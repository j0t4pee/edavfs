/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plane, ChevronRight, Map as MapIcon, 
  ShoppingCart, CheckCircle2, CalendarX2, Newspaper, 
  ChevronUp, Quote, Lock, Download, Menu, X, ShieldCheck, FileText
} from 'lucide-react';

import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

import headerImage from '../images/header.jpg';
import a29Image from '../images/a29.png'; 
import logoImage from '../images/logo.png';
import parceiroImage from '../images/parceiro.png';
import faviconImage from '../images/favicon.png';
import pilotoImage from '../images/piloto.png';

const getMarkerIcon = (status: string) => {
  const color = status === 'Confirmado' ? '#10b981' : status === 'Cancelado' ? '#ef4444' : '#f59e0b';
  return new L.DivIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #030712; box-shadow: 0 0 12px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
};

interface Piloto { id?: string; posicao: string; nome: string; callsign: string; cidade?: string; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; tipo: string; }
interface Mod { id?: string; titulo: string; desc: string; icon: React.ReactNode; isMarketplace: boolean; buttonText: string; buttonIcon: React.ReactNode; link: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }

const DiscordIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const A29Stat = ({ label, value }: { label: string, value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem', background: 'rgba(3, 7, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
    <span style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif' }}>{label}</span>
    <span style={{ color: '#f59e0b', fontFamily: 'Arial, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>{value}</span>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="section-header" style={{ marginBottom: '3.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2 className="section-title" style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: '#f8fafc', fontSize: '2rem', textTransform: 'uppercase', textAlign: 'center' }}>{title}</h2>
    <div className="section-line" style={{ height: '30px', width: '2px', background: 'linear-gradient(to bottom, #f59e0b, transparent)', opacity: 0.6, marginTop: '1rem' }} />
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacidade' | 'termos' | 'cookies'>('privacidade');

  const [dbPilotos, setDbPilotos] = useState<Piloto[]>([]);
  const [dbDemonstracoes, setDbDemonstracoes] = useState<Demonstracao[]>([]);
  const [dbMods, setDbMods] = useState<Mod[]>([]);
  const [dbNoticias, setDbNoticias] = useState<Noticia[]>([]);
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  
  const [simulador, setSimulador] = useState('MSFS 2020');
  const [modalAlistamento, setModalAlistamento] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [discord, setDiscord] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [idade, setIdade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.title = "EDAV MSFS - Esquadrilha da Fumaça | MSFS";

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
        setAlistamentoAberto(docSnap.data().alistamentoAberto || false);
      }
    });

    return () => {
      unsubPilotos(); unsubAgenda(); unsubMods(); unsubNoticias(); unsubConfig();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowTopBtn(window.scrollY > 400); 

      const sections = ['pilotos', 'agenda', 'aeronave', 'noticias', 'sobre', 'alistamento'];
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    closeMobileMenu();
  };

  const handleCookie = (acc: boolean) => {
    localStorage.setItem('cookiePref_edav', acc ? 'accepted' : 'rejected');
    setShowCookieBanner(false);
  };

  const openLegalModal = (tab: 'privacidade' | 'termos' | 'cookies') => {
    setActiveLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleIdadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    setIdade(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setWhatsapp(val);
  };

  const submitAlistamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!simulador) { alert("Por favor, selecione qual o seu simulador."); return; }
    
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
          Idade: idade,
          WhatsApp: whatsapp,
          Discord: discord,
          Experiencia: experiencia,
          Simulador: simulador
        })
      });

      setModalAlistamento(true);
      setNome(''); setNickname(''); setDiscord(''); setExperiencia(''); setIdade(''); setWhatsapp('');
    } catch (error) {
      alert("Houve um erro ao enviar sua aplicação. Verifique sua conexão e tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const mapCenter: [number, number] = [-15.8658, -47.9292];

  const legalContent = {
    privacidade: {
      title: "Política de privacidade",
      subtitle: "Como tratamos seus dados e protegemos sua navegação.",
      body: (
        <>
          <p>Esta Política descreve como coletamos, usamos e protegemos os dados no portal do Esquadrão de Demonstração Aérea Virtual (EDAV MSFS). Ao utilizar este portal, você concorda com estas práticas.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. BASE LEGAL</h4>
          <p>O tratamento de dados pessoais segue a Lei 13.709/2018 (LGPD), a Lei 12.965/2014 (Marco Civil da Internet) e demais normas aplicáveis.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. DADOS COLETADOS</h4>
          <p>Podemos coletar dados fornecidos voluntariamente por você (como nome, nickname, idade e contatos via formulário de alistamento) e dados técnicos de navegação (como endereço IP e cookies não identificáveis) para viabilizar os serviços, segurança e contato interno.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. FINALIDADES</h4>
          <p>Utilizamos os dados para avaliação de novos membros (alistamento), comunicação institucional, moderação e melhoria da experiência do portal.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. COMPARTILHAMENTO</h4>
          <p>Dados jamais serão vendidos ou compartilhados com terceiros. O acesso é restrito exclusivamente ao Comando do EDAV MSFS para fins operacionais da simulação.</p>
        </>
      )
    },
    termos: {
      title: "Termos de uso",
      subtitle: "Regras de utilização do portal e serviços.",
      body: (
        <>
          <p>Bem-vindo ao EDAV MSFS. Este é um projeto de simulação sem fins lucrativos.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. ACEITAÇÃO</h4>
          <p>Ao acessar o portal ou enviar um formulário de alistamento, você concorda em cumprir estes termos e as diretrizes da comunidade.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. REGRAS DE CONDUTA</h4>
          <p>O EDAV exige respeito mútuo, profissionalismo virtual e dedicação. Não toleramos comportamentos tóxicos, ofensas ou uso de cheats/hacks nos simuladores.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. RESPONSABILIDADES E VÍNCULOS</h4>
          <p>O EDAV MSFS não possui qualquer vínculo, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB) ou qualquer entidade militar real. Somos um grupo de entusiastas utilizando softwares de entretenimento.</p>
        </>
      )
    },
    cookies: {
      title: "Política de Cookies (LGPD)",
      subtitle: "Gerenciamento de dados de navegação e preferências.",
      body: (
        <>
          <p>Utilizamos cookies para melhorar a performance e a sua experiência como usuário no nosso portal.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>O QUE SÃO COOKIES?</h4>
          <p>Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo que nos ajudam a saber, por exemplo, se você já fechou o aviso de cookies ou quais suas preferências visuais.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>COMO UTILIZAMOS</h4>
          <p>Usamos apenas cookies estritamente necessários para o funcionamento da plataforma (ex: lembrar que você aceitou os termos) e não realizamos rastreamento para fins de publicidade direcionada.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>SEUS DIREITOS</h4>
          <p>Você pode recusar o uso de cookies não essenciais através do banner exibido na página inicial ou configurando diretamente o seu navegador.</p>
        </>
      )
    }
  };

  return (
    <div id="top">
      <style>{`
        body, html { background-color: #030712 !important; font-family: Arial, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #d97706; }
        .glass-panel, .btn-primary, .btn-outline, .btn-market, 
        .form-control, .map-box, .modal-content, .nav-btn-highlight, .news-card { border-radius: 4px !important; }
        .form-control::placeholder { color: #94a3b8 !important; opacity: 0.7 !important; }
        .btn-primary:hover, .nav-btn-highlight:hover { filter: none !important; transform: none !important; box-shadow: none !important; background-color: #f59e0b !important; opacity: 1 !important; color: #000 !important; }
        .section-container { padding: 6rem 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 10; }
        .leaflet-popup-content-wrapper { background-color: #0f172a; color: #f8fafc; border: 1px solid #1e293b; border-radius: 6px; }
        .leaflet-popup-tip { background-color: #0f172a; }
        
        .desktop-nav { display: flex; align-items: center; gap: 1.5rem; }
        
        .nav-link {
          position: relative;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          font-family: "NormalFont", sans-serif;
          transition: color 0.3s ease;
          padding-bottom: 4px;
          cursor: pointer;
        }
        .nav-link:hover { color: #f8fafc; }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #f59e0b;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .nav-link.active { color: #f59e0b; }

        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(3, 7, 18, 0.98); backdrop-filter: blur(10px); z-index: 99; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; transform: translateY(-100%); transition: transform 0.3s ease; }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.25rem; text-decoration: none; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-family: "NormalFont", sans-serif; transition: color 0.3s ease; cursor: pointer; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #f59e0b; }
        
        .legal-tab { background: transparent; border: 1px solid #1e293b; color: #94a3b8; padding: 0.6rem 1.25rem; border-radius: 999px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-family: "NormalFont", sans-serif; transition: all 0.3s ease; font-size: 0.85rem; text-transform: uppercase; }
        .legal-tab:hover { background: rgba(255,255,255,0.05); color: #f8fafc; border-color: #334155; }
        .legal-tab.active { background: rgba(30, 41, 59, 0.8); color: #f8fafc; border-color: #334155; }
        .modal-body-scroll::-webkit-scrollbar { width: 5px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: #0b1121; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .section-container { padding: 4rem 1.5rem !important; }
          .map-box { height: 400px !important; }
          .footer-content { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .footer-content img { margin: 0 auto; }
          .footer-content div { align-items: center !important; justify-content: center !important; }
          .responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: scrolled || mobileMenuOpen ? 'rgba(11, 17, 33, 0.95)' : 'rgba(11, 17, 33, 0.2)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s ease', padding: scrolled || mobileMenuOpen ? '0.5rem 0' : '0.8rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => { scrollToTop(); closeMobileMenu(); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '65px', width: 'auto', display: 'block' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.1 }}>ESQUADRILHA DA FUMAÇA VIRTUAL</span>
              <span style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 400, fontSize: '0.8rem', color: '#f59e0b', letterSpacing: '0.15em', lineHeight: 1.1 }}>MICROSOFT FLIGHT SIMULATOR</span>
            </div>
          </div>
          
          <div className="desktop-nav">
            <span onClick={() => scrollToSection('pilotos')} className={`nav-link ${activeSection === 'pilotos' ? 'active' : ''}`}>Pilotos</span>
            <span onClick={() => scrollToSection('agenda')} className={`nav-link ${activeSection === 'agenda' ? 'active' : ''}`}>Agenda</span>
            <span onClick={() => scrollToSection('aeronave')} className={`nav-link ${activeSection === 'aeronave' ? 'active' : ''}`}>Aeronave</span>
            <span onClick={() => scrollToSection('noticias')} className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`}>Artigos</span>
            <span onClick={() => scrollToSection('sobre')} className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}>Sobre</span>
            {alistamentoAberto && (
              <span onClick={() => scrollToSection('alistamento')} className={`nav-btn-highlight ${activeSection === 'alistamento' ? 'active' : ''}`} style={{ cursor: 'pointer', backgroundColor: '#f59e0b', color: '#000', padding: '0.5rem 1.5rem', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', borderRadius: '3px', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase' }}>Alistamento</span>
            )}
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className={activeSection === 'pilotos' ? 'active' : ''} onClick={() => scrollToSection('pilotos')}>Pilotos</span>
        <span className={activeSection === 'agenda' ? 'active' : ''} onClick={() => scrollToSection('agenda')}>Agenda</span>
        <span className={activeSection === 'aeronave' ? 'active' : ''} onClick={() => scrollToSection('aeronave')}>Aeronave</span>
        <span className={activeSection === 'noticias' ? 'active' : ''} onClick={() => scrollToSection('noticias')}>Artigos</span>
        <span className={activeSection === 'sobre' ? 'active' : ''} onClick={() => scrollToSection('sobre')}>Sobre</span>
        {alistamentoAberto && (
          <span className={activeSection === 'alistamento' ? 'active' : ''} onClick={() => scrollToSection('alistamento')}>Alistamento</span>
        )}
      </div>

      <section className="hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11, 17, 33, 0.1) 0%, rgba(11, 17, 33, 0.6) 60%, #0b1121 100%)', zIndex: 1 }} />
      </section>

      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="pilotos" className="section-container">
          <SectionHeader title="Nossos Pilotos" />
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {dbPilotos.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', fontWeight: 300, fontFamily: 'Arial, sans-serif' }}>Carregando dados dos pilotos...</p>
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
                return (
                  <div key={index} className="card-piloto" style={{ 
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(3, 7, 18, 0.9) 100%)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end',
                    padding: '1.5rem',
                    minHeight: '210px'
                  }}>
                    
                    <img src={pilotoImage} alt="Piloto" style={{ 
                      position: 'absolute', 
                      left: '-10%', 
                      top: '-80%', 
                      width: '60%', 
                      height: '280%', 
                      objectFit: 'cover', 
                      objectPosition: 'left top',
                      WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)', 
                      maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)', 
                      zIndex: 0, 
                      opacity: 0.9 
                    }} />

                    {/* Informações do Piloto (Sem Box) */}
                    <div style={{ 
                      zIndex: 2,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      textAlign: 'right',
                      maxWidth: '60%',
                      marginTop: '10px'
                    }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 400, color: '#f8fafc', margin: '0', fontFamily: '"NormalFont", sans-serif', letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {piloto.nome}
                      </h3>
                      {piloto.cidade && (
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600, fontFamily: 'Arial, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                          {piloto.cidade}
                        </div>
                      )}
                    </div>
                    
                    {/* Número e Posição */}
                    <div style={{ 
                      zIndex: 2,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      justifyContent: 'flex-end',
                      marginTop: 'auto'
                    }}>
                      <div style={{ fontSize: '4.2rem', fontFamily: '"PosicaoFont", sans-serif', color: '#f59e0b', lineHeight: 0.8, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {piloto.posicao}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: '#f59e0b', marginTop: '0.5rem', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', textAlign: 'right' }}>
                        {role}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="agenda" className="section-container">
          <SectionHeader title="Agenda de Demonstrações" />
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <div>
              <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '2.5rem', fontFamily: 'Arial, sans-serif' }}>Nossas demonstrações seguem rigorosos critérios técnicos, com meteorologia e horário baseados em dados atualizados em tempo real.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {dbDemonstracoes.length > 0 ? (
                  dbDemonstracoes.map((dem, idx) => (
                    <div key={idx} className="agenda-card" style={{ 
                      padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease', cursor: 'default'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = dem.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.3)' : dem.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.25rem', color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', marginBottom: '0.35rem' }}>{dem.cidade}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>
                            <CalendarX2 size={14} color="#f59e0b" /> {dem.dataHora}
                          </div>
                        </div>
                        <span style={{ 
                          background: dem.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.1)' : dem.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: dem.status === 'Confirmado' ? '#10b981' : dem.status === 'Cancelado' ? '#ef4444' : '#f59e0b', 
                          padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase'
                        }}>{dem.status === 'Planejamento' ? 'M-PREC' : dem.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state glass-panel" style={{ padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(11, 17, 33, 0.4)', textAlign: 'center', borderRadius: '16px' }}>
                    <CalendarX2 size={36} color="#f59e0b" style={{ margin: '0 auto 1.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 300, letterSpacing: '0.05em', lineHeight: '1.8', color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>O calendário de demonstrações será atualizado em breve.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="map-box glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', height: '550px', overflow: 'hidden', borderRadius: '16px' }}>
              <MapContainer center={mapCenter} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1, background: 'transparent' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dbDemonstracoes.map((dem) => {
                  if (!dem.lat || !dem.lng) return null;
                  return (
                    <Marker key={dem.id} position={[dem.lat, dem.lng]} icon={getMarkerIcon(dem.status)}>
                      <Popup>
                        <div style={{ fontFamily: 'Arial, sans-serif' }}>
                          <strong style={{ fontSize: '1.1em', color: '#f59e0b', fontFamily: '"NormalFont", sans-serif' }}>{dem.cidade}</strong><br />
                          <span style={{ color: '#cbd5e1' }}>Status: {dem.status}</span><br />
                          <span style={{ color: '#94a3b8' }}>{dem.dataHora}</span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#0b1121', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${a29Image})`, backgroundSize: 'contain', backgroundPosition: 'center right', backgroundRepeat: 'no-repeat', opacity: 0.15, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0b1121 10%, transparent 50%, #0b1121 90%)', zIndex: 0 }} />
        <section id="aeronave" className="section-container" style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
          <SectionHeader title="A-29 Super Tucano" />
          <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '3.5rem', textAlign: 'justify', maxWidth: '900px', margin: '0 auto 3.5rem auto', fontFamily: 'Arial, sans-serif' }}>
            O Embraer EMB-314 Super Tucano, também designado como A-29, é uma aeronave turboélice de ataque leve e treinamento avançado. Reconhecido mundialmente por sua robustez, versatilidade e alta tecnologia, é o avião oficial utilizado pela Esquadrilha da Fumaça para realizar manobras de tirar o fôlego nos céus do Brasil e do mundo.
          </p>
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ fontFamily: '"NormalFont", sans-serif', color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Plane size={20} color="#f59e0b" /> Geral
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <A29Stat label="Fabricante" value="Embraer" />
                <A29Stat label="Tripulação" value="2 Pilotos" />
                <A29Stat label="Motorização" value="PT6A-68C" />
                <A29Stat label="Potência" value="1.600 shp" />
              </div>
            </div>

            <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ fontFamily: '"NormalFont", sans-serif', color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Plane size={20} color="#f59e0b" /> Dimensões
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <A29Stat label="Comprimento" value="11,38 m" />
                <A29Stat label="Envergadura" value="11,14 m" />
                <A29Stat label="Altura" value="3,97 m" />
                <A29Stat label="Peso Máx." value="5.200 kg" />
              </div>
            </div>

            <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ fontFamily: '"NormalFont", sans-serif', color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Plane size={20} color="#f59e0b" /> Desempenho
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <A29Stat label="Vel. Máxima" value="593 km/h" />
                <A29Stat label="Razão Subida" value="1.440 m/min" />
                <A29Stat label="Teto Serviço" value="10.670 m" />
                <A29Stat label="Alcance" value="1.445 km" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="noticias" className="section-container">
          <SectionHeader title="Artigos" />
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {dbNoticias.length > 0 ? (
              dbNoticias.map((noticia, idx) => (
                <div key={idx} className="news-card glass-panel" style={{ background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                  <div style={{ height: '180px', backgroundImage: `url(${noticia.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{noticia.data}</span>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontFamily: '"NormalFont", sans-serif', marginBottom: '1rem', lineHeight: 1.4 }}>{noticia.titulo}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300, flexGrow: 1, marginBottom: '1.5rem', fontFamily: 'Arial, sans-serif' }}>{noticia.resumo}</p>
                    <span onClick={() => document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif', cursor: 'pointer' }}>Ler Matéria Completa <ChevronRight size={14} color="#f59e0b" /></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(11, 17, 33, 0.4)' }}>
                <Newspaper size={36} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: '#94a3b8', fontWeight: 300, fontFamily: 'Arial, sans-serif' }}>Nenhum artigo publicado ainda.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="sobre" className="section-container" style={{ padding: '6rem 2rem' }}>
          <SectionHeader title="Sobre o Esquadrão" />
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ padding: '0 1rem', textAlign: 'justify' }}>
              <p style={{ fontWeight: 300, fontSize: '1.15rem', letterSpacing: '0.03em', lineHeight: '1.8', color: '#cbd5e1', margin: 0, fontFamily: 'Arial, sans-serif' }}>
                O <strong style={{ color: '#f59e0b', fontWeight: 500 }}>EDAV MSFS</strong> (Esquadrão de Demonstração Aérea Virtual) nasce da paixão pela aviação e pelo voo em formação. Utilizando o Microsoft Flight Simulator, buscamos representar com excelência, precisão e profissionalismo as manobras e a doutrina da Esquadrilha da Fumaça real. Nossa equipe é formada por entusiastas e pilotos virtuais dedicados ao treinamento contínuo, elevando a simulação a um novo patamar de imersão e realismo.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem 2.5rem', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)', borderLeft: '4px solid #f59e0b', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', maxWidth: '900px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: '"NormalFont", sans-serif', color: '#f59e0b', fontSize: '1.1rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Quote size={18} /> Palavra do Comandante</h3>
              <p style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6', color: '#94a3b8', margin: 0, fontFamily: 'Arial, sans-serif' }}>
                "A paixão pelo EDA começou ao assistir a minha primeira demonstração em 16 de outubro de 2022. A partir daquele dia, mergulhei fundo na história e na doutrina do esquadrão. Em 6 de julho de 2024, decidi reunir um grupo de entusiastas do T-27 que compartilhavam desse mesmo fascínio. Foi assim que nasceu a semente deste esquadrão virtual. Desde então, voamos diariamente, aperfeiçoando nossas formaturas e acrobacias. Hoje, conto com uma equipe de pilotos excelentes e nossa meta é voar cada vez mais alto, elevando o nível da demonstração aérea no Microsoft Flight Simulator."
              </p>
            </div>
          </div>
        </section>
      </div>

      {alistamentoAberto && (
        <div style={{ backgroundColor: '#030712' }}>
          <section id="alistamento" className="section-container" style={{ paddingBottom: '3rem' }}>
            <SectionHeader title="Alistamento" />
            <div className="glass-panel alistamento-box responsive-grid" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase' }}>Requisitos Oficiais</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}><div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div><span style={{ fontWeight: 300, lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>Possuir cópia original do Microsoft Flight Simulator.</span></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}><div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div><span style={{ fontWeight: 300, lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>Uso obrigatório de periféricos adequados (Joystick ou HOTAS).</span></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}><div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div><span style={{ fontWeight: 300, lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>Disponibilidade para treinamentos nas Terças e Quintas (20h - 22h).</span></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}><div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div><span style={{ fontWeight: 300, lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>Microfone de boa qualidade e conta ativa no Discord.</span></li>
                </ul>
              </div>
              <form onSubmit={submitAlistamento} style={{ width: '100%' }}>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>Nome Completo</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="Seu nome real" value={nome} onChange={e => setNome(e.target.value)} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>Nickname</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="Como gosta de ser chamado" value={nickname} onChange={e => setNickname(e.target.value)} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>Idade</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="Sua idade" value={idade} onChange={handleIdadeChange} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>WhatsApp</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="(00) 00000-0000" value={whatsapp} onChange={handlePhoneChange} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>ID no Discord</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="usuario#1234 ou @usuario" value={discord} onChange={e => setDiscord(e.target.value)} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}><label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>Experiência de Voo / Aeronave</label><input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontSize: '0.9rem' }} placeholder="Ex: 50h no Cessna 152, 10h no A-29" value={experiencia} onChange={e => setExperiencia(e.target.value)} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>Qual seu simulador?</label>
                    <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {['MSFS 2020', 'MSFS 2024'].map(sim => (
                        <div key={sim} onClick={() => setSimulador(sim)} style={{ cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: simulador === sim ? '2px solid #f59e0b' : '2px solid transparent', color: simulador === sim ? '#f8fafc' : '#94a3b8', fontWeight: simulador === sim ? 600 : 400, transition: 'all 0.3s ease', fontSize: '0.85rem', marginBottom: '-1px', fontFamily: 'Arial, sans-serif' }}>{sim}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary font-title" style={{ width: '100%', marginTop: '2.5rem', letterSpacing: '0.2em', padding: '1rem', background: '#f59e0b', color: '#000', fontWeight: 700, borderRadius: '3px', fontFamily: '"NormalFont", sans-serif', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'ENVIANDO...' : 'ENVIAR APLICAÇÃO'}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      <div style={{ backgroundColor: '#030712' }}>
        <section id="parceiros" className="section-container" style={{ padding: '3rem 2rem' }}>
          <div className="section-header" style={{ margin: 0 }}><h2 className="section-title" style={{ fontSize: '1.25rem', fontFamily: '"NormalFont", sans-serif', fontWeight: 700, opacity: 0.7 }}>Parceiros</h2></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'transparent', border: 'none', padding: 0 }}>
              <img src={parceiroImage} alt="RP Simulation Logo" style={{ opacity: 0.6, height: '35px', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Arial, sans-serif', color: '#f8fafc', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>RP Simulation</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer" style={{ padding: '4rem 2rem 1.5rem', backgroundColor: '#0b1121', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', paddingBottom: '3rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '70px', width: 'auto', alignSelf: 'flex-start' }} />
            <div>
              <span style={{ display: 'block', fontFamily: '"NormalFont", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>ESQUADRILHA DA FUMAÇA VIRTUAL</span>
              <span style={{ display: 'block', fontFamily: '"NormalFont", sans-serif', fontWeight: 400, fontSize: '0.75rem', color: '#f59e0b', letterSpacing: '0.15em', lineHeight: 1.4 }}>MICROSOFT FLIGHT SIMULATOR</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <span onClick={() => window.open('https://instagram.com', '_blank')} style={{ color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '4px', transition: 'all 0.3s ease', cursor: 'pointer' }}><svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></span>
              <span onClick={() => window.open('https://youtube.com', '_blank')} style={{ color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '4px', transition: 'all 0.3s ease', cursor: 'pointer' }}><YoutubeIcon size={18} /></span>
              <span onClick={() => window.open('https://discord.com', '_blank')} style={{ color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '4px', transition: 'all 0.3s ease', cursor: 'pointer' }}><DiscordIcon size={18} /></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Menu Rápido</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span onClick={() => document.getElementById('pilotos')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><ChevronRight size={12} /> Pilotos</span>
              <span onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><ChevronRight size={12} /> Agenda</span>
              <span onClick={() => document.getElementById('aeronave')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><ChevronRight size={12} /> Aeronave</span>
              <span onClick={() => document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><ChevronRight size={12} /> Artigos</span>
              <span onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><ChevronRight size={12} /> Sobre Nós</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Utilitários & Downloads</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dbMods.length > 0 ? dbMods.map((mod, idx) => (
                <span key={idx} onClick={() => window.open(mod.link, '_blank')} style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', cursor: 'pointer' }}>
                  {mod.isMarketplace ? <ShoppingCart size={14} /> : <Download size={14} />} 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.titulo}</span>
                </span>
              )) : <span style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>Em breve...</span>}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>
              <span onClick={() => openLegalModal('termos')} style={{ cursor: 'pointer', transition: 'color 0.3s' }}>Termos de Uso</span>
              <span>|</span>
              <span onClick={() => openLegalModal('privacidade')} style={{ cursor: 'pointer', transition: 'color 0.3s' }}>Política de Privacidade</span>
              <span>|</span>
              <span onClick={() => openLegalModal('cookies')} style={{ cursor: 'pointer', transition: 'color 0.3s' }}>Política de Cookies</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ color: '#64748b', fontSize: '0.65rem', lineHeight: 1.6, margin: 0, fontFamily: 'Arial, sans-serif', textAlign: 'justify' }}>
                  <strong>AVISO LEGAL:</strong> A Esquadrilha da Fumaça Virtual (EDAV MSFS) é uma organização civil e independente, voltada exclusivamente à simulação de voo e esporte eletrônico (e-sports) no software Microsoft Flight Simulator. <strong>Não possuímos nenhum tipo de vínculo institucional, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB)</strong> ou com o Esquadrão de Demonstração Aérea (EDA) oficial. Logotipos e insígnias inspirados são utilizados estritamente em ambiente de simulação e lazer, visando homenagear a aviação brasileira.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', whiteSpace: 'nowrap' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 300, margin: 0, fontFamily: '"NormalFont", sans-serif' }}>
                  &copy; {new Date().getFullYear()} EDAV MSFS
                </p>
                <span onClick={() => window.location.href = '/login'} style={{ cursor: 'pointer', color: '#94a3b8', opacity: 0.1, transition: 'opacity 0.3s ease' }}><Lock size={12} /></span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #1e293b', padding: '1rem 2rem', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '90%', maxWidth: '800px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '250px' }}>
            <ShieldCheck size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
              Nosso portal utiliza cookies essenciais para garantir o funcionamento correto e melhorar sua experiência de navegação, em conformidade com a LGPD. 
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleCookie(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontFamily: '"NormalFont", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
              RECUSAR
            </button>
            <button onClick={() => handleCookie(true)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 700, fontFamily: '"NormalFont", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
              ENTENDI E ACEITO
            </button>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, background: '#f59e0b', color: '#000', border: 'none', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showTopBtn ? 1 : 0, pointerEvents: showTopBtn ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
        <ChevronUp size={24} strokeWidth={2.5} />
      </button>

      <div className={`modal-overlay ${modalAlistamento ? 'active' : ''}`}>
        <div className="modal-content glass-panel" style={{ padding: '4rem 3rem', background: '#0b1121', border: '1px solid #f59e0b' }}>
          <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 className="font-title" style={{ color: '#f8fafc', fontSize: '1.75rem', margin: '1.5rem 0 1rem', fontWeight: 400, fontFamily: '"NormalFont", sans-serif' }}>Aplicação Enviada!</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.8', fontWeight: 300, fontSize: '0.95rem', fontFamily: 'Arial, sans-serif' }}>Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve.</p>
          <button type="button" className="btn-primary font-title" style={{ letterSpacing: '0.2em', padding: '1.25rem 2.5rem', width: '100%', borderRadius: '3px', fontFamily: '"NormalFont", sans-serif' }} onClick={() => setModalAlistamento(false)}>CONFIRMAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${legalModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: 0, background: '#0b1121', border: '1px solid #1e293b', width: '100%', maxWidth: '800px', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.35rem', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase' }}>{legalContent[activeLegalTab].title}</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>{legalContent[activeLegalTab].subtitle}</p>
            </div>
            <button onClick={() => setLegalModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body-scroll" style={{ padding: '2rem', maxHeight: '55vh', overflowY: 'auto', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'Arial, sans-serif', textAlign: 'justify' }}>
            {legalContent[activeLegalTab].body}
          </div>

          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #1e293b', background: '#030712', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setActiveLegalTab('cookies')} className={`legal-tab ${activeLegalTab === 'cookies' ? 'active' : ''}`}>
              <ShieldCheck size={16} /> LGPD / Cookies
            </button>
            <button onClick={() => setActiveLegalTab('privacidade')} className={`legal-tab ${activeLegalTab === 'privacidade' ? 'active' : ''}`}>
              <FileText size={16} /> Política de Privacidade
            </button>
            <button onClick={() => setActiveLegalTab('termos')} className={`legal-tab ${activeLegalTab === 'termos' ? 'active' : ''}`}>
              <FileText size={16} /> Termos de Uso
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}