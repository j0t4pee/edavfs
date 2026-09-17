import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import logoImage from '../images/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const appleFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, Arial, sans-serif';

  // Se o usuário já estiver logado, joga ele direto pra intranet
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/intranet');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/intranet'); // Deu certo, vai pro painel!
    } catch (error: any) {
      console.error(error);
      setErro('Credenciais inválidas ou usuário não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: '#f8fafc', fontFamily: appleFontStack, padding: '1rem' }}>
      
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src={logoImage} alt="EDAV Logo" style={{ height: '60px', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
          <h1 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '1.5rem', color: '#f8fafc', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>ACESSO RESTRITO</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Intranet Exclusiva para a Administração</p>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          {erro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
              <AlertTriangle size={18} /> {erro}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>E-mail Administrativo</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.85rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="admin@esquadrao.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Senha</label>
              <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} style={{ padding: '0.85rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem', fontSize: '1rem', fontFamily: appleFontStack, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              <Lock size={18} /> {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', color: '#64748b', marginTop: '2rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
          <ArrowLeft size={16} /> Retornar ao Site
        </button>
      </div>
    </div>
  );
}