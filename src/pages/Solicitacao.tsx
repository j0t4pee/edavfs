"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import { 
  PlaneTakeoff, ShieldCheck, MapPin, 
  CheckCircle2, Globe, Activity, Clock, AlertTriangle, CalendarCheck2, RefreshCw, ShieldAlert
} from 'lucide-react';

import bg1 from '../images/1.png';
import bg2 from '../images/2.png';
import bg3 from '../images/3.png';
import bg4 from '../images/4.png';
import bg5 from '../images/5.png';

const imagensFundo = [bg1, bg2, bg3, bg4, bg5];

interface Solicitacao {
  id?: string;
  cidade: string;
  icao?: string;
  dataDesejada: string;
  status: string;
  dataSolicitacao: string;
}

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function SolicitacaoPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [listaSolicitacoes, setListaSolicitacoes] = useState<Solicitacao[]>([]);

  // Campos do Formulário
  const [cidade, setCidade] = useState('');
  const [dataDesejada, setDataDesejada] = useState('');
  const [icao, setIcao] = useState('');
  const [termosAceites, setTermosAceites] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Verificação Matemática Anti-Spam
  const [numA, setNumA] = useState(2);
  const [numB, setNumB] = useState(2);
  const [captchaInput, setCaptchaInput] = useState('');

  const gerarNovoCaptcha = useCallback(() => {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    setNumA(a);
    setNumB(b);
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    gerarNovoCaptcha();
  }, [gerarNovoCaptcha]);

  const isCaptchaCorreto = parseInt(captchaInput.trim(), 10) === numA + numB;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imagensFundo.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = "Solicitar Demonstração Aérea | EDAFS Virtual";
    
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('description', 'Convide a Esquadrilha da Fumaça Virtual (EDAFS) para o seu evento ou aeroclube no Microsoft Flight Simulator. Preencha a solicitação online.');
    setMetaTag('keywords', 'esquadrilha da fumaça virtual, EDAFS, demonstração aérea virtual, MSFS 2020, MSFS 2024, show aéreo simulador, voo em formação');
    setMetaTag('og:title', 'Solicitar Demonstração Aérea | EDAFS Virtual', true);
    setMetaTag('og:description', 'Convide a Esquadrilha da Fumaça Virtual (EDAFS) para o seu evento no MSFS.', true);
    setMetaTag('og:type', 'website', true);

    const unsubscribe = onSnapshot(collection(db, 'solicitacoes'), (snap) => {
      const arr: Solicitacao[] = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() } as Solicitacao));
      arr.sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());
      setListaSolicitacoes(arr);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setModalSucesso(true);
      return;
    }

    if (!isCaptchaCorreto) {
      alert("A resposta da verificação de segurança está incorreta.");
      gerarNovoCaptcha();
      return;
    }

    if (!termosAceites) return alert("É necessário aceitar os termos da demonstração.");
    if (!cidade.trim() || !icao.trim() || icao.trim().length < 4) return;

    const lastRequest = localStorage.getItem('lastDemoRequest_edafs');
    if (lastRequest) {
      const timeDiff = Date.now() - parseInt(lastRequest, 10);
      if (timeDiff < 24 * 60 * 60 * 1000) {
        alert('Apenas uma solicitação por dia é permitida por dispositivo. Tente novamente amanhã.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'solicitacoes'), {
        cidade: cidade.trim(),
        icao: icao.trim().toUpperCase(),
        dataDesejada: dataDesejada,
        dataSolicitacao: new Date().toISOString(),
        status: 'Pendente'
      });

      localStorage.setItem('lastDemoRequest_edafs', Date.now().toString());
      setModalSucesso(true);
      
      setCidade('');
      setDataDesejada('');
      setIcao('');
      setTermosAceites(false);
      gerarNovoCaptcha();
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao enviar o pedido. Verifique a conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 2) {
      const day = parseInt(val.substring(0, 2), 10);
      if (day > 31) val = '31' + val.substring(2);
      else if (day === 0 && val.length >= 2) val = '01' + val.substring(2);
    }
    if (val.length >= 4) {
      const month = parseInt(val.substring(2, 4), 10);
      if (month > 12) val = val.substring(0, 2) + '12' + val.substring(4);
      else if (month === 0 && val.length >= 4) val = val.substring(0, 2) + '01' + val.substring(4);
    }
    if (val.length > 4) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    else if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    setDataDesejada(val);
  };

  const isFormValid =
    cidade.trim().length > 0 &&
    icao.trim().length === 4 &&
    dataDesejada.length === 10 &&
    termosAceites &&
    isCaptchaCorreto;

  return (
    <div className="root-wrapper">
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-weight: normal; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); font-weight: normal; font-style: normal; }

        * { font-family: 'Regular', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Comum', sans-serif !important; margin: 0; }

        .root-wrapper {
          background-color: #030712;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          color: #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .main-container {
          position: relative;
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 2rem;
          z-index: 10;
          height: calc(100vh - 80px);
          overflow: hidden;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 3.5rem;
          width: 100%;
          max-width: 1300px;
          height: 100%;
          max-height: 860px;
          align-items: stretch;
        }
        
        .left-column {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          overflow: hidden;
          animation: fadeIn 0.6s ease;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .termos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.9rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 1rem;
          border-radius: 14px;
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 115px;
          gap: 0.75rem;
        }

        .modern-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.42);
          border: 1px solid rgba(255,255,255,0.09);
          outline: none;
          padding: 0.8rem 1rem;
          color: #ffffff;
          border-radius: 11px;
          font-size: 0.9rem;
          font-weight: 400;
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }
        .modern-input:focus {
          background: rgba(0, 0, 0, 0.65);
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
        }
        .modern-input::placeholder { color: #64748b !important; opacity: 0.7 !important; }
        
        .timeline-step { display: flex; gap: 1.25rem; position: relative; padding-bottom: 1.75rem; }
        .timeline-step:last-child { padding-bottom: 0; }
        .timeline-step::before { content: ''; position: absolute; left: 21px; top: 44px; bottom: 0; width: 2px; background: linear-gradient(to bottom, #0ea5e9, rgba(14,165,233,0.05)); }
        .timeline-step:last-child::before { display: none; }
        .timeline-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); display: flex; align-items: center; justify-content: center; color: #0ea5e9; flex-shrink: 0; position: relative; z-index: 2; box-shadow: 0 4px 15px rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
        
        .glass-panel {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* NOVO LAYOUT DO QUADRO DE DEMONSTRAÇÕES */
        .demo-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          padding: 0.8rem 1rem;
          background: rgba(3, 7, 18, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          margin-bottom: 0.55rem;
          transition: all 0.2s ease;
        }
        .demo-card-row:last-child { margin-bottom: 0; }
        .demo-card-row:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(14, 165, 233, 0.25);
        }

        .demo-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.38rem 0.7rem;
          border-radius: 8px;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.22);
          color: #7dd3fc;
          font-size: 0.76rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .demo-location-info {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex: 1;
          min-width: 0;
        }

        .demo-city-name {
          color: #f8fafc;
          font-weight: 500;
          font-size: 0.88rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .demo-icao-pill {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 5px;
          flex-shrink: 0;
        }

        .captcha-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.75rem 0.9rem;
          background: rgba(2, 6, 23, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
        }

        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 1000px) {
          .root-wrapper {
            height: auto !important;
            min-height: 100vh;
            overflow: auto !important;
            overflow-x: hidden !important;
          }
          .main-container {
            height: auto !important;
            display: block !important;
            padding: 1rem 1.25rem 3rem 1.25rem !important;
            overflow: visible !important;
          }
          .grid-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            height: auto !important;
            max-height: none !important;
          }
          .left-column, .form-column {
            height: auto !important;
            overflow: visible !important;
          }
          .glass-panel {
            padding: 1.4rem !important;
          }
          .termos-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row-2 {
            grid-template-columns: 1fr !important;
          }
          .demo-card-row {
            flex-wrap: wrap;
            gap: 0.65rem;
          }
          .demo-location-info {
            order: 3;
            flex-basis: 100%;
          }
          .quadro-scroll-area {
            max-height: 320px !important;
          }
        }
      `}</style>

      {/* --- SISTEMA DE SLIDE DE FUNDO --- */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {imagensFundo.map((img, index) => (
          <div
            key={index}
            style={{
              position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentSlide === index ? 0.6 : 0,
              transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
              transitionProperty: 'opacity, transform', transitionDuration: '2s, 10s',
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.72) 50%, rgba(3,7,18,0.95) 100%)', zIndex: 1 }} />
      </div>

      {/* --- MENU SUPERIOR COMPACTO --- */}
      <header style={{ position: 'relative', zIndex: 50, width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', height: '80px', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/')} 
          aria-label="Voltar para a página inicial"
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', 
            padding: '0.6rem 1.25rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.5rem', 
            cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s', fontSize: '0.85rem', fontFamily: '"Comum", sans-serif'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <Globe size={16} color="#0ea5e9" aria-hidden="true" /> Voltar ao Início
        </button>

        <a 
          href="https://instagram.com/eda.msfs" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Visitar a página do Instagram da Esquadrilha da Fumaça Virtual"
          style={{ 
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
            border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '99px', display: 'flex', 
            alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', 
            fontSize: '0.85rem', fontFamily: '"Comum", sans-serif', boxShadow: '0 4px 15px rgba(220, 39, 67, 0.3)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <InstagramIcon /> Siga-nos no Instagram
        </a>
      </header>

      {/* --- CONTEÚDO CENTRAL --- */}
      <main className="main-container">
        <div className="grid-layout">
          
          {/* LADO ESQUERDO: Textos, Timeline e Quadro */}
          <section className="left-column">
            
            <header style={{ flexShrink: 0, marginBottom: '1.75rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Operações EDAFS</span>
              <h1 style={{ fontSize: 'clamp(2.1rem, 3.2vw, 3rem)', color: '#ffffff', margin: '0.2rem 0 0.45rem', lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                Solicitar Demonstração
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.5, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Leve a precisão e a doutrina da Esquadrilha da Fumaça Virtual ao seu evento.
              </p>
            </header>

            <article style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, marginBottom: '1.5rem' }}>
              <div className="timeline-step">
                <div className="timeline-icon"><ShieldCheck size={22} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', color: '#f8fafc', fontSize: '1.08rem' }}>1. Análise de Comando</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.48 }}>
                    Sua solicitação é avaliada pela seção de Operações da EDAFS quanto à natureza do evento, relevância para a simulação e viabilidade da data.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="timeline-icon"><MapPin size={22} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', color: '#f8fafc', fontSize: '1.08rem' }}>2. Missão Precursora (Logística)</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.48 }}>
                    Realizamos o reconhecimento técnico do local no simulador. <strong style={{ color: '#cbd5e1' }}>É obrigatória</strong> a existência de um aeródromo homologado a até 80 km de distância.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="timeline-icon"><CalendarCheck2 size={22} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem', color: '#f8fafc', fontSize: '1.08rem' }}>3. Aprovação e Agenda</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.48 }}>
                    Sendo viável, o pedido é aprovado internamente. <strong>Atenção:</strong> aguarde sempre a publicação oficial na agenda do site para confirmação definitiva.
                  </p>
                </div>
              </div>
            </article>

            <article className="termos-grid">
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><ShieldCheck size={14} aria-hidden="true"/> 1. Apoio Logístico</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>O local requer um aeródromo homologado (ICAO) a no máximo 80 km de distância.</p>
              </div>
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><MapPin size={14} aria-hidden="true"/> 2. Meteorologia</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>Operamos com clima real. Condições extremas podem causar cancelamentos por segurança.</p>
              </div>
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><AlertTriangle size={14} aria-hidden="true"/> 3. Disponibilidade</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>Imprevistos técnicos e a escala dos pilotos voluntários podem gerar reagendamentos.</p>
              </div>
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><CalendarCheck2 size={14} aria-hidden="true"/> 4. Confirmação Final</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>A aprovação prévia não garante o voo. Aguarde a publicação na agenda oficial do site.</p>
              </div>
            </article>

            {/* Quadro de Solicitações Reformulado */}
            {listaSolicitacoes.length > 0 && (
              <article className="glass-panel" style={{ flexGrow: 1, minHeight: '150px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.1rem 1.35rem' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Activity size={18} color="#0ea5e9" aria-hidden="true" />
                    <h2 style={{ margin: 0, fontSize: '0.98rem', color: '#f8fafc', letterSpacing: '0.02em' }}>Quadro de Demonstrações Solicitadas</h2>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    {listaSolicitacoes.length} {listaSolicitacoes.length === 1 ? 'registro' : 'registros'}
                  </span>
                </header>
                
                <div className="custom-scroll quadro-scroll-area" style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.35rem' }}>
                  {listaSolicitacoes.map((s) => {
                    const isAprovado = s.status === 'Aprovado';
                    const isRecusado = s.status === 'Recusado';
                    const statusColor = isAprovado ? '#10b981' : isRecusado ? '#ef4444' : '#f59e0b';
                    const statusBg = isAprovado ? 'rgba(16,185,129,0.12)' : isRecusado ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
                    const statusBorder = isAprovado ? 'rgba(16,185,129,0.28)' : isRecusado ? 'rgba(239,68,68,0.28)' : 'rgba(245,158,11,0.28)';

                    return (
                      <div key={s.id} className="demo-card-row">
                        <div className="demo-date-badge">
                          <Clock size={13} color="#0ea5e9" aria-hidden="true" />
                          <time dateTime={s.dataDesejada}>{s.dataDesejada || 'A definir'}</time>
                        </div>

                        <div className="demo-location-info">
                          <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} aria-hidden="true" />
                          <span className="demo-city-name" title={s.cidade}>{s.cidade}</span>
                          {s.icao && <span className="demo-icao-pill">{s.icao}</span>}
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: statusBg,
                            border: `1px solid ${statusBorder}`,
                            color: statusColor,
                            padding: '0.28rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                          {s.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            )}
          </section>

          {/* LADO DIREITO: Formulário Enxuto + Verificação Anti-Spam */}
          <section className="form-column" aria-label="Formulário de Solicitação">
            <div className="glass-panel" style={{ padding: '2.1rem', animation: 'fadeIn 0.8s ease' }}>
              <div style={{ marginBottom: '1.35rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Dados da Operação</h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Informe a localidade, o aeródromo de apoio e a data pretendida.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                
                {/* HONEYPOT ANTI-BOT INVISÍVEL */}
                <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                  <label htmlFor="website_confirm">Deixe este campo vazio</label>
                  <input id="website_confirm" type="text" name="website_confirm" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                </div>

                <div className="form-row-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="cidade" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade ou Evento *</label>
                    <input id="cidade" required type="text" className="modern-input" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Rio de Janeiro - RJ" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="icao" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ICAO *</label>
                    <input id="icao" required type="text" maxLength={4} className="modern-input" value={icao} onChange={e => setIcao(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} placeholder="SBRJ" style={{ textTransform: 'uppercase', borderColor: 'rgba(14,165,233,0.35)', color: '#0ea5e9', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.08em' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="dataDesejada" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Desejada *</label>
                  <input id="dataDesejada" required type="text" maxLength={10} className="modern-input" value={dataDesejada} onChange={handleDateChange} placeholder="DD/MM/AAAA" />
                </div>

                {/* VERIFICAÇÃO ANTI-SPAM (DESAFIO MATEMÁTICO) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="captcha" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldAlert size={13} color="#0ea5e9" aria-hidden="true" /> Verificação Anti-Spam *
                  </label>
                  <div className="captcha-box" style={{ borderColor: captchaInput ? (isCaptchaCorreto ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.45)') : 'rgba(255,255,255,0.09)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Quanto é</span>
                      <span style={{ background: 'rgba(14,165,233,0.14)', border: '1px solid rgba(14,165,233,0.3)', color: '#f8fafc', padding: '0.32rem 0.7rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                        {numA} + {numB} =
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        id="captcha"
                        required
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="?"
                        style={{
                          width: '68px',
                          textAlign: 'center',
                          padding: '0.48rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.5)',
                          border: `1px solid ${captchaInput ? (isCaptchaCorreto ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.15)'}`,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={gerarNovoCaptcha}
                        title="Gerar outra conta"
                        aria-label="Gerar novo cálculo de segurança"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <button 
                    type="button"
                    role="checkbox"
                    aria-checked={termosAceites}
                    onClick={() => setTermosAceites(!termosAceites)} 
                    style={{ width: '20px', height: '20px', borderRadius: '5px', border: termosAceites ? 'none' : '1px solid #64748b', background: termosAceites ? '#0ea5e9' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '2px', transition: 'all 0.2s' }}
                  >
                    {termosAceites && <CheckCircle2 size={14} color="#fff" />}
                  </button>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.45, cursor: 'pointer', userSelect: 'none' }} onClick={() => setTermosAceites(!termosAceites)}>
                    Li e concordo expressamente com todas as etapas de avaliação e as 4 restrições descritas ao lado.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !isFormValid} 
                  aria-busy={isSubmitting}
                  style={{
                    width: '100%',
                    marginTop: '0.4rem',
                    padding: '0.9rem',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: (isSubmitting || !isFormValid) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: (isSubmitting || !isFormValid) ? 0.45 : 1,
                    boxShadow: isFormValid ? '0 10px 25px rgba(14, 165, 233, 0.38)' : 'none',
                  }}
                >
                  {isSubmitting ? 'Enviando ao Comando...' : 'Enviar Solicitação'}
                </button>
              </form>
            </div>
          </section>

        </div>
      </main>

      {/* Modal Sucesso */}
      <div className="modal-overlay" aria-hidden={!modalSucesso} style={{ position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(10px)', zIndex: 99999, display: modalSucesso ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', padding: '1rem', opacity: modalSucesso ? 1 : 0, visibility: modalSucesso ? 'visible' : 'hidden', transition: 'all 0.3s ease' }}>
        <div role="dialog" aria-labelledby="sucesso-title" aria-describedby="sucesso-desc" style={{ padding: '3rem 2.5rem', background: '#0f172a', border: '1px solid #10b981', borderRadius: '24px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <PlaneTakeoff size={48} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} aria-hidden="true" />
          <h2 id="sucesso-title" style={{ color: '#f8fafc', fontSize: '1.5rem', margin: '0 0 1rem', fontWeight: 'bold', fontFamily: '"Comum", sans-serif' }}>Solicitação Enviada!</h2>
          <p id="sucesso-desc" style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 400, fontSize: '0.9rem' }}>O Comando Geral irá analisar o seu pedido. Caso viável, faremos o alinhamento interno. Acompanhe a nossa agenda oficial!</p>
          <button type="button" style={{ background: '#10b981', color: '#030712', letterSpacing: '0.1em', padding: '0.85rem 2rem', width: '100%', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} onClick={() => { setModalSucesso(false); navigate('/'); }}>VOLTAR AO INÍCIO</button>
        </div>
      </div>
    </div>
  );
}