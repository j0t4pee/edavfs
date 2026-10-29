/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plane, ChevronRight, ChevronLeft, Map as MapIcon, 
  ShoppingCart, CheckCircle2, Calendar, Newspaper, 
  ChevronUp, Quote, Download, Menu, X, ShieldCheck, Shield, FileText, AlertTriangle, LayoutGrid, Send, Cookie, ChevronDown,
  GraduationCap, Crosshair, Award, Globe, Mail, PlaneTakeoff, Radio
} from 'lucide-react';

import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

import Header from './Header';
import Footer from './Footer';

import headerImage from '../images/tucano.jpg';
import a29Image from '../images/tucano3.jpg'; 
import logoImage from '../images/logo.png';
import parceiroImage from '../images/parceiro.png';
import faviconImage from '../images/favicon.png';
import pilotoImage from '../images/piloto.png';
import a29icon from '../images/a-29.png';
import ytLogo from '../images/yt.svg';
import twLogo from '../images/tw.png';
import tkLogo from '../images/tk.png';
import formacaoImage from '../images/formacao.png';
import mfLogo from '../images/mf.png';
import mfLogo24 from '../images/mf24.png';

// Imagens do slider
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

const southAmericaBounds = L.latLngBounds(
  L.latLng(-60.0, -90.0), 
  L.latLng(15.0, -30.0)   
);

