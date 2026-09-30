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
  ShoppingCart, CheckCircle2, CalendarCheck2, Newspaper, 
  ChevronUp, Quote, Download, Menu, X, ShieldCheck, FileText, AlertTriangle, User, Phone, Gamepad2, LayoutGrid, Navigation, Ban,
  UserGroup
} from 'lucide-react';

import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

import headerImage from '../images/header.jpg';
import a29Image from '../images/a29.png'; 
import logoImage from '../images/logo.png';
import parceiroImage from '../images/parceiro.png';
import faviconImage from '../images/favicon.png';
import pilotoImage from '../images/piloto.png';
import a29icon from '../images/a-29.png';

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

interface Piloto { id?: string; posicao: string; nome: string; cidade?: string; uf?: string; oculto?: boolean; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; tipo: string; }
interface Mod { id?: string; titulo: string; desc: string; icon: React.ReactNode; isMarketplace: boolean; buttonText: string; buttonIcon: React.ReactNode; link: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }

const DiscordIcon = ({ size = 24, className = "", color = "currentColor" }: { size?: number, className?: string, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 127.14 96.36" fill={color} className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="section-header" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2 className="section-title" style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: '#f8fafc', fontSize: '2rem', textTransform: 'uppercase', textAlign: 'center' }}>{title}</h2>
    <div className="section-line" style={{ height: '30px', width: '2px', background: 'linear-gradient(to bottom, #f59e0b, transparent)', opacity: 0.6, marginTop: '1rem' }} />
  </div>
);

const AppleSpec = ({ value, unit, label }: { value: string, unit?: string, label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', color: '#f8fafc' }}>
      <span style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{value}</span>
      {unit && <span style={{ fontSize: '1.25rem', fontWeight: 500, color: '#94a3b8' }}>{unit}</span>}
    </div>
    <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', fontWeight: 600 }}>{label}</span>
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [pilotosViewMode, setPilotosViewMode] = useState<'cards' | 'formatura'>('cards');
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacidade' | 'termos' | 'cookies' | 'disclaimer'>('privacidade');

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

  const [offsetY, setOffsetY] = useState(0);

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
      }
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubPilotos(); unsubAgenda(); unsubMods(); unsubNoticias(); unsubConfig();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
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
    if (!nome.trim() || !nickname.trim() || !whatsapp.trim() || !discord.trim() || !experiencia.trim() || !plataforma || dataNascimento.length !== 10 || isBlocked) {
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
          Plataforma: plataforma
        })
      });

      setModalAlistamento(true);
      setNome(''); setNickname(''); setDiscord(''); setExperiencia(''); setWhatsapp(''); setPlataforma('');
      setDataNascimento('');
    } catch (error) {
      alert("Houve um erro ao enviar sua aplicação. Verifique sua conexão e tente novamente.");
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

  const legalContent = {
    privacidade: {
      title: "Política de privacidade",
      subtitle: "Como tratamos seus dados e protegemos sua navegação.",
      body: (
        <>
          <p>Esta Política descreve como coletamos, usamos e protegemos os dados no portal da Esquadrilha da Fumaça Virtual. Ao utilizar este portal, você concorda com estas práticas.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. BASE LEGAL</h4>
          <p>O tratamento de dados pessoais segue a Lei 13.709/2018 (LGPD), a Lei 12.965/2014 (Marco Civil da Internet) e demais normas aplicáveis.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. DADOS COLETADOS</h4>
          <p>Podemos coletar dados fornecidos voluntariamente por você (como nome, nickname, data de nascimento e contatos via formulário de alistamento) e dados técnicos de navegação (como endereço IP e cookies não identificáveis) para viabilizar os serviços, segurança e contato interno.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. FINALIDADES</h4>
          <p>Utilizamos os dados para avaliação de novos membros (alistamento), comunicação institucional, moderação e melhoria da experiência do portal.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. COMPARTILHAMENTO</h4>
          <p>Dados jamais serão vendidos ou compartilhados com terceiros. O acesso é restrito exclusivamente ao Comando para fins operacionais da simulação.</p>
        </>
      )
    },
    termos: {
      title: "Termos de uso",
      subtitle: "Regras de utilização do portal e serviços.",
      body: (
        <>
          <p>Bem-vindo à Esquadrilha da Fumaça Virtual. Este é um projeto de simulação sem fins lucrativos.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. ACEITAÇÃO</h4>
          <p>Ao acessar o portal ou enviar um formulário de alistamento, você concorda em cumprir estes termos e as diretrizes da comunidade.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. REGRAS DE CONDUTA</h4>
          <p>Exigimos respeito mútuo, profissionalismo virtual e dedicação. Não toleramos comportamentos tóxicos, ofensas ou uso de cheats/hacks nos simuladores.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. RESPONSABILIDADES E VÍNCULOS</h4>
          <p>Este esquadrão não possui qualquer vínculo, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB) ou qualquer entidade militar real. Somos um grupo de entusiastas utilizando softwares de entretenimento.</p>
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
    },
    disclaimer: {
      title: "Aviso Legal & Disclaimer",
      subtitle: "Direitos autorais e afiliações.",
      body: (
        <>
          <p>Somos uma organização virtual sem fins lucrativos criada por entusiastas da aviação militar virtual.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. IMAGENS E DIREITOS AUTORAIS</h4>
          <p>Algumas das imagens e recursos utilizados neste portal foram retirados da internet e podem pertencer a terceiros, sendo utilizados exclusivamente em caráter ilustrativo e não-comercial. Caso você seja o criador ou proprietário de algum recurso gráfico aqui exibido e deseje os devidos créditos ou a remoção do mesmo, por favor entre em contato conosco e atenderemos prontamente.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. AFILIAÇÃO INSTITUCIONAL</h4>
          <p><strong>Deixamos claro que não possuímos qualquer filiação, vínculo oficial ou associação com a FAB, nem com a Esquadrilha da Fumaça Virtual (EDAV Oficial - pioneiros no Brasil).</strong> Recomendamos e convidamos todos os entusiastas a conhecerem e visitarem o belíssimo projeto oficial em <a href="https://www.edav.com.br/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>www.edav.com.br</a>.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. RESPEITO À IDENTIDADE</h4>
          <p>Temos o mais profundo e sincero respeito pela imagem, pela história e pela identidade da Esquadrilha da Fumaça real e de nossos "irmãos mais velhos" da aviação virtual. O nosso objetivo primordial é apenas homenagear a aviação de alta performance, simulando manobras no Microsoft Flight Simulator em um ambiente de diversão sadia e respeitosa.</p>
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
      <div className="tatic-slot" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '310px', justifyContent: 'center', height: '160px' }}>
        
        <img 
          src={a29icon} 
          alt={`Posição ${posicao}`} 
          className="tatic-plane"
          style={{ 
            width: '150px', 
            height: '150px', 
            objectFit: 'contain', 
            filter: piloto ? 'drop-shadow(2px 4px 4px rgba(0,0,0,0.5))' : 'grayscale(100%) opacity(20%)',
            zIndex: 2,
            position: 'relative'
          }} 
        />
        
        <div style={{ 
          position: 'absolute',
          [isLeft ? 'right' : 'left']: 'calc(50% + 75px)',
          display: 'flex',
          flexDirection: isLeft ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          <span className="tatic-number" style={{ 
            fontSize: '3.2rem', 
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
            <span style={{ display: 'block', color: '#f59e0b', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{role}</span>
            <span style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Arial, sans-serif', marginTop: '2px', whiteSpace: 'nowrap' }}>{piloto ? piloto.nome : 'Vago'}</span>
          </div>
        </div>
        
      </div>
    );
  };

  return (
    <div id="top">
      <style>{`
        body, html { background-color: #030712 !important; font-family: Arial, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #d97706; }
        
        .glass-panel, .btn-outline, .btn-market, 
        .map-box, .modal-content, .nav-btn-highlight, .news-card, .agenda-card { 
          border-radius: 4px !important; 
        }
        
        .card-piloto { border-radius: 4px !important; border: none !important; } 
        
        .tatic-slot .tatic-plane {
          transition: all 0.3s ease;
        }

        .modern-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 2px solid rgba(255,255,255,0.1);
          padding: 1rem 1rem;
          color: #f8fafc;
          border-radius: 4px 4px 0 0;
          font-family: Arial, sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .modern-input:focus {
          border-color: #f59e0b;
          background: rgba(255, 255, 255, 0.08);
        }
        .modern-input::placeholder { color: #64748b !important; opacity: 0.7 !important; }

        .section-container { padding: 6rem 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 10; }
        .leaflet-popup-content-wrapper { background-color: #0f172a; color: #f8fafc; border: 1px solid #1e293b; border-radius: 4px; }
        .leaflet-popup-tip { background-color: #0f172a; }
        
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
          border-radius: 4px !important;
          overflow: hidden;
        }
        .leaflet-touch .leaflet-bar a, .leaflet-bar a {
          background-color: rgba(15, 23, 42, 0.9) !important;
          color: #f59e0b !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease !important;
        }
        .leaflet-touch .leaflet-bar a:hover, .leaflet-bar a:hover {
          background-color: #f59e0b !important;
          color: #000 !important;
        }

        .desktop-nav { display: flex; align-items: center; gap: 1.5rem; }
        
        .nav-link {
          color: #94a3b8;
          text-decoration: none;
          font-weight: 400; 
          font-size: 0.95rem; 
          text-transform: uppercase;
          font-family: "NormalFont", sans-serif !important;
          font-style: italic;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover { color: #f8fafc; }
        .nav-link.active { color: #f59e0b; }

        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(3, 7, 18, 0.98); backdrop-filter: blur(10px); z-index: 99; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; transform: translateY(-100%); transition: transform 0.3s ease; }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.25rem; text-decoration: none; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; font-family: "NormalFont", sans-serif !important; font-style: italic; transition: color 0.3s ease; cursor: pointer; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #f59e0b; }
        
        .legal-tab { background: transparent; border: 1px solid #1e293b; color: #94a3b8; padding: 0.6rem 1.25rem; border-radius: 999px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-family: "NormalFont", sans-serif !important; transition: all 0.3s ease; font-size: 0.85rem; text-transform: uppercase; }
        .legal-tab:hover { background: rgba(255,255,255,0.05); color: #f8fafc; border-color: #334155; }
        .legal-tab.active { background: rgba(30, 41, 59, 0.8); color: #f8fafc; border-color: #334155; }
        .modal-body-scroll::-webkit-scrollbar { width: 5px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: #0b1121; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }

        .platform-btn {
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 2px solid rgba(255,255,255,0.1);
          border-radius: 4px 4px 0 0;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: Arial, sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
        }
        .platform-btn.active {
          background: rgba(255, 255, 255, 0.08);
          border-color: #f59e0b;
          color: #f59e0b;
        }
        .platform-btn:hover:not(.active) {
          border-color: rgba(255,255,255,0.2);
          color: #f8fafc;
        }
        
        .view-toggle-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: Arial, sans-serif;
        }
        .view-toggle-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #f8fafc;
        }
        .view-toggle-btn.active {
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .alistamento-grid {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 800px;
          margin: 0 auto;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .section-container { padding: 4rem 1.25rem !important; }
          .map-box { height: 350px !important; }
          .footer-content { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .footer-content img { margin: 0 auto; }
          .footer-content div { align-items: center !important; justify-content: center !important; }
          .responsive-grid { grid-template-columns: 1fr !important; }
          .alistamento-grid { grid-template-columns: 1fr !important; gap: 2rem; }
          
          .card-piloto { min-height: 165px !important; }
          .piloto-nome { font-size: 1.15rem !important; }

          .formacao-wrapper {
             transform: scale(0.6);
             transform-origin: top center;
             margin-bottom: -150px;
          }
        }

        @media (max-width: 600px) {
           .formacao-wrapper {
             transform: scale(0.45);
             transform-origin: top center;
             margin-bottom: -200px;
           }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: scrolled || mobileMenuOpen ? 'rgba(11, 17, 33, 0.95)' : 'rgba(11, 17, 33, 0.2)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s ease', padding: scrolled || mobileMenuOpen ? '0.5rem 0' : '0.8rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => { scrollToTop(); closeMobileMenu(); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '65px', width: 'auto', display: 'block' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.1 }}>
                ESQUADRILHA DA FUMAÇA VIRTUAL
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: '"NormalFont", sans-serif', fontWeight: 600, fontSize: '0.8rem', background: '#38bdf8', color: '#030712', fontStyle: 'italic', padding: '2px 8px', letterSpacing: '0.1em', transform: 'skewX(-12deg)', display: 'inline-block' }}>
                  MICROSOFT FLIGHT SIMULATOR
                </span>
              </div>
            </div>
          </div>
          
          <div className="desktop-nav">
            <span onClick={() => scrollToSection('pilotos')} className={`nav-link ${activeSection === 'pilotos' ? 'active' : ''}`}>Pilotos</span>
            <span onClick={() => scrollToSection('agenda')} className={`nav-link ${activeSection === 'agenda' ? 'active' : ''}`}>Agenda</span>
            <span onClick={() => scrollToSection('aeronave')} className={`nav-link ${activeSection === 'aeronave' ? 'active' : ''}`}>Aeronave</span>
            
            {dbNoticias.length > 0 && (
              <span onClick={() => scrollToSection('noticias')} className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`}>Artigos</span>
            )}
            
            <span onClick={() => scrollToSection('sobre')} className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}>Sobre</span>
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
        {dbNoticias.length > 0 && (
          <span className={activeSection === 'noticias' ? 'active' : ''} onClick={() => scrollToSection('noticias')}>Artigos</span>
        )}
        <span className={activeSection === 'sobre' ? 'active' : ''} onClick={() => scrollToSection('sobre')}>Sobre</span>
      </div>

      <section className="hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customHeader || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9, transform: `translateY(${offsetY * 0.4}px)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11, 17, 33, 0.1) 0%, rgba(11, 17, 33, 0.6) 60%, #0b1121 100%)', zIndex: 1 }} />
        
        {alistamentoAberto && (
          <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <button onClick={() => scrollToSection('alistamento')} style={{
              background: '#11df71', color: '#000', border: 'none', cursor: 'pointer',
              fontFamily: '"NormalFont", sans-serif', fontWeight: 700, fontSize: '1.2rem',
              fontStyle: 'italic', padding: '10px 28px', letterSpacing: '0.15em',
              transform: 'skewX(-12deg)', transition: 'all 0.3s ease', textTransform: 'uppercase',
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'skewX(-12deg) scale(1.05)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'skewX(-12deg) scale(1)'}>
              QUERO FAZER PARTE!
            </button>
          </div>
        )}
      </section>

      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="pilotos" className="section-container">
          <SectionHeader title="Nossos Pilotos" />
          <p style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '700px', margin: '-2rem auto 2.5rem', lineHeight: '1.6', fontSize: '0.95rem', fontFamily: 'Arial, sans-serif' }}>
            Conheça a equipe de pilotos virtuais que compõe a Esquadrilha da Fumaça Virtual. Treinamento constante, dedicação e busca ininterrupta pela perfeição nas formaturas e manobras táticas.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
            <button onClick={() => setPilotosViewMode('cards')} className={`view-toggle-btn ${pilotosViewMode === 'cards' ? 'active' : ''}`} title="">
              <LayoutGrid size={18} /> Cartões
            </button>
            <button onClick={() => setPilotosViewMode('formatura')} className={`view-toggle-btn ${pilotosViewMode === 'formatura' ? 'active' : ''}`} title="">
              <UserGroup size={18} /> Formação em Voo
            </button>
          </div>

          {pilotosViewMode === 'cards' ? (
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
                  
                  if (piloto.oculto) return null; 
                  
                  return (
                    <div key={index} className="card-piloto" style={{ 
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(3, 7, 18, 0.9) 100%)', 
                      position: 'relative', 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      padding: '1.25rem 1.25rem 1rem 1.25rem',
                      minHeight: '165px'
                    }}>
                      
                      <img src={pilotoImage} alt="Piloto" style={{ 
                        position: 'absolute', 
                        left: '-10%', 
                        top: '0', 
                        width: '60%', 
                        height: '120%', 
                        objectFit: 'cover', 
                        objectPosition: 'left top',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)', 
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)', 
                        zIndex: 0, 
                        opacity: 0.9,
                        pointerEvents: 'none'
                      }} />

                      <div style={{ 
                        zIndex: 2,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end', 
                        textAlign: 'right',
                        maxWidth: '65%'
                      }}>
                        <h3 className="piloto-nome" style={{ fontFamily: '"NormalFont", sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0', letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {piloto.nome}
                        </h3>
                        {(piloto.cidade || piloto.uf) && (
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontFamily: 'Arial, sans-serif' }}>
                            {piloto.cidade}{piloto.cidade && piloto.uf ? ' - ' : ''}{piloto.uf}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        zIndex: 2,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end', 
                        justifyContent: 'flex-end',
                        marginTop: 'auto'
                      }}>
                        <div style={{ fontSize: '4.5rem', fontFamily: '"PosicaoFont", sans-serif', color: '#f59e0b', lineHeight: 0.8, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                          {piloto.posicao}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', color: '#f59e0b', marginTop: '0.75rem', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                          {role}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="formacao-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0rem', marginTop: '3rem', minHeight: '400px', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderFormationSlot('1')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14rem', marginTop: '-10px' }}>
                {renderFormationSlot('3')}
                {renderFormationSlot('2')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6.5rem', marginTop: '-10px' }}>
                {renderFormationSlot('5')}
                {renderFormationSlot('4')}
                {renderFormationSlot('6')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                {renderFormationSlot('7')}
              </div>
            </div>
          )}
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="agenda" className="section-container">
          <SectionHeader title="Agenda de Demonstrações" />
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <div>
              <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '2.5rem', fontFamily: 'Arial, sans-serif' }}>Nossas demonstrações seguem rigorosos critérios técnicos, com meteorologia e horário baseados em dados atualizados em tempo real.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dbDemonstracoes.length > 0 ? (
                  dbDemonstracoes.map((dem, idx) => (
                    <div key={idx} className="agenda-card" style={{ 
                      padding: '1rem 1.25rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', 
                      display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'all 0.3s ease', cursor: 'default'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>{dem.cidade}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>
                            <CalendarCheck2 size={12} color="#f59e0b" /> {dem.dataHora}
                          </div>
                        </div>
                        <span style={{ 
                          background: dem.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.1)' : dem.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: dem.status === 'Confirmado' ? '#10b981' : dem.status === 'Cancelado' ? '#ef4444' : '#f59e0b', 
                          padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase'
                        }}>{dem.status === 'Planejamento' ? 'PREVISÃO' : dem.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state glass-panel" style={{ padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(11, 17, 33, 0.4)', textAlign: 'center' }}>
                    <CalendarCheck2 size={36} color="#f59e0b" style={{ margin: '0 auto 1.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 300, letterSpacing: '0.05em', lineHeight: '1.8', color: '#94a3b8', fontFamily: 'Arial, sans-serif' }}>O calendário de demonstrações será atualizado em breve.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="map-box glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', height: '600px', overflow: 'hidden' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={4} 
                minZoom={3}
                maxBounds={southAmericaBounds}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 1, background: 'transparent' }}
              >
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
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: `url(${a29Image})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center right', 
          backgroundRepeat: 'no-repeat', 
          opacity: 0.6, 
          zIndex: 0,
          transform: `translateY(${(offsetY - 2000) * 0.15}px)`
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.7) 40%, transparent 100%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #030712 0%, transparent 20%, transparent 80%, #030712 100%)', zIndex: 0 }} />
        
        <section id="aeronave" className="section-container" style={{ padding: '8rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <SectionHeader title="A-29 Super Tucano" />

          <p style={{ fontWeight: 300, fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto', fontFamily: 'Arial, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            O Embraer EMB-314 Super Tucano é uma aeronave turboélice de ataque leve e treinamento avançado. Reconhecido mundialmente por sua robustez e alta tecnologia, é o avião oficial da Fumaça.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto', alignItems: 'center', width: '100%' }}>
            <AppleSpec label="Fabricante" value="Embraer" />
            <AppleSpec label="Tripulação" value="2" unit="Pilotos" />
            <AppleSpec label="Vel. Máxima" value="593" unit="km/h" />
            <AppleSpec label="Teto Serviço" value="10.6" unit="km" />
            <AppleSpec label="Potência" value="1.600" unit="shp" />
            <AppleSpec label="Alcance" value="1.445" unit="km" />
          </div>
        </section>
      </div>

      {dbNoticias.length > 0 && (
        <div style={{ backgroundColor: '#030712' }}>
          <section id="noticias" className="section-container">
            <SectionHeader title="Artigos" />
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {dbNoticias.map((noticia, idx) => (
                <div key={idx} className="news-card glass-panel" style={{ background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                  {noticia.imagem && (
                    <div style={{ height: '180px', backgroundImage: `url(${noticia.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                  )}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{noticia.data}</span>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontFamily: '"NormalFont", sans-serif', marginBottom: '1rem', lineHeight: 1.4 }}>{noticia.titulo}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300, flexGrow: 1, margin: 0, fontFamily: 'Arial, sans-serif' }}>{noticia.resumo}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div style={{ position: 'relative', backgroundColor: '#0b1121', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0b1121 0%, transparent 20%, transparent 80%, #0b1121 100%)', zIndex: 0 }} />
        
        <section id="sobre" className="section-container" style={{ position: 'relative', zIndex: 1, padding: '8rem 2rem' }}>
          <SectionHeader title="SOBRE O EDA FS" />
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 300, fontSize: '1.15rem', letterSpacing: '0.03em', lineHeight: '1.8', color: '#cbd5e1', margin: 0, fontFamily: 'Arial, sans-serif' }}>
                A <strong style={{ color: '#f59e0b', fontWeight: 600 }}>Esquadrilha da Fumaça Virtual</strong> nasce da paixão pela aviação e pelo voo em formação. Utilizando o Microsoft Flight Simulator, buscamos representar com excelência, precisão e profissionalismo as manobras e a doutrina da Esquadrilha da Fumaça real. Nossa equipe é formada por entusiastas e pilotos virtuais dedicados ao treinamento contínuo, elevando a simulação a um novo patamar de imersão e realismo.
              </p>
            </div>
            <div style={{ padding: '1.5rem 2.5rem', borderLeft: '4px solid #f59e0b', maxWidth: '900px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: '"NormalFont", sans-serif', color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Quote size={18} color="#f59e0b" /> Palavra do Comandante</h3>
              <p style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '1rem', lineHeight: '1.7', color: '#94a3b8', margin: 0, fontFamily: 'Arial, sans-serif' }}>
                "A paixão pelo EDA começou ao assistir a minha primeira demonstração em 16 de outubro de 2022. A partir daquele dia, mergulhei fundo na história e na doutrina do esquadrão. Em 6 de julho de 2024, decidi reunir um grupo de entusiastas do T-27 que compartilhavam desse mesmo fascínio. Foi assim que nasceu a semente deste esquadrão virtual. Desde então, voamos diariamente, aperfeiçoando nossas formaturas e acrobacias. Hoje, conto com uma equipe de pilotos excelentes e nossa meta é voar cada vez mais alto, elevando o nível da demonstração aérea no Microsoft Flight Simulator."
              </p>
            </div>
          </div>
        </section>
      </div>

      {alistamentoAberto && (
        <div style={{ backgroundColor: '#030712' }}>
          <section id="alistamento" className="section-container" style={{ paddingBottom: '3rem' }}>
            <SectionHeader title="FORMULÁRIO PARA INSCRIÇÃO" />
            
            <div className="glass-panel alistamento-grid" style={{ padding: '3rem', background: 'rgba(11, 17, 33, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              
              {isBlocked ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px' }}>
                  <Ban size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
                  <h3 style={{ color: '#f8fafc', fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>Acesso Restrito</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                    De acordo com as diretrizes da AFA FS, não é permitido o alistamento de menores de 17 anos. O seu acesso a este formulário foi bloqueado permanentemente.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 2rem', fontFamily: 'Arial, sans-serif' }}>
                      O ingresso não é direto. Nossos pilotos são formados na <strong>FAB FS</strong> e treinados na <strong>AFA FS</strong>. Apenas os que demonstram excelência e disciplina são selecionados.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}><CheckCircle2 size={16} color="#f59e0b" /> +17 Anos</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}><CheckCircle2 size={16} color="#f59e0b" /> MSFS 2020 Original</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}><CheckCircle2 size={16} color="#f59e0b" /> Uso de HOTAS/Yoke</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}><CheckCircle2 size={16} color="#f59e0b" /> Microfone & Discord</span>
                    </div>
                  </div>

                  <form onSubmit={submitAlistamento} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>Nome Completo</label>
                        <input required type="text" className="modern-input" placeholder="Seu nome real" value={nome} onChange={e => setNome(e.target.value)} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>Nickname no Discord</label>
                        <input required type="text" className="modern-input" placeholder="Ex: Maverick" value={nickname} onChange={e => setNickname(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>Data de Nascimento (+17)</label>
                        <input required type="text" maxLength={10} className="modern-input" placeholder="DD/MM/AAAA" value={dataNascimento} onChange={handleDateChange} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>WhatsApp</label>
                        <input required type="text" className="modern-input" placeholder="(00) 00000-0000" value={whatsapp} onChange={handlePhoneChange} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Arial, sans-serif' }}>
                          ID no Discord
                        </label>
                        <input required type="text" className="modern-input" placeholder="usuario#1234 ou @usuario" value={discord} onChange={e => setDiscord(e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>Experiência de Voo</label>
                        <input required type="text" className="modern-input" placeholder="Ex: 50h Cessna 152, 10h A-29" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>Sua Plataforma (MSFS 2020)</label>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                        {['PC', 'Console'].map(plat => (
                          <button key={plat} type="button" onClick={() => setPlataforma(plat)} className={`platform-btn ${plataforma === plat ? 'active' : ''}`}>
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || !isFormReady} 
                      style={{ 
                        width: '100%', 
                        maxWidth: '400px', 
                        margin: '1rem auto 0', 
                        letterSpacing: '0.11em', 
                        padding: '0.8rem', 
                        fontWeight: 700, 
                        borderRadius: '4px', 
                        cursor: (isSubmitting || !isFormReady) ? 'not-allowed' : 'pointer', 
                        background: isFormReady ? '#f59e0b' : '#334155',
                        color: isFormReady ? '#000' : '#64748b',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        fontSize: '0.95rem', 
                        fontFamily: '"NormalFont", sans-serif' 
                      }}
                    >
                      {isSubmitting ? 'PROCESSANDO...' : 'ENVIAR APLICAÇÃO'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      <div style={{ backgroundColor: '#030712' }}>
        <section id="parceiros" className="section-container" style={{ padding: '3rem 2rem' }}>
          <div className="section-header" style={{ margin: 0 }}><h2 className="section-title" style={{ fontSize: '1.25rem', fontFamily: '"NormalFont", sans-serif', fontWeight: 700, opacity: 0.7 }}>Parceiros</h2></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'transparent', border: 'none', padding: 0 }}>
              <img src={parceiroImage} alt="RP Simulation Logo" style={{ opacity: 0.8, height: '65px', objectFit: 'contain' }} />
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
              <span style={{ display: 'inline-block', fontFamily: '"NormalFont", sans-serif', fontWeight: 600, fontSize: '0.65rem', background: '#38bdf8', color: '#030712', fontStyle: 'italic', padding: '2px 8px', alignSelf: 'flex-start', letterSpacing: '0.15em', lineHeight: 1.1, transform: 'skewX(-12deg)', marginLeft: '4px', marginTop: '4px' }}>
                MICROSOFT FLIGHT SIMULATOR
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <span onClick={() => window.open('https://www.instagram.com/eda.msfs/', '_blank')} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '4px', transition: 'all 0.3s ease', display: 'inline-flex' }} onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}><svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Menu Rápido</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span onClick={() => document.getElementById('pilotos')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><ChevronRight size={12} /> Pilotos</span>
              <span onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><ChevronRight size={12} /> Agenda</span>
              <span onClick={() => document.getElementById('aeronave')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><ChevronRight size={12} /> Aeronave</span>
              {dbNoticias.length > 0 && (
                <span onClick={() => document.getElementById('noticias')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><ChevronRight size={12} /> Artigos</span>
              )}
              <span onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s ease', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><ChevronRight size={12} /> Sobre Nós</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#f8fafc', fontFamily: '"NormalFont", sans-serif', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Utilitários & Downloads</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px' }}>
              {dbMods.length > 0 ? dbMods.map((mod, idx) => (
                <span key={idx} onClick={() => window.open(mod.link, '_blank')} style={{ width: '100%', color: '#10b981', background: 'transparent', padding: '0.4rem 0', border: 'none', textDecoration: 'none', fontSize: '0.9rem', fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.color = '#059669'; }} onMouseLeave={e => { e.currentTarget.style.color = '#10b981'; }}>
                  {mod.isMarketplace ? <ShoppingCart size={16} /> : <Download size={16} />} 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.titulo}</span>
                </span>
              )) : <span style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>Em breve...</span>}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>
              <span onClick={() => openLegalModal('termos')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                <FileText size={14} /> Termos de Uso
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('privacidade')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                <ShieldCheck size={14} /> Política de Privacidade
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('cookies')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg> Política de Cookies
              </span>
              <span>|</span>
              <span onClick={() => openLegalModal('disclaimer')} style={{ cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                <AlertTriangle size={14} /> Aviso Legal & Disclaimer
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ color: '#64748b', fontSize: '0.65rem', lineHeight: 1.6, margin: 0, fontFamily: 'Arial, sans-serif', textAlign: 'justify' }}>
                  <strong>AVISO LEGAL:</strong> A Esquadrilha da Fumaça Virtual é uma organização civil e independente, voltada exclusivamente à simulação de voo e esporte eletrônico (e-sports) no software Microsoft Flight Simulator. <strong>Não possuímos nenhum tipo de vínculo institucional, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB)</strong> ou com o Esquadrão de Demonstração Aérea (EDA) oficial. Logotipos e insígnias inspirados são utilizados estritamente em ambiente de simulação e lazer, visando homenagear a aviação brasileira.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #1e293b', padding: '1rem 2rem', borderRadius: '4px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '90%', maxWidth: '800px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '250px' }}>
            <ShieldCheck size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
              Nosso portal utiliza cookies essenciais para garantir o funcionamento correto e melhorar sua experiência de navegação, em conformidade com a LGPD. 
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleCookie(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontFamily: '"NormalFont", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#64748b'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}>
              RECUSAR
            </button>
            <button onClick={() => handleCookie(true)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontFamily: '"NormalFont", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => e.currentTarget.style.background = '#d97706'} onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}>
              ENTENDI E ACEITO
            </button>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, background: 'transparent', color: '#f59e0b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showTopBtn ? 1 : 0, pointerEvents: showTopBtn ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
        <ChevronUp size={28} strokeWidth={3} />
      </button>

      <div className={`modal-overlay ${modalAlistamento ? 'active' : ''}`}>
        <div className="modal-content glass-panel" style={{ padding: '4rem 3rem', background: '#0b1121', border: '1px solid #10b981', borderRadius: '4px', maxWidth: '500px', textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 className="font-title" style={{ color: '#f8fafc', fontSize: '1.75rem', margin: '1.5rem 0 1rem', fontWeight: 400, fontFamily: '"NormalFont", sans-serif' }}>Aplicação Enviada!</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.8', fontWeight: 300, fontSize: '0.95rem', fontFamily: 'Arial, sans-serif' }}>Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve.</p>
          <button type="button" className="btn-primary font-title" style={{ letterSpacing: '0.2em', padding: '1.25rem 2.5rem', width: '100%', borderRadius: '4px', fontFamily: '"NormalFont", sans-serif' }} onClick={() => setModalAlistamento(false)}>CONFIRMAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${modalIdadeOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '4rem 3rem', background: '#0b1121', border: '1px solid #ef4444', borderRadius: '4px', maxWidth: '500px', textAlign: 'center' }}>
          <AlertTriangle size={56} color="#ef4444" style={{ margin: '0 auto 1.5rem', opacity: 0.9 }} />
          <h3 className="font-title" style={{ color: '#f8fafc', fontSize: '1.5rem', margin: '1.5rem 0 1rem', fontWeight: 700, fontFamily: '"NormalFont", sans-serif', textTransform: 'uppercase' }}>Idade Mínima Não Atingida</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.8', fontWeight: 300, fontSize: '0.95rem', fontFamily: 'Arial, sans-serif' }}>
            A doutrina da AFA FS exige a idade mínima de <strong>17 anos completos</strong> para ingresso no esquadrão. Agradecemos o seu interesse e esperamos contar consigo no futuro!
          </p>
          <button type="button" className="btn-outline" style={{ border: '1px solid #334155', background: 'transparent', color: '#cbd5e1', letterSpacing: '0.1em', padding: '1rem 2.5rem', width: '100%', borderRadius: '4px', fontFamily: '"NormalFont", sans-serif', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#334155'; }} onClick={() => setModalIdadeOpen(false)}>FECHAR</button>
        </div>
      </div>

      <div className={`modal-overlay ${legalModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: 0, background: '#0b1121', border: '1px solid #1e293b', width: '100%', maxWidth: '800px', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.35rem', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textTransform: 'uppercase' }}>{legalContent[activeLegalTab].title}</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' }}>{legalContent[activeLegalTab].subtitle}</p>
            </div>
            <button onClick={() => setLegalModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body-scroll" style={{ padding: '2rem', maxHeight: '55vh', overflowY: 'auto', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: 'Arial, sans-serif', textAlign: 'justify' }}>
            {legalContent[activeLegalTab].body}
          </div>

          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #1e293b', background: '#030712', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setActiveLegalTab('cookies')} className={`legal-tab ${activeLegalTab === 'cookies' ? 'active' : ''}`} style={{ fontFamily: 'Arial, sans-serif' }}>
              <ShieldCheck size={16} /> LGPD / Cookies
            </button>
            <button onClick={() => setActiveLegalTab('privacidade')} className={`legal-tab ${activeLegalTab === 'privacidade' ? 'active' : ''}`} style={{ fontFamily: 'Arial, sans-serif' }}>
              <FileText size={16} /> Política de Privacidade
            </button>
            <button onClick={() => setActiveLegalTab('termos')} className={`legal-tab ${activeLegalTab === 'termos' ? 'active' : ''}`} style={{ fontFamily: 'Arial, sans-serif' }}>
              <FileText size={16} /> Termos de Uso
            </button>
            <button onClick={() => setActiveLegalTab('disclaimer')} className={`legal-tab ${activeLegalTab === 'disclaimer' ? 'active' : ''}`} style={{ fontFamily: 'Arial, sans-serif' }}>
              <AlertTriangle size={16} /> Disclaimer
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}