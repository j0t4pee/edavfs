import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import logoImage from '../images/logo.png';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nome: user.displayName || 'Piloto Sem Nome',
          email: user.email,
          role: 'piloto',
          status: 'ativo',
          dataCriacao: new Date().toISOString()
        });
      }
      
      await verificarAcesso(user);
    } catch (err: any) {
      setError('Falha ao autenticar com o Google.');
      setLoading(false);
    }
  };

  const verificarAcesso = async (user: any) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().status === 'ativo') {
        
        // 1. Gera o token de sessão validado pelo Firebase
        const token = await user.getIdToken();
        
        // 2. Grava no cache do navegador para que o App.tsx liberte a rota /intranet
        localStorage.setItem('edav_auth_token', token);
        
        // 3. Redireciona com segurança
        navigate('/intranet');
        
      } else {
        setError('Conta inativa ou sem permissão de acesso.');
        await auth.signOut();
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao ler a base de dados de utilizadores.');
      await auth.signOut();
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#030712', fontFamily: '"Inter", sans-serif' }}>
      
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: '#0ea5e9', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '440px', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <img src={logoImage} alt="EDAFS" style={{ height: '64px' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>CIOEDAFS Workspace</h2>
            <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '0.9rem' }}>Acesso restrito a membros operacionais</p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ width: '100%', padding: '16px', background: '#ffffff', color: '#030712', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'background 0.2s' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          {loading ? 'A autenticar...' : 'Entrar com o Google'}
        </button>

      </div>
    </div>
  );
}