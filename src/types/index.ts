export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
  dueTime?: string;
  priority: Priority;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  subTasks: SubTask[];
  recurrence?: {
    type: RecurrenceType;
    endDate?: Date;
    daysOfWeek?: number[];
    lastCompletedDate?: Date;
  };
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface DailyStats {
  date: Date;
  completed: number;
  total: number;
}

export interface CategoryStats {
  categoryId: string;
  completed: number;
  total: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  defaultPriority: Priority;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  settings: AppSettings;
  lastSyncTime: Date;
}
