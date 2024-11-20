import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-gray-800 h-screen fixed left-0 top-0 p-4">
      <div className="text-white text-xl font-bold mb-8 p-4">
        Админ-панель
      </div>
      <div className="space-y-2">
        <Button
          className={`w-full justify-start text-white ${isActive('/') ? 'bg-primary' : ''}`}
          variant={isActive('/') ? 'solid' : 'light'}
          onClick={() => handleNavigation('/')}
        >
          Главная
        </Button>
        <Button
          className={`w-full justify-start text-white ${isActive('/tags') ? 'bg-primary' : ''}`}
          variant={isActive('/tags') ? 'solid' : 'light'}
          onClick={() => handleNavigation('/tags')}
        >
          Теги
        </Button>
        <Button
          className={`w-full justify-start text-white ${isActive('/jokes-x') ? 'bg-primary' : ''}`}
          variant={isActive('/jokes-x') ? 'solid' : 'light'}
          onClick={() => handleNavigation('/jokes-x')}
        >
          Анекдоты
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;