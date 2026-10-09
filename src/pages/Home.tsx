/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

"use client";

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plane, ChevronRight, Map as MapIcon, 
  ShoppingCart, CheckCircle2, Calendar, Newspaper, 
  ChevronUp, Quote, Download, Menu, X, ShieldCheck, FileText, AlertTriangle, LayoutGrid, Send, Cookie, MapPin, Play, Tv, ChevronDown,
  Signal
} from 'lucide-react';

import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

import headerImage from '../images/tucano.jpg';
import a29Image from '../images/a29.png'; 
import logoImage from '../images/logo.png';
import parceiroImage from '../images/parceiro.png';
import faviconImage from '../images/favicon.png';
import pilotoImage from '../images/piloto.png';
import a29icon from '../images/a-29.png';
import ytLogo from '../images/yt.svg';
import twLogo from '../images/tw.png';
import tkLogo from '../images/tk.png';
import formacaoImage from '../images/formacao.png';

import tucano2png from '../images/tucano2.jpg';
import tucano4png from '../images/tucano4.jpg';
import tucano5png from '../images/tucano5.jpg';

import t271 from '../images/t271.jpg';
import t272 from '../images/t272.jpg';
import t273 from '../images/t273.jpg';

const mapaBrasilUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Brazil_blank_map.svg/1000px-Brazil_blank_map.svg.png";

