import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@nextui-org/react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-800 h-screen fixed left-0 top-0 p-4">
      <div className="text-white text-xl font-bold mb-8 p-4">
        Админ-панель
      </div>
      <div className="space-y-2">
        <Link to="/">
          <Button
            className={`w-full justify-start ${isActive('/') ? 'bg-primary' : ''}`}
            variant={isActive('/') ? 'solid' : 'light'}
          >
            Главная
          </Button>
        </Link>
        <Link to="/tags">
          <Button
            className={`w-full justify-start ${isActive('/tags') ? 'bg-primary' : ''}`}
            variant={isActive('/tags') ? 'solid' : 'light'}
          >
            Триггеры
          </Button>
        </Link>
      
      </div>
    </div>
  );
};

export default Sidebar;