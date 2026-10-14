/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

import { 
  ChevronRight, ChevronUp, Menu, X, ShieldCheck, FileText, AlertTriangle, Cookie, ChevronDown,
  GraduationCap, Globe, Mail
} from 'lucide-react';

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import headerImage from '../images/tucano.jpg';
import logoImage from '../images/logo.png';
import faviconImage from '../images/favicon.png';
import formacaoImage from '../images/formacao.png';
import mfLogo from '../images/mf.png';

import tucano3png from '../images/tucano3.jpg';
import tucano2png from '../images/tucano2.jpg';
import t271 from '../images/t271.jpg';

const SectionHeader = ({ title }: { title: string }) => (
  <div className="section-header" style={{ marginBottom: '3.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
    <h2 className="section-title" style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, letterSpacing: '0.05em', color: '#f8fafc', fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>
      {title}
    </h2>
  </div>
);

const AppleSpec = ({ value, unit, label }: { value: string, unit?: string, label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: 'none', backdropFilter: 'blur(12px)' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', color: '#f8fafc' }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</span>
      {unit && <span style={{ fontSize: '1rem', fontWeight: 400, color: '#0ea5e9', fontFamily: '"Inter", sans-serif' }}>{unit}</span>}
    </div>
    <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>{label}</span>
  </div>
);

export default function HomeEn() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAppLoading) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setIsAppLoading(false);
        document.body.style.overflow = 'auto';
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [isAppLoading]);

  useEffect(() => {
    document.title = "Virtual Smoke Squadron | MSFS";
    document.documentElement.setAttribute('data-theme', 'dark');

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Discover more about the Virtual Smoke Squadron in MSFS 2020. High precision maneuvers, professionalism, and pure emotion in the virtual skies!');

    let linkFavicon = document.querySelector('link[rel="icon"]');
    if (!linkFavicon) {
      linkFavicon = document.createElement('link');
      linkFavicon.setAttribute('rel', 'icon');
      document.head.appendChild(linkFavicon);
    }
    linkFavicon.setAttribute('href', faviconImage);

    const unsubConfig = onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.headerImageUrl) {
          setCustomHeader(d.headerImageUrl);
        }
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubConfig();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
    setScrolled(window.scrollY > 30);
    setShowTopBtn(window.scrollY > 400); 

    const sections = ['aircraft', 'academy', 'about'];
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

  const [offsetY, setOffsetY] = useState(0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const legalContent = {
    privacidade: {
      title: "Privacy Policy",
      subtitle: "How we protect and handle your data.",
      body: (
        <>
          <p>This document establishes the data protection and privacy guidelines of the Virtual Smoke Squadron (EDAV), ensuring compliance with current laws and respect for your browsing.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Data Collection</h4>
          <p>Upon enlistment, we request essential information (name, age, contact, experience) which is stored securely with restricted access only to General Command members.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Purpose and Use</h4>
          <p>The data provided serves the sole purpose of enabling the pilot selection process, internal communication, and operational flight coordination. No data is shared, sold, or used for commercial or advertising purposes of any kind.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Confidentiality and Protection</h4>
          <p>We maintain strict protocols in our database to prevent unauthorized access. Collected information is discarded upon user request or termination of the link with the squadron.</p>
        </>
      )
    },
    termos: {
      title: "Operational Terms of Use",
      subtitle: "Guidelines for coexistence and conduct in the Squadron.",
      body: (
        <>
          <p>By joining or participating in the platforms and flights of the Virtual Smoke Squadron, the member commits to following the required standards of conduct.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Professionalism and Ethics</h4>
          <p>We demand mutual respect, cordiality, and team spirit. We do not tolerate toxic behaviors, hate speech, harassment, or any attitude that harms the morale of our members and partners.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Flight and Simulation Rules</h4>
          <p>We operate in simulation environments (Microsoft Flight Simulator) seeking the highest possible fidelity. The use of cheats, malicious modifications, or unsportsmanlike conduct in simulation networks is strictly prohibited.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Hierarchy</h4>
          <p>Decisions made by the General Command aim for the well-being and organization of the group and must be respected. Constructive suggestions and criticisms are always welcome in the appropriate channels.</p>
        </>
      )
    },
    cookies: {
      title: "Cookie Policy",
      subtitle: "Use of essential cookies for the platform.",
      body: (
        <>
          <p>This portal uses local storage technologies to ensure smooth and secure navigation.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>What type of Cookies do we use?</h4>
          <p>We exclusively use <strong>Strictly Necessary Cookies</strong>. They are essential for the basic functions of the portal to operate correctly. For example, we use a cookie to register that you have read and hidden the cookie warning bar, preventing it from reappearing on every page reload.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>No Third-Party Tracking</h4>
          <p>We do not integrate targeted advertising cookies, marketing, or invasive trackers. Your browsing on this site is not monitored by us to create consumer profiles.</p>
        </>
      )
    },
    disclaimer: {
      title: "Institutional Legal Notice",
      subtitle: "Copyrights, trademarks, and lack of affiliations.",
      body: (
        <>
          <p>The Virtual Smoke Squadron portal operates under the principles of *Fair Use* and institutional respect, establishing the following legal points:</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>1. Civilian and Enthusiast Entity</h4>
          <p>The Virtual Smoke Squadron (referred to in this portal) is a civilian, independent, and non-profit group, strictly focused on the practice of electronic sports (e-sports) in the field of flight simulation.</p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>2. Lack of Affiliation with FAB</h4>
          <p><strong>We formally explicitly state that we do not have any affiliation, sponsorship, endorsement, or link with the Brazilian Air Force (FAB), nor with the official Air Demonstration Squadron (EDA).</strong></p>
          <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>3. Use of Insignias and Trademarks</h4>
          <p>The use of paint schemes, inspired logos, references to aircraft (such as the Embraer A-29 Super Tucano), and military terminology has a purely illustrative, fictional, and recreational character, with the sole objective of honoring real aviation professionals in a virtual environment.</p>
          <p style={{ marginTop: '1rem' }}>
            We strongly encourage all interested parties and enthusiasts to visit and discover the incredible work of the <strong>Official EDAV</strong> by accessing the link <a href="https://edav.com.br" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>edav.com.br</a>. We leave here our deepest respect and profound admiration for everything they represent to the community.
          </p>
        </>
      )
    }
  };

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'privacidade' | 'termos' | 'cookies' | 'disclaimer'>('privacidade');
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookiePref_edav')) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCookie = (acc: boolean) => {
    localStorage.setItem('cookiePref_edav', acc ? 'accepted' : 'rejected');
    setShowCookieBanner(false);
  };

  const openLegalModal = (tab: 'privacidade' | 'termos' | 'cookies' | 'disclaimer') => {
    setActiveLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div id="top">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

        @font-face {
          font-family: 'StratumNo2';
          src: url('/fonts/stratumno2_regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap; 
        }

        body, html { 
          background-color: #030712 !important; 
          font-family: "Inter", sans-serif; 
          overflow-x: hidden; 
          scroll-behavior: smooth; 
          font-weight: 300; 
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        
        p {
          font-family: "Inter", sans-serif;
          font-weight: 300;
          line-height: 1.8;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }

        h1, h2, h3, h4, h5, h6 { font-family: "StratumNo2", sans-serif !important; color: #ffffff; }

        .zoom-wrapper {
          position: relative;
          z-index: 1;
          border-radius: 4px;
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

        .academy-phase-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          background: linear-gradient(90deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0) 100%);
          border-left: 2px solid #334155;
          padding: 1.5rem;
          border-radius: 0 8px 8px 0;
          transition: all 0.4s ease;
          position: relative;
        }
        .academy-phase-card:hover {
          border-left: 2px solid #0ea5e9;
          background: linear-gradient(90deg, rgba(14,165,233,0.15) 0%, transparent 100%);
          transform: translateX(10px);
        }

        .section-container { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10; }
        
        .desktop-nav { display: flex; align-items: center; gap: 2rem; }

        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 700; 
          font-style: normal;
          font-size: 0.9rem; 
          font-family: "StratumNo2", sans-serif !important;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover { color: #0ea5e9; }
        .nav-link.active { color: #0ea5e9; font-weight: 700; }

        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(15, 23, 42, 0.95); z-index: 99; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.5rem; text-decoration: none; font-weight: 700; font-family: "StratumNo2", sans-serif !important; letter-spacing: 0.05em; transition: color 0.3s ease; cursor: pointer; text-transform: uppercase; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #0ea5e9; }

        .tb-button {
          position: relative;
          background: transparent;
          color: #0ea5e9;
          font-family: 'StratumNo2', sans-serif !important;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.6rem 1.4rem;
          border: 1px solid #0ea5e9;
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
          background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
          color: #ffffff;
          border-color: transparent;
        }

        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-10px); }
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
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 0px solid rgba(255,255,255,0.1);
          border-radius: 0px;
          width: 130px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          animation: dropFade 0.2s ease forwards;
          overflow: hidden;
        }
        
        .lang-item {
          padding: 0.85rem 1rem;
          color: #f8fafc;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-family: "Inter", sans-serif;
          font-weight: 500;
        }

        .lang-item:hover {
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
        }

        .split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          align-items: center;
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
          .footer-content { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .footer-content img { margin: 0 auto; }
          .footer-content div { align-items: center !important; justify-content: center !important; }
          .academy-phase-card { flex-direction: column; gap: 1rem; padding: 1.5rem; }
        }
      `}</style>

      {/* SPLASH SCREEN */}
      <div className={`splash-screen ${!isAppLoading ? 'hidden' : ''}`}>
        <img src={logoImage} alt="EDAV Logo Loading" className="pulse-logo" style={{ width: '120px', height: 'auto', marginBottom: '2rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: '"StratumNo2", sans-serif', color: '#ffffff', fontSize: '1.2rem', letterSpacing: '0.1em' }}>LOADING...</span>
        </div>
      </div>

      {/* MENU SUPERIOR */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease', padding: scrolled || mobileMenuOpen ? '0.6rem 0' : '1.4rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => { scrollToTop(); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: scrolled ? '45px' : '60px', width: 'auto', display: 'block', transition: 'height 0.3s ease' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.1 }}>
                VIRTUAL SMOKE SQUADRON
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#ffffff', padding: '3px 12px', borderRadius: '0px', letterSpacing: '0.1em', display: 'inline-block', background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)', transform: 'skewX(-20deg)', boxShadow: '0 2px 10px rgba(14, 165, 233, 0.2)' }}>
                  <span style={{ display: 'inline-block', transform: 'skewX(20deg)', fontStyle: 'italic', fontWeight: 700 }}>MICROSOFT FLIGHT SIMULATOR</span>
                </span>
              </div>
            </div>
          </div>

          <div className="desktop-nav">
            <span onClick={() => scrollToSection('aircraft')} className={`nav-link ${activeSection === 'aircraft' ? 'active' : ''}`}>AIRCRAFT</span>
            <span onClick={() => scrollToSection('academy')} className={`nav-link ${activeSection === 'academy' ? 'active' : ''}`}>ACADEMY</span>
            <span onClick={() => scrollToSection('about')} className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>ABOUT US</span>
            
            <a href="mailto:fumacavirtualmfs@gmail.com" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '0.5rem' }} title="Contact Us">
              <Mail size={18} />
            </a>

            <div style={{ position: 'relative', marginLeft: '1rem', height: '100%', display: 'flex', alignItems: 'center' }} onMouseEnter={() => setLangMenuOpen(true)} onMouseLeave={() => setLangMenuOpen(false)}>
              <button className="tb-button" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent' }}>
                <Globe size={16} /> EN-US <ChevronDown size={12} />
              </button>
              {langMenuOpen && (
                <div className="lang-dropdown-wrapper">
                  <div className="lang-dropdown">
                    <div className="lang-item" onClick={() => navigate('/')}>
                      <Globe size={14} /> PT-BR
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a href="mailto:fumacavirtualmfs@gmail.com" style={{ display: window.innerWidth <= 900 ? 'flex' : 'none', color: '#0ea5e9', alignItems: 'center' }}>
              <Mail size={22} />
            </a>
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} color="#f8fafc" /> : <Menu size={24} color="#f8fafc" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className={activeSection === 'aircraft' ? 'active' : ''} onClick={() => scrollToSection('aircraft')}>AIRCRAFT</span>
        <span className={activeSection === 'academy' ? 'active' : ''} onClick={() => scrollToSection('academy')}>ACADEMY</span>
        <span className={activeSection === 'about' ? 'active' : ''} onClick={() => scrollToSection('about')}>ABOUT US</span>
        
        <a href="mailto:fumacavirtualmfs@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', textDecoration: 'none', fontSize: '1.5rem', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, marginTop: '1rem' }}>
          <Mail size={24} /> CONTACT
        </a>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Language</span>
          <button className="tb-button" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> PT-BR
          </button>
        </div>
      </div>

      <section className="hero" style={{ height: '80vh', minHeight: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customHeader || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,7,18,0) 0%, rgba(3,7,18,0.5) 80%, #030712 100%)', pointerEvents: 'none' }} />
      </section>

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b1121', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${tucano3png})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1, filter: 'brightness(1.15) contrast(1.05)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b1121 0%, rgba(3,7,18,0.3) 50%, #030712 100%)', zIndex: 0 }} />
        
        <section id="aircraft" className="section-container" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px', margin: '0 auto', padding: '6rem 2rem' }}>
          <SectionHeader title="THE SUPER TUCANO" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.1rem', lineHeight: '1.8', color: '#f8fafc', margin: '0 auto', fontFamily: '"Inter", sans-serif', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              The Embraer EMB-314 Super Tucano is a turboprop light attack and advanced training aircraft. Globally recognized for its robustness and high technology, it is the official aircraft of our virtual squadron.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', borderRadius: '10px', marginTop: '2.5rem' }}>
              <AppleSpec label="Developer" value="RPSim" />
              <AppleSpec label="Max Speed" value="593" unit="km/h" />
              <AppleSpec label="Service Ceiling" value="10.6" unit="km" />
              <AppleSpec label="Power" value="1,600" unit="shp" />
            </div>
          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section className="section-container">
          <SectionHeader title="TRANSITION TO SUPER TUCANO" />
          <div className="split-grid">
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: '-15px', border: '1px solid #0ea5e9', borderRadius: '4px', zIndex: 0, opacity: 0.5, transform: 'translate(20px, -20px)' }}></div>
              <div className="zoom-wrapper">
                <img src={tucano2png} alt="A-29 Transition" className="zoom-image" style={{ filter: 'grayscale(10%) contrast(110%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.6) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <h2 style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#f8fafc', lineHeight: 1.1, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                THE NEW <span style={{ color: '#0ea5e9' }}>ERA</span>
              </h2>
              <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', margin: 0, fontFamily: '"Inter", sans-serif' }}>
                Our pilots are currently undergoing intense training and adaptation for the official implementation of the A-29 Super Tucano. This phase marks a historic moment of evolution and enhancement of our aerobatic capabilities in the simulator.
              </p>
            </div>

          </div>
        </section>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b1121' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <section className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeader title="THE T-27 ERA" />
          <div className="split-grid reverse">
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: '-15px', border: '1px solid #0ea5e9', borderRadius: '4px', zIndex: 0, opacity: 0.5, transform: 'translate(-20px, 20px)' }}></div>
              <div className="zoom-wrapper">
                <img src={t271} alt="T-27 Formation" className="zoom-image" style={{ filter: 'grayscale(10%) contrast(110%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.8) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <h2 style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#f8fafc', lineHeight: 1.1, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                THE VETERAN'S <span style={{ color: '#0ea5e9' }}>LEGACY</span>
              </h2>
              <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', margin: 0, fontFamily: '"Inter", sans-serif' }}>
                Remember our history and the glorious operations with the legendary Embraer T-27 Tucano. After 3 years of activity in our virtual squadron, the veteran will soon retire to make way for the modern A-29 Super Tucano.
              </p>
            </div>

          </div>
        </section>
      </div>

      <div style={{ backgroundColor: '#030712' }}>
        <section id="academy" className="section-container">
          <SectionHeader title="CAREER PATH" />
          <p style={{ textAlign: 'center', color: '#cbd5e1', maxWidth: '800px', margin: '-1.5rem auto 3rem', fontWeight: 300, fontFamily: '"Inter", sans-serif', lineHeight: '1.8' }}>
            The journey in the EDA FS requires extreme dedication. Discover the training stages and responsibilities assumed by our pilots until they achieve the coveted operational status.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px', margin: '0 auto' }}>
            <div className="academy-phase-card">
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1rem', borderRadius: '8px', color: '#0ea5e9', flexShrink: 0 }}>
                <GraduationCap size={28} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Phase 01</span>
                <h3 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.5rem', color: '#f8fafc', fontFamily: '"StratumNo2", sans-serif' }}>CADET</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', fontWeight: 300, fontFamily: '"Inter", sans-serif', margin: 0 }}>
                  Admission and initial training phase. The Cadet focuses on total adaptation to the squadron's aircraft (T-27/A-29), instrument navigation improvement, radio communication, and basic element flight fundamentals.
                </p>
              </div>
            </div>

            <div className="academy-phase-card">
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1rem', borderRadius: '8px', color: '#0ea5e9', flexShrink: 0 }}>
                <GraduationCap size={28} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Phase 02</span>
                <h3 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.5rem', color: '#f8fafc', fontFamily: '"StratumNo2", sans-serif' }}>WINGMAN (TRAINEE)</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', fontWeight: 300, fontFamily: '"Inter", sans-serif', margin: 0 }}>
                  Intensive aerobatic formation training period. The Wingman learns to fly in diamond, snake, and arrow formations, maintaining minimum safety distances, while executing complex maneuvers synchronized with the leader.
                </p>
              </div>
            </div>

            <div className="academy-phase-card" style={{ borderLeftColor: '#ef4444' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Phase 03</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: '#ef4444', fontFamily: '"StratumNo2", sans-serif', letterSpacing: '0.1em' }}>
                  [CLASSIFIED]
                </h3>
              </div>
            </div>
          </div>

        </section>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b1121' }}>
        <div style={{ position: 'absolute', top: '0', right: '0', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <section id="about" className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '4rem', alignItems: 'center' }}>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: '-15px', border: '1px solid #0ea5e9', borderRadius: '4px', zIndex: 0, opacity: 0.5, transform: 'translate(20px, 20px)' }}></div>
              <div className="zoom-wrapper">
                <img src={formacaoImage} alt="Formation EDAV" className="zoom-image" style={{ filter: 'grayscale(20%) contrast(110%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.8) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <h2 style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#f8fafc', lineHeight: 1.1, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                EXCELLENCE AS <span style={{ color: '#0ea5e9' }}>DOCTRINE</span>
              </h2>
              <p style={{ textAlign: 'justify', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', margin: 0, fontFamily: '"Inter", sans-serif' }}>
                The Virtual Smoke Squadron is born from a passion for aviation and high-performance formation flying. Operating exclusively in Microsoft Flight Simulator, our squadron seeks to replicate with extreme fidelity, precision, and professionalism the doctrine of the real Brazilian Smoke Squadron.
              </p>
              
              <blockquote style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: '1.5rem', margin: '1rem 0 0 0', fontStyle: 'italic', fontWeight: 300, fontSize: '1rem', lineHeight: '1.7', color: '#94a3b8', fontFamily: '"Inter", sans-serif' }}>
                "Our goal is not just to fly, but to elevate virtual air demonstration to the highest levels of discipline, beauty, and synchronization. The training never ends."
                <footer style={{ marginTop: '0.5rem', color: '#0ea5e9', fontWeight: 600, fontSize: '0.8rem', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.1em' }}>— High Command EDA FS</footer>
              </blockquote>
            </div>

          </div>
        </section>
      </div>

      <footer className="footer" style={{ padding: '5rem 2rem 2rem', background: '#030712', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', paddingBottom: '4rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '60px', width: 'auto', alignSelf: 'flex-start' }} />
            <div>
              <span style={{ display: 'block', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>VIRTUAL SMOKE SQUADRON</span>
              <span style={{ fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontSize: '0.75rem', background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)', color: '#f8fafc', padding: '3px 12px', borderRadius: '0px', letterSpacing: '0.1em', transform: 'skewX(-24deg)', display: 'inline-block', marginTop: '8px' }}>
                <span style={{ display: 'inline-block', transform: 'skewX(24deg)', fontStyle: 'italic' }}>MICROSOFT FLIGHT SIMULATOR</span>
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
              <span onClick={() => window.open('https://www.instagram.com/eda.msfs/', '_blank')} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%', transition: 'all 0.3s ease', display: 'inline-flex' }} onMouseEnter={e => { e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#0ea5e9'; }} onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </span>
              <a href="mailto:fumacavirtualmfs@gmail.com" style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%', transition: 'all 0.3s ease', display: 'inline-flex' }} onMouseEnter={e => { e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#0ea5e9'; }} onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span onClick={() => document.getElementById('aircraft')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.85rem', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontStyle: 'normal', letterSpacing: '0.05em', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Aircraft</span>
              <span onClick={() => document.getElementById('academy')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.85rem', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontStyle: 'normal', letterSpacing: '0.05em', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> Academy</span>
              <span onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '0.85rem', fontFamily: '"StratumNo2", sans-serif', fontWeight: 700, fontStyle: 'normal', letterSpacing: '0.05em', transition: 'color 0.3s ease', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}><ChevronRight size={12} /> About Us</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Our Platform</h4>
              <img src={mfLogo} alt="MSFS 2020" style={{ height: '40px', width: 'auto', alignSelf: 'flex-start', opacity: 0.8 }} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.6, margin: 0, textAlign: 'justify', fontFamily: 'Arial, sans-serif' }}>
                  <strong>LEGAL NOTICE:</strong> The Virtual Smoke Squadron is a civilian and independent organization, focused exclusively on flight simulation and e-sports within Microsoft Flight Simulator. <strong>We do not possess any institutional link, affiliation, endorsement, or sponsorship with the Brazilian Air Force (FAB)</strong> or the official Air Demonstration Squadron (EDA). Inspired logos and insignias are used strictly in a simulation and recreational environment, aiming to honor Brazilian aviation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(28, 28, 30, 0.85)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1rem 1.5rem', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 'auto', maxWidth: '90%', flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '250px' }}>
            <ShieldCheck size={24} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontFamily: '"Inter", sans-serif', lineHeight: 1.5 }}>
              Nosso portal utiliza cookies essenciais para garantir o funcionamento correto e melhorar sua experiência de navegação, in compliance with LGPD. 
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleCookie(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontFamily: '"StratumNo2", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#64748b'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}>
              DECLINE
            </button>
            <button onClick={() => handleCookie(true)} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid #0ea5e9', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 700, fontFamily: '"StratumNo2", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', letterSpacing: '0.05em' }} onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)'; e.currentTarget.style.color = '#030712'; e.currentTarget.style.borderColor = 'transparent'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.borderColor = '#0ea5e9'; }}>
              UNDERSTOOD AND ACCEPT
            </button>
          </div>
        </div>
      )}

      <button onClick={scrollToTop} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, background: 'transparent', color: '#94a3b8', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showTopBtn ? 0.6 : 0, pointerEvents: showTopBtn ? 'auto' : 'none', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.opacity = '0.6'; }}>
        <ChevronUp size={28} strokeWidth={2} />
      </button>

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
              <ShieldCheck size={16} /> Privacy
            </button>
            <button onClick={() => setActiveLegalTab('termos')} className={`legal-tab ${activeLegalTab === 'termos' ? 'active' : ''}`}>
              <FileText size={16} /> Terms
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