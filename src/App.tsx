import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Intranet from './pages/Intranet';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intranet" element={<Intranet />} />
      </Routes>
    </Router>
  );
}

export default App;