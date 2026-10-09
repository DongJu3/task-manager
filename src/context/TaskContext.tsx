import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Task, Category, AppSettings } from '../types';
import { db } from '../utils/storage/db';
import { generateRecurrenceTask } from '../utils/taskHelper';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  settings: AppSettings;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  dateFormat: 'yyyy-MM-dd',
  defaultPriority: 'medium',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_study', name: '공부', color: '#3b82f6', createdAt: new Date() },
  { id: 'cat_project', name: '프로젝트', color: '#8b5cf6', createdAt: new Date() },
  { id: 'cat_personal', name: '개인', color: '#ec4899', createdAt: new Date() },
  { id: 'cat_exercise', name: '운동', color: '#10b981', createdAt: new Date() },
  { id: 'cat_other', name: '기타', color: '#f59e0b', createdAt: new Date() },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await db.init();

      const loadedCategories = await db.getAllCategories();
      if (loadedCategories.length === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          await db.addCategory(cat);
        }
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(loadedCategories);
      }

      const loadedTasks = await db.getAllTasks();
      setTasks(loadedTasks);

      const loadedSettings = await db.getSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }

      await handleRecurrence(loadedTasks);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecurrence = async (currentTasks: Task[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of currentTasks) {
      if (task.completed && task.recurrence && task.recurrence.type !== 'none') {
        const lastCompletedDate = task.recurrence.lastCompletedDate
          ? new Date(task.recurrence.lastCompletedDate)
          : task.dueDate
          ? new Date(task.dueDate)
          : null;

        if (lastCompletedDate) {
          lastCompletedDate.setHours(0, 0, 0, 0);
          if (lastCompletedDate < today) {
            const newTask = generateRecurrenceTask(task);
            if (newTask) {
              await db.addTask(newTask);
              setTasks((prev) => [...prev, newTask]);
            }
          }
        }
      }
    }
  };

  const addTask = useCallback(async (task: Task) => {
    try {
      await db.addTask(task);
      setTasks((prev) => [...prev, task]);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (task: Task) => {
    try {
      await db.updateTask(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await db.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, []);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date(),
    };

    if (!updatedTask.completed && updatedTask.recurrence && updatedTask.recurrence.type !== 'none') {
      updatedTask.recurrence.lastCompletedDate = new Date();
    }

    try {
      await db.updateTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      if (updatedTask.completed && updatedTask.recurrence?.type !== 'none') {
        const newTask = generateRecurrenceTask(updatedTask);
        if (newTask) {
          await db.addTask(newTask);
          setTasks((prev) => [...prev, newTask]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      throw error;
    }
  }, [tasks]);

  const addCategory = useCallback(async (category: Category) => {
    try {
      await db.addCategory(category);
      setCategories((prev) => [...prev, category]);
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (category: Category) => {
    try {
      await db.updateCategory(category);
      setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      await db.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setTasks((prev) =>
        prev.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: DEFAULT_CATEGORIES[4].id } : t))
      );
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await db.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = await db.exportData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      await db.importData(data);
      const reloadedTasks = await db.getAllTasks();
      const reloadedCategories = await db.getAllCategories();
      const reloadedSettings = await db.getSettings();

      setTasks(reloadedTasks);
      setCategories(reloadedCategories);
      if (reloadedSettings) setSettings(reloadedSettings);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await db.clearAll();
      setTasks([]);
      setSettings(DEFAULT_SETTINGS);

      for (const cat of DEFAULT_CATEGORIES) {
        await db.addCategory(cat);
      }
      setCategories(DEFAULT_CATEGORIES);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }, []);

  const value: TaskContextType = {
    tasks,
    categories,
    settings,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    toggleTaskCompletion,
    loading,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};
