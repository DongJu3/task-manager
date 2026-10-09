import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, addMonths, subMonths } from 'date-fns';

interface CalendarPageProps {
  onAddTask: () => void;
  onEditTask: (task: any) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onAddTask }) => {
  const { tasks, categories, toggleTaskCompletion } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthTasks = useMemo(() => {
    const result: { [key: string]: any[] } = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dueDate = new Date(task.dueDate);
      const month = dueDate.getMonth();
      const year = dueDate.getFullYear();
      const date = dueDate.getDate();

      if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
        const key = `${year}-${month}-${date}`;
        if (!result[key]) result[key] = [];
        result[key].push(task);
      }
    });

    return result;
  }, [tasks, currentDate]);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
  };

  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;

  const selectedDateTasks = selectedDateKey ? monthTasks[selectedDateKey] || [] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">캘린더</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-bold text-gray-700 dark:text-gray-300 text-sm"
                >
                  {day}
                </div>
              ))}

              {days.map((day, idx) => {
                const dateKey = day
                  ? `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
                  : null;
                const dayTasks = dateKey ? monthTasks[dateKey] || [] : [];
                const isToday = day === new Date().getDate();
                const isSelected = selectedDate?.getDate() === day;

                return (
                  <button
                    key={idx}
                    onClick={() => day && handleSelectDate(day)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      day === null
                        ? ''
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : isToday
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    {dayTasks.length > 0 && (
                      <div className="text-xs mt-1">
                        {dayTasks.length === 1 ? (
                          <div className="w-2 h-2 bg-red-500 rounded-full mx-auto" />
                        ) : (
                          <span className="text-xs font-bold">{dayTasks.length}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onAddTask}
            className="btn-primary w-full text-center"
          >
            + 새로운 할 일
          </button>

          {selectedDate && (
            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                {selectedDate.toLocaleDateString('ko-KR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>

              {selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4"
                      style={{
                        borderColor: categories.find((c) => c.id === task.categoryId)?.color,
                      }}
                    >
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="mt-1 w-4 h-4 rounded"
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.dueTime && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {task.dueTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  이 날짜에 할 일이 없습니다
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
