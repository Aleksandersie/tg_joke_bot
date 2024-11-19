import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import JokesPage from './pages/JokesPage';
import Tags from './pages/Tags';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Sidebar />
        <div className="ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/jokes/:triggerId" element={<JokesPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;