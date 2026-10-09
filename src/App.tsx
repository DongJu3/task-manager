import { useEffect, useState } from 'react';
import './App.css';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import TaskModal from './components/Common/TaskModal';
import type { Task } from './types';

function AppContent() {
  const { categories, addTask, updateTask } = useTaskContext();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    if (task.id.startsWith('task_') && !task.id.includes('_undefined')) {
      if (editingTask) {
        await updateTask(task);
      } else {
        await addTask(task);
      }
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onAddTask={handleAddTask} />;
      case 'tasks':
        return <TasksPage onAddTask={handleAddTask} onEditTask={handleEditTask} />;
      case 'calendar':
        return <CalendarPage onAddTask={handleAddTask} onEditTask={handleEditTask} />;
      case 'statistics':
        return <StatisticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onAddTask={handleAddTask} />;
    }
  };

  return (
    <>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </MainLayout>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        categories={categories}
        onSave={handleSaveTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
