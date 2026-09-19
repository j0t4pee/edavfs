"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { Plane, AlertTriangle, Loader2 } from 'lucide-react';
import logoImage from '../images/logo.png';
import headerImage from '../images/header.jpg';
import faviconImage from '../images/favicon.png'; // Importação do favicon adicionada

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Login | EDA FS";
    
    let linkFavicon = document.querySelector('link[rel="icon"]');
    if (!linkFavicon) {
      linkFavicon = document.createElement('link');
      linkFavicon.setAttribute('rel', 'icon');
      document.head.appendChild(linkFavicon);
    }
    linkFavicon.setAttribute('href', faviconImage);
    linkFavicon.setAttribute('type', 'image/png');
    linkFavicon.setAttribute('sizes', '32x32');

    // 3. Listener de sessão
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/intranet');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Abre o Pop-up do Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Verifica se o usuário já existe no banco de dados
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Se não existe, vamos criá-lo!
        // Primeiro, vamos ver se é a primeira pessoa a fazer login no sistema inteiro.
        const usersSnapshot = await getDocs(collection(db, 'usuarios'));
        const isFirstUser = usersSnapshot.empty;

        // O primeiro a logar vira admin. Os próximos viram 'pendente'.
        const newRole = isFirstUser ? 'admin' : 'pendente';

        await setDoc(userDocRef, {
          uid: user.uid,
          nome: user.displayName || 'Piloto Desconhecido',
          email: user.email || '',
          foto: user.photoURL || '',
          role: newRole,
          dataCadastro: new Date().toISOString()
        });
      }

      navigate('/intranet');

    } catch (err: any) {
      console.error(err);
      setError('Falha ao iniciar sessão com o Google. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712', fontFamily: '"Arial", sans-serif', position: 'relative' }}>
      {/* Background com imagem e overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(3,7,18,0.95) 0%, rgba(15,23,42,0.8) 100%)', backdropFilter: 'blur(8px)' }} />

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <img src={logoImage} alt="EDAV Logo" style={{ height: '70px', marginBottom: '1.5rem' }} />
          
          <h2 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontFamily: '"Quantico", sans-serif', letterSpacing: '0.05em', textAlign: 'center' }}>
            ACESSO RESTRITO
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem', textAlign: 'center', lineHeight: 1.5 }}>
            Faça login com a sua conta Google para acessar o painel de comando do EDAV.
          </p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', boxSizing: 'border-box', marginBottom: '1.5rem' }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ width: '100%', background: '#f8fafc', color: '#0f172a', border: 'none', padding: '0.85rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s', opacity: loading ? 0.8 : 1 }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#e2e8f0'; }} 
            onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#f8fafc'; }}
          >
            {loading ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com o Google
              </>
            )}
          </button>

          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', marginTop: '1.5rem', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'} 
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <Plane size={14} /> Voltar ao site
          </button>
          
        </div>
      </div>
    </div>
  );
}