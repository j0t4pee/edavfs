"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import { 
  PlaneTakeoff, ShieldCheck, MapPin, 
  CheckCircle2, Radio, Globe, Activity, Clock, Inbox, AlertTriangle, CalendarCheck2
} from 'lucide-react';

// Importação das 5 imagens para o Slide
import bg1 from '../images/1.png';
import bg2 from '../images/2.png';
import bg3 from '../images/3.png';
import bg4 from '../images/4.png';
import bg5 from '../images/5.png';

const imagensFundo = [bg1, bg2, bg3, bg4, bg5];

interface Solicitacao {
  id?: string;
  cidade: string;
  dataDesejada: string;
  status: string;
  dataSolicitacao: string;
}

// Ícone do Instagram em SVG desenhado manualmente para evitar erros do Lucide e aplicar o Degradê
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
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [dataDesejada, setDataDesejada] = useState('');
  const [icao, setIcao] = useState('');
  const [transmissao, setTransmissao] = useState<'sim' | 'nao' | ''>('');
  const [canal, setCanal] = useState('');
  const [termosAceites, setTermosAceites] = useState(false);

  // Efeito de transição automática do fundo a cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imagensFundo.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch das solicitações públicas e Injeção de Meta Tags SEO
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
    
    document.body.style.overflow = 'hidden';

    const unsubscribe = onSnapshot(collection(db, 'solicitacoes'), (snap) => {
      const arr: Solicitacao[] = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() } as Solicitacao));
      arr.sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());
      setListaSolicitacoes(arr);
    });

    return () => {
      document.body.style.overflow = 'auto'; // Restaura ao sair
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termosAceites) return alert("É necessário aceitar os termos da demonstração.");
    if (!cidade.trim() || !icao.trim() || !transmissao) return;

    const lastRequest = localStorage.getItem('lastDemoRequest_edafs');
    if (lastRequest) {
      const timeDiff = Date.now() - parseInt(lastRequest);
      if (timeDiff < 24 * 60 * 60 * 1000) {
        alert('Apenas uma solicitação por dia é permitida por dispositivo. Tente novamente amanhã.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'solicitacoes'), {
        solicitante: nome,
        cidade: cidade,
        icao: icao.toUpperCase(),
        dataDesejada: dataDesejada,
        transmissao: transmissao,
        canal: transmissao === 'sim' ? canal : 'Sem Transmissão',
        dataSolicitacao: new Date().toISOString(),
        status: 'Pendente'
      });

      localStorage.setItem('lastDemoRequest_edafs', Date.now().toString());
      setModalSucesso(true);
      
      setNome(''); setCidade(''); setDataDesejada(''); setIcao(''); 
      setTransmissao(''); setCanal(''); setTermosAceites(false);
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
      let day = parseInt(val.substring(0, 2));
      if (day > 31) val = '31' + val.substring(2);
      else if (day === 0 && val.length >= 2) val = '01' + val.substring(2);
    }
    if (val.length >= 4) {
      let month = parseInt(val.substring(2, 4));
      if (month > 12) val = val.substring(0, 2) + '12' + val.substring(4);
      else if (month === 0 && val.length >= 4) val = val.substring(0, 2) + '01' + val.substring(4);
    }
    if (val.length > 4) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    else if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    setDataDesejada(val);
  };

  return (
    <div style={{ backgroundColor: '#030712', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-weight: normal; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); font-weight: normal; font-style: normal; }

        * { font-family: 'Regular', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Comum', sans-serif !important; margin: 0; }

        .modern-input {
          width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.08); outline: none; padding: 0.75rem 1rem; color: #ffffff; border-radius: 10px; font-size: 0.9rem; font-weight: 300; transition: all 0.3s ease; box-sizing: border-box; backdrop-filter: blur(4px);
        }
        .modern-input:focus { background: rgba(0, 0, 0, 0.6); border-color: #0ea5e9; box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2); }
        .modern-input::placeholder { color: #64748b !important; opacity: 0.6 !important; font-weight: 300; }
        
        .platform-btn {
          flex: 1; padding: 0.6rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); outline: none; border-radius: 10px; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s ease; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; backdrop-filter: blur(4px);
        }
        .platform-btn:hover { background: rgba(255,255,255,0.08); color: #f8fafc; border-color: rgba(255,255,255,0.15); }
        .platform-btn.active { background: rgba(14, 165, 233, 0.15); border-color: #0ea5e9; color: #0ea5e9; font-weight: 600; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2); }
        
        /* TIMELINE COM MAIOR DESTAQUE */
        .timeline-step { display: flex; gap: 1.5rem; position: relative; padding-bottom: 2.5rem; }
        .timeline-step:last-child { padding-bottom: 0; }
        .timeline-step::before { content: ''; position: absolute; left: 23px; top: 48px; bottom: 0; width: 2px; background: linear-gradient(to bottom, #0ea5e9, rgba(14,165,233,0.05)); }
        .timeline-step:last-child::before { display: none; }
        .timeline-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); display: flex; align-items: center; justify-content: center; color: #0ea5e9; flex-shrink: 0; position: relative; z-index: 2; box-shadow: 0 4px 15px rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
        
        .glass-panel {
          background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .list-row {
          display: grid; grid-template-columns: 80px 1fr auto; align-items: center; padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 0.5rem;
        }

        /* Custom Scrollbar for internal lists */
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Mobile Fallback: Permite scroll no celular */
        @media (max-width: 900px) {
          body { overflow: auto !important; }
          .main-container { height: auto !important; overflow: visible !important; display: block !important; padding-bottom: 2rem; }
          .grid-layout { grid-template-columns: 1fr !important; gap: 2rem !important; height: auto !important; }
          .left-column { overflow: visible !important; }
        }
      `}</style>

      {/* --- SISTEMA DE SLIDE DE FUNDO --- */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {imagensFundo.map((img, index) => (
          <div
            key={index}
            style={{
              position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentSlide === index ? 0.6 : 0, transition: 'opacity 2s ease-in-out',
              transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
              transitionProperty: 'opacity, transform', transitionDuration: '2s, 10s',
            }}
          />
        ))}
        {/* Máscara Escura para contraste */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.7) 50%, rgba(3,7,18,0.95) 100%)', zIndex: 1 }} />
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

      {/* --- CONTEÚDO CENTRAL (NO-SCROLL LAYOUT) --- */}
      <main className="main-container" style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 2rem', zIndex: 10, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
        <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '4rem', width: '100%', maxWidth: '1300px', height: '100%', maxHeight: '850px', alignItems: 'stretch' }}>
          
          {/* LADO ESQUERDO: Textos e Timeline BEM EXPLICADA */}
          <section className="left-column" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', overflow: 'hidden', animation: 'fadeIn 0.6s ease' }}>
            
            {/* Título e Info */}
            <header style={{ flexShrink: 0, marginBottom: '2.5rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Operações EDAFS</span>
              <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: '#ffffff', margin: '0.2rem 0 0.5rem', lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                Solicitar Demonstração
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.5, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Leve a precisão e a doutrina da Esquadrilha da Fumaça Virtual ao seu evento. 
              </p>
            </header>

            {/* TIMELINE VERTICAL - AMPLIADA E BEM EXPLICADA */}
            <article style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, marginBottom: '2rem' }}>
              
              <div className="timeline-step">
                <div className="timeline-icon"><ShieldCheck size={24} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.4rem', color: '#f8fafc', fontSize: '1.25rem' }}>1. Análise de Comando</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Sua solicitação é recebida de imediato pela seção de Operações da EDAFS. O Comando Geral avaliará a natureza do evento, relevância para a simulação e viabilidade da data.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="timeline-icon"><MapPin size={24} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.4rem', color: '#f8fafc', fontSize: '1.25rem' }}>2. Missão Precursora (Logística)</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Uma equipe realiza o reconhecimento técnico do local no simulador. <strong style={{ color: '#cbd5e1' }}>É obrigatória</strong> a existência de um aeródromo homologado a no máximo 80 km de distância do evento, para apoio logístico.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="timeline-icon"><CalendarCheck2 size={24} aria-hidden="true"/></div>
                <div>
                  <h3 style={{ margin: '0 0 0.4rem', color: '#f8fafc', fontSize: '1.25rem' }}>3. Aprovação e Alinhamento</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Sendo viável, o pedido é aprovado e a equipe fará uma reunião de alinhamento. <strong>Atenção:</strong> a aprovação da solicitação não confirma 100% que o evento ocorrerá. Aguarde a publicação oficial na agenda do site.
                  </p>
                </div>
              </div>

            </article>

            {/* Termos de Execução - Muito compactos, agora com 4 itens (2x2) */}
            <article style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><ShieldCheck size={14} aria-hidden="true"/> 1. Apoio Logístico</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>O local do evento requer um aeródromo homologado (ICAO) a no máximo 80 km de distância.</p>
              </div>
              <div>
                <h3 style={{ color: '#0ea5e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><MapPin size={14} aria-hidden="true"/> 2. Meteorologia</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: 0, lineHeight: 1.4 }}>Operamos com clima real. Condições extremas podem causar cancelamentos por segurança virtual.</p>
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

            {/* Quadro de Solicitações - Renderiza APENAS se houver itens e a altura permitir */}
            {listaSolicitacoes.length > 0 && (
              <article className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem 1.5rem' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0 }}>
                  <Activity size={18} color="#0ea5e9" aria-hidden="true" />
                  <h2 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Quadro de Solicitações</h2>
                </header>
                
                <div className="custom-scroll" style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem' }}>
                  {listaSolicitacoes.map(s => (
                    <div key={s.id} className="list-row" style={{ padding: '0.5rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem' }}>
                        <Clock size={12} aria-hidden="true" /> <time dateTime={s.dataDesejada}>{s.dataDesejada || 'A definir'}</time>
                      </div>
                      <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.cidade}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          background: s.status === 'Aprovado' ? 'rgba(16,185,129,0.1)' : s.status === 'Recusado' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', 
                          color: s.status === 'Aprovado' ? '#10b981' : s.status === 'Recusado' ? '#ef4444' : '#f59e0b', 
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' 
                        }}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </section>

          {/* LADO DIREITO: Formulário Glassmorphism Centrado Verticalmente */}
          <section aria-label="Formulário de Solicitação" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.8s ease' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label htmlFor="nome" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome / Organização *</label>
                  <input id="nome" required type="text" className="modern-input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Quem está organizando?" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label htmlFor="cidade" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade ou Evento *</label>
                    <input id="cidade" required type="text" className="modern-input" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Rio de Janeiro - RJ" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label htmlFor="icao" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ICAO *</label>
                    <input id="icao" required type="text" maxLength={4} className="modern-input" value={icao} onChange={e => setIcao(e.target.value)} placeholder="SBRJ" style={{ textTransform: 'uppercase', borderColor: 'rgba(14,165,233,0.3)', color: '#0ea5e9', fontWeight: 'bold' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label htmlFor="dataDesejada" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Desejada</label>
                  <input id="dataDesejada" required type="text" maxLength={10} className="modern-input" value={dataDesejada} onChange={handleDateChange} placeholder="DD/MM/AAAA" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Haverá Transmissão ao Vivo? *</span>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }} role="group" aria-label="Haverá transmissão ao vivo?">
                    <button type="button" aria-pressed={transmissao === 'sim'} onClick={() => setTransmissao('sim')} className={`platform-btn ${transmissao === 'sim' ? 'active' : ''}`}>Sim</button>
                    <button type="button" aria-pressed={transmissao === 'nao'} onClick={() => { setTransmissao('nao'); setCanal(''); }} className={`platform-btn ${transmissao === 'nao' ? 'active' : ''}`}>Não</button>
                  </div>
                </div>

                {transmissao === 'sim' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', animation: 'fadeIn 0.3s ease' }}>
                    <label htmlFor="canal" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link do Canal (YouTube/Twitch) *</label>
                    <div style={{ position: 'relative' }}>
                      <Radio size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
                      <input id="canal" required type="url" className="modern-input" value={canal} onChange={e => setCanal(e.target.value)} placeholder="https://youtube.com/..." style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <button 
                    type="button"
                    role="checkbox"
                    aria-checked={termosAceites}
                    onClick={() => setTermosAceites(!termosAceites)} 
                    style={{ width: '20px', height: '20px', borderRadius: '4px', border: termosAceites ? 'none' : '1px solid #64748b', background: termosAceites ? '#0ea5e9' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '2px', transition: 'all 0.2s' }}
                  >
                    {termosAceites && <CheckCircle2 size={14} color="#fff" />}
                  </button>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4, cursor: 'pointer', userSelect: 'none' }} onClick={() => setTermosAceites(!termosAceites)}>
                    Li e concordo expressamente com todas as etapas de avaliação e as 4 restrições descritas ao lado.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !nome || !cidade || !icao || !transmissao || !termosAceites || icao.length < 4} 
                  aria-busy={isSubmitting}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', opacity: (isSubmitting || !nome || !cidade || !icao || !transmissao || !termosAceites || icao.length < 4) ? 0.5 : 1, boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)' }}
                >
                  {isSubmitting ? 'Enviando Comando...' : 'Enviar Solicitação'}
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