"use client";

import React, { useState, useEffect, useRef } from 'react';
import '../App.css'; 
import { 
  ChevronRight, ChevronLeft, CheckCircle2, Calendar, 
  X, ShieldCheck, Shield, FileText, AlertTriangle, Cookie,
  Radio, PlaneTakeoff, Play, Camera, History, Plus, Users
} from 'lucide-react';

import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

import Header from './Header';
import Footer from './Footer';

import logoImage from '../images/logo.png';
import faviconImage from '../images/favicon.png';
import pilotoImg from '../images/piloto.png';
import a29TopDown from '../images/a-29.png'; 
import mfLogo from '../images/mf.png';
import mfLogo24 from '../images/mf24.png';

import tucano3png from '../images/tucano3.jpg';
import tucano2png from '../images/tucano2.jpg';
import tucano4png from '../images/tucano4.jpg';
import tucano5png from '../images/tucano5.jpg';
import tucano8png from '../images/tucano8.png';
import tucano9png from '../images/tucano9.png';
import tucano10png from '../images/tucano10.png';
import tucano11png from '../images/tucano11.png';
import tucano12png from '../images/tucano12.png';
import tucano13png from '../images/tucano13.png';

import img1 from '../images/1.png';
import img2 from '../images/2.png';
import img3 from '../images/3.png';
import img4 from '../images/4.png';
import img5 from '../images/5.png';
import img6 from '../images/6.png';
import img7 from '../images/7.png';
import img8 from '../images/8.png';

interface Piloto {
  id?: string;
  posicao: string;
  nome: string;
  cidade?: string;
  uf?: string;
  oculto?: boolean;
  plataforma?: string;
  idade?: number;
  descricao?: string;
  simulador?: string;
  patente?: string;
  ocultarSimulador?: boolean;
}

interface Demonstracao {
  id?: string;
  cidade: string;
  coordsText: string;
  lat: number;
  lng: number;
  status: string;
  cssClass: string;
  dataHora: string;
  tipo: string;
  plataforma?: string;
  ocultarSimulador?: boolean;
}

interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }
interface Video { id?: string; url: string; ativo?: boolean; }

const getPatenteAbbr = (patente?: string) => {
  if (patente === 'Capitão Aviador') return 'Cap. Av.';
  if (patente === 'Major Aviador') return 'Maj. Av.';
  if (patente === 'Tenente-Coronel Aviador') return 'Ten. Cel. Av.';
  if (patente === 'Oficial de Relações Públicas') return 'Of. RP';
  return '';
};

const getInitials3 = (name: string) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.substring(0, 3).toUpperCase();
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  return (words[0].substring(0, 2) + words[1].substring(0, 1)).toUpperCase();
};