const getMarkerIcon = (status: string) => {
  const color = status === 'Confirmado' ? '#10b981' : status === 'Cancelado' ? '#ef4444' : '#f59e0b';
  return new L.DivIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position:relative; width: 24px; height: 24px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; border: 1px solid ${color}; opacity: 0.4; animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        <div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface Piloto { id?: string; posicao: string; nome: string; cidade?: string; uf?: string; oculto?: boolean; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; tipo: string; }
interface Mod { id?: string; titulo: string; desc: string; icon: React.ReactNode; isMarketplace: boolean; buttonText: string; buttonIcon: React.ReactNode; link: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }

const SectionHeader = ({ title }: { title: string }) => (
  <div className="section-header" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
    <h2 className="section-title" style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, letterSpacing: '0.05em', color: '#f8fafc', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>{title}</h2>
    <div className="section-line" style={{ height: '2px', width: '80px', background: 'linear-gradient(to right, #f59e0b, transparent)', opacity: 0.8, marginTop: '0.75rem', borderRadius: '2px' }} />
  </div>
);

const AppleSpec = ({ value, unit, label }: { value: string, unit?: string, label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: 'none', backdropFilter: 'blur(12px)' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', color: '#f8fafc' }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</span>
      {unit && <span style={{ fontSize: '1rem', fontWeight: 400, color: '#f59e0b', fontFamily: '"Inter", sans-serif' }}>{unit}</span>}
    </div>
    <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem', fontWeight: 400, fontFamily: '"Inter", sans-serif' }}>{label}</span>
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  const [pilotosViewMode, setPilotosViewMode] = useState<'cards' | 'formatura'>('cards');
  
  const [isMidiasOpen, setIsMidiasOpen] = useState(false);
  const [livePlatform, setLivePlatform] = useState<'youtube' | 'twitch' | 'tiktok'>('youtube');
  const [liveYT, setLiveYT] = useState('');
  const [liveTwitch, setLiveTwitch] = useState('');
  const [liveTikTok, setLiveTikTok] = useState('');
  const hasLive = liveYT || liveTwitch || liveTikTok;
  
  const [agendaView, setAgendaView] = useState<'lista' | 'mapa'>('lista');
  const [agendaPage, setAgendaPage] = useState(1);
  const AGENDA_ITEMS_PER_PAGE = 6;
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacidade' | 'termos' | 'cookies' | 'disclaimer'>('privacidade');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [dbPilotos, setDbPilotos] = useState<Piloto[]>([]);
  const [dbDemonstracoes, setDbDemonstracoes] = useState<Demonstracao[]>([]);
  const [dbMods, setDbMods] = useState<Mod[]>([]);
  const [dbNoticias, setDbNoticias] = useState<Noticia[]>([]);
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  
  const [plataforma, setPlataforma] = useState('');
  const [modalAlistamento, setModalAlistamento] = useState(false);
  const [modalIdadeOpen, setModalIdadeOpen] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isBlocked, setIsBlocked] = useState(false); 

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
  
  const [possuiT27, setPossuiT27] = useState<'sim' | 'nao' | ''>('');
  const [possuiA29, setPossuiA29] = useState<'sim' | 'nao' | ''>('');

  const [offsetY, setOffsetY] = useState(0);

  const formatYouTubeUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1`;
    }
    return url; 
  };

  const formatTwitchUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('player.twitch.tv')) return url;
    const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
    const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (match && match[1]) {
      return `https://player.twitch.tv/?channel=${match[1]}&parent=${parentDomain}&autoplay=true&muted=true`;
    }
    return url;
  };

  const formatTikTokUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('tiktok.com/embed')) return url;
    const match = url.match(/video\/(\d+)/);
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
    return url;
  };

  useEffect(() => {
    document.title = "MSFS | Esquadrilha da Fumaça Virtual";
    document.documentElement.setAttribute('data-theme', 'dark');

    if (localStorage.getItem('edav_age_blocked') === 'true') {
      setIsBlocked(true);
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Acompanhe a Esquadrilha da Fumaça Virtual no Microsoft Flight Simulator. Manobras de alta precisão, profissionalismo e pura emoção nos céus virtuais!');

    let linkFavicon = document.querySelector('link[rel="icon"]');
    if (!linkFavicon) {
      linkFavicon = document.createElement('link');
      linkFavicon.setAttribute('rel', 'icon');
      document.head.appendChild(linkFavicon);
    }
    linkFavicon.setAttribute('href', faviconImage);
    linkFavicon.setAttribute('type', 'image/png');
    linkFavicon.setAttribute('sizes', '32x32');
    
    if (!localStorage.getItem('cookiePref_edav')) {
      setShowCookieBanner(true);
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

    const unsubMods = onSnapshot(collection(db, 'mods'), (snapshot) => {
      const arr: Mod[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        arr.push({ 
          id: doc.id, titulo: d.titulo, desc: d.desc, isMarketplace: d.isMarketplace, link: d.link, 
          buttonText: d.isMarketplace ? 'Loja MSFS' : 'Download',
          icon: d.isMarketplace ? <Plane size={24} strokeWidth={1.5} /> : <MapIcon size={24} strokeWidth={1.5} />,
          buttonIcon: d.isMarketplace ? <ShoppingCart size={14} /> : <Download size={14} />
        } as unknown as Mod);
      });
      setDbMods(arr);
    });

    const unsubNoticias = onSnapshot(collection(db, 'noticias'), (snapshot) => {
      const arr: Noticia[] = [];
      snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() } as unknown as Noticia));
      setDbNoticias(arr);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setAlistamentoAberto(d.alistamentoAberto || false);
        if (d.headerImageUrl) {
          setCustomHeader(d.headerImageUrl);
        }
        
        const yt = d.liveYouTubeUrl || '';
        const tw = d.liveTwitchUrl || '';
        const tk = d.liveTikTokUrl || '';
        
        setLiveYT(formatYouTubeUrl(yt));
        setLiveTwitch(formatTwitchUrl(tw));
        setLiveTikTok(formatTikTokUrl(tk));
        
        if (yt) setLivePlatform('youtube');
        else if (tw) setLivePlatform('twitch');
        else if (tk) setLivePlatform('tiktok');
        else setLivePlatform('youtube');
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubPilotos(); unsubAgenda(); unsubMods(); unsubNoticias(); unsubConfig();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
    setScrolled(window.scrollY > 30);
    setShowTopBtn(window.scrollY > 400); 

    const sections = ['pilotos', 'midias', 'agenda', 'aeronave', 'destaque', 't27', 'noticias', 'sobre'];
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    closeMobileMenu();
  };

  const handleCookie = (acc: boolean) => {
    localStorage.setItem('cookiePref_edav', acc ? 'accepted' : 'rejected');
    setShowCookieBanner(false);
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
    if (!nome.trim() || !nickname.trim() || !whatsapp.trim() || !discord.trim() || !experiencia.trim() || !plataforma || !disponibilidade.trim() || !possuiT27 || !possuiA29 || dataNascimento.length !== 10 || isBlocked) {
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
          _subject: "Novo Alistamento Recebido - EDAV MSFS",
          Nome: nome,
          Nickname: nickname,
          "Data de Nascimento": dataNascimento,
          WhatsApp: whatsapp,
          Discord: discord,
          Experiencia: experiencia,
          Plataforma: plataforma,
          "Possui T-27 RP Simulations": possuiT27 === 'sim' ? 'Sim' : 'Não',
          "Possui A-29 RP Simulations": possuiA29 === 'sim' ? 'Sim' : 'Não',
          "Experiência Acrobática": vooAcrobatico === 'sim' ? detalhesVooAcrobatico : 'Não',
          "Disponibilidade": disponibilidade,
          "Motivação": motivoIngresso
        })
      });

      setIsFormModalOpen(false);
      setModalAlistamento(true);
      setNome(''); setNickname(''); setDiscord(''); setExperiencia(''); setWhatsapp(''); setPlataforma('');
      setDataNascimento(''); setVooAcrobatico(''); setDetalhesVooAcrobatico(''); setDisponibilidade(''); setMotivoIngresso('');
      setPossuiT27(''); setPossuiA29('');
    } catch (error) {
      alert("Houve um erro ao enviar a sua candidatura. Verifique a sua conexão e tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const mapCenter: [number, number] = [-15.8658, -47.9292];
  const southAmericaBounds = L.latLngBounds(
    L.latLng(-60.0, -90.0), 
    L.latLng(15.0, -30.0)   
  );

  const totalAgendaPages = Math.ceil(dbDemonstracoes.length / AGENDA_ITEMS_PER_PAGE) || 1;
  const startIndex = (agendaPage - 1) * AGENDA_ITEMS_PER_PAGE;
  const currentAgendaItems = dbDemonstracoes.slice(startIndex, startIndex + AGENDA_ITEMS_PER_PAGE);
  const emptySlotsCount = AGENDA_ITEMS_PER_PAGE - currentAgendaItems.length;
  const emptySlots = Array.from({ length: emptySlotsCount > 0 ? emptySlotsCount : 0 });

  const legalContent = {
    privacidade: {
      title: "Política de Privacidade",
      subtitle: "Como protegemos e tratamos os seus dados.",
      body: (
        <>
          <p>Este documento estabelece as diretrizes de proteção de dados e privacidade da Esquadrilha da Fumaça Virtual (EDAV), garantindo o cumprimento das leis vigentes e o respeito à sua navegação.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Coleta de Dados</h4>
          <p>Ao realizar o alistamento, solicitamos informações essenciais (nome, idade, contacto, experiência) que são armazenadas de forma segura e com acesso restrito apenas aos membros do Comando Geral.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Finalidade e Uso</h4>
          <p>Os dados fornecidos têm o único propósito de viabilizar o processo de seleção de pilotos, comunicação interna e coordenação operacional de voos. Nenhum dado é repassado, vendido ou utilizado para fins comerciais ou publicitários de qualquer espécie.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Sigilo e Proteção</h4>
          <p>Mantemos protocolos rigorosos na base de dados para impedir o acesso não autorizado. As informações recolhidas são descartadas mediante solicitação do usuário ou encerramento de vínculo com o esquadrão.</p>
        </>
      )
    },
    termos: {
      title: "Termos de Uso Operacional",
      subtitle: "Diretrizes de convivência e conduta no Esquadrão.",
      body: (
        <>
          <p>Ao ingressar ou participar nas plataformas e voos da Esquadrilha da Fumaça Virtual, o membro compromete-se a seguir os padrões de conduta exigidos.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Profissionalismo e Ética</h4>
          <p>Exigimos respeito mútuo, cordialidade e espírito de equipa. Não toleramos comportamentos tóxicos, discursos de ódio, assédio ou qualquer atitude que lese a moral dos nossos membros e parceiros.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Normas de Voo e Simulação</h4>
          <p>Operamos em ambientes de simulação (Microsoft Flight Simulator) buscando a mais alta fidelidade possível. O uso de cheats, modificações maliciosas ou conduta antidesportiva nas redes de simulação é estritamente proibido.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Hierarquia</h4>
          <p>As decisões tomadas pelo Comando Geral visam o bem-estar e a organização do grupo, devendo ser respeitadas. Sugestões e críticas construtivas são sempre bem-vindas nos canais adequados.</p>
        </>
      )
    },
    cookies: {
      title: "Política de Cookies",
      subtitle: "Uso de cookies essenciais para a plataforma.",
      body: (
        <>
          <p>Este portal utiliza tecnologias de armazenamento local para garantir uma navegação fluida e segura.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>Que tipo de Cookies utilizamos?</h4>
          <p>Utilizamos exclusivamente <strong>Cookies Estritamente Necessários</strong>. Eles são essenciais para que as funções básicas do portal operem corretamente. Por exemplo, utilizamos um cookie para registar que você já leu e ocultou a barra de aviso de cookies, evitando que ela reapareça a cada recarregamento de página.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>Sem Rastreio de Terceiros</h4>
          <p>Não integramos cookies de publicidade direcionada, marketing ou rastreadores invasivos. A sua navegação neste site não é monitorizada por nós para criar perfis de consumidor.</p>
        </>
      )
    },
    disclaimer: {
      title: "Aviso Legal Institucional",
      subtitle: "Direitos autorais, marcas e ausência de vínculos.",
      body: (
        <>
          <p>O portal da Esquadrilha da Fumaça Virtual opera sob os princípios do *Fair Use* e do respeito institucional, estabelecendo os seguintes pontos legais:</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Entidade Civil e Entusiasta</h4>
          <p>A Esquadrilha da Fumaça Virtual (neste portal referida) é um grupo civil, independente e sem fins lucrativos, focado estritamente na prática do desporto eletrónico (e-sports) no âmbito da simulação de voo.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Ausência de Vínculo com a FAB</h4>
          <p><strong>Deixamos formalmente explícito que não possuímos nenhuma filiação, patrocínio, endosso ou ligação com a Força Aérea Brasileira (FAB), nem com o Esquadrão de Demonstração Aérea (EDA) oficial.</strong></p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Uso de Insígnias e Marcas</h4>
          <p>A utilização de pinturas, logotipos inspirados, referências a aeronaves (como o Embraer A-29 Super Tucano) e terminologias militares possui caráter puramente ilustrativo, ficcional e lúdico, com o objetivo único de homenagear os profissionais reais da aviação em ambiente virtual.</p>
          <p style={{ marginTop: '1rem' }}>
            Encorajamos fortemente todos os interessados e entusiastas a visitarem e conhecerem o trabalho incrível da <strong>EDAV Oficial</strong> acessando o link <a href="https://edav.com.br" target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>edav.com.br</a>. Deixamos aqui o nosso máximo respeito e profunda admiração por tudo o que eles representam para a comunidade.
          </p>
        </>
      )
    }
  };

  const renderFormationSlot = (posicao: string) => {
    const piloto = dbPilotos.find(p => p.posicao === posicao && !p.oculto);
    
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

    const isLeft = posicao === '3' || posicao === '5';

    return (
      <div className="tatic-slot" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '260px', justifyContent: 'center', height: '140px' }}>
        
        <img 
          src={a29icon} 
          alt={`Posição ${posicao}`} 
          className="tatic-plane"
          style={{ 
            width: '140px', 
            height: '140px', 
            objectFit: 'contain', 
            filter: piloto ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.6))' : 'grayscale(100%) opacity(10%)',
            zIndex: 2,
            position: 'relative'
          }} 
        />
        
        <div className="slot-info" style={{ 
          position: 'absolute',
          [isLeft ? 'right' : 'left']: 'calc(50% + 75px)',
          display: 'flex',
          flexDirection: isLeft ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          <span style={{ 
            fontSize: '3rem', 
            fontFamily: '"PosicaoFont", sans-serif', 
            color: '#f59e0b',
            lineHeight: 0.8
          }}>
            {posicao}
          </span>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            textAlign: isLeft ? 'right' : 'left'
          }}>
            <span style={{ display: 'block', color: '#f59e0b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"Inter", sans-serif' }}>{role}</span>
            <span style={{ display: 'block', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 300, fontFamily: '"Inter", sans-serif', marginTop: '2px', whiteSpace: 'nowrap' }}>{piloto ? piloto.nome : 'Vago'}</span>
          </div>
        </div>
        
      </div>
    );
  };

  return (
    <div id="top">
      <style>{`
        

        body, html { 
          background-color: #030712 !important; 
          font-family: "Inter", sans-serif; 
          overflow-x: hidden; 
          scroll-behavior: smooth; 
          font-weight: 300; 
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        
        @font-face {
           font-family: 'StratumNo2';
          src: url('./fonts/stratumno2_regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap; 
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

        p {
          font-family: "Inter", sans-serif;
          font-weight: 300;
          line-height: 1.8;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #f59e0b; }

        h1, h2, h3, h4, h5, h6 { font-family: "Arial", sans-serif !important; color: #ffffff; }

        .section-title {
          font-family: "StratumNo2", sans-serif !important;
        }

        .glass-panel { 
          background: rgba(15, 23, 42, 0.4);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .card-piloto { 
          border-radius: 4px !important; 
          border: 1px solid rgba(255,255,255,0.05) !important; 
          background: rgba(15, 23, 42, 0.4);
        }

        .piloto-img {
          opacity: 0.9;
        }

        .numero-posicao {
          font-size: 3.5rem !important;
          font-family: "PosicaoFont", sans-serif !important;
          color: #f59e0b !important;
          line-height: 0.8 !important;
        }

        .tatic-number {
          color: #f59e0b !important;
        }
        
        /* ADICIONADO PARA O EFEITO DE HOVER NO SLOT DE FORMAÇÃO */
        .slot-info { 
          opacity: 0; 
          transition: opacity 0.3s ease; 
        }
        .tatic-slot:hover .slot-info { 
          opacity: 1; 
        }

        .modern-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          outline: none;
          padding: 0.85rem 1rem;
          color: #ffffff;
          border-radius: 4px 4px 0 0;
          font-family: "Inter", sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .modern-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid #f59e0b;
        }
        .modern-input::placeholder { color: #64748b !important; opacity: 0.5 !important; font-weight: 300; }

        .section-container { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10; }
        
        .leaflet-popup-content-wrapper { background: #ffffff !important; color: #030712 !important; border: 1px solid #e2e8f0 !important; border-radius: 4px !important; font-family: "Inter", sans-serif; font-weight: 400; }
        .leaflet-popup-tip { background-color: #ffffff !important; }
        .leaflet-container { background: #e2e8f0 !important; border-radius: 4px; }
        .leaflet-layer { filter: none !important; }

        .leaflet-bar {
          border: none !important;
          border-radius: 4px !important;
          overflow: hidden;
        }
        .leaflet-touch .leaflet-bar a, .leaflet-bar a {
          background-color: rgba(15, 23, 42, 0.8) !important;
          color: #f59e0b !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          transition: all 0.3s ease !important;
          border-radius: 0 !important;
        }
        .leaflet-touch .leaflet-bar a:hover, .leaflet-bar a:hover {
          background-color: #f59e0b !important;
          color: #000 !important;
        }

        .desktop-nav { display: flex; align-items: center; gap: 2rem; }

        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 600; 
          font-style: normal;
          font-size: 0.90rem; 
          font-family: "StratumNo2", sans-serif !important;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover { color: #f59e0b; }
        .nav-link.active { color: #f59e0b; font-weight: 700; }

        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(15, 23, 42, 0.95); z-index: 99; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.5rem; text-decoration: none; font-weight: 400; font-family: "StratumNo2", sans-serif !important; letter-spacing: 0.05em; transition: color 0.3s ease; cursor: pointer; text-transform: uppercase; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #f59e0b; }

        .legal-tab { background: transparent; border: none; color: #94a3b8; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; font-family: "Inter", sans-serif !important; transition: all 0.3s ease; font-size: 0.9rem; text-transform: uppercase; }
        .legal-tab:hover { background: rgba(255,255,255,0.05); color: #ffffff; }
        .legal-tab.active { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        
        .modal-body-scroll::-webkit-scrollbar { width: 6px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }

        .platform-btn {
          flex: 1;
          padding: 0.7rem;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          outline: none;
          border-radius: 4px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: "Inter", sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .platform-btn.active {
          background: #f59e0b;
          color: #030712;
        }
        .platform-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .view-toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8;
          padding: 0.6rem 1.25rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: "Inter", sans-serif;
        }
        .view-toggle-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
        }
        .view-toggle-btn.active {
          background: #f59e0b !important;
          color: #030712 !important;
          border-color: #f59e0b !important;
        }

        .view-toggle-btn.active-yt {
          background: #ef4444 !important;
          border-color: #ef4444 !important;
          color: #ffffff !important;
        }
        .view-toggle-btn.active-yt img {
          filter: brightness(0) invert(1) !important;
        }

        .view-toggle-btn.active-tw {
          background: #9146FF !important;
          border-color: #9146FF !important;
          color: #ffffff !important;
        }
        .view-toggle-btn.active-tw img {
          filter: brightness(0) invert(1) !important;
        }
        
        .view-toggle-btn.active-tk {
          background: #000000 !important;
          border-color: #ffffff !important;
          color: #ffffff !important;
        }
        .view-toggle-btn.active-tk img {
          filter: brightness(0) invert(1) !important;
        }
        
        .view-toggle-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(255,255,255,0.02) !important;
          color: rgba(255,255,255,0.3) !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
        
        .view-toggle-btn:disabled img {
          filter: grayscale(100%) opacity(0.4) !important;
        }

        .tb-button {
          position: relative;
          background: transparent;
          color: #f59e0b;
          font-family: 'StratumNo2', sans-serif !important;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.85rem 2rem;
          border: 1px solid #f59e0b;
          outline: none;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .tb-button:hover {
          background: #f59e0b;
          color: #030712;
        }
        
        .tb-button:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          border-color: transparent;
          cursor: not-allowed;
        }

        .agenda-card {
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(15, 23, 42, 0.4);
        }
        
        .agenda-card-empty {
          border-radius: 4px;
          border: 1px dashed rgba(255,255,255,0.1);
          background: rgba(15, 23, 42, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          font-family: Arial, sans-serif;
          font-size: 0.9rem;
          min-height: 55px;
        }

        .t27-box {
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          position: relative;
        }
        .t27-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }
        .t27-box:hover .t27-img {
          transform: scale(1.05);
        }

        .grid-t27 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        .grid-a29 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          align-items: center;
        }

        .ao-vivo-content {
          margin-top: 1rem;
        }
        
        @media (min-width: 768px) {
          .grid-t27 {
            grid-template-columns: 2fr 1fr;
            min-height: 400px;
          }
          .grid-a29 {
            grid-template-columns: 1fr 1fr;
            min-height: 400px;
          }
        }
        
        @media (min-width: 900px) {
          .split-grid { grid-template-columns: 1fr 1fr; }
          .split-grid.reverse { direction: rtl; }
          .split-grid.reverse > * { direction: ltr; }
        }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .section-container { padding: 4rem 1.5rem !important; }
          .map-box { height: 400px !important; }
          .footer-content { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .footer-content img { margin: 0 auto; }
          .footer-content div { align-items: center !important; justify-content: center !important; }
          .responsive-grid { grid-template-columns: 1fr !important; }

          .card-piloto { min-height: 140px !important; }
          .piloto-nome { font-size: 1.25rem !important; }

          .formacao-wrapper {
             transform: scale(0.60);
             transform-origin: top center;
             margin-bottom: -120px;
          }
        }

        @media (max-width: 600px) {
           .formacao-wrapper {
             transform: scale(0.38);
             transform-origin: top center;
             margin-bottom: -220px;
           }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease', padding: scrolled || mobileMenuOpen ? '0.6rem 0' : '1.25rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => { scrollToTop(); closeMobileMenu(); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: scrolled ? '50px' : '64px', width: 'auto', display: 'block', transition: 'height 0.3s ease' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 500, fontSize: '1.20rem', color: '#f8fafc', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                ESQUADRILHA DA FUMAÇA VIRTUAL
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 400, fontSize: '0.85rem', color: '#ffffff', padding: '1px 10px', borderRadius: '0px', letterSpacing: '0.1em', transform: 'skewX(-25deg)', display: 'inline-block', background: 'linear-gradient(135deg, #0ea5e9 0%, #0f89c6 100%)' }}>
                  MICROSOFT FLIGHT SIMULATOR
                </span>
              </div>
            </div>
          </div>

          <div className="desktop-nav">
            <span onClick={() => scrollToSection('pilotos')} className={`nav-link ${activeSection === 'pilotos' ? 'active' : ''}`}>PILOTOS</span>
            {hasLive && (
              <span onClick={() => scrollToSection('midias')} className={`nav-link ${activeSection === 'midias' ? 'active' : ''}`}>MÍDIAS</span>
            )}
            <span onClick={() => scrollToSection('agenda')} className={`nav-link ${activeSection === 'agenda' ? 'active' : ''}`}>AGENDA</span>
            <span onClick={() => scrollToSection('aeronave')} className={`nav-link ${activeSection === 'aeronave' ? 'active' : ''}`}>AERONAVE</span>
            {dbNoticias.length > 0 && (
              <span onClick={() => scrollToSection('noticias')} className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`}>ARTIGOS</span>
            )}
            <span onClick={() => scrollToSection('sobre')} className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}>SOBRE NÓS</span>
            
            {alistamentoAberto && (
              <button className="tb-button" onClick={() => setIsFormModalOpen(true)} style={{ fontSize: '0.8rem', padding: '0.5rem 1.2rem', marginLeft: '0.5rem', fontFamily: '"StratumNo2", sans-serif', background: '#f59e0b', color: '#030712' }}>
                QUERO FAZER PARTE
              </button>
            )}
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} color="#f8fafc" /> : <Menu size={24} color="#f8fafc" />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className={activeSection === 'pilotos' ? 'active' : ''} onClick={() => scrollToSection('pilotos')}>PILOTOS</span>
        {hasLive && (
          <span className={activeSection === 'midias' ? 'active' : ''} onClick={() => scrollToSection('midias')}>MÍDIAS</span>
        )}
        <span className={activeSection === 'agenda' ? 'active' : ''} onClick={() => scrollToSection('agenda')}>AGENDA</span>
        <span className={activeSection === 'aeronave' ? 'active' : ''} onClick={() => scrollToSection('aeronave')}>O SUPER TUCANO</span>
        {dbNoticias.length > 0 && (
          <span className={activeSection === 'noticias' ? 'active' : ''} onClick={() => scrollToSection('noticias')}>ARTIGOS</span>
        )}
        <span className={activeSection === 'sobre' ? 'active' : ''} onClick={() => scrollToSection('sobre')}>SOBRE O EDA FS</span>
        {alistamentoAberto && (
          <button className="tb-button" onClick={() => { setIsFormModalOpen(true); setMobileMenuOpen(false); }} style={{ marginTop: '1rem', fontSize: '1rem', fontFamily: '"StratumNo2", sans-serif', background: '#f59e0b', color: '#030712' }}>
            QUERO FAZER PARTE
          </button>
        )}
      </div>

      <section className="hero" style={{ height: '60vh', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customHeader || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'cover', opacity: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,7,18,0.2) 0%, rgba(3,7,18,0.5) 86%, #030712 100%)', zIndex: 1 }} />
      </section>

      <div style={{ position: 'relative', backgroundColor: '#030712' }}>
        <section id="pilotos" className="section-container">
          <SectionHeader title="PILOTOS" />
          <p style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '700px', margin: '-1.5rem auto 3rem', fontWeight: 300 }}>
            Conheça os aviadores virtuais que compõem a Esquadrilha Virtual.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <button onClick={() => setPilotosViewMode('cards')} className={`view-toggle-btn ${pilotosViewMode === 'cards' ? 'active' : ''}`} style={{ textTransform: 'none' }}>
              <LayoutGrid size={16} /> Pilotos
            </button>
            <button onClick={() => setPilotosViewMode('formatura')} className={`view-toggle-btn ${pilotosViewMode === 'formatura' ? 'active' : ''}`} style={{ textTransform: 'none' }}>
              <Plane size={16} /> Formação em Voo
            </button>
          </div>

          {pilotosViewMode === 'cards' ? (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {dbPilotos.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', gridColumn: '1 / -1', fontWeight: 300 }}>Carregando dados dos pilotos...</p>
              ) : (
                dbPilotos.map((piloto, index) => {
                  let role = "";
                  switch (piloto.posicao) {
                    case '1': role = 'LÍDER'; break;
                    case '2': role = 'ALA DIREITA'; break;
                    case '3': role = 'ALA ESQUERDA'; break;
                    case '4': role = 'FERROLHO'; break;
                    case '5': role = 'ALA ESQ. EXTERNA'; break;
                    case '6': role = 'ALA DIR. EXTERNA'; break;
                    case '7': role = 'ISOLADO'; break;
                    default: role = `ALA ${piloto.posicao}`;
                  }

                  if (piloto.oculto) return null; 

                  return (
                    <div key={index} className="card-piloto" style={{ 
                      position: 'relative', 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'row', 
                      justifyContent: 'flex-end', 
                      alignItems: 'center',
                      padding: '1.5rem',
                      minHeight: '140px'
                    }}>
                      <img src={pilotoImage} alt="Piloto" className="piloto-img" style={{ 
                        position: 'absolute', left: '-5%', top: '0', width: '50%', height: '100%', 
                        objectFit: 'cover', objectPosition: 'left top',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)', 
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)', 
                        zIndex: 0, pointerEvents: 'none'
                      }} />

                      <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                          <h3 className="piloto-nome" style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.3rem', fontWeight: 500, color: '#f8fafc', margin: '0 0 0.2rem 0' }}>
                            {piloto.nome}
                          </h3>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', color: '#f59e0b', textTransform: 'uppercase', marginTop: '0.5rem', fontFamily: '"Inter", sans-serif' }}>
                            {role}
                          </div>
                        </div>
                        
                        <div className="numero-posicao">
                          {piloto.posicao}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="formacao-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0rem', marginTop: '2rem', minHeight: '350px', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderFormationSlot('1')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '7rem', marginTop: '-15px' }}>
                {renderFormationSlot('3')}
                {renderFormationSlot('2')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '-15px' }}>
                {renderFormationSlot('5')}
                {renderFormationSlot('4')}
                {renderFormationSlot('6')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                {renderFormationSlot('7')}
              </div>
            </div>
          )}
        </section>
      </div>

      {hasLive && (
        <div style={{ position: 'relative', backgroundColor: '#0b1121' }}>
          <section id="midias" className="section-container">
            <SectionHeader title="MÍDIAS" />
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
                 Acompanhe as nossas apresentações em tempo real e reveja os melhores momentos das demonstrações da Esquadrilha da Fumaça Virtual nos nossos canais oficiais.
               </p>
            </div>

            {isMidiasOpen && (
              <div className="ao-vivo-content" style={{ animation: 'fadeIn 0.3s ease', marginBottom: '2rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <button disabled={!liveYT} onClick={() => setLivePlatform('youtube')} className={`view-toggle-btn ${livePlatform === 'youtube' && liveYT ? 'active-yt' : ''}`} style={{ textTransform: 'none' }}>
                    <img src={ytLogo} alt="YouTube" style={{ width: 18, height: 18, filter: livePlatform === 'youtube' && liveYT ? 'brightness(0) invert(1)' : 'none' }} /> YouTube Gaming
                  </button>
                  <button disabled={!liveTwitch} onClick={() => setLivePlatform('twitch')} className={`view-toggle-btn ${livePlatform === 'twitch' && liveTwitch ? 'active-tw' : ''}`} style={{ textTransform: 'none' }}>
                    <img src={twLogo} alt="Twitch" style={{ width: 18, height: 18, filter: livePlatform === 'twitch' && liveTwitch ? 'brightness(0) invert(1)' : 'none' }} /> Twitch
                  </button>
                  <button disabled={!liveTikTok} onClick={() => setLivePlatform('tiktok')} className={`view-toggle-btn ${livePlatform === 'tiktok' && liveTikTok ? 'active-tk' : ''}`} style={{ textTransform: 'none' }}>
                    <img src={tkLogo} alt="TikTok" style={{ width: 18, height: 18, filter: livePlatform === 'tiktok' && liveTikTok ? 'brightness(0) invert(1)' : 'none' }} /> TikTok
                  </button>
                </div>

                <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {livePlatform === 'youtube' && liveYT && (
                    <iframe width="100%" height="100%" src={liveYT} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', inset: 0 }}></iframe>
                  )}
                  {livePlatform === 'twitch' && liveTwitch && (
                    <iframe src={liveTwitch} frameBorder="0" allowFullScreen scrolling="no" height="100%" width="100%" style={{ position: 'absolute', inset: 0 }}></iframe>
                  )}
                  {livePlatform === 'tiktok' && liveTikTok && (
                    <iframe src={liveTikTok} frameBorder="0" allowFullScreen scrolling="no" height="100%" width="100%" style={{ position: 'absolute', inset: 0 }}></iframe>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
               <button onClick={() => setIsMidiasOpen(!isMidiasOpen)} className={`view-toggle-btn ${isMidiasOpen ? 'active' : ''}`} style={{ textTransform: 'none' }}>
                 {isMidiasOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {isMidiasOpen ? 'Recolher' : 'Expandir'}
               </button>
            </div>
          </section>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#030712' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #030712 0%, transparent 20%, transparent 80%, #030712 100%)', zIndex: 0 }} />
        
        <section id="agenda" className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeader title="AGENDA" />
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <button onClick={() => setAgendaView('lista')} className={`view-toggle-btn ${agendaView === 'lista' ? 'active' : ''}`} style={{ textTransform: 'none' }}>
              <Calendar size={16} /> Agenda
            </button>
            <button onClick={() => setAgendaView('mapa')} className={`view-toggle-btn ${agendaView === 'mapa' ? 'active' : ''}`} style={{ textTransform: 'none' }}>
              <MapIcon size={16} /> Ver no mapa
            </button>
          </div>
          
          {agendaView === 'lista' ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontWeight: 300, fontSize: '1rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1.5rem', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                Acompanhe a nossa programação oficial. As demonstrações seguem horários e condições meteorólogicas em tempo real.              </p>
              
              {dbDemonstracoes.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '0.75rem', flexGrow: 1 }}>
                    {currentAgendaItems.map((dem, idx) => {
                      let statusColor = '#f59e0b'; 
                      if (dem.status === 'Confirmado') statusColor = '#34d399';
                      if (dem.status === 'Cancelado') statusColor = '#f87171';

                      return (
                        <div key={idx} className="agenda-card" style={{ 
                          padding: '0.75rem 1rem', 
                          background: `linear-gradient(to left, ${statusColor}15 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.8) 100%)`, 
                          border: '0px solid rgba(255,255,255,0.05)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.2rem' }}>{dem.dataHora}</span>
                              <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 500, margin: 0, fontFamily: '"Inter", sans-serif' }}>{dem.cidade}</h4>
                            </div>
                          </div>
                          <span style={{ 
                            color: statusColor, 
                            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
                          }}>{dem.status === 'Planejamento' ? 'PREVISÃO' : dem.status}</span>
                        </div>
                      );
                    })}
                    {emptySlots.map((_, idx) => (
                      <div key={`empty-${idx}`} className="agenda-card-empty">Nada ainda, volte mais tarde</div>
                    ))}
                  </div>

                  {totalAgendaPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      <button onClick={() => setAgendaPage(p => Math.max(1, p - 1))} disabled={agendaPage === 1} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '4px', cursor: agendaPage === 1 ? 'not-allowed' : 'pointer', fontFamily: '"StratumNo2", sans-serif' }}>&lt; ANTERIOR</button>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: '"StratumNo2", sans-serif' }}>PÁG {agendaPage} / {totalAgendaPages}</span>
                      <button onClick={() => setAgendaPage(p => Math.min(totalAgendaPages, p + 1))} disabled={agendaPage === totalAgendaPages} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '4px', cursor: agendaPage === totalAgendaPages ? 'not-allowed' : 'pointer', fontFamily: '"StratumNo2", sans-serif' }}>PRÓXIMA &gt;</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '3rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent', borderRadius: '4px', textAlign: 'center' }}>
                  <Calendar size={32} color="#f59e0b" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: 300, color: '#64748b', fontFamily: 'Arial, sans-serif' }}>Nada ainda, volte mais tarde</p>
                </div>
              )}
            </div>
          ) : (
            <div className="map-box" style={{ maxWidth: '850px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.05)', height: '450px', borderRadius: '4px', overflow: 'hidden', transform: 'translateZ(0)' }}>
              <MapContainer 
                center={mapCenter} zoom={4} minZoom={3} maxBounds={southAmericaBounds} maxBoundsViscosity={1.0} scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 1, background: '#f8fafc' }}
              >
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dbDemonstracoes.map((dem) => {
                  if (!dem.lat || !dem.lng) return null;
                  return (
                    <Marker key={dem.id} position={[dem.lat, dem.lng]} icon={getMarkerIcon(dem.status)}>
                      <Popup>
                        <div>
                          <strong style={{ fontSize: '1.1em', color: '#f59e0b', fontFamily: '"StratumNo2", sans-serif' }}>{dem.cidade}</strong><br />
                          <span style={{ color: '#030712', fontWeight: 400, fontSize: '0.8rem' }}>Status: {dem.status}</span><br />
                          <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>{dem.dataHora}</span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

        </section>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b1121', minHeight: '600px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${a29Image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b1121 0%, rgba(3,7,18,0.7) 50%, #0b1121 100%)', zIndex: 0 }} />
        
        <section id="aeronave" className="section-container" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          <SectionHeader title="O SUPER TUCANO" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 300, fontSize: '1.1rem', lineHeight: '1.8', color: '#f8fafc', margin: '0 auto', fontFamily: '"Inter", sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              O Embraer EMB-314 Super Tucano é uma aeronave turboélice de ataque leve e treinamento avançado. Reconhecido mundialmente por sua robustez e alta tecnologia, é o vetor oficial da nossa esquadrilha virtual.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', borderRadius: '10px', marginTop: '2.5rem' }}>
              <AppleSpec label="Fabricante" value="Embraer" />
              <AppleSpec label="Velocidade Máx." value="593" unit="km/h" />
              <AppleSpec label="Teto de Serviço" value="10.6" unit="km" />
              <AppleSpec label="Potência" value="1.600" unit="shp" />
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="destaque" className="section-container">
          <SectionHeader title="TRANSIÇÃO PARA O SUPER TUCANO" />
          <p style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '800px', margin: '-1.5rem auto 3rem', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
            Os nossos pilotos encontram-se em intenso treinamento e adaptação para a implementação oficial do A-29 Super Tucano. Esta fase marca um momento histórico de evolução e aprimoramento das nossas capacidades acrobáticas no simulador.
          </p>
          <div className="grid-a29">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="t27-box" style={{ flex: 1, minHeight: '200px' }}>
                <div className="t27-img" style={{ backgroundImage: `url(${tucano2png})` }}></div>
              </div>
              <div className="t27-box" style={{ flex: 1, minHeight: '200px' }}>
                <div className="t27-img" style={{ backgroundImage: `url(${tucano4png})` }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="t27-box" style={{ flex: 1, minHeight: '300px' }}>
                <div className="t27-img" style={{ backgroundImage: `url(${tucano5png})` }}></div>
              </div>
              
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="t27" className="section-container">
          <SectionHeader title="ERA T-27" />
          <p style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '700px', margin: '-1.5rem auto 3rem', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
            Relembre a nossa trajetória e as gloriosas operações com o lendário Embraer T-27 Tucano. Após 3 anos de atividade no nosso esquadrão virtual, o veterano já tem data para se aposentar e dar lugar ao moderno A-29 Super Tucano.
          </p>
          <div className="grid-t27">
            <div className="t27-box" style={{ minHeight: '300px' }}>
              <div className="t27-img" style={{ backgroundImage: `url(${t271})` }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="t27-box" style={{ flex: 1, minHeight: '140px' }}>
                <div className="t27-img" style={{ backgroundImage: `url(${t272})` }}></div>
              </div>
              <div className="t27-box" style={{ flex: 1, minHeight: '140px' }}>
                <div className="t27-img" style={{ backgroundImage: `url(${t273})` }}></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {dbNoticias.length > 0 && (
        <div style={{ backgroundColor: '#030712' }}>
          <section id="noticias" className="section-container">
            <SectionHeader title="ARTIGOS" />
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {dbNoticias.map((noticia, idx) => (
                <div key={idx} className="news-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', border: 'none' }}>
                  {noticia.imagem && (
                    <div style={{ height: '180px', backgroundImage: `url(${noticia.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }}></div>
                  )}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{noticia.data}</span>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontFamily: '"NormalFont", sans-serif', fontWeight: 500, marginBottom: '1rem', lineHeight: 1.4 }}>{noticia.titulo}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300, flexGrow: 1, margin: 0 }}>{noticia.resumo}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b1121' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${formacaoImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.7) 100%)', zIndex: 0 }} />
        
        <section id="sobre" className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeader title="SOBRE O EDA FS" />
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#e2e8f0', margin: 0, textAlign: 'center' }}>
              A <strong style={{ color: '#ffffff', fontWeight: 500 }}>Esquadrilha da Fumaça Virtual</strong> nasce da paixão pela aviação e pelo voo em formação. Utilizando o Microsoft Flight Simulator, procuramos representar com excelência, precisão e profissionalismo a doutrina da Esquadrilha da Fumaça real. Nossa equipe é formada por entusiastas e pilotos dedicados ao treinamento contínuo, elevando a simulação a um novo patamar de imersão.
            </p>

            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(1px)' }}>
              <h3 style={{ fontFamily: '"StratumNo2", sans-serif', color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                <Quote size={30} color="#f59e0b" /> Palavra do Comandante
              </h3>
              <p style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.7', color: '#94a3b8', margin: 0 }}>
                "Desde a fundação deste esquadrão virtual, voamos diariamente para aperfeiçoar as nossas formaturas e acrobacias. O nosso objetivo é elevar a demonstração aérea no Microsoft Flight Simulator aos níveis mais altos de disciplina e beleza."
              </p>
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="parceiros" className="section-container" style={{ padding: '4rem 2rem' }}>
          <SectionHeader title="PARCEIROS" />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <img src={parceiroImage} alt="RP Simulation Logo" style={{ opacity: 0.5, height: '65px', objectFit: 'contain', filter: 'grayscale(100%)', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(100%)'; e.currentTarget.style.opacity = '0.5'; }} />
            </div>
          </div>
        </section>
      </div>

      <footer className="footer" style={{ padding: '5rem 2rem 2rem', background: '#0b1121', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', paddingBottom: '4rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '60px', width: 'auto', alignSelf: 'flex-start' }} />
            <div>
              <span style={{ display: 'block', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>ESQUADRILHA DA FUMAÇA VIRTUAL</span>
              <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 400, fontSize: '0.75rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#f8fafc', padding: '3px 12px', borderRadius: '0px', letterSpacing: '0.1em', transform: 'skewX(-24deg)', display: 'inline-block', marginTop: '8px' }}>
                MICROSOFT FLIGHT SIMULATOR
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
              <span onClick={() => window.open('https://www.instagram.com/eda.msfs/', '_blank')} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%', transition: 'all 0.3s ease', display: 'inline-flex' }} onMouseEnter={e => { e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#f59e0b'; }} onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Navegação</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span onClick={() => document.getElementById('pilotos')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Pilotos</span>
              {hasLive && (
                <span onClick={() => document.getElementById('midias')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Mídias</span>
              )}
              <span onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Agenda</span>
              <span onClick={() => document.getElementById('aeronave')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Aeronave</span>
              {dbNoticias.length > 0 && (
                <span onClick={() => document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Artigos</span>
              )}
              <span onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Sobre</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Utilitários & Mods</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px' }}>
              {dbMods.length > 0 ? dbMods.map((mod, idx) => (
                <span key={idx} onClick={() => window.open(mod.link, '_blank')} style={{ width: '100%', color: '#10b981', background: 'transparent', padding: '0.4rem 0', border: 'none', textDecoration: 'none', fontSize: '0.8rem', fontFamily: '"Inter", sans-serif', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.color = '#059669'; }} onMouseLeave={e => { e.currentTarget.style.color = '#10b981'; }}>
                  {mod.isMarketplace ? <ShoppingCart size={16} /> : <Download size={16} />} 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.titulo}</span>
                </span>
              )) : <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'normal', fontFamily: 'Arial, sans-serif' }}>Em breve...</span>}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#8e8e93', fontSize: '0.85rem' }}>
              <span onClick={() => openLegalModal('termos')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"Inter", sans-serif' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = '#8e8e93'}>
                <FileText size={14} /> Termos de Uso
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('privacidade')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"Inter", sans-serif' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = '#8e8e93'}>
                <ShieldCheck size={14} /> Privacidade de Dados
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('cookies')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"Inter", sans-serif' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = '#8e8e93'}>
                <Cookie size={14} /> Política de Cookies
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('disclaimer')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"Inter", sans-serif' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = '#8e8e93'}>
                <AlertTriangle size={14} /> Aviso Legal & Disclaimer
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.6, margin: 0, textAlign: 'justify', fontFamily: 'Arial, sans-serif' }}>
                  <strong>AVISO LEGAL:</strong> A Esquadrilha da Fumaça Virtual é uma organização civil e independente, voltada exclusivamente à simulação de voo e esporte eletrônico (e-sports) no software Microsoft Flight Simulator. <strong>Não possuímos nenhum tipo de vínculo institucional, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB)</strong> ou com o Esquadrão de Demonstração Aérea (EDA) oficial. Logotipos e insígnias inspirados são utilizados estritamente em ambiente de simulação e lazer, visando homenagear a aviação brasileira.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(28, 28, 30, 0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1rem 1.5rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 'auto', maxWidth: '90%', flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '250px' }}>
            <ShieldCheck size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontFamily: '"Inter", sans-serif', lineHeight: 1.5 }}>
              Nosso portal utiliza cookies essenciais para garantir o funcionamento correto e melhorar sua experiência de navegação, em conformidade com a LGPD. 
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleCookie(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontFamily: '"StratumNo2", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#64748b'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}>
              RECUSAR
            </button>
            <button onClick={() => handleCookie(true)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 700, fontFamily: '"StratumNo2", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => e.currentTarget.style.background = '#d97706'} onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}>
              ENTENDI E ACEITO
            </button>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, background: 'transparent', color: '#94a3b8', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showTopBtn ? 0.6 : 0, pointerEvents: showTopBtn ? 'auto' : 'none', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.opacity = '0.6'; }}>
        <ChevronUp size={28} strokeWidth={2} />
      </button>

      {/* Modal Formulário Alistamento */}
      <div className={`modal-overlay ${isFormModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel modal-body-scroll" style={{ padding: '2.5rem', background: '#0b1121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={() => setIsFormModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            <X size={24} />
          </button>
          
          {alistamentoAberto ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: '0 0 1rem 0', fontFamily: '"StratumNo2", sans-serif', textTransform: 'uppercase' }}>Alistamento Operacional</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.25rem 0', fontWeight: 300 }}>
                  Para participar no processo seletivo, é <strong>obrigatório</strong> possuir todos os requisitos listados abaixo, além do preenchimento correto e sincero de todos os dados do formulário.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400 }}><CheckCircle2 size={14} color="#f59e0b" /> +17 Anos</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400 }}><CheckCircle2 size={14} color="#f59e0b" /> MSFS Original</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400 }}><CheckCircle2 size={14} color="#f59e0b" /> HOTAS/Yoke</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400 }}><CheckCircle2 size={14} color="#f59e0b" /> EMB-312 | RP Simulations</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 400 }}><CheckCircle2 size={14} color="#f59e0b" /> EMB-314 | RP Simulations</span>
                </div>
              </div>

              <form onSubmit={submitAlistamento} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Completo *</label>
                    <input required type="text" className="modern-input" value={nome} onChange={e => setNome(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nickname no Discord *</label>
                    <input required type="text" className="modern-input" value={nickname} onChange={e => setNickname(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data de Nasc. (+17) *</label>
                    <input required type="text" maxLength={10} className="modern-input" value={dataNascimento} onChange={handleDateChange} placeholder="DD/MM/AAAA" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp *</label>
                    <input required type="text" className="modern-input" value={whatsapp} onChange={handlePhoneChange} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID no Discord *</label>
                    <input required type="text" className="modern-input" value={discord} onChange={e => setDiscord(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horas de Voo Totais *</label>
                    <input required type="text" className="modern-input" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Possui T-27 RP Simulations? *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button type="button" onClick={() => setPossuiT27('sim')} className={`platform-btn ${possuiT27 === 'sim' ? 'active' : ''}`}>Sim</button>
                      <button type="button" onClick={() => setPossuiT27('nao')} className={`platform-btn ${possuiT27 === 'nao' ? 'active' : ''}`}>Não</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Possui A-29 RP Simulations? *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button type="button" onClick={() => setPossuiA29('sim')} className={`platform-btn ${possuiA29 === 'sim' ? 'active' : ''}`}>Sim</button>
                      <button type="button" onClick={() => setPossuiA29('nao')} className={`platform-btn ${possuiA29 === 'nao' ? 'active' : ''}`}>Não</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experiência em Voo Acrobático? *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button type="button" onClick={() => setVooAcrobatico('sim')} className={`platform-btn ${vooAcrobatico === 'sim' ? 'active' : ''}`}>Sim</button>
                    <button type="button" onClick={() => { setVooAcrobatico('nao'); setDetalhesVooAcrobatico(''); }} className={`platform-btn ${vooAcrobatico === 'nao' ? 'active' : ''}`}>Não</button>
                  </div>
                </div>

                {vooAcrobatico === 'sim' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', animation: 'fadeIn 0.3s ease' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aeronave e Horas Acrobáticas *</label>
                    <input required type="text" className="modern-input" value={detalhesVooAcrobatico} onChange={e => setDetalhesVooAcrobatico(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>
                    Quais dias da semana conseguiria dedicar-se ao estudo e formação como Piloto da Academia e posterior evolução ao quadro de pilotos do EDA FS? *
                  </label>
                  <input required type="text" className="modern-input" value={disponibilidade} onChange={e => setDisponibilidade(e.target.value)} placeholder="Ex: Segundas, Quartas e Sextas à noite..." />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Por que fazer parte do EDA FS? *</span>
                    <span style={{ color: motivoIngresso.length > 950 ? '#f87171' : '#475569' }}>{motivoIngresso.length}/600</span>
                  </label>
                  <textarea required className="modern-input" rows={2} maxLength={1000} value={motivoIngresso} onChange={e => setMotivoIngresso(e.target.value)} style={{ resize: 'vertical', minHeight: '60px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Sua Plataforma (MSFS) *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%', maxWidth: '250px', margin: '0 auto' }}>
                    {['PC', 'Console'].map(plat => (
                      <button key={plat} type="button" onClick={() => setPlataforma(plat)} className={`platform-btn ${plataforma === plat ? 'active' : ''}`} style={{ borderRadius: '4px' }}>
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="tb-button"
                  disabled={isSubmitting || !isFormReady} 
                  style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', fontSize: '0.9rem', background: '#f59e0b', color: '#030712' }}
                >
                  {isSubmitting ? 'A PROCESSAR...' : <>ENVIAR APLICAÇÃO <Send size={16} style={{ marginLeft: '6px' }} /></>}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
               <h3 style={{ color: '#94a3b8', fontFamily: '"StratumNo2", sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>Alistamento Fechado</h3>
               <p style={{ color: '#64748b', fontWeight: 300 }}>Fique atento para futuras vagas.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`modal-overlay ${modalAlistamento ? 'active' : ''}`}>
        <div className="modal-content glass-panel" style={{ padding: '3rem 2.5rem', background: '#0b1121', border: '1px solid #10b981', borderRadius: '4px', maxWidth: '400px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: '1.5rem 0 1rem', fontWeight: 400, fontFamily: '"StratumNo2", sans-serif' }}>Aplicação Enviada!</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 300, fontSize: '0.9rem' }}>Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve.</p>
          <button type="button" className="tb-button" style={{ letterSpacing: '0.1em', padding: '1rem 2rem', width: '100%', borderRadius: '4px', fontFamily: '"StratumNo2", sans-serif' }} onClick={() => setModalAlistamento(false)}>CONFIRMAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${modalIdadeOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '3rem 2.5rem', background: '#0b1121', border: '1px solid #ef4444', borderRadius: '4px', maxWidth: '400px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.35rem', margin: '1.5rem 0 1rem', fontWeight: 700, fontFamily: '"StratumNo2", sans-serif', textTransform: 'uppercase' }}>Idade Não Atingida</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 300, fontSize: '0.9rem' }}>
            A doutrina da AFA FS exige a idade mínima de <strong>17 anos completos</strong> para ingresso. Agradecemos o interesse!
          </p>
          <button type="button" style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', letterSpacing: '0.1em', padding: '0.8rem 2rem', width: '100%', borderRadius: '4px', fontFamily: '"StratumNo2", sans-serif', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#334155'; }} onClick={() => setModalIdadeOpen(false)}>FECHAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${legalModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content" style={{ padding: 0, background: '#0f172a', border: '1px solid #1e293b', width: '100%', maxWidth: '700px', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontFamily: '"Inter", sans-serif', fontWeight: 700 }}>{legalContent[activeLegalTab].title}</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', fontFamily: '"Inter", sans-serif' }}>{legalContent[activeLegalTab].subtitle}</p>
            </div>
            <button onClick={() => setLegalModalOpen(false)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#334155'; }}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body-scroll" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, fontFamily: '"Inter", sans-serif', paddingRight: '1rem' }}>
            {legalContent[activeLegalTab].body}
          </div>

          <div style={{ borderTop: '1px solid #1e293b', padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: '#0f172a' }}>
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
              <AlertTriangle size={16} /> Disclaimer
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}