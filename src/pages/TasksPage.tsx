import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/Common/TaskCard';
import { sortTasks, filterTasks } from '../utils/taskHelper';
import { Plus } from 'lucide-react';

interface TasksPageProps {
  onAddTask: () => void;
  onEditTask: (task: any) => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ onAddTask, onEditTask }) => {
  const { tasks, categories, deleteTask, toggleTaskCompletion } = useTaskContext();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filter === 'pending') {
      result = result.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }

    if (search) {
      result = filterTasks(result, { search });
    }

    return sortTasks(result, sortBy);
  }, [tasks, filter, search, sortBy, selectedCategory]);

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('이 할 일을 삭제하시겠습니까?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">할 일 목록</h1>
        <button onClick={onAddTask} className="btn-primary flex items-center space-x-2 w-full md:w-auto">
          <Plus size={20} />
          <span>새로운 할 일</span>
        </button>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태 필터
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">전체</option>
                <option value="pending">진행 중</option>
                <option value="completed">완료됨</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                카테고리
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">전체</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                정렬
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="dueDate">마감일</option>
                <option value="priority">우선순위</option>
                <option value="createdAt">생성일</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                검색
              </label>
              <input
                type="text"
                placeholder="검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            총 {filteredTasks.length}개의 할 일
          </div>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((c) => c.id === task.categoryId)}
              onToggle={toggleTaskCompletion}
              onEdit={onEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {search ? '검색 결과가 없습니다.' : '할 일이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