const getMarkerIcon = (status: string) => {
  const color = status === 'Confirmado' ? '#10b981' : status === 'Cancelado' ? '#ef4444' : '#0ea5e9';
  return new L.DivIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position:relative; width: 24px; height: 24px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; border: 1px solid ${color}; opacity: 0.4; animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        <div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #ffffff;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface Piloto { id?: string; posicao: string; nome: string; cidade?: string; uf?: string; oculto?: boolean; plataforma?: string; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; tipo: string; plataforma?: string; }
interface Mod { id?: string; titulo: string; desc: string; isMarketplace: boolean; link: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }
interface Estatistica { id?: string; icone: string; valor: string; rotulo: string; ordem: number; }

const ElegantDivider = () => (
  <div className="reveal-on-scroll" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem auto', opacity: 0.6 }}>
    <div style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, #0ea5e9)' }} />
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9', margin: '0 15px', boxShadow: '0 0 10px #0ea5e9' }} />
    <div style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg, #0ea5e9, transparent)' }} />
  </div>
);

const SectionHeaderApple = ({ overline, title, subtitle }: { overline?: string, title: string, subtitle?: string }) => (
  <div className="noselect reveal-on-scroll" style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'left' }}>
    {overline && <span style={{ fontFamily: '"Comum", sans-serif', fontWeight: 600, color: '#0ea5e9', fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{overline}</span>}
    <h2 style={{ fontFamily: '"Comum", Arial, sans-serif', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#f8fafc', fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', margin: '0 0 1rem 0', lineHeight: 1.1 }}>{title}</h2>
    {subtitle && <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, fontWeight: 400, fontFamily: '"Regular", Arial, sans-serif', lineHeight: 1.6 }}>{subtitle}</p>}
  </div>
);

const AppleSpecText = ({ value, unit, label }: { value: string, unit?: string, label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', color: '#f8fafc' }}>
      <span style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif' }}>{value}</span>
      {unit && <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#eab308', fontFamily: '"Comum", sans-serif' }}>{unit}</span>}
    </div>
    <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem', fontWeight: 700, fontFamily: '"Comum", sans-serif' }}>{label}</span>
  </div>
);

const StatBox = ({ iconClass, value, label }: { iconClass: string, value: string, label: string }) => (
  <div className="noselect" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'transparent', zIndex: 2, position: 'relative' }}>
    <div style={{ color: '#0ea5e9', opacity: 0.9 }}><i className={iconClass || 'fa-solid fa-star'} style={{ fontSize: '1.8rem' }}></i></div>
    <span style={{ fontSize: '3.5rem', fontFamily: '"Regular", Arial, sans-serif', fontWeight: 300, color: '#f8fafc', letterSpacing: '-0.04em', lineHeight: 1, padding: '0 10px' }}>{value}</span>
    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center' }}>{label}</span>
  </div>
);

export default function Home() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const [pilotoTab, setPilotoTab] = useState<'2020' | '2024'>('2020');
  const [agendaTab, setAgendaTab] = useState<'2020' | '2024'>('2020');
  
  const [livePlatform, setLivePlatform] = useState<'youtube' | 'twitch' | 'tiktok'>('youtube');
  const [liveYT, setLiveYT] = useState('');
  const [liveTwitch, setLiveTwitch] = useState('');
  const [liveTikTok, setLiveTikTok] = useState('');
  const hasLive = Boolean(liveYT || liveTwitch || liveTikTok);  
  
  const [agendaPage, setAgendaPage] = useState(1);
  const AGENDA_ITEMS_PER_PAGE = 5;
  
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
  const [dbDemonstracoes, setDbDemonstracoes] = useState<Demonstracao[]>([]);
  const [dbMods, setDbMods] = useState<Mod[]>([]);
  const [dbNoticias, setDbNoticias] = useState<Noticia[]>([]);
  const [dbEstatisticas, setDbEstatisticas] = useState<Estatistica[]>([]);
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [solicitacaoAberta, setSolicitacaoAberta] = useState(true);
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  
  const [plataforma, setPlataforma] = useState('');
  const [simuladorPossui, setSimuladorPossui] = useState('');
  
  const [modalAlistamento, setModalAlistamento] = useState(false);
  const [modalIdadeOpen, setModalIdadeOpen] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isBlocked, setIsBlocked] = useState(false); 

  const navigate = useNavigate();

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

  const [offsetY, setOffsetY] = useState(0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null);
    if ('targetTouches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
      setIsDragging(true);
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else if (isDragging) {
      setTouchEnd((e as React.MouseEvent).clientX);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentSlide(s => s === sliderImages.length - 1 ? 0 : s + 1);
    }
    if (isRightSwipe) {
      setCurrentSlide(s => s === 0 ? sliderImages.length - 1 : s - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

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
    const allImages = [tucano2png, tucano3png, tucano4png, tucano5png, tucano8png, tucano9png, tucano10png, tucano11png, tucano12png, tucano13png];
    setSliderImages([...allImages].sort(() => Math.random() - 0.5));
    
    if (isAppLoading) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setIsAppLoading(false);
        document.body.style.overflow = 'auto';
      }, 1800); 
      return () => clearTimeout(timer);
    }
  }, [isAppLoading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 6500); 
    return () => clearInterval(timer);
  }, [sliderImages.length]);

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
          id: doc.id, titulo: d.titulo, desc: d.desc, isMarketplace: d.isMarketplace, link: d.link
        } as unknown as Mod);
      });
      setDbMods(arr);
    });

    const unsubNoticias = onSnapshot(collection(db, 'noticias'), (snapshot) => {
      const arr: Noticia[] = [];
      snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() } as unknown as Noticia));
      setDbNoticias(arr);
    });
    
    const unsubStats = onSnapshot(collection(db, 'estatisticas'), (snapshot) => {
      const arr: Estatistica[] = [];
      snapshot.forEach((doc) => arr.push({ id: doc.id, ...doc.data() } as unknown as Estatistica));
      arr.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      setDbEstatisticas(arr.slice(0, 5));
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setAlistamentoAberto(d.alistamentoAberto || false);
        setSolicitacaoAberta(d.solicitacaoAberta !== undefined ? d.solicitacaoAberta : true);
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
      unsubPilotos(); unsubAgenda(); unsubMods(); unsubNoticias(); unsubStats(); unsubConfig();
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
  }, [dbPilotos, dbDemonstracoes, dbNoticias]);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);

    const sections = ['pilotos', 'agenda', 'aeronave', 'noticias', 'midias', 'sobre', 'alistamento'];
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
          _subject: "Novo Alistamento Recebido - EDAV MSFS",
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
    
    const lastRequest = localStorage.getItem('lastDemoRequest_edav');
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

      localStorage.setItem('lastDemoRequest_edav', Date.now().toString());
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

  const filteredPilotos = dbPilotos.filter(p => (p.plataforma || '2020') === pilotoTab || p.plataforma === 'Ambos');
  const filteredAgenda = dbDemonstracoes.filter(a => (a.plataforma || '2020') === agendaTab || a.plataforma === 'Ambos');
  
  const totalAgendaPages = Math.ceil(filteredAgenda.length / AGENDA_ITEMS_PER_PAGE) || 1;
  const startIndex = (agendaPage - 1) * AGENDA_ITEMS_PER_PAGE;
  const currentAgendaItems = filteredAgenda.slice(startIndex, startIndex + AGENDA_ITEMS_PER_PAGE);

  const groupedAgenda = currentAgendaItems.reduce((acc: Record<string, Demonstracao[]>, dem) => {
    const parts = dem.dataHora.split('/');
    let monthName = "EVENTOS";
    if (parts.length >= 2) {
      const mIndex = parseInt(parts[1], 10) - 1;
      if (!isNaN(mIndex) && mIndex >= 0 && mIndex < 12) {
        const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
        monthName = meses[mIndex];
      }
    }
    if (!acc[monthName]) acc[monthName] = [];
    acc[monthName].push(dem);
    return acc;
  }, {});

  const legalContent = {
    privacidade: {
      title: "Política de Privacidade",
      subtitle: "Como protegemos e tratamos os seus dados.",
      body: (
        <>
          <p>Este documento estabelece as diretrizes de proteção de dados e privacidade da Esquadrilha da Fumaça Virtual (EDAV), garantindo o cumprimento das leis vigentes e o respeito à sua navegação.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Coleta de Dados</h4>
          <p>Ao realizar o alistamento, solicitamos informações essenciais (nome, idade, contacto, experiência) que são armazenadas de forma segura e com acesso restrito apenas aos membros do Comando Geral.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Finalidade e Uso</h4>
          <p>Os dados fornecidos têm o único propósito de viabilizar o processo de seleção de pilotos, comunicação interna e coordenação operacional de voos. Nenhum dado é repassado, vendido ou utilizado para fins comerciais ou publicitários de qualquer espécie.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Sigilo e Proteção</h4>
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
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Profissionalismo e Ética</h4>
          <p>Exigimos respeito mútuo, cordialidade e espírito de equipa. Não toleramos comportamentos tóxicos, discursos de ódio, assédio ou qualquer atitude que lese a moral dos nossos membros e parceiros.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Normas de Voo e Simulação</h4>
          <p>Operamos em ambientes de simulação (Microsoft Flight Simulator) buscando a mais alta fidelidade possível. O uso de cheats, modificações maliciosas ou conduta antidesportiva nas redes de simulação é estritamente proibido.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Hierarquia</h4>
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
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>Que tipo de Cookies utilizamos?</h4>
          <p>Utilizamos exclusivamente <strong>Cookies Estritamente Necessários</strong>. Eles são essenciais para que as funções básicas do portal operem corretamente. Por exemplo, utilizamos um cookie para registar que você já leu e ocultou a barra de aviso de cookies, evitando que ela reapareça a cada recarregamento de página.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>Sem Rastreio de Terceiros</h4>
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
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>1. Entidade Civil e Entusiasta</h4>
          <p>A Esquadrilha da Fumaça Virtual (neste portal referida) é um grupo civil, independente e sem fins lucrativos, focado estritamente na prática do desporto eletrónico (e-sports) no âmbito da simulação de voo.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>2. Ausência de Vínculo com a FAB</h4>
          <p><strong>Deixamos formalmente explícito que não possuímos nenhuma filiação, patrocínio, endosso ou ligação com a Força Aérea Brasileira (FAB), nem com o Esquadrão de Demonstração Aérea (EDA) oficial.</strong></p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Comum", sans-serif', fontWeight: 600 }}>3. Uso de Insígnias e Marcas</h4>
          <p>A utilização de pinturas, logotipos inspirados, referências a aeronaves (como o Embraer A-29 Super Tucano) e terminologias militares possui caráter puramente ilustrativo, ficcional e lúdico, com o objetivo único de homenagear os profissionais reais da aviação em ambiente virtual.</p>
          <p style={{ marginTop: '1rem' }}>
            Encorajamos fortemente todos os interessados e entusiastas a visitarem e conhecerem o trabalho incrível da <strong>EDAV Oficial</strong> acessando o link <a href="https://edav.com.br" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>edav.com.br</a>. Deixamos aqui o nosso máximo respeito e profunda admiração por tudo o que eles representam para a comunidade.
          </p>
        </>
      )
    }
  };

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

    const isLeft = posicao === '3' || posicao === '5';

    return (
      <div className="tatic-slot noselect" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '300px', justifyContent: 'center', height: '180px', cursor: 'default' }}>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img 
            src={a29icon} 
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
        
        <div className="slot-info" style={{ 
          position: 'absolute',
          [isLeft ? 'right' : 'left']: 'calc(50% + 100px)',
          zIndex: 4,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {pilotosSlot.length > 0 ? pilotosSlot.map((piloto, idx) => (
            <div key={idx} className="bio-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '999px', padding: '0.75rem 1.5rem', backdropFilter: 'blur(20px)', whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', flexDirection: isLeft ? 'row-reverse' : 'row' }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: isLeft ? 'right' : 'left' }}>
                <span style={{ fontSize: '1rem', fontFamily: '"Regular", Arial, sans-serif', fontWeight: 500, color: '#f8fafc' }}>{piloto.nome}</span>
                <span style={{ fontSize: '0.7rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginTop: '2px' }}>{role}</span>
                {piloto.cidade && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{piloto.cidade} {piloto.uf ? `- ${piloto.uf}` : ''}</span>}
              </div>
            </div>
          )) : (
            <div className="bio-card" style={{ padding: '0.75rem 1.5rem' }}>
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
          background: linear-gradient(145deg, #030712 0%, #060d1a 50%, #0a192f 100%) fixed !important;
          font-family: 'Regular', system-ui, -apple-system, sans-serif;
          overflow-x: hidden; 
          scroll-behavior: smooth; 
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
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

        p {
          font-weight: 400;
          line-height: 1.8;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

        h1, h2, h3, h4, h5, h6 { font-family: "Comum", sans-serif !important; color: #ffffff; font-weight: bold; }

        .glass-panel { 
          background: rgba(15, 23, 42, 0.4);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .slot-info { 
          opacity: 0; 
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease; 
        }
        .tatic-slot:hover .slot-info { 
          opacity: 1; 
          visibility: visible;
          transform: translateY(0);
        }

        .bio-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 999px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          white-space: nowrap;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        
        .bio-card:hover {
          background: rgba(4, 15, 35, 0.9) !important;
          border-color: rgba(14,165,233,0.4);
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
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

        .stats-grain {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }
        .stats-bg-light {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
          filter: blur(60px);
          z-index: 0;
        }

        .section-top-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent);
          margin-bottom: 4rem;
        }

        .section-glow-left {
          position: absolute; top: 10%; left: -10%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%);
          filter: blur(80px); z-index: 0; pointer-events: none;
        }
        
        .section-glow-right {
          position: absolute; top: 10%; right: -10%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%);
          filter: blur(80px); z-index: 0; pointer-events: none;
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
        
        .leaflet-popup-content-wrapper { background: #ffffff !important; color: #030712 !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; font-weight: 400; }
        .leaflet-popup-tip { background-color: #ffffff !important; }
        .leaflet-container { background: #e2e8f0 !important; border-radius: 12px; }
        .leaflet-layer { filter: none !important; }

        .leaflet-bar {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-touch .leaflet-bar a, .leaflet-bar a {
          background-color: rgba(15, 23, 42, 0.8) !important;
          color: #0ea5e9 !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          transition: all 0.3s ease !important;
          border-radius: 0 !important;
        }
        .leaflet-touch .leaflet-bar a:hover, .leaflet-bar a:hover {
          background-color: #0ea5e9 !important;
          color: #000 !important;
        }

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

        .modal-body-scroll::-webkit-scrollbar { width: 6px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 12px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }

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
        .platform-btn.active {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: #ffffff;
        }
        .platform-btn.active-blue {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: #ffffff;
        }
        .platform-btn:hover:not(.active):not(.active-blue) {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .view-toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8;
          padding: 0.6rem 1.25rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .view-toggle-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
        }
        .view-toggle-btn.active {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
          color: #ffffff !important;
          border-color: transparent !important;
        }
        .view-toggle-btn.active-blue {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
          color: #ffffff !important;
          border-color: transparent !important;
        }

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
        .tab-btn:hover {
          color: #f8fafc;
          background: rgba(255,255,255,0.05);
        }
        .tab-btn:active {
          transform: scale(0.95);
        }
        .tab-btn.active {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.05);
        }

        .fs-badge { 
          font-size: 0.85rem; 
          border: 1px solid var(--border-light); 
          padding: 4px 10px; 
          border-radius: 6px; 
          font-weight: 500; 
          letter-spacing: 0.05em; 
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
        
        .tb-button:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          border-color: transparent;
          cursor: not-allowed;
        }

        .btn-alistamento {
          background: rgba(14, 165, 233, 0.15) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          color: #ffffff !important;
          border: 1px solid rgba(14, 165, 233, 0.5) !important;
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.2) !important;
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
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 30px rgba(14, 165, 233, 0.4) !important;
          border-color: #0ea5e9 !important;
        }

        .agenda-card {
          border-radius: 16px;
          border: none;
        }

        .cookie-banner {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 1rem 1.5rem;
          z-index: 9999; display: flex; align-items: center; gap: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5); width: max-content; max-width: 90%;
        }
        .cookie-content { display: flex; align-items: flex-start; gap: 1rem; flex: 1; min-width: 250px; }
        .cookie-actions { display: flex; gap: 1rem; flex-wrap: nowrap; }

        @media (max-width: 768px) {
          .cookie-banner {
            flex-direction: column; width: calc(100% - 2rem); bottom: 1rem; padding: 1.25rem; gap: 1.25rem; text-align: center;
          }
          .cookie-content { flex-direction: column; align-items: center; min-width: 100%; gap: 0.5rem; }
          .cookie-actions { width: 100%; }
          .cookie-actions button { flex: 1; justify-content: center; }
        }

        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lang-dropdown-wrapper {
          position: absolute;
          top: 100%;
          right: 0;
          padding-top: 6px;
          z-index: 50;
        }

        .lang-dropdown {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          min-width: 100px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          animation: dropFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }
        
        .lang-item {
          padding: 0.6rem 0.8rem;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .lang-item:hover {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
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
        
        .full-width-band {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          max-width: 100vw;
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
          .responsive-grid { grid-template-columns: 1fr !important; }
          .formacao-wrapper {
             transform: scale(0.75);
             transform-origin: top center;
             margin-bottom: -50px;
          }
        }

        @media (max-width: 600px) {
           .formacao-wrapper {
             transform: scale(0.55);
             transform-origin: top center;
             margin-bottom: -150px;
           }
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .bento-card {
          background: rgba(15, 23, 42, 0.4);
          border: none !important;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: none; 
        }
        
        .bento-card-img {
          width: 100%;
          flex-grow: 1;
          object-fit: cover;
          min-height: 200px;
        }
        
        .bento-card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(2, 6, 23, 0.6);
          border-top: none;
        }
        
        .bento-card-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
        }
        
        .bento-card-desc {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
        }
        
        .col-span-12 { grid-column: span 12; }
        .col-span-8 { grid-column: span 8; }
        .col-span-6 { grid-column: span 6; }
        .col-span-4 { grid-column: span 4; }

        .slider-arrow-inline {
          background: rgba(3,7,18,0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .slider-arrow-inline:hover {
          background: rgba(14,165,233,0.5);
          color: #fff;
          border-color: rgba(14,165,233,0.8);
          transform: scale(1.05);
        }

        .footer-wrapper { border-top: 1px solid rgba(255,255,255,0.05); padding: 4rem 2rem 2rem; margin-top: 6rem; background: transparent; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr; gap: 3rem; max-width: 1200px; margin: 0 auto; }
        .footer-heading { font-size: 1.1rem; color: #fff; margin: 0 0 1.5rem 0; letter-spacing: 0.05em; }
        
        .footer-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; margin-bottom: 0.8rem; display: block; transition: color 0.2s; cursor: pointer; }
        .footer-link:hover { color: #0ea5e9; }
        
        .footer-pills { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
        .footer-pill { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.15); padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 500; font-size: 0.95rem; color: #f8fafc; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; text-decoration: none !important; }
        .footer-pill:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4rem; padding-top: 2rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); max-width: 1200px; margin-left: auto; margin-right: auto; }
        
        .legal-footer-link { color: var(--text-muted); cursor: pointer; transition: color 0.2s; display: flex; gap: 6px; align-items: center; user-select: none; }
        .legal-footer-link:hover { color: #0ea5e9; }

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
          user-select: none;
        }
        .legal-tab:hover { background: rgba(255,255,255,0.05); color: #ffffff; }
        .legal-tab.active { background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          min-width: 280px;
          height: 70px;
          cursor: pointer;
          overflow: hidden;
          flex: 0 0 auto;
        }
        .bf-action-card-icon {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.05);
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
          color: #f8fafc;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .bf-action-card-subtitle {
          color: #94a3b8;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr; } .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; } }
      `}</style>

      <Header 
        activeSection={activeSection}
        alistamentoAberto={alistamentoAberto}
        solicitacaoAberta={solicitacaoAberta}
        onOpenAlistamento={() => setIsFormModalOpen(true)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        hasLive={hasLive}
        hasNoticias={dbNoticias.length > 0}
      />

      <div className={`splash-screen ${!isAppLoading ? 'hidden' : ''}`}>
        <img src={logoImage} alt="EDAV Logo Loading" className="pulse-logo" style={{ width: '120px', height: 'auto', marginBottom: '2rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ffffff', fontSize: '1.2rem', letterSpacing: '0.1em' }}>Aguarde..</span>
        </div>
      </div>

      <section className="hero" style={{ height: '80vh', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', paddingBottom: '2rem' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customHeader || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(3,7,18,0.3)', pointerEvents: 'none' }} />
        
        <div className="hero-notification-bar reveal-on-scroll" style={{ position: 'relative', zIndex: 20, padding: '0 2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {alistamentoAberto && (
            <div className="bf-action-card" onClick={() => setIsFormModalOpen(true)} style={{ border: '1px solid rgba(14, 165, 233, 0.4)' }}>
              <div className="bf-action-card-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <FileText size={28} />
              </div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title" style={{ fontFamily: '"Comum", sans-serif' }}>Alistamento EDA FS</span>
                <span className="bf-action-card-subtitle" style={{ color: '#0ea5e9' }}>Inscrições Abertas</span>
              </div>
            </div>
          )}

          {solicitacaoAberta && (
            <div className="bf-action-card" onClick={() => setIsDemoModalOpen(true)} style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div className="bf-action-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <PlaneTakeoff size={28} />
              </div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title" style={{ fontFamily: '"Comum", sans-serif' }}>Solicitar Apresentação</span>
                <span className="bf-action-card-subtitle" style={{ color: '#10b981' }}>Solicite aqui uma demonstração</span>
              </div>
            </div>
          )}

          <div className="bf-action-card" onClick={() => scrollToSection('agenda')} style={{ border: '1px solid rgba(234, 179, 8, 0.4)' }}>
            <div className="bf-action-card-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
              <Calendar size={28} />
            </div>
            <div className="bf-action-card-content">
              <span className="bf-action-card-title" style={{ fontFamily: '"Comum", sans-serif' }}>Agenda Oficial</span>
              <span className="bf-action-card-subtitle" style={{ color: '#eab308' }}>Ver próximos eventos</span>
            </div>
          </div>

          {dbEstatisticas.map((stat, idx) => (
            <div key={idx} className="bf-action-card" style={{ cursor: 'default' }}>
              <div className="bf-action-card-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <i className={stat.icone} style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div className="bf-action-card-content">
                <span className="bf-action-card-title" style={{ fontSize: '1.1rem', fontFamily: '"Comum", sans-serif' }}>{stat.valor}</span>
                <span className="bf-action-card-subtitle">{stat.rotulo}</span>
              </div>
            </div>
          ))}

        </div>
      </section>

      <div style={{ position: 'relative', background: 'transparent' }}>
        <section id="pilotos" className="section-container" style={{ paddingTop: '4rem' }}>
          <div className="section-glow-left" />

          <SectionHeaderApple overline="Equipe" title="Os Nossos Pilotos." subtitle="Conheça os aviadores virtuais que compõem a Esquadrilha da Fumaça Virtual, separados por plataforma." />

          <div className="reveal-on-scroll" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button className={`tab-btn ${pilotoTab === '2020' ? 'active' : ''}`} onClick={() => setPilotoTab('2020')}>
              <img src={mfLogo} alt="MSFS" style={{ height: '16px', filter: pilotoTab === '2020' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
            </button>
            <button className={`tab-btn ${pilotoTab === '2024' ? 'active' : ''}`} onClick={() => setPilotoTab('2024')}>
              <img src={mfLogo24} alt="MSFS" style={{ height: '26px', filter: pilotoTab === '2024' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
            </button>
          </div>

          <div className="formacao-wrapper noselect reveal-on-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0rem', marginTop: '2rem', minHeight: '350px', transition: 'all 0.3s ease' }}>
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
        </section>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
        <section id="agenda" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
          <div className="section-top-divider" />
          <div className="section-glow-right" />

          <SectionHeaderApple overline="Programação" title="Agenda Oficial." subtitle="Acompanhe nossa agenda de demonstrações no Flight Simulator 2020 e Flight Simulator 2024. As demonstrações são feitas com meteorologia e tempo atualizados em tempo real." />
          
          <div className="reveal-on-scroll" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button className={`tab-btn ${agendaTab === '2020' ? 'active' : ''}`} onClick={() => setAgendaTab('2020')}>
                <img src={mfLogo} alt="MSFS" style={{ height: '16px', filter: agendaTab === '2020' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} /> 
              </button>
              <button className={`tab-btn ${agendaTab === '2024' ? 'active' : ''}`} onClick={() => setAgendaTab('2024')}>
                <img src={mfLogo24} alt="MSFS" style={{ height: '28px', filter: agendaTab === '2024' ? 'none' : 'grayscale(100%) opacity(70%)', transition: 'all 0.3s ease' }} />
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

                      const datePart = dem.dataHora.split(' às ')[0] || dem.dataHora;
                      const timePart = dem.dataHora.includes('às') ? ` às ${dem.dataHora.split(' às ')[1]}` : '';

                      return (
                        <div key={dem.id || idx} className="agenda-card" style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          background: `linear-gradient(90deg, ${statusColor}33 0%, rgba(3,7,18,0) 100%)`,
                          borderLeft: `4px solid ${statusColor}`,
                          padding: '1rem 1.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 300 }}>
                              {datePart}{timePart}
                            </span>
                            <span style={{ color: '#cbd5e1', fontWeight: 300, marginLeft: '0.5rem', fontSize: '1.05rem' }}>
                              {dem.cidade}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '0.5rem' }}>
                              {(dem.plataforma === 'Ambos') && (
                                <>
                                  <span className="fs-badge" style={{color:'#0ea5e9', borderColor:'rgba(14,165,233,0.3)', padding: '3px 8px', fontSize: '0.75rem'}}>MSFS 2020</span>
                                  <span className="fs-badge" style={{color:'#f59e0b', borderColor:'rgba(245,158,11,0.3)', padding: '3px 8px', fontSize: '0.75rem'}}>MSFS 2024</span>
                                </>
                              )}
                              {(dem.plataforma === '2024') && (
                                <span className="fs-badge" style={{color:'#f59e0b', borderColor:'rgba(245,158,11,0.3)', padding: '3px 8px', fontSize: '0.75rem'}}>MSFS 2024</span>
                              )}
                              {(dem.plataforma === '2020' || !dem.plataforma) && (
                                <span className="fs-badge" style={{color:'#0ea5e9', borderColor:'rgba(14,165,233,0.3)', padding: '3px 8px', fontSize: '0.75rem'}}>MSFS 2020</span>
                              )}
                            </div>
                          </div>
                          <span style={{ color: statusColor, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {dem.status === 'Planejamento' ? 'PREVISÃO' : dem.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
               <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <Calendar size={32} color="#0ea5e9" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ fontWeight: 300, color: '#64748b' }}>Nenhum evento agendado para esta plataforma.</p>
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

      <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent', display: 'flex', alignItems: 'center' }}>
        
        <section id="aeronave" style={{ position: 'relative', zIndex: 1, width: '100%', margin: '0 auto', paddingTop: '4rem' }}>
          <div className="section-top-divider" style={{ marginBottom: '1rem' }} />
          <div className="section-glow-left" />

          <div className="section-container reveal-on-scroll" style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center', alignItems: 'center' }}>
              <h2 style={{ 
                fontFamily: '"Comum", Arial, sans-serif', 
                fontSize: '2.5rem', 
                margin: 0, 
                fontWeight: 'bold', 
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}>
                O Super Tucano
              </h2>
              <p style={{ textAlign: 'center', fontWeight: 400, fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', margin: '0', fontFamily: '"Comum", Arial, sans-serif', maxWidth: '800px', padding: '0 2rem' }}>
                O Embraer EMB-314 Super Tucano é uma aeronave turboélice de ataque leve e treinamento avançado. Reconhecido mundialmente por sua robustez e alta tecnologia, é o vetor oficial da nossa esquadrilha virtual.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', marginTop: '1rem', padding: '0 2rem' }}>
                <AppleSpecText label="Desenvolvedor" value="RPSim" unit="" />
                <AppleSpecText label="Velocidade Máx." value="593" unit="km/h" />
                <AppleSpecText label="Teto de Serviço" value="10.6" unit="km" />
                <AppleSpecText label="Potência" value="1.600" unit="shp" />
              </div>
            </div>
          </div>

          <div className="full-width-band reveal-on-scroll"
            onMouseDown={onTouchStart} 
            onMouseMove={onTouchMove} 
            onMouseUp={onTouchEnd} 
            onMouseLeave={onTouchEnd}
            onTouchStart={onTouchStart} 
            onTouchMove={onTouchMove} 
            onTouchEnd={onTouchEnd}
            style={{ 
              marginTop: '1rem', 
              height: '60vh',
              minHeight: '400px',
              overflow: 'hidden', 
              cursor: isDragging ? 'grabbing' : 'grab',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' 
            }}
          >
            {sliderImages.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Super Tucano ${idx}`} 
                draggable={false}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: currentSlide === idx ? 1 : 0, 
                  transition: 'opacity 0.6s ease-in-out',
                  pointerEvents: 'none'
                }} 
              />
            ))}
          </div>

          <div className="reveal-on-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', zIndex: 10, paddingBottom: '4rem' }}>
            <button 
              onClick={() => setCurrentSlide(s => s === 0 ? sliderImages.length - 1 : s - 1)}
              className="slider-arrow-inline"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {sliderImages.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  style={{ 
                    width: currentSlide === idx ? '24px' : '8px', 
                    height: '8px', 
                    borderRadius: '4px', 
                    background: currentSlide === idx ? '#0ea5e9' : 'rgba(255,255,255,0.3)', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}
                />
              ))}
            </div>

            <button 
              onClick={() => setCurrentSlide(s => s === sliderImages.length - 1 ? 0 : s + 1)}
              className="slider-arrow-inline"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </div>

        </section>
      </div>

      {dbNoticias.length > 0 && (
        <div style={{ background: 'transparent' }}>
          <section id="noticias" className="section-container" style={{ paddingTop: '4rem' }}>
            <div className="section-top-divider" />
            <div className="section-glow-right" />

            <SectionHeaderApple overline="Comunicação" title="Artigos Recentes." subtitle="Fique a par das últimas novidades da esquadrilha." />
            <div className="responsive-grid reveal-on-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {dbNoticias.map((noticia, idx) => (
                <div key={idx} className="news-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', border: 'none' }}>
                  {noticia.imagem && (
                    <div style={{ height: '180px', backgroundImage: `url(${noticia.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }}></div>
                  )}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{noticia.data}</span>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.4 }}>{noticia.titulo}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8, fontWeight: 300, flexGrow: 1, margin: 0 }}>{noticia.resumo}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {hasLive && (
        <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
          
          <section id="midias" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
            <div className="section-top-divider" />
            <div className="section-glow-left" />

            <SectionHeaderApple overline="Ao Vivo" title="Transmissões Oficiais." subtitle="Acompanhe as nossas apresentações em tempo real e reveja os melhores momentos nos nossos canais." />

            <div className="ao-vivo-content reveal-on-scroll" style={{ animation: 'fadeIn 0.3s ease', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <button disabled={!liveYT} onClick={() => setLivePlatform('youtube')} className={`view-toggle-btn ${livePlatform === 'youtube' && liveYT ? 'active-yt' : ''}`} style={{ background: 'transparent', border: 'none' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" style={{ filter: livePlatform === 'youtube' && liveYT ? 'brightness(0) invert(1)' : 'grayscale(100%) opacity(70%)' }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YouTube Gaming
                </button>
                <button disabled={!liveTwitch} onClick={() => setLivePlatform('twitch')} className={`view-toggle-btn ${livePlatform === 'twitch' && liveTwitch ? 'active-tw' : ''}`} style={{ background: 'transparent', border: 'none' }}>
                  <img src={twLogo} alt="Twitch" style={{ width: 20, height: 20, filter: livePlatform === 'twitch' && liveTwitch ? 'brightness(0) invert(1)' : 'grayscale(100%) opacity(70%)' }} /> Twitch
                </button>
                <button disabled={!liveTikTok} onClick={() => setLivePlatform('tiktok')} className={`view-toggle-btn ${livePlatform === 'tiktok' && liveTikTok ? 'active-tk' : ''}`} style={{ background: 'transparent', border: 'none' }}>
                  <img src={tkLogo} alt="TikTok" style={{ width: 20, height: 20, filter: livePlatform === 'tiktok' && liveTikTok ? 'brightness(0) invert(1)' : 'grayscale(100%) opacity(70%)' }} /> TikTok
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: 'none' }}>
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

          </section>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
        
        <section id="sobre" className="section-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
          <div className="section-top-divider" />
          <div className="section-glow-right" />

          <SectionHeaderApple overline="Nossa História" title="O Esquadrão e a Jornada." subtitle="Descubra a história e os valores que guiam o nosso esquadrão." />

          <div className="reveal-on-scroll" style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '4rem', alignItems: 'center' }}>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: '-15px', border: '1px solid #0ea5e9', borderRadius: '16px', zIndex: 0, opacity: 0.5, transform: 'translate(20px, 20px)' }}></div>
              <div className="zoom-wrapper">
                <img src={formacaoImage} alt="Formação EDAV" className="zoom-image" style={{ filter: 'grayscale(20%) contrast(110%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.8) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                lineHeight: 1.1, 
                margin: 0, 
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                color: '#ffffff'
              }}>
                A Excelência como Doutrina
              </h2>
              <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', margin: 0 }}>
                A Esquadrilha da Fumaça Virtual nasce da paixão pela aviação e pelo voo em formação de alta performance. Operando exclusivamente no Microsoft Flight Simulator, o nosso esquadrão busca replicar com extrema fidelidade, precisão e profissionalismo a doutrina da verdadeira Esquadrilha da Fumaça.
              </p>
              
              <blockquote style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: '1.5rem', margin: '1rem 0 0 0', fontStyle: 'italic', fontWeight: 300, fontSize: '1rem', lineHeight: '1.7', color: '#94a3b8' }}>
                "O nosso objetivo não é apenas voar, mas elevar a demonstração aérea no simulador aos mais altos níveis de disciplina, beleza e sincronia. O treinamento nunca termina."
                <footer style={{ marginTop: '0.5rem', color: '#0ea5e9', fontWeight: 600, fontSize: '0.8rem', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.1em' }}>— Comandante</footer>
              </blockquote>
            </div>

          </div>
        </section>
      </div>

      <Footer 
        hasNoticias={dbNoticias.length > 0}
        onOpenLegal={openLegalModal}
      />

      <div className={`modal-overlay ${isFormModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel modal-body-scroll" style={{ padding: '2.5rem', background: '#0b1121', border: '1px solid var(--border-light)', borderRadius: '24px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={() => setIsFormModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--glass-bg)', borderRadius: '50%', padding: '0.5rem', border: 'none', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-strong)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}>
            <X size={18} />
          </button>
          
          {alistamentoAberto ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '0 0 1rem 0', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Alistamento EDA FS</h3>
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

      {/* MODAL DE SOLICITAÇÃO DE DEMONSTRAÇÃO */}
      <div className={`modal-overlay ${isDemoModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content glass-panel" style={{ padding: '2.5rem', background: '#0b1121', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '24px', maxWidth: '500px', width: '90%' }}>
          <button onClick={() => setIsDemoModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}><PlaneTakeoff size={24} /></div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>Solicitar Demonstração</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>Preencha os dados abaixo para convidar o EDA FS para o seu evento ou cidade.</p>

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
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: 400, fontSize: '0.9rem' }}>Recebemos os dados com sucesso. Nossa equipa entrará em contato em breve.</p>
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

      <div className={`modal-overlay ${legalModalOpen ? 'active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-content" style={{ padding: 0, background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '700px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600 }}>{legalContent[activeLegalTab].title}</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>{legalContent[activeLegalTab].subtitle}</p>
            </div>
            <button onClick={() => setLegalModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.4rem', borderRadius: '999px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
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
              <AlertTriangle size={16} /> Disclaimer
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}