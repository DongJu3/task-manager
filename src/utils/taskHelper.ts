import type { Task } from '../types';
import { addDays, addWeeks, addMonths, startOfDay, isSameDay } from 'date-fns';

export const createNewTask = (categoryId: string): Task => ({
  id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: '',
  description: '',
  completed: false,
  priority: 'medium',
  categoryId,
  createdAt: new Date(),
  updatedAt: new Date(),
  subTasks: [],
});

export const isOverdue = (task: Task): boolean => {
  if (task.completed || !task.dueDate) return false;
  const dueDate = startOfDay(new Date(task.dueDate));
  const today = startOfDay(new Date());
  return dueDate < today;
};

export const isToday = (date: Date): boolean => {
  return isSameDay(new Date(date), new Date());
};

export const isDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;
  return isToday(new Date(task.dueDate));
};

export const isDueSoon = (task: Task, days: number = 7): boolean => {
  if (task.completed || !task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const soon = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return dueDate >= today && dueDate <= soon;
};

export const getNextRecurrenceDate = (task: Task): Date | null => {
  if (!task.recurrence || task.recurrence.type === 'none') return null;

  const lastDate = task.recurrence.lastCompletedDate
    ? new Date(task.recurrence.lastCompletedDate)
    : task.dueDate
    ? new Date(task.dueDate)
    : new Date();

  let nextDate: Date;

  switch (task.recurrence.type) {
    case 'daily':
      nextDate = addDays(lastDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(lastDate, 1);
      break;
    case 'monthly':
      nextDate = addMonths(lastDate, 1);
      break;
    case 'custom':
      if (!task.recurrence.daysOfWeek || task.recurrence.daysOfWeek.length === 0) {
        return null;
      }
      let tempDate = addDays(lastDate, 1);
      while (!task.recurrence.daysOfWeek.includes(tempDate.getDay())) {
        tempDate = addDays(tempDate, 1);
      }
      nextDate = tempDate;
      break;
    default:
      return null;
  }

  if (task.recurrence.endDate) {
    const endDate = new Date(task.recurrence.endDate);
    if (nextDate > endDate) return null;
  }

  return nextDate;
};

export const generateRecurrenceTask = (originalTask: Task): Task | null => {
  const nextDate = getNextRecurrenceDate(originalTask);
  if (!nextDate) return null;

  return {
    ...originalTask,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completed: false,
    dueDate: nextDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    subTasks: originalTask.subTasks.map((st) => ({
      ...st,
      completed: false,
    })),
    recurrence: originalTask.recurrence ? {
      ...originalTask.recurrence,
      lastCompletedDate: originalTask.dueDate || new Date(),
    } : undefined,
  };
};

export const sortTasks = (
  tasks: Task[],
  sortBy: 'dueDate' | 'priority' | 'createdAt' = 'dueDate'
): Task[] => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    }

    if (sortBy === 'dueDate') {
      const aHasDue = a.dueDate ? 1 : 0;
      const bHasDue = b.dueDate ? 1 : 0;
      if (aHasDue !== bHasDue) return aHasDue - bHasDue;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const getCompletionStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percentage };
};

export const filterTasks = (
  tasks: Task[],
  options: {
    completed?: boolean;
    categoryId?: string;
    priority?: string;
    search?: string;
  }
): Task[] => {
  let filtered = tasks;

  if (options.completed !== undefined) {
    filtered = filtered.filter((t) => t.completed === options.completed);
  }

  if (options.categoryId) {
    filtered = filtered.filter((t) => t.categoryId === options.categoryId);
  }

  if (options.priority) {
    filtered = filtered.filter((t) => t.priority === options.priority);
  }

  if (options.search) {
    const query = options.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }

  return filtered;
};
