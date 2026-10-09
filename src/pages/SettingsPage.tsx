import React, { useState, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Download, Upload, Trash2, Plus } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { categories, addCategory, deleteCategory, settings, updateSettings, exportData, importData, clearAllData } = useTaskContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `cat_${Date.now()}`,
        name: newCategoryName,
        color: newCategoryColor,
        createdAt: new Date(),
      };
      await addCategory(newCategory);
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      await deleteCategory(categoryId);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await exportData();
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
      );
      element.setAttribute(
        'download',
        `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      alert('데이터를 내보냈습니다!');
    } catch (error) {
      alert('내보내기에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      await importData(text);
      alert('데이터를 불러왔습니다!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('불러오기에 실패했습니다. 파일 형식을 확인하세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        '정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      try {
        setLoading(true);
        await clearAllData();
        alert('모든 데이터를 초기화했습니다.');
      } catch (error) {
        alert('초기화에 실패했습니다.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleThemeChange = async (theme: string) => {
    await updateSettings({ ...settings, theme: theme as any });

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">설정</h1>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">외관</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              테마
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                라이트
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                다크
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'system'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                시스템
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">카테고리 관리</h2>

        <div className="space-y-4">
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {category.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={categories.length === 1}
                  className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="카테고리 삭제"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="새 카테고리 이름"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                className="input-field w-full"
              />

              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  <span>추가</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">데이터 관리</h2>

        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 정기적으로 데이터를 백업하여 소중한 정보를 보호하세요.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download size={18} />
            <span>{loading ? '처리 중...' : '데이터 내보내기 (JSON)'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Upload size={18} />
            <span>{loading ? '처리 중...' : '데이터 불러오기'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              ⚠️ 주의: 이 작업은 되돌릴 수 없습니다.
            </p>
            <button
              onClick={handleClearAllData}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '모든 데이터 초기화'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">정보</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>앱 이름</span>
            <span className="font-medium text-gray-900 dark:text-white">Task Manager</span>
          </div>
          <div className="flex justify-between">
            <span>버전</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>데이터 저장</span>
            <span className="font-medium text-gray-900 dark:text-white">IndexedDB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