const SectionHeaderApple = ({ overline, title, subtitle }: { overline?: string; title: string; subtitle?: string }) => (
  <div className="noselect reveal-on-scroll" style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'left' }}>
    {overline && (
      <span style={{ fontFamily: '"Comum", sans-serif', fontWeight: 600, color: '#0ea5e9', fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {overline}
      </span>
    )}
    <h2 style={{ fontFamily: '"Comum", Arial, sans-serif', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#f8fafc', fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', margin: '0 0 1rem 0', lineHeight: 1.1 }}>
      {title}
    </h2>
    {subtitle && (
      <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, fontWeight: 400, fontFamily: '"Regular", Arial, sans-serif', lineHeight: 1.6 }}>
        {subtitle}
      </p>
    )}
  </div>
);

const galeriaImagens = [
  img1, img2, img3, img4, img5, img6, img7, img8,
  tucano2png, tucano3png, tucano4png, tucano5png,
  tucano8png, tucano9png, tucano10png, tucano11png,
  tucano12png, tucano13png
];

const legalContent = {
  privacidade: {
    title: "Política de Privacidade",
    subtitle: "Como protegemos e tratamos os seus dados.",
    body: (
      <>
        <p>Este documento estabelece as diretrizes de proteção de dados e privacidade da Esquadrilha da Fumaça Virtual (EDAFS), garantindo o cumprimento das leis vigentes e o respeito à sua navegação.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Coleta de Dados e Finalidade</h4>
        <p>Ao realizar o alistamento ou interagir no portal, solicitamos informações essenciais (nome, idade, contacto, experiência em simuladores). Estes dados têm o único propósito de viabilizar o processo de seleção de pilotos, comunicação interna e coordenação operacional de voos. Nenhum dado é repassado, vendido ou utilizado para fins comerciais ou publicitários de qualquer espécie.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Armazenamento e Autenticação</h4>
        <p>Utilizamos os serviços seguros da Google (Firebase Authentication e Firestore) para guardar os perfis dos membros e validar o login. O acesso à base de dados é estritamente limitado ao Comando Geral (Administradores) através do Workspace criptografado.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Exclusão e Direitos do Utilizador</h4>
        <p>O piloto pode solicitar a eliminação definitiva e integral dos seus dados do sistema a qualquer momento, contactando a administração via Discord. A exclusão dos dados acarretará no imediato desligamento do membro do esquadrão.</p>
      </>
    )
  },
  termos: {
    title: "Termos de Uso Operacional",
    subtitle: "Diretrizes de convivência e conduta no Esquadrão.",
    body: (
      <>
        <p>Ao ingressar ou participar nas plataformas e voos da Esquadrilha da Fumaça Virtual, o membro concorda e compromete-se a seguir rigorosamente os padrões de conduta exigidos.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Conduta e Profissionalismo</h4>
        <p>Exigimos respeito mútuo, camaradagem e espírito de equipa. Não toleramos, sob qualquer pretexto, comportamentos tóxicos, discursos de ódio, assédio, ou qualquer atitude que lese a moral e a boa convivência entre os membros e parceiros do esquadrão. Violações resultarão em expulsão imediata.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Normas de Voo e Simulação</h4>
        <p>Operamos em ambientes de simulação (redes como VATSIM/IVAO ou servidores privados do MSFS) buscando a mais alta fidelidade e profissionalismo possíveis. O uso de cheats, modificações que afetem a integridade do voo dos parceiros ou qualquer conduta antidesportiva é estritamente proibido. É mandatório o uso de cópias legais e originais do Microsoft Flight Simulator.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Assiduidade e Hierarquia</h4>
        <p>Pilotos inativos por longos períodos sem a devida justificação ao comando serão movidos para a reserva (ocultos) ou permanentemente desligados para dar lugar a novos cadetes. As decisões tomadas pelo Comando Geral visam sempre a organização do grupo e o sucesso das missões, devendo ser respeitadas. Sugestões e críticas construtivas são sempre bem-vindas nos canais adequados (Discord).</p>
      </>
    )
  },
  cookies: {
    title: "Política de Cookies",
    subtitle: "Uso de cookies essenciais para a plataforma.",
    body: (
      <>
        <p>Este portal utiliza tecnologias de armazenamento local para garantir uma navegação fluida, segura e personalizada.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Cookies Estritamente Necessários</h4>
        <p>Utilizamos exclusivamente cookies de sessão e localStorage essenciais para que as funções básicas do portal operem corretamente. Estes ficheiros servem, por exemplo, para manter a sua sessão segura no Workspace (via Firebase) e para registar as suas escolhas de interface (como ter fechado o banner de aviso ou aceite esta mesma política, evitando que reapareçam em cada carregamento).</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Ausência de Rastreadores (Tracking)</h4>
        <p>Em respeito total à sua privacidade, <strong>não integramos rastreadores de terceiros</strong> (como Google Analytics, Meta Pixel ou ferramentas de publicidade direcionada). A sua navegação no nosso site é privada, anónima, e não é monitorizada para a criação de perfis de consumidor.</p>
      </>
    )
  },
  disclaimer: {
    title: "Aviso Legal Institucional",
    subtitle: "Direitos autorais, marcas e ausência de vínculos.",
    body: (
      <>
        <p>O portal e o grupo Esquadrilha da Fumaça Virtual operam sob os princípios do Fair Use (uso aceitável) e do absoluto respeito institucional.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Entidade Civil e Entusiasta</h4>
        <p>A Esquadrilha da Fumaça Virtual (EDAFS) é um agrupamento civil, amador, independente e sem fins lucrativos, focado estritamente na prática do desporto eletrónico (e-sports) e entretenimento no âmbito da simulação de voo digital.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Ausência de Vínculo Oficial</h4>
        <p><strong>Deixamos formal e categoricamente explícito que não possuímos nenhuma afiliação, patrocínio, endosso ou ligação com a Força Aérea Brasileira (FAB), o Ministério da Defesa, ou o Esquadrão de Demonstração Aérea (EDA) oficial.</strong></p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Propriedade Intelectual e Homenagem</h4>
        <p>A utilização de pinturas, logotipos inspirados, designações de aeronaves (como o Embraer A-29 Super Tucano), e terminologias militares possui caráter puramente ilustrativo, ficcional e lúdico. O único e exclusivo objetivo é prestar homenagem aos profissionais reais da aviação em ambiente virtual. Marcas registadas como "Embraer", "Super Tucano" e "Microsoft Flight Simulator" pertencem aos seus respetivos e legítimos proprietários.</p>
        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>4. Isenção de Responsabilidade Técnica</h4>
        <p>As atividades conduzidas pelo grupo são jogos de computador. Não prestamos instrução de voo real e não somos homologados por nenhuma autoridade aeronáutica. Nenhuma tática, conhecimento ou manobra aprendida no nosso ambiente simulado deve ser aplicada na aviação real.</p>
      </>
    )
  }
};

const PilotBioModal = ({ piloto, onClose }: { piloto: Piloto | null; onClose: () => void }) => {
  if (!piloto) return null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 100000 }} onClick={onClose}>
      <div
        className="modal-content glass-panel modal-content-pilot"
        style={{ 
          padding: 0, 
          maxWidth: '850px', 
          width: '95%', 
          position: 'relative', 
          overflow: 'hidden', 
          animation: 'scaleIn 0.3s ease',
          display: 'flex',
          minHeight: '450px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          backgroundImage: `url(${pilotoImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center left',
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: '#0ea5e9', filter: 'blur(120px)', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />

        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <X size={20} />
        </button>

        <div className="bio-container-content" style={{ position: 'relative', zIndex: 1, padding: '3.5rem', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 'auto', maxWidth: '650px' }}>
          
          <div className="bio-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ 
              minWidth: '84px', 
              width: 'auto', 
              height: '80px', 
              padding: '0 1rem',
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0 
            }}>
              <span style={{ 
                fontSize: '2.2rem', 
                fontFamily: '"PosicaoFont", sans-serif', 
                background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                color: 'transparent', 
                lineHeight: 1, 
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' 
              }}>
                {getInitials3(piloto.nome)}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#ffffff', fontWeight: 'bold', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {piloto.nome}
              </h3>
              <span style={{ color: '#0ea5e9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.9rem', display: 'block', marginTop: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {piloto.patente ? `${piloto.patente} • ` : ''}Fumaça {piloto.posicao}
              </span>
            </div>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)', marginBottom: '2rem' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Idade</span>
              <div style={{ color: '#f8fafc', fontWeight: 500, marginTop: '4px', fontSize: '1.2rem' }}>{piloto.idade || '--'} anos</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Localidade</span>
              <div style={{ color: '#f8fafc', fontWeight: 500, marginTop: '4px', fontSize: '1.2rem' }}>{piloto.cidade || '--'} {piloto.uf ? `- ${piloto.uf}` : ''}</div>
            </div>
            {!piloto.ocultarSimulador && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Plataforma</span>
                <div style={{ color: '#f8fafc', fontWeight: 500, marginTop: '4px', fontSize: '1.2rem' }}>{piloto.simulador || piloto.plataforma || 'MSFS 2020'}</div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Biografia & Trajetória</span>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.8, textAlign: 'justify' }}>
              {piloto.descricao || 'Biografia em atualização. Em breve o piloto irá preencher o seu perfil com mais informações acerca da sua trajetória na aviação virtual.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTopBanner, setShowTopBanner] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edafs_banner_closed') !== 'true';
    }
    return true;
  });

  const [cookiesAccepted, setCookiesAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edafs_cookies_accepted') === 'true';
    }
    return false;
  });
  
  const [activeSection, setActiveSection] = useState('');
  
  const [pilotoTab, setPilotoTab] = useState<'2020' | '2024'>('2024');
  const [agendaTab, setAgendaTab] = useState<'2020' | '2024' | 'historico'>('2024');
  
  const [midiaTab, setMidiaTab] = useState<'videos' | 'galeria'>('galeria');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const [agendaPage, setAgendaPage] = useState(1);
  const AGENDA_ITEMS_PER_PAGE = 5;

  const [videoPage, setVideoPage] = useState(1);
  const VIDEOS_PER_PAGE = 6;

  const [galeriaPage, setGaleriaPage] = useState(1);
  const GALERIA_PER_PAGE = 6;
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacidade' | 'termos' | 'cookies' | 'disclaimer'>('privacidade');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoCidade, setDemoCidade] = useState('');
  const [demoTransmissao, setDemoTransmissao] = useState<'sim' | 'nao' | ''>('');
  const [demoCanal, setDemoCanal] = useState('');
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [modalDemoSucesso, setModalDemoSucesso] = useState(false);

  const [dbPilotos, setDbPilotos] = useState<Piloto[]>([]);
  const [selectedPiloto, setSelectedPiloto] = useState<Piloto | null>(null);

  const [dbDemonstracoes, setDbDemonstracoes] = useState<Demonstracao[]>([]);
  const [dbVideos, setDbVideos] = useState<Video[]>([]);
  
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [solicitacaoAberta, setSolicitacaoAberta] = useState(true);
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  const [mostrarFS20, setMostrarFS20] = useState(true);
  const [mostrarFS24, setMostrarFS24] = useState(true);
  
  const [plataforma, setPlataforma] = useState('');
  const [simuladorPossui, setSimuladorPossui] = useState('');
  
  const [modalAlistamento, setModalAlistamento] = useState(false);
  const [modalIdadeOpen, setModalIdadeOpen] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isBlocked, setIsBlocked] = useState(false); 

  const modalContentRef = useRef<HTMLDivElement>(null);

  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [discord, setDiscord] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [vooAcrobatico, setVooAcrobatico] = useState<'sim' | 'nao' | ''>('');
  const [detalhesVooAcrobatico, setDetalhesVooAcrobatico] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('');
  const [motivoIngresso, setMotivoIngresso] = useState('');
  const [possuiA29, setPossuiA29] = useState<'sim' | 'nao' | ''>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
      }

      if (lightboxIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setLightboxIndex(prev => prev === 0 ? galeriaImagens.length - 1 : prev! - 1);
        } else if (e.key === 'ArrowRight') {
          setLightboxIndex(prev => prev === galeriaImagens.length - 1 ? 0 : prev! + 1);
        } else if (e.key === 'Escape') {
          setLightboxIndex(null);
        }
      }
    };
    
    const blockRightClick = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', blockRightClick);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', blockRightClick);
    };
  }, [lightboxIndex]);

  const handleCloseBanner = () => {
    setShowTopBanner(false);
    localStorage.setItem('edafs_banner_closed', 'true');
  };

  const aceitarCookies = () => {
    setCookiesAccepted(true);
    localStorage.setItem('edafs_cookies_accepted', 'true');
    setLegalModalOpen(false);
  };

  const recusarCookies = () => {
    setCookiesAccepted(false);
    localStorage.setItem('edafs_cookies_accepted', 'false');
    setLegalModalOpen(false);
  };

  const fecharModalClicandoFora = (e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      setLegalModalOpen(false);
    }
  };

  useEffect(() => {
    if (isAppLoading) {
      document.body.style.overflow = 'hidden';
      const duration = 1800;
      const intervalTime = 30;
      const totalSteps = duration / intervalTime;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setLoadingProgress(Math.min(100, (step / totalSteps) * 100));
        
        if (step >= totalSteps) {
          clearInterval(timer);
          setIsAppLoading(false);
          document.body.style.overflow = 'auto';
        }
      }, intervalTime);
      
      return () => clearInterval(timer);
    }
  }, [isAppLoading]);

  useEffect(() => {
    if (showTopBanner) {
      document.body.classList.add('has-banner');
    } else {
      document.body.classList.remove('has-banner');
    }
    return () => document.body.classList.remove('has-banner');
  }, [showTopBanner]);

  useEffect(() => {
    document.title = "EDAFS - Esquadrilha da Fumaça FS";
    document.documentElement.setAttribute('data-theme', 'dark');

    if (localStorage.getItem('edafs_age_blocked') === 'true') {
      setIsBlocked(true);
    }

    const unsubPilotos = onSnapshot(collection(db, 'pilotos'), (snapshot) => {
      const arr: Piloto[] = [];
      snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() } as unknown as Piloto));
      arr.sort((a, b) => parseInt(a.posicao) - parseInt(b.posicao));
      setDbPilotos(arr);
    });

    const unsubAgenda = onSnapshot(collection(db, 'agenda'), (snapshot) => {
      const arr: Demonstracao[] = [];
      snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() } as unknown as Demonstracao));
      setDbDemonstracoes(arr);
    });

    const unsubVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
      const arr: Video[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.ativo !== false) {
          arr.push({ id: doc.id, ...data } as unknown as Video);
        }
      });
      setDbVideos(arr);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setAlistamentoAberto(d.alistamentoAberto || false);
        setSolicitacaoAberta(d.solicitacaoAberta !== undefined ? d.solicitacaoAberta : true);
        if (d.mostrarFS20 !== undefined) setMostrarFS20(d.mostrarFS20);
        if (d.mostrarFS24 !== undefined) setMostrarFS24(d.mostrarFS24);
        if (d.headerImageUrl) {
          setCustomHeader(d.headerImageUrl);
        }
      }
    });

    const handleScroll = () => {
      const sections = ['pilotos', 'agenda', 'midias', 'sobre', 'alistamento'];
      let current = '';
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = section;
          }
        }
      }
      
      if (window.scrollY < 100) {
        current = '';
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubPilotos(); 
      unsubAgenda(); 
      unsubVideos(); 
      unsubConfig();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [dbPilotos, dbDemonstracoes, dbVideos]);

  const hasAgenda2020 = mostrarFS20 && dbDemonstracoes.some(a => a.plataforma === '2020' || a.plataforma === 'Ambos');
  const hasAgenda2024 = mostrarFS24 && dbDemonstracoes.some(a => a.plataforma === '2024' || a.plataforma === 'Ambos');
  const hasPiloto2020 = mostrarFS20 && dbPilotos.some(p => p.plataforma === '2020' || p.plataforma === 'Ambos');
  const hasPiloto2024 = mostrarFS24 && dbPilotos.some(p => p.plataforma === '2024' || p.plataforma === 'Ambos');
  const hasVideos = dbVideos.length > 0;
  const hasGaleria = galeriaImagens.length > 0;

  useEffect(() => {
    if (agendaTab === '2024' && !hasAgenda2024 && hasAgenda2020) setAgendaTab('2020');
    if (agendaTab === '2020' && !hasAgenda2020 && hasAgenda2024) setAgendaTab('2024');
  }, [hasAgenda2024, hasAgenda2020, agendaTab]);

  useEffect(() => {
    if (pilotoTab === '2024' && !hasPiloto2024 && hasPiloto2020) setPilotoTab('2020');
    if (pilotoTab === '2020' && !hasPiloto2020 && hasPiloto2024) setPilotoTab('2024');
  }, [hasPiloto2024, hasPiloto2020, pilotoTab]);

  useEffect(() => {
    if (midiaTab === 'videos' && !hasVideos && hasGaleria) setMidiaTab('galeria');
    if (midiaTab === 'galeria' && !hasGaleria && hasVideos) setMidiaTab('videos');
  }, [hasVideos, hasGaleria, midiaTab]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openLegalModal = (tab: 'privacidade' | 'termos' | 'cookies' | 'disclaimer') => {
    setActiveLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setWhatsapp(val);
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

    if (val.length > 4) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    } else if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    
    setDataNascimento(val);
  };

  const checkIsFormReady = () => {
    if (!nome.trim() || !nickname.trim() || !whatsapp.trim() || !discord.trim() || !experiencia.trim() || !plataforma || !simuladorPossui || !disponibilidade.trim() || !possuiA29 || dataNascimento.length !== 10 || isBlocked) {
      return false;
    }
    const parts = dataNascimento.split('/');
    const birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 17 && !isNaN(age);
  };

  const isFormReady = checkIsFormReady();

  const submitAlistamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!isFormReady) return;
    
    setIsSubmitting(true);

    try {
      await fetch("https://formsubmit.co/ajax/fumacavirtualmfs@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: "Novo Alistamento Recebido - EDAFS MSFS",
          Nome: nome,
          Nickname: nickname,
          "Data de Nascimento": dataNascimento,
          WhatsApp: whatsapp,
          Discord: discord,
          Experiencia: experiencia,
          Plataforma: plataforma,
          Simulador: simuladorPossui,
          "Possui A-29 RP Simulations": possuiA29 === 'sim' ? 'Sim' : 'Não',
          "Experiência Acrobática": vooAcrobatico === 'sim' ? detalhesVooAcrobatico : 'Não',
          "Disponibilidade": disponibilidade,
          "Motivação": motivoIngresso
        })
      });

      setIsFormModalOpen(false);
      setModalAlistamento(true);
      setNome(''); setNickname(''); setDiscord(''); setExperiencia(''); setWhatsapp(''); setPlataforma(''); setSimuladorPossui('');
      setDataNascimento(''); setVooAcrobatico(''); setDetalhesVooAcrobatico(''); setDisponibilidade(''); setMotivoIngresso('');
      setPossuiA29('');
    } catch (error) {
      alert("Houve um erro ao enviar a sua candidatura. Verifique a sua conexão e tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDemonstracao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoCidade.trim() || !demoTransmissao) return;
    
    const lastRequest = localStorage.getItem('lastDemoRequest_edafs');
    if (lastRequest) {
      const timeDiff = Date.now() - parseInt(lastRequest);
      if (timeDiff < 24 * 60 * 60 * 1000) {
        alert('Apenas uma solicitação por dia é permitida por dispositivo. Tente novamente amanhã.');
        return;
      }
    }

    setIsSubmittingDemo(true);

    try {
      await addDoc(collection(db, 'solicitacoes'), {
        cidade: demoCidade,
        transmissao: demoTransmissao,
        canal: demoTransmissao === 'sim' ? demoCanal : 'Sem Transmissão',
        dataSolicitacao: new Date().toISOString(),
        status: 'Pendente'
      });

      localStorage.setItem('lastDemoRequest_edafs', Date.now().toString());
      setIsDemoModalOpen(false);
      setModalDemoSucesso(true);
      setDemoCidade(''); setDemoTransmissao(''); setDemoCanal('');
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao enviar o pedido. Tente novamente.");
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const parseEventDate = (dataHoraStr: string) => {
    if (!dataHoraStr) return 0;
    const [datePart] = dataHoraStr.split(' às ');
    const parts = datePart.split('/');
    if (parts.length !== 3) return 0;
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 23, 59, 59).getTime();
  };

  const filteredPilotos = dbPilotos.filter(p => {
    if (pilotoTab === '2024') return (p.plataforma === '2024' || p.plataforma === 'Ambos') && mostrarFS24;
    if (pilotoTab === '2020') return (p.plataforma === '2020' || p.plataforma === 'Ambos') && mostrarFS20;
    return false;
  });
  
  const filteredAgenda = dbDemonstracoes.filter(a => {
    const eventTime = parseEventDate(a.dataHora);
    const isPast = eventTime > 0 && eventTime < Date.now();
    
    if (agendaTab === 'historico') {
      return isPast;
    } else {
      if (isPast) return false;
      if (agendaTab === '2024') return (a.plataforma === '2024' || a.plataforma === 'Ambos') && mostrarFS24;
      if (agendaTab === '2020') return (a.plataforma === '2020' || a.plataforma === 'Ambos') && mostrarFS20;
      return false;
    }
  });

  const sortedAgenda = [...filteredAgenda].sort((a, b) => {
    const timeA = parseEventDate(a.dataHora);
    const timeB = parseEventDate(b.dataHora);
    return agendaTab === 'historico' ? timeB - timeA : timeA - timeB;
  });
  
  const totalAgendaPages = Math.ceil(sortedAgenda.length / AGENDA_ITEMS_PER_PAGE) || 1;
  const startIndex = (agendaPage - 1) * AGENDA_ITEMS_PER_PAGE;
  const currentAgendaItems = sortedAgenda.slice(startIndex, startIndex + AGENDA_ITEMS_PER_PAGE);

  const groupedAgenda = currentAgendaItems.reduce((acc: Record<string, Demonstracao[]>, dem) => {
    const parts = dem.dataHora.split('/');
    let monthName = "EVENTOS";
    if (parts.length >= 3) {
      const mIndex = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      if (!isNaN(mIndex) && mIndex >= 0 && mIndex < 12) {
        const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
        monthName = `${meses[mIndex]} ${year}`;
      }
    }
    if (!acc[monthName]) acc[monthName] = [];
    acc[monthName].push(dem);
    return acc;
  }, {});

  const maxVideos = dbVideos.slice(0, 50); 
  const totalVideoPages = Math.ceil(maxVideos.length / VIDEOS_PER_PAGE) || 1;
  const startVideoIndex = (videoPage - 1) * VIDEOS_PER_PAGE;
  const currentVideos = maxVideos.slice(startVideoIndex, startVideoIndex + VIDEOS_PER_PAGE);

  const totalGaleriaPages = Math.ceil(galeriaImagens.length / GALERIA_PER_PAGE) || 1;
  const startGaleriaIndex = (galeriaPage - 1) * GALERIA_PER_PAGE;
  const currentGaleria = galeriaImagens.slice(startGaleriaIndex, startGaleriaIndex + GALERIA_PER_PAGE);

  const renderFormationSlot = (posicao: string) => {
    const pilotosSlot = filteredPilotos.filter(p => p.posicao === posicao && !p.oculto);
    
    let role = "";
    switch (posicao) {
      case '1': role = 'Líder'; break;
      case '2': role = 'Ala Direita'; break;
      case '3': role = 'Ala Esquerda'; break;
      case '4': role = 'Ferrolho'; break;
      case '5': role = 'Ala Esq. Externa'; break;
      case '6': role = 'Ala Dir. Externa'; break;
      case '7': role = 'Isolado'; break;
      default: role = `Ala ${posicao}`;
    }

    const opensToLeft = posicao === '2' || posicao === '6';

    return (
      <div className="tatic-slot noselect" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '300px', justifyContent: 'center', height: '180px', cursor: 'default' }}>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img 
            src={a29TopDown} 
            alt={`Posição ${posicao}`} 
            className="tatic-plane"
            style={{ 
              width: '180px', 
              height: '180px', 
              objectFit: 'contain', 
              filter: pilotosSlot.length > 0 ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.6))' : 'grayscale(100%) opacity(20%)'
            }} 
          />
          <span style={{ position: 'absolute', bottom: '15px', right: '-15px', fontSize: '2.6rem', fontFamily: '"PosicaoFont", sans-serif', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', lineHeight: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))', zIndex: 3 }}>
            {posicao}
          </span>
        </div>
        
        <div className={`slot-info ${opensToLeft ? 'slot-left' : 'slot-right'}`}>
          {pilotosSlot.length > 0 ? pilotosSlot.map((piloto, idx) => {
            const patenteAbbr = getPatenteAbbr(piloto.patente);
            return (
              <div 
                key={idx} 
                className="bio-card" 
                onClick={() => setSelectedPiloto(piloto)} 
                style={{ cursor: 'pointer' }}
                title="Clique para ver detalhes"
              >
                <div className="bio-text">
                  <span style={{ fontSize: '1rem', fontFamily: '"Regular", Arial, sans-serif', fontWeight: 500, color: '#f8fafc' }}>
                    {patenteAbbr ? `${patenteAbbr} ` : ''}{piloto.nome}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginTop: '2px' }}>{role}</span>
                  {piloto.cidade && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{piloto.cidade} {piloto.uf ? `- ${piloto.uf}` : ''}</span>}
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0, marginLeft: opensToLeft ? '0' : '8px', marginRight: opensToLeft ? '8px' : '0' }}>
                  <Plus size={16} />
                </div>
              </div>
            );
          }) : (
            <div className="bio-card empty-card" style={{ padding: '0.75rem 1.5rem', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '999px' }}>
              <span style={{ fontSize: '0.9rem', fontFamily: '"Comum", sans-serif', fontWeight: 500, color: '#94a3b8' }}>Vago</span>
            </div>
          )}
        </div>
        
      </div>
    );
  };

  return (
    <div id="top">
      <style>{`
        * {
          box-sizing: border-box;
          scrollbar-width: thin; 
          scrollbar-color: rgba(255,255,255,0.15) #030712;
        }

        @font-face {
          font-family: 'Regular';
          src: url('/fonts/regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap; 
        }

        @font-face {
          font-family: 'Comum';
          src: url('/fonts/comum.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        body, html { 
          background: #030712 !important;
          font-family: 'Regular', system-ui, -apple-system, sans-serif;
          max-width: 100vw;
          overflow-x: hidden; 
          scroll-behavior: smooth; 
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .tarja-banner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(90deg, #0ea5e9 0%, #0369a1 100%);
          z-index: 1000000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 2rem;
          font-family: 'Regular', sans-serif;
        }
        
        .tarja-left { display: flex; gap: 2.5rem; align-items: center; }
        
        .tarja-item {
          position: relative;
          cursor: help;
          color: #ffffff;
          font-weight: bold;
          font-family: 'Comum', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .tarja-tooltip {
          position: absolute;
          top: 150%;
          left: 0;
          width: 280px;
          background: #030712;
          border: 1px solid #1e293b;
          padding: 1rem;
          border-radius: 12px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          font-family: 'Regular', sans-serif;
          font-size: 0.85rem;
          color: #cbd5e1;
          font-weight: normal;
          line-height: 1.5;
          text-transform: none;
          letter-spacing: normal;
        }
        
        .tarja-item:hover {
          color: #f8fafc;
          transform: scale(1.05);
        }

        .tarja-item:hover .tarja-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(5px);
        }
        
        .tarja-right { display: flex; gap: 1rem; align-items: center; }
        
        .tarja-btn {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: #ffffff;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .tarja-btn.primary {
          background: #030712;
          border-color: #030712;
          color: #0ea5e9;
        }
        
        .tarja-btn:hover { background: #ffffff; color: #030712; border-color: #ffffff; }

        .tarja-close {
          background: transparent;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 50%;
        }

        .tarja-close:hover {
          background: rgba(0,0,0,0.2);
          transform: scale(1.1);
        }

        body.has-banner nav {
          top: 50px !important; 
        }

        @media (max-width: 768px) {
          .tarja-banner {
            flex-direction: column;
            gap: 0.8rem;
            padding: 0.8rem;
            height: auto;
          }
          .tarja-left { justify-content: center; width: 100%; gap: 1.5rem; }
          .tarja-right { justify-content: center; width: 100%; }
          .tarja-tooltip { width: 220px; left: -50px; }
          body.has-banner nav { top: 95px !important; }
        }

        button, a, input, textarea {
          font-family: 'Regular', system-ui, -apple-system, sans-serif;
          cursor: pointer;
        }
        
        @font-face {
          font-family: 'PosicaoFont';
          src: local('posicao'), url('/fonts/posicao.otf') format('opentype'), url('../fonts/posicao.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'NormalFont';
          src: local('NormalFont'), url('/fonts/normal.otf') format('opentype'), url('../fonts/normal.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        p { font-weight: 400; line-height: 1.8; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

        h1, h2, h3, h4, h5, h6 { font-family: "Comum", sans-serif !important; color: #ffffff; font-weight: bold; }

        .glass-panel { 
          background: rgba(15, 23, 42, 0.85);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .tatic-slot { z-index: 1; }
        .tatic-slot:hover { z-index: 50; }
        
        .slot-info { 
          opacity: 0; 
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease; 
          position: absolute;
          z-index: 100;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .tatic-slot:hover .slot-info { 
          opacity: 1; 
          visibility: visible;
          transform: translateY(0);
        }
        
        .slot-right { left: calc(50% + 100px); }
        .slot-left { right: calc(50% + 100px); }

        .bio-card {
          display: flex;
          align-items: center;
          background: rgba(15,23,42,0.95);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 999px;
          padding: 0.75rem 1.5rem;
          white-space: nowrap;
          transition: all 0.3s ease;
          pointer-events: auto;
        }
        
        .slot-right .bio-card { flex-direction: row; }
        .slot-left .bio-card { flex-direction: row-reverse; }

        .bio-text { display: flex; flex-direction: column; }
        .slot-right .bio-text { text-align: left; }
        .slot-left .bio-text { text-align: right; }

        .bio-card:hover {
          background: #09090b !important;
          border-color: rgba(14,165,233,0.4);
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .zoom-wrapper {
          position: relative;
          z-index: 1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .zoom-image {
          width: 100%;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zoom-wrapper:hover .zoom-image {
          transform: scale(1.08);
        }

        .splash-screen {
          position: fixed; inset: 0; z-index: 99999; background: #030712;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: opacity 0.8s ease, visibility 0.8s ease;
        }
        .splash-screen.hidden { opacity: 0; visibility: hidden; }
        .pulse-logo { animation: pulseLogo 2s infinite ease-in-out; }
        @keyframes pulseLogo { 
          0% { transform: scale(1); opacity: 0.7; } 
          50% { transform: scale(1.05); opacity: 1; filter: none; } 
          100% { transform: scale(1); opacity: 0.7; } 
        }

        .section-top-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent);
          margin-bottom: 4rem;
        }

        .modern-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          outline: none;
          padding: 0.85rem 1rem;
          color: #ffffff;
          border-radius: 12px 12px 0 0;
          font-size: 0.95rem;
          font-weight: 300;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .modern-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid #0ea5e9;
        }
        .modern-input::placeholder { color: #64748b !important; opacity: 0.5 !important; font-weight: 300; }

        .section-container { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10; }
        
        .desktop-nav { display: flex; align-items: center; gap: 2rem; }

        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500; 
          font-style: normal;
          font-size: 0.95rem; 
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover { color: #0ea5e9; }
        .nav-link.active { color: #0ea5e9; font-weight: 500; }

        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        
        .mobile-menu { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: auto; 
          max-height: 95vh;
          padding: 6rem 2rem 2rem; 
          background: rgba(15, 23, 42, 0.98); 
          z-index: 99; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: flex-start; 
          gap: 1.5rem; 
          transform: translateY(-100%); 
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
          border-bottom: 1px solid rgba(255,255,255,0.1); 
          border-radius: 0 0 32px 32px; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
          overflow-y: auto; 
        }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.25rem; text-decoration: none; font-weight: 500; letter-spacing: 0.02em; transition: color 0.3s ease; cursor: pointer; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #0ea5e9; }

        .reveal-on-scroll { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }

        .platform-btn {
          flex: 1;
          padding: 0.7rem;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          outline: none;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-weight: 400;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .platform-btn.active { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; }
        .platform-btn.active-blue { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; }
        .platform-btn:hover:not(.active):not(.active-blue) { background: rgba(255, 255, 255, 0.05); color: #ffffff; }

        .tab-btn {
          background: rgba(255,255,255,0.02);
          color: #94a3b8;
          border: none;
          padding: 0.6rem 1.5rem;
          cursor: pointer;
          font-weight: 400;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          letter-spacing: 0.05em;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tab-btn:hover { color: #f8fafc; background: rgba(255,255,255,0.05); }
        .tab-btn.active { color: #0ea5e9; background: rgba(14, 165, 233, 0.05); }

        .tb-button {
          position: relative;
          background: transparent;
          color: #0ea5e9;
          font-weight: 400;
          font-size: 0.95rem;
          padding: 0.6rem 1.4rem;
          border: 1px solid #0ea5e9;
          outline: none;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          letter-spacing: 0.05em;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .tb-button:hover {
          background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
          color: #ffffff;
          border-color: transparent;
        }

        .btn-alistamento {
          background: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid #0ea5e9 !important;
          border-radius: 30px !important;
          font-weight: 400 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
        }
        .btn-alistamento:hover {
          background: #0ea5e9 !important;
          color: #030712 !important;
          border-color: #0ea5e9 !important;
        }
        
        .agenda-card {
          border-radius: 16px;
          border: none;
        }

        .formacao-scroll-container {
          width: 100%;
          padding-bottom: 6rem !important; 
          display: flex;
          justify-content: center;
          overflow: visible !important;
        }

        .formacao-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          transform-origin: top center;
          transition: all 0.3s ease;
          width: 750px;
          flex-shrink: 0;
          margin: 0 auto;
        }

        .footer-wrapper { border-top: 1px solid rgba(255,255,255,0.05); padding: 4rem 2rem 2rem; margin-top: 6rem; background: transparent; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr; gap: 3rem; max-width: 1200px; margin: 0 auto; }
        .footer-heading { font-size: 1.1rem; color: #fff; margin: 0 0 1.5rem 0; letter-spacing: 0.05em; }
        
        .footer-link { color: #94a3b8; text-decoration: none; font-size: 0.9rem; margin-bottom: 0.8rem; display: block; transition: color 0.2s; cursor: pointer; }
        .footer-link:hover { color: #0ea5e9; }
        
        .footer-pills { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
        .footer-pill { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.15); padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 500; font-size: 0.95rem; color: #f8fafc; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; text-decoration: none !important; }
        .footer-pill:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4rem; padding-top: 2rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; max-width: 1200px; margin-left: auto; margin-right: auto; }
        
        .legal-footer-link { color: #94a3b8; cursor: pointer; transition: color 0.2s; display: flex; gap: 6px; align-items: center; user-select: none; }
        .legal-footer-link:hover { color: #0ea5e9; }
        
        @media (min-width: 900px) {
          .split-grid { grid-template-columns: 1fr 1fr; }
          .split-grid.reverse { direction: rtl; }
          .split-grid.reverse > * { direction: ltr; }
        }

        @media (max-width: 900px) {
           .slot-info {
              left: 50% !important;
              right: auto !important;
              top: 85% !important;
              transform: translateX(-50%) !important;
              width: max-content !important;
              min-width: 180px !important;
           }
           .tatic-slot:hover .slot-info {
              transform: translate(-50%, 15px) !important;
           }
           .bio-card {
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              padding: 0.75rem 1rem !important;
              white-space: normal !important; 
           }
           .slot-left .bio-text, .slot-right .bio-text {
              text-align: center !important;
           }

          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .section-container { padding: 4rem 1.5rem 0 !important; }
          .footer-grid { grid-template-columns: 1fr; } 
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
          
          .formacao-wrapper {
             transform: scale(0.65) !important;
             margin-bottom: -150px !important;
          }

          .modal-content-pilot {
             padding: 1.5rem !important;
          }
          .bio-container-content {
            padding: 2rem !important;
            max-width: 100% !important;
            align-items: center !important;
            text-align: center !important;
          }
          .bio-header {
            flex-direction: column !important;
            text-align: center !important;
          }
          .bio-header > div {
            align-items: center !important;
            text-align: center !important;
          }
        }
        
        @media (max-width: 600px) {
           .formacao-wrapper {
             transform: scale(0.45) !important;
             margin-bottom: -220px !important;
           }
        }
        
        @media (max-width: 400px) {
           .formacao-wrapper {
             transform: scale(0.38) !important;
             margin-bottom: -250px !important;
           }
        }

        .legal-tab { 
          background: transparent; 
          border: none; 
          color: #94a3b8; 
          padding: 0.75rem 1.5rem; 
          border-radius: 12px; 
          cursor: pointer !important; 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          font-weight: 500; 
          transition: all 0.3s ease; 
          font-size: 0.9rem; 
          text-transform: uppercase; 
        }
        .legal-tab:hover { background: rgba(255,255,255,0.05); color: #ffffff; }
        .legal-tab.active { background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3,7,18,0.95);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        .bf-action-card {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 16px; 
          min-width: 280px;
          height: 70px;
          cursor: pointer;
          flex: 0 0 auto;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .bf-action-card:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
          border-color: #0ea5e9;
        }
        .bf-action-card-icon {
          width: 70px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          flex-shrink: 0;
        }
        .bf-action-card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 1rem;
          flex-grow: 1;
        }
        .bf-action-card-title {
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .bf-action-card-subtitle {
          color: rgba(255,255,255,0.85);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
          font-weight: 500;
        }
      `}</style>

      {showTopBanner && (
        <div className="tarja-banner">
          <div className="tarja-left">
            <div className="tarja-item">
              EDAFS
              <div className="tarja-tooltip">
                Esquadrão virtual focado no Microsoft Flight Simulator. Nascidos da paixão pela aviação, buscamos replicar com extrema fidelidade e profissionalismo a doutrina da Esquadrilha da Fumaça.
              </div>
            </div>
            
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.4)' }}></div>

            <div className="tarja-item">
              EDAV
              <div className="tarja-tooltip">
                O mais antigo time de demonstração aérea virtual do mundo (1998). Representante do Brasil no VFAT, recria com precisão as operações oficiais da verdadeira Esquadrilha da Fumaça.
              </div>
            </div>
          </div>

          <div className="tarja-right">
            <button className="tarja-btn primary" onClick={() => window.open('https://edav.com.br', '_blank')}>IR PARA O EDAV</button>
            <button className="tarja-close" onClick={handleCloseBanner} aria-label="Fechar banner">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {!cookiesAccepted && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', width: '90%', maxWidth: '800px', flexDirection: window.innerWidth < 768 ? 'column' : 'row', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start' }}>
              <Cookie size={18} color="#0ea5e9" /> Uso de Cookies
            </h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Utilizamos cookies essenciais para garantir o funcionamento do nosso portal. Não usamos trackers ou publicidade.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
            <button onClick={recusarCookies} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, flex: window.innerWidth < 768 ? 1 : 'none' }}>Recusar</button>
            <button onClick={aceitarCookies} style={{ background: '#0ea5e9', border: 'none', color: '#030712', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', flex: window.innerWidth < 768 ? 1 : 'none' }}>Aceitar</button>
          </div>
        </div>
      )}

      <Header 
        activeSection={activeSection}
        alistamentoAberto={alistamentoAberto}
        solicitacaoAberta={solicitacaoAberta}
        onOpenAlistamento={() => setIsFormModalOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        hasLive={true}
        hasNoticias={false}
      />

      <div className={`splash-screen ${!isAppLoading ? 'hidden' : ''}`}>
        <img src={logoImage} alt="EDAFS Logo Loading" className="pulse-logo" style={{ width: '120px', height: 'auto', marginBottom: '2rem' }} />
        <div style={{ width: '220px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
          <div style={{ width: `${loadingProgress}%`, height: '100%', background: '#0ea5e9', transition: 'width 0.1s linear' }} />
        </div>
        <span style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8', fontFamily: '"Regular", sans-serif', letterSpacing: '0.1em' }}>
          {Math.round(loadingProgress)}%
        </span>
      </div>

      <section className="hero" style={{ minHeight: '80vh', height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', paddingTop: '8rem', paddingBottom: '2rem' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customHeader || img5})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(3,7,18,0.3)', pointerEvents: 'none' }} />
        
        <div className="hero-notification-bar reveal-on-scroll" style={{ position: 'relative', zIndex: 20, padding: '0 2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {alistamentoAberto && (
            <div className="bf-action-card" onClick={() => setIsFormModalOpen(true)}>
              <div className="bf-action-card-icon"><Users size={28} /></div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title">Alistamento EDAFS</span>
                <span className="bf-action-card-subtitle">Inscrições Abertas</span>
              </div>
            </div>
          )}

          {solicitacaoAberta && (
            <div className="bf-action-card" onClick={() => setIsDemoModalOpen(true)}>
              <div className="bf-action-card-icon"><PlaneTakeoff size={28} /></div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title">Solicitar Demonstração</span>
                <span className="bf-action-card-subtitle">No Flight Simulator</span>
              </div>
            </div>
          )}

          {hasAgenda2020 || hasAgenda2024 ? (
            <div className="bf-action-card" onClick={() => scrollToSection('agenda')}>
              <div className="bf-action-card-icon"><Calendar size={28} /></div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title">Agenda Oficial</span>
                <span className="bf-action-card-subtitle">Ver próximos eventos</span>
              </div>
              {dbDemonstracoes.length > 0 && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#0ea5e9', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                  {dbDemonstracoes.length}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <div style={{ position: 'relative', background: 'transparent' }}>
        <section id="pilotos" className="section-container" style={{ paddingTop: '4rem' }}>
          <SectionHeaderApple overline="Equipe" title="Os Nossos Pilotos." subtitle="Conheça os aviadores virtuais que compõem a Esquadrilha da Fumaça Virtual, separados por plataforma." />

          <div className="reveal-on-scroll" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {hasPiloto2024 && (
              <button className={`tab-btn ${pilotoTab === '2024' ? 'active' : ''}`} onClick={() => setPilotoTab('2024')}>
                <img src={mfLogo24} alt="MSFS 2024" style={{ height: '26px', filter: pilotoTab === '2024' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
              </button>
            )}
            {hasPiloto2020 && (
              <button className={`tab-btn ${pilotoTab === '2020' ? 'active' : ''}`} onClick={() => setPilotoTab('2020')}>
                <img src={mfLogo} alt="MSFS 2020" style={{ height: '16px', filter: pilotoTab === '2020' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
              </button>
            )}
          </div>

          <div className="formacao-scroll-container noselect reveal-on-scroll" style={{ marginTop: '2rem', transition: 'all 0.3s ease' }}>
            <div className="formacao-wrapper">
              <div style={{ display: 'flex', justifyContent: 'center' }}>{renderFormationSlot('1')}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '7rem', marginTop: '-15px' }}>
                {renderFormationSlot('3')}
                {renderFormationSlot('2')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '-15px' }}>
                {renderFormationSlot('5')}
                {renderFormationSlot('4')}
                {renderFormationSlot('6')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>{renderFormationSlot('7')}</div>
            </div>
          </div>
        </section>
      </div>

      {(hasAgenda2020 || hasAgenda2024) && (
        <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
          <section id="agenda" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
            <SectionHeaderApple overline="Programação" title="Agenda Oficial." subtitle="Acompanhe nossa agenda de demonstrações. As demonstrações são feitas com meteorologia e tempo atualizados em tempo real." />
            
            <div className="reveal-on-scroll" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {hasAgenda2024 && (
                  <button className={`tab-btn ${agendaTab === '2024' ? 'active' : ''}`} onClick={() => setAgendaTab('2024')}>
                    <img src={mfLogo24} alt="MSFS 2024" style={{ height: '28px', filter: agendaTab === '2024' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
                  </button>
                )}
                {hasAgenda2020 && (
                  <button className={`tab-btn ${agendaTab === '2020' ? 'active' : ''}`} onClick={() => setAgendaTab('2020')}>
                    <img src={mfLogo} alt="MSFS 2020" style={{ height: '16px', filter: agendaTab === '2020' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} /> 
                  </button>
                )}
                <button className={`tab-btn ${agendaTab === 'historico' ? 'active' : ''}`} onClick={() => setAgendaTab('historico')} style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  <History size={16} /> Histórico
                </button>
              </div>

              <div style={{ height: '1px', width: '100%', background: '#334155', marginBottom: '2.5rem' }} />
              
              {Object.keys(groupedAgenda).length > 0 ? (
                Object.keys(groupedAgenda).map(month => (
                  <div key={month} style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 400, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
                      {month}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {groupedAgenda[month].map((dem: Demonstracao, idx: number) => {
                        let statusColor = '#0ea5e9'; 
                        if (dem.status === 'Confirmado') statusColor = '#10b981';
                        if (dem.status === 'Cancelado') statusColor = '#ef4444';
                        if (agendaTab === 'historico') statusColor = '#64748b';

                        const datePart = dem.dataHora.split(' às ')[0] || dem.dataHora;
                        const timePart = dem.dataHora.includes('às') ? ` às ${dem.dataHora.split(' às ')[1]}` : '';

                        return (
                          <div
                            key={dem.id || idx}
                            className="agenda-card"
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              background: `linear-gradient(90deg, ${statusColor}33 0%, rgba(3,7,18,0) 100%)`,
                              borderLeft: `4px solid ${statusColor}`,
                              padding: '1rem 1.5rem',
                              opacity: agendaTab === 'historico' ? 0.7 : 1
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 300 }}>
                                {datePart}{timePart}
                              </span>
                              <span style={{ color: '#cbd5e1', fontWeight: 300, marginLeft: '0.5rem', fontSize: '1.05rem' }}>
                                {dem.cidade}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              {!dem.ocultarSimulador && (dem.plataforma === '2024' || dem.plataforma === 'Ambos') && agendaTab !== 'historico' ? (
                                <span style={{fontSize:'0.6rem', color:'#f59e0b', border:'1px solid #f59e0b', padding:'1px 4px', borderRadius:'4px'}}>2024</span>
                              ) : null}
                              <span style={{ color: statusColor, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {agendaTab === 'historico' ? 'REALIZADO' : (dem.status === 'Planejamento' ? 'PREVISÃO' : dem.status)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <Calendar size={32} color={agendaTab === 'historico' ? "#64748b" : "#0ea5e9"} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 300, color: '#64748b' }}>
                    {agendaTab === 'historico' ? 'Nenhum evento passado encontrado no histórico.' : 'Nenhum evento agendado para esta plataforma.'}
                  </p>
                </div>
              )}

              {totalAgendaPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                  <button onClick={() => setAgendaPage(p => Math.max(1, p - 1))} disabled={agendaPage === 1} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: agendaPage === 1 ? 'not-allowed' : 'pointer' }}>&lt; ANTERIOR</button>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>PÁG {agendaPage} / {totalAgendaPages}</span>
                  <button onClick={() => setAgendaPage(p => Math.min(totalAgendaPages, p + 1))} disabled={agendaPage === totalAgendaPages} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: agendaPage === totalAgendaPages ? 'not-allowed' : 'pointer' }}>PRÓXIMA &gt;</button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {(hasVideos || hasGaleria) && (
        <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
          <section id="midias" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
            <SectionHeaderApple overline="Mídias" title="Vídeos e Galeria." subtitle="Acompanhe os nossos melhores momentos em vídeo e fotografia." />

            <div className="reveal-on-scroll" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              {hasGaleria && (
                <button className={`tab-btn ${midiaTab === 'galeria' ? 'active' : ''}`} onClick={() => setMidiaTab('galeria')}>
                  <Camera size={18} style={{ marginRight: '6px' }} /> Galeria
                </button>
              )}
              {hasVideos && (
                <button className={`tab-btn ${midiaTab === 'videos' ? 'active' : ''}`} onClick={() => setMidiaTab('videos')}>
                  <Play size={18} style={{ marginRight: '6px' }} /> Vídeos
                </button>
              )}
            </div>

            {midiaTab === 'videos' && hasVideos && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
                  {currentVideos.length > 0 ? (
                    currentVideos.map((vid, idx) => (
                      <div key={vid.id || idx} style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <iframe width="100%" height="100%" src={vid.url} title={`Video ${idx}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', width: '100%' }}>Nenhum vídeo publicado.</div>
                  )}
                </div>
                {totalVideoPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setVideoPage(p => Math.max(1, p - 1))} disabled={videoPage === 1} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: videoPage === 1 ? 'not-allowed' : 'pointer' }}>&lt; ANTERIOR</button>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>PÁG {videoPage} / {totalVideoPages}</span>
                    <button onClick={() => setVideoPage(p => Math.min(totalVideoPages, p + 1))} disabled={videoPage === totalVideoPages} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: videoPage === totalVideoPages ? 'not-allowed' : 'pointer' }}>PRÓXIMA &gt;</button>
                  </div>
                )}
              </div>
            )}

            {midiaTab === 'galeria' && hasGaleria && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                  {currentGaleria.map((img, idx) => (
                    <div key={idx} onClick={() => setLightboxIndex(startGaleriaIndex + idx)} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                      <img src={img} alt={`Galeria ${startGaleriaIndex + idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    </div>
                  ))}
                </div>
                {totalGaleriaPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setGaleriaPage(p => Math.max(1, p - 1))} disabled={galeriaPage === 1} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: galeriaPage === 1 ? 'not-allowed' : 'pointer' }}>&lt; ANTERIOR</button>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>PÁG {galeriaPage} / {totalGaleriaPages}</span>
                    <button onClick={() => setGaleriaPage(p => Math.min(totalGaleriaPages, p + 1))} disabled={galeriaPage === totalGaleriaPages} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '12px', cursor: galeriaPage === totalGaleriaPages ? 'not-allowed' : 'pointer' }}>PRÓXIMA &gt;</button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
        <section id="sobre" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
          <SectionHeaderApple overline="Nossa História" title="O Esquadrão e a Jornada." subtitle="Descubra a história e os valores que guiam o nosso esquadrão." />

          <div className="reveal-on-scroll" style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: '-15px', border: '1px solid #0ea5e9', borderRadius: '16px', zIndex: 0, opacity: 0.5, transform: 'translate(20px, 20px)' }} />
              <div className="zoom-wrapper">
                <img src={img2} alt="Formação EDAFS" className="zoom-image" style={{ filter: 'contrast(110%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.8) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <img src={logoImage} alt="EDAFS" style={{ height: '60px', width: 'auto', alignSelf: 'flex-start', marginBottom: '0.5rem' }} />
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', lineHeight: 1.1, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)', color: '#ffffff' }}>
                A Excelência como Doutrina
              </h2>
              <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', margin: 0 }}>
                A Esquadrilha da Fumaça Virtual (EDAFS) nasce da paixão pela aviação e pelo voo em formação de alta performance. O nosso esquadrão busca replicar com extrema fidelidade, precisão e profissionalismo a doutrina da verdadeira Esquadrilha da Fumaça.
                <br /><br />
                Operamos ativamente nas plataformas <strong>Microsoft Flight Simulator 2020 e 2024</strong>. O nosso vetor oficial é o <strong>Embraer A-29 Super Tucano</strong> (desenvolvido pela RPSim), uma aeronave turboélice de ataque leve e treinamento avançado que nos garante a robustez e o realismo necessários para as manobras acrobáticas mais exigentes.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer hasNoticias={false} onOpenLegal={openLegalModal} />

      <PilotBioModal piloto={selectedPiloto} onClose={() => setSelectedPiloto(null)} />

      <div className={`modal-overlay ${isFormModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel modal-body-scroll" style={{ padding: '2.5rem', background: '#0b1121', border: '1px solid var(--border-light)', borderRadius: '24px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={() => setIsFormModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--glass-bg)', borderRadius: '50%', padding: '0.5rem', border: 'none', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-strong)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}>
            <X size={18} />
          </button>
          
          {alistamentoAberto ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '0 0 1rem 0', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Alistamento EDAFS</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.25rem 0', fontWeight: 400 }}>
                  Para participar no processo seletivo, é <strong>obrigatório</strong> possuir todos os requisitos listados abaixo.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ background: 'var(--glass-bg)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><CheckCircle2 size={14} color="#10b981" /> +17 Anos</span>
                  <span style={{ background: 'var(--glass-bg)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><CheckCircle2 size={14} color="#10b981" /> MSFS Original</span>
                  <span style={{ background: 'var(--glass-bg)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><CheckCircle2 size={14} color="#10b981" /> HOTAS/Yoke</span>
                </div>
              </div>

              <form onSubmit={submitAlistamento} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Nome Completo</label>
                    <input required type="text" className="modern-input" value={nome} onChange={e => setNome(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Nickname (Discord)</label>
                    <input required type="text" className="modern-input" value={nickname} onChange={e => setNickname(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Data Nasc. (+17)</label>
                    <input required type="text" maxLength={10} className="modern-input" value={dataNascimento} onChange={handleDateChange} placeholder="DD/MM/AAAA" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>WhatsApp</label>
                    <input required type="text" className="modern-input" value={whatsapp} onChange={handlePhoneChange} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>ID Discord</label>
                    <input required type="text" className="modern-input" value={discord} onChange={e => setDiscord(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Horas Totais</label>
                    <input required type="text" className="modern-input" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Qual simulador possui? *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button type="button" onClick={() => setSimuladorPossui('2020')} className={`platform-btn ${simuladorPossui === '2020' ? 'active-blue' : ''}`}>MSFS 2020</button>
                      <button type="button" onClick={() => setSimuladorPossui('2024')} className={`platform-btn ${simuladorPossui === '2024' ? 'active-blue' : ''}`}>MSFS 2024</button>
                      <button type="button" onClick={() => setSimuladorPossui('Ambos')} className={`platform-btn ${simuladorPossui === 'Ambos' ? 'active-blue' : ''}`}>Ambos</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Possui A-29 RP Simulations? *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button type="button" onClick={() => setPossuiA29('sim')} className={`platform-btn ${possuiA29 === 'sim' ? 'active-blue' : ''}`}>Sim</button>
                      <button type="button" onClick={() => setPossuiA29('nao')} className={`platform-btn ${possuiA29 === 'nao' ? 'active-blue' : ''}`}>Não</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Experiência Acrobática?</label>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button type="button" onClick={() => setVooAcrobatico('sim')} className={`platform-btn ${vooAcrobatico === 'sim' ? 'active' : ''}`}>Sim</button>
                    <button type="button" onClick={() => { setVooAcrobatico('nao'); setDetalhesVooAcrobatico(''); }} className={`platform-btn ${vooAcrobatico === 'nao' ? 'active' : ''}`}>Não</button>
                  </div>
                </div>

                {vooAcrobatico === 'sim' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', animation: 'fadeIn 0.3s ease' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Quais aeronaves e horas?</label>
                    <input required type="text" className="modern-input" value={detalhesVooAcrobatico} onChange={e => setDetalhesVooAcrobatico(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Disponibilidade (Dias/Horários)</label>
                  <input required type="text" className="modern-input" value={disponibilidade} onChange={e => setDisponibilidade(e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Por que ingressar?</span>
                    <span style={{ color: motivoIngresso.length > 950 ? '#ef4444' : 'var(--text-muted)' }}>{motivoIngresso.length}/600</span>
                  </label>
                  <textarea required className="modern-input" rows={3} maxLength={1000} value={motivoIngresso} onChange={e => setMotivoIngresso(e.target.value)} style={{ resize: 'vertical', minHeight: '80px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Sua Plataforma *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    {['PC', 'Console'].map(plat => (
                      <button key={plat} type="button" onClick={() => setPlataforma(plat)} className={`platform-btn ${plataforma === plat ? 'active-blue' : ''}`} style={{ borderRadius: '12px' }}>
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="tb-button btn-alistamento"
                  disabled={isSubmitting || !isFormReady} 
                  style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem', background: 'var(--text-main)', color: 'var(--bg-base)', border: 'none', borderRadius: '999px' }}
                >
                  {isSubmitting ? 'A PROCESSAR...' : 'Enviar aplicação'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
               <Shield size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
               <h3 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.25rem' }}>Recrutamento Fechado</h3>
               <p style={{ color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.5rem' }}>Fique atento aos nossos canais oficiais.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`modal-overlay ${isDemoModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '2.5rem', background: '#0b1121', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
          <button onClick={() => setIsDemoModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%' }}>
            <X size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}><PlaneTakeoff size={24} /></div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>Solicitar Demonstração</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>Preencha os dados abaixo para convidar o EDAFS para o seu evento ou cidade.</p>

          <form onSubmit={submitDemonstracao} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cidade ou Nome do Evento *</label>
              <input required type="text" className="modern-input" value={demoCidade} onChange={e => setDemoCidade(e.target.value)} placeholder="Ex: São Paulo - SP" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Haverá Transmissão ao Vivo? *</label>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <button type="button" onClick={() => setDemoTransmissao('sim')} className={`platform-btn ${demoTransmissao === 'sim' ? 'active' : ''}`} style={{ borderColor: demoTransmissao === 'sim' ? '#10b981' : '', background: demoTransmissao === 'sim' ? 'rgba(16,185,129,0.1)' : '', color: demoTransmissao === 'sim' ? '#10b981' : '' }}>Sim</button>
                <button type="button" onClick={() => { setDemoTransmissao('nao'); setDemoCanal(''); }} className={`platform-btn ${demoTransmissao === 'nao' ? 'active' : ''}`} style={{ borderColor: demoTransmissao === 'nao' ? '#10b981' : '', background: demoTransmissao === 'nao' ? 'rgba(16,185,129,0.1)' : '', color: demoTransmissao === 'nao' ? '#10b981' : '' }}>Não</button>
              </div>
            </div>

            {demoTransmissao === 'sim' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', animation: 'fadeIn 0.3s ease' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Link do Canal (YouTube/Twitch) *</label>
                <div style={{ position: 'relative' }}>
                  <Radio size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="url" className="modern-input" value={demoCanal} onChange={e => setDemoCanal(e.target.value)} placeholder="https://youtube.com/..." style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmittingDemo || !demoCidade.trim() || !demoTransmissao} style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '0.95rem', background: '#10b981', color: '#030712', border: 'none', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', opacity: (isSubmittingDemo || !demoCidade.trim() || !demoTransmissao) ? 0.5 : 1 }}>
              {isSubmittingDemo ? 'A Enviar...' : 'Enviar Solicitação'}
            </button>
          </form>
        </div>
      </div>

      <div className={`modal-overlay ${modalDemoSucesso ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '3rem 2.5rem', background: '#0b1121', border: '1px solid #10b981', borderRadius: '24px', maxWidth: '400px', textAlign: 'center' }}>
          <PlaneTakeoff size={48} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '1.5rem 0 1rem', fontWeight: 'bold' }}>Solicitação Enviada!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 400, fontSize: '0.9rem' }}>O nosso Comando Geral irá analisar o seu pedido e entraremos em contacto em breve.</p>
          <button type="button" style={{ background: '#10b981', color: '#030712', letterSpacing: '0.1em', padding: '1rem 2rem', width: '100%', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }} onClick={() => setModalDemoSucesso(false)}>CONCLUÍDO</button>
        </div>
      </div>

      <div className={`modal-overlay ${modalAlistamento ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '3rem 2.5rem', background: 'var(--bg-base)', border: '1px solid #10b981', borderRadius: '24px', maxWidth: '400px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '1.5rem 0 1rem', fontWeight: 'bold' }}>Aplicação Enviada!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 400, fontSize: '0.9rem' }}>Recebemos os seus dados com sucesso. Nossa equipa entrará em contato em breve.</p>
          <button type="button" className="tb-button" style={{ letterSpacing: '0.1em', padding: '1rem 2rem', width: '100%', borderRadius: '999px', fontWeight: 'bold' }} onClick={() => setModalAlistamento(false)}>CONFIRMAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${modalIdadeOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '3rem 2.5rem', background: 'var(--bg-base)', border: '1px solid #ef4444', borderRadius: '24px', maxWidth: '400px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', margin: '1.5rem 0 1rem', fontWeight: 700, textTransform: 'uppercase' }}>Idade Não Atingida</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 400, fontSize: '0.9rem' }}>
            A doutrina da AFA FS exige a idade mínima de <strong>17 anos completos</strong> para ingresso. Agradecemos o interesse!
          </p>
          <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '0.8rem 2rem', width: '100%', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }} onClick={() => setModalIdadeOpen(false)}>FECHAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${legalModalOpen ? 'active' : ''}`} onClick={fecharModalClicandoFora} style={{ zIndex: 9999 }}>
        <div ref={modalContentRef} className="modal-content" style={{ padding: 0, background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '700px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600 }}>{legalContent[activeLegalTab].title}</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>{legalContent[activeLegalTab].subtitle}</p>
            </div>
            <button onClick={() => setLegalModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body-scroll" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, paddingRight: '1rem' }}>
            {legalContent[activeLegalTab].body}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <button onClick={() => setActiveLegalTab('cookies')} className={`legal-tab ${activeLegalTab === 'cookies' ? 'active' : ''}`}>
              <Cookie size={16} /> Cookies
            </button>
            <button onClick={() => setActiveLegalTab('privacidade')} className={`legal-tab ${activeLegalTab === 'privacidade' ? 'active' : ''}`}>
              <ShieldCheck size={16} /> Privacidade
            </button>
            <button onClick={() => setActiveLegalTab('termos')} className={`legal-tab ${activeLegalTab === 'termos' ? 'active' : ''}`}>
              <FileText size={16} /> Termos
            </button>
            <button onClick={() => setActiveLegalTab('disclaimer')} className={`legal-tab ${activeLegalTab === 'disclaimer' ? 'active' : ''}`}>
              <FileText size={16} /> Aviso Legal
            </button>
          </div>

          {!cookiesAccepted && activeLegalTab === 'cookies' && (
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={recusarCookies} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 500 }}>Recusar</button>
              <button onClick={aceitarCookies} style={{ flex: 1, background: '#0ea5e9', border: 'none', color: '#030712', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Aceitar e Fechar</button>
            </div>
          )}
        </div>
      </div>

      <div className={`modal-overlay ${lightboxIndex !== null ? 'active' : ''}`} style={{ zIndex: 100000, padding: 0 }} onClick={() => setLightboxIndex(null)}>
        {lightboxIndex !== null && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,7,18,0.95)' }}>
            <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s', backdropFilter: 'blur(10px)' }} onMouseEnter={e => e.currentTarget.style.background = '#ef4444'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <X size={24} />
            </button>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '90%', maxHeight: '90vh' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? galeriaImagens.length - 1 : prev! - 1); }} 
                style={{ position: 'absolute', left: '-25px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', background: '#0ea5e9', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }} 
                onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>

              <img src={galeriaImagens[lightboxIndex]} alt={`Galeria ${lightboxIndex}`} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.8))' }} />

              <button 
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === galeriaImagens.length - 1 ? 0 : prev! + 1); }} 
                style={{ position: 'absolute', right: '-25px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', background: '#0ea5e9', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }} 
                onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}