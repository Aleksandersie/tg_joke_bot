import React from 'react';
import { Card, CardBody } from '@nextui-org/react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Панель управления</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800">
          <CardBody>
            <h2 className="text-2xl font-bold mb-2">Теги</h2>
            <p className="text-gray-400">Всего тегов: 10</p>
          </CardBody>
        </Card>
        <Card className="bg-gray-800">
          <CardBody>
            <h2 className="text-2xl font-bold mb-2">Анекдоты</h2>
            <p className="text-gray-400">Всего анекдотов: 25</p>
          </CardBody>
        </Card>
        <Card className="bg-gray-800">
          <CardBody>
            <h2 className="text-2xl font-bold mb-2">Активность</h2>
            <p className="text-gray-400">Последние 24 часа: 100 запросов</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;