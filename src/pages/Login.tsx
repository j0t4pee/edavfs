"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ShieldAlert, Globe, Clock, LogOut } from 'lucide-react';
import logoImage from '../images/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [contaPendente, setContaPendente] = useState(false);

  useEffect(() => {
    document.title = "Acesso Restrito | CIOEDAFS";
    document.documentElement.setAttribute('data-theme', 'dark');

    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'ativo' && data.role !== 'pendente' && data.role !== 'recusado') {
            navigate('/intranet');
          } else {
            setContaPendente(true);
          }
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErro('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // F-01 CORRIGIDO: Toda conta nova nasce obrigatoriamente como PENDENTE
        await setDoc(userRef, {
          uid: user.uid,
          nome: user.displayName || 'Piloto Sem Nome',
          email: user.email,
          foto: user.photoURL || '',
          role: 'pendente',
          status: 'pendente',
          permissoes: {
            publicarNotam: false,
            publicarAgenda: false,
            editarVideo: false,
            editarUsuarios: false
          },
          dataCriacao: new Date().toISOString()
        });
        setContaPendente(true);
      } else {
        const userData = userSnap.data();
        // Atualiza apenas dados básicos de perfil sem tocar em role/status
        await setDoc(userRef, {
          nome: user.displayName || userData.nome,
          foto: user.photoURL || userData.foto
        }, { merge: true });

        if (userData.status === 'ativo' && userData.role !== 'pendente' && userData.role !== 'recusado') {
          navigate('/intranet');
        } else {
          setContaPendente(true);
        }
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      setErro("Não foi possível autenticar com o Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSair = async () => {
    await signOut(auth);
    setContaPendente(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); }
        * { font-family: 'Regular', system-ui, sans-serif; box-sizing: border-box; }
        h1, h2, h3 { font-family: 'Comum', sans-serif !important; }
        .grid-bg { position: fixed; inset: 0; background-size: 50px 50px; background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); pointer-events: none; }
      `}</style>

      <div className="grid-bg" />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '3rem 2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
        <img src={logoImage} alt="EDAFS" style={{ height: '64px', margin: '0 auto 1.5rem', display: 'block' }} />
        
        {contaPendente ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#f59e0b' }}>
              <Clock size={28} />
            </div>
            <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: '0 0 0.75rem' }}>Aguardando Aprovação</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              A sua conta foi registada com sucesso, mas o acesso à Intranet está bloqueado até que o <strong>Comando Geral</strong> valide o seu cadastro.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/')} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Voltar ao Site Principal
              </button>
              <button onClick={handleSair} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Sair desta conta
              </button>
            </div>
          </div>
        ) : (
          <>
            <span style={{ color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intranet Operacional</span>
            <h1 style={{ color: '#ffffff', fontSize: '1.75rem', margin: '0.4rem 0 0.75rem' }}>Acesso ao CIOEDAFS</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Área exclusiva para pilotos homologados e comando da Esquadrilha da Fumaça Virtual.
            </p>

            {erro && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{erro}</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{ width: '100%', padding: '0.9rem 1.5rem', borderRadius: '12px', background: '#ffffff', color: '#0f172a', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'transform 0.2s', opacity: loading ? 0.7 : 1 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
              </svg>
              {loading ? 'Autenticando...' : 'Entrar com Google'}
            </button>

            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '1.5rem', background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Globe size={14} /> Voltar ao site
            </button>
          </>
        )}
      </div>
    </div>
  );
}