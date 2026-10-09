import React, { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { isToday, isOverdue, getCompletionStats } from '../utils/taskHelper';
import { addDays, isBefore, startOfDay } from 'date-fns';
import { CheckCircle2, AlertCircle, Calendar, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onAddTask: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddTask }) => {
  const { tasks, categories } = useTaskContext();

  const todayTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.completed && t.dueDate && isToday(new Date(t.dueDate))
    );
  }, [tasks]);

  const completedToday = useMemo(() => {
    return tasks.filter(
      (t) => t.completed && t.dueDate && isToday(new Date(t.dueDate))
    );
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && isOverdue(t));
  }, [tasks]);

  const upcomingWeek = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);

    return tasks.filter((t) => {
      if (t.completed || !t.dueDate) return false;
      const dueDate = startOfDay(new Date(t.dueDate));
      return isBefore(dueDate, weekEnd) && dueDate >= today;
    });
  }, [tasks]);

  const stats = useMemo(() => {
    return getCompletionStats(tasks);
  }, [tasks]);

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id);
      const completed = catTasks.filter((t) => t.completed).length;
      return { category: cat, total: catTasks.length, completed };
    });
  }, [tasks, categories]);

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#gray';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">오늘 해야 할 일</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayTasks.length}</p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">완료한 일</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {completedToday.length}
              </p>
            </div>
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">기한 만료</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {overdueTasks.length}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">전체 완료율</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.percentage}%</p>
            </div>
            <TrendingUp className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">오늘의 할 일</h2>
              <button
                onClick={onAddTask}
                className="btn-primary text-sm"
              >
                + 추가
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.dueTime && `${task.dueTime}`}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded text-white"
                      style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                    >
                      {categories.find((c) => c.id === task.categoryId)?.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                오늘 할 일이 없습니다 🎉
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">이번 주 예정</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {upcomingWeek.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">개의 일정</p>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">전체 통계</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">전체</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">완료</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.completed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">미완료</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {stats.total - stats.completed}
                </span>
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
              카테고리별
            </h3>
            <div className="space-y-2 text-xs">
              {categoryStats.map((stat) => (
                <div key={stat.category.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.category.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {stat.category.name}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.completed}/{stat.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h3 className="font-bold text-red-600 dark:text-red-400 mb-3">⚠️ 기한 만료된 일</h3>
          <div className="space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {task.dueDate && new Date(task.dueDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
