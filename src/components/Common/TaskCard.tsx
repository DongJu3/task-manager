import React, { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import type { Task, Category } from '../../types';
import { isOverdue, isToday } from '../../utils/taskHelper';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  expanded?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onToggle,
  onEdit,
  onDelete,
  expanded: initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const overdue = isOverdue(task);
  const dueSoon = task.dueDate && isToday(new Date(task.dueDate));

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
    }
  };

  const completedSubTasks = task.subTasks.filter((st) => st.completed).length;

  return (
    <div
      className={`card border-l-4 ${
        overdue
          ? 'border-red-500 dark:border-red-400'
          : dueSoon
          ? 'border-yellow-500 dark:border-yellow-400'
          : 'border-gray-300 dark:border-gray-600'
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 size={24} className="text-green-500" />
            ) : (
              <Circle size={24} />
            )}
          </button>

          <div className="flex-1">
            <h3
              className={`font-medium text-lg ${
                task.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title || '제목 없음'}
            </h3>

            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {category && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}

              <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor()}`}>
                {getPriorityLabel()}
              </span>

              {overdue && (
                <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  기한 만료
                </span>
              )}

              {task.dueDate && !overdue && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: ko })}
                </span>
              )}

              {task.subTasks.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  체크리스트: {completedSubTasks}/{task.subTasks.length}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(task.subTasks.length > 0 || task.description) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-blue-500 hover:text-blue-600"
          >
            <Edit2 size={18} />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-red-500 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {task.subTasks.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                체크리스트
              </h4>
              <ul className="space-y-1">
                {task.subTasks.map((subTask) => (
                  <li key={subTask.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      readOnly
                      className="w-4 h-4 rounded"
                    />
                    <span
                      className={
                        subTask.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    >
                      {subTask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.recurrence?.type && task.recurrence.type !== 'none' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              반복: {getRecurrenceLabel(task.recurrence.type)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getRecurrenceLabel(type: string): string {
  const labels: { [key: string]: string } = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    custom: '사용자 정의',
  };
  return labels[type] || type;
}

export default TaskCard;
