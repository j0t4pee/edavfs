import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import Home from './pages/Home';
import Intranet from './pages/Workspace';
import Login from './pages/Login';

const RotaProtegida = ({ children }: { children: React.ReactNode }) => {
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().status === 'ativo') {
          setAutenticado(true);
        } else {
          setAutenticado(false);
        }
      } else {
        setAutenticado(false);
      }
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  if (carregando) return <div style={{ minHeight: '100vh', backgroundColor: '#020617' }}></div>;
  return autenticado ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/intranet" element={<RotaProtegida><Intranet /></RotaProtegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}