import React, { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { subDays, isSameDay } from 'date-fns';

const StatisticsPage: React.FC = () => {
  const { tasks, categories } = useTaskContext();

  const weekStats = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayTasks = tasks.filter(
        (t) => t.dueDate && isSameDay(new Date(t.dueDate), date)
      );
      const completed = dayTasks.filter((t) => t.completed).length;

      data.push({
        date: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        completed,
        total: dayTasks.length,
      });
    }

    return data;
  }, [tasks]);

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id);
      const completed = catTasks.filter((t) => t.completed).length;
      return {
        name: cat.name,
        value: catTasks.length,
        completed,
        color: cat.color,
      };
    });
  }, [tasks, categories]);

  const overallStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    return [
      { name: '완료', value: completed, color: '#10b981' },
      { name: '진행 중', value: pending, color: '#f59e0b' },
    ];
  }, [tasks]);

  const priorityStats = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'high');
    const medium = tasks.filter((t) => t.priority === 'medium');
    const low = tasks.filter((t) => t.priority === 'low');

    return [
      { name: '높음', value: high.length, completed: high.filter((t) => t.completed).length, color: '#ef4444' },
      { name: '보통', value: medium.length, completed: medium.filter((t) => t.completed).length, color: '#f59e0b' },
      { name: '낮음', value: low.length, completed: low.filter((t) => t.completed).length, color: '#10b981' },
    ];
  }, [tasks]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">통계</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">전체 할 일</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{tasks.length}</p>
        </div>

        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">완료한 일</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
            {tasks.filter((t) => t.completed).length}
          </p>
        </div>

        <div className="card text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">완료율</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {tasks.length === 0
              ? '0'
              : Math.round(
                  (tasks.filter((t) => t.completed).length / tasks.length) * 100
                )}
            %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">최근 7일 활동</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                name="완료"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                name="전체"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">전체 완료율</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overallStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {overallStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">카테고리별 진행</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="완료" />
              <Bar dataKey="value" fill="#3b82f6" name="전체" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">우선순위별 진행</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="완료" />
              <Bar dataKey="value" fill="#f59e0b" name="전체" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">카테고리별 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">카테고리</th>
                <th className="text-center py-2 text-gray-700 dark:text-gray-300">전체</th>
                <th className="text-center py-2 text-gray-700 dark:text-gray-300">완료</th>
                <th className="text-center py-2 text-gray-700 dark:text-gray-300">완료율</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat) => (
                <tr
                  key={stat.name}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-2 flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-gray-900 dark:text-white">{stat.name}</span>
                  </td>
                  <td className="text-center text-gray-900 dark:text-white">{stat.value}</td>
                  <td className="text-center text-green-600 dark:text-green-400 font-medium">
                    {stat.completed}
                  </td>
                  <td className="text-center text-gray-900 dark:text-white">
                    {stat.value === 0 ? '0' : Math.round((stat.completed / stat.value) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
