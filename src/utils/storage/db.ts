import type { Task, Category, AppSettings, AppState } from '../../types';

const DB_NAME = 'TaskManagerDB';
const DB_VERSION = 1;

export class TaskDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('dueDate', 'dueDate', { unique: false });
          taskStore.createIndex('categoryId', 'categoryId', { unique: false });
          taskStore.createIndex('completed', 'completed', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addTask(task: Task): Promise<string> {
    await this.withStore('tasks', 'readwrite', (store) => {
      const serializedTask = this.serializeTask(task);
      return store.add(serializedTask);
    });
    return task.id;
  }

  async updateTask(task: Task): Promise<void> {
    await this.withStore('tasks', 'readwrite', (store) => {
      const serializedTask = this.serializeTask(task);
      return store.put(serializedTask);
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.withStore('tasks', 'readwrite', (store) => {
      return store.delete(taskId);
    });
  }

  async getTask(taskId: string): Promise<Task | undefined> {
    return this.withStore('tasks', 'readonly', async (store) => {
      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(taskId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      return result ? this.deserializeTask(result) : undefined;
    });
  }

  async getAllTasks(): Promise<Task[]> {
    return this.withStore('tasks', 'readonly', async (store) => {
      const results = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      return results.map((task) => this.deserializeTask(task));
    });
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    return this.withStore('tasks', 'readonly', async (store) => {
      const index = store.index('categoryId');
      const results = await new Promise<any[]>((resolve, reject) => {
        const request = index.getAll(categoryId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      return results.map((task) => this.deserializeTask(task));
    });
  }

  async getTasksByDate(date: Date): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allTasks = await this.getAllTasks();
    return allTasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  }

  async addCategory(category: Category): Promise<string> {
    await this.withStore('categories', 'readwrite', (store) => {
      return store.add(category);
    });
    return category.id;
  }

  async updateCategory(category: Category): Promise<void> {
    await this.withStore('categories', 'readwrite', (store) => {
      return store.put(category);
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.withStore('categories', 'readwrite', (store) => {
      return store.delete(categoryId);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.withStore('categories', 'readonly', async (store) => {
      return new Promise<Category[]>((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    await this.withStore('settings', 'readwrite', (store) => {
      return store.put({ key: 'app-settings', value: settings });
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    return this.withStore('settings', 'readonly', async (store) => {
      return new Promise<AppSettings | null>((resolve, reject) => {
        const request = store.get('app-settings');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
      });
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['tasks', 'categories', 'settings'], 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.objectStore('tasks').clear();
      transaction.objectStore('categories').clear();
      transaction.objectStore('settings').clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  async exportData(): Promise<AppState> {
    const tasks = await this.getAllTasks();
    const categories = await this.getAllCategories();
    const settings = await this.getSettings();

    return {
      tasks,
      categories,
      settings: settings || this.getDefaultSettings(),
      lastSyncTime: new Date(),
    };
  }

  async importData(data: AppState): Promise<void> {
    await this.clearAll();

    for (const category of data.categories) {
      await this.addCategory(category);
    }

    for (const task of data.tasks) {
      await this.addTask(task);
    }

    if (data.settings) {
      await this.updateSettings(data.settings);
    }
  }

  private async withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
  ): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      Promise.resolve(callback(store))
        .then((result) => {
          if (result instanceof IDBRequest) {
            result.onerror = () => reject(result.error);
            result.onsuccess = () => resolve(result.result);
          } else {
            resolve(result);
          }
        })
        .catch(reject);

      transaction.onerror = () => reject(transaction.error);
    });
  }

  private serializeTask(task: Task): any {
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      recurrence: task.recurrence ? {
        ...task.recurrence,
        endDate: task.recurrence.endDate?.toISOString(),
        lastCompletedDate: task.recurrence.lastCompletedDate?.toISOString(),
      } : undefined,
    };
  }

  private deserializeTask(data: any): Task {
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      recurrence: data.recurrence ? {
        ...data.recurrence,
        endDate: data.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
        lastCompletedDate: data.recurrence.lastCompletedDate ? new Date(data.recurrence.lastCompletedDate) : undefined,
      } : undefined,
    };
  }

  private getDefaultSettings() {
    return {
      theme: 'system' as const,
      dateFormat: 'yyyy-MM-dd',
      defaultPriority: 'medium' as const,
    };
  }
}

export const db = new TaskDatabase();
