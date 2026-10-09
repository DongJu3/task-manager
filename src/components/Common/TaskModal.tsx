import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Task, Category } from '../../types';
import { createNewTask } from '../../utils/taskHelper';

interface TaskModalProps {
  isOpen: boolean;
  task?: Task;
  categories: Category[];
  onSave: (task: Task) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState<Task>(task || createNewTask(categories[0]?.id || 'cat_other'));

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else if (categories.length > 0) {
      setFormData(createNewTask(categories[0].id));
    }
  }, [task, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({ ...formData, updatedAt: new Date() });
      onClose();
    }
  };

  const handleAddSubTask = () => {
    const newSubTask = {
      id: `subtask_${Date.now()}`,
      title: '',
      completed: false,
    };
    setFormData({
      ...formData,
      subTasks: [...formData.subTasks, newSubTask],
    });
  };

  const handleDeleteSubTask = (index: number) => {
    setFormData({
      ...formData,
      subTasks: formData.subTasks.filter((_, i) => i !== index),
    });
  };

  const handleSubTaskChange = (index: number, title: string) => {
    const updated = [...formData.subTasks];
    updated[index].title = title;
    setFormData({ ...formData, subTasks: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {task ? '할 일 수정' : '새로운 할 일'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field w-full"
              placeholder="할 일 제목을 입력하세요"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full h-20 resize-none"
              placeholder="상세 설명을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                마감일
              </label>
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                시간
              </label>
              <input
                type="time"
                value={formData.dueTime || ''}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                우선순위
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="input-field w-full"
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                카테고리
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field w-full"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                체크리스트
              </label>
              <button
                type="button"
                onClick={handleAddSubTask}
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>추가</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.subTasks.map((subTask, index) => (
                <div key={subTask.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={subTask.title}
                    onChange={(e) => handleSubTaskChange(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`체크리스트 항목 ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSubTask(index)}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              반복 설정
            </label>
            <select
              value={formData.recurrence?.type || 'none'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurrence: {
                    type: e.target.value as any,
                    endDate: formData.recurrence?.endDate,
                    daysOfWeek: formData.recurrence?.daysOfWeek,
                  },
                })
              }
              className="input-field w-full"
            >
              <option value="none">없음</option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {task ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
