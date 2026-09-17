import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Home from './pages/Home';
import Intranet from './pages/Intranet';
import Login from './pages/Login'; 

// COMPONENTE CADEADO: Só deixa passar quem estiver logado!
const RotaProtegida = ({ children }: { children: React.ReactNode }) => {
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAutenticado(!!user); 
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  if (carregando) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontFamily: 'sans-serif' }}>Carregando sistema seguro...</div>;
  }

  // Se estiver logado, mostra a Intranet. Se não, manda pro Login!
  return autenticado ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/intranet" element={
          <RotaProtegida>
            <Intranet />
          </RotaProtegida>
        } />
      </Routes>
    </Router>
  );
}

export default App;