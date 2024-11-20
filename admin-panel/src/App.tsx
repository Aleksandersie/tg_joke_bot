import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tags from './pages/Tags';
import JokesPage from './pages/JokesPage';
import JokesX from './pages/JokesX';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Sidebar />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/jokes/:triggerId" element={<JokesPage />} />
          <Route path="/jokes-x" element={<JokesX />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;