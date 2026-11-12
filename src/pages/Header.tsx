import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import logoImage from '../images/logo.png';

interface HeaderProps {
  activeSection: string;
  alistamentoAberto: boolean;
  solicitacaoAberta: boolean;
  onOpenAlistamento: () => void;
  onOpenDemo: () => void;
  hasLive: boolean;
  hasNoticias: boolean;
}

export default function Header({ 
  activeSection, 
  alistamentoAberto, 
  solicitacaoAberta, 
  onOpenAlistamento, 
  onOpenDemo, 
  hasLive, 
  hasNoticias 
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agendaCount, setAgendaCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Busca a quantidade de eventos na agenda em tempo real para exibir o balão
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'agenda'), (snapshot) => {
      setAgendaCount(snapshot.size);
    });
    return () => unsub();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .desktop-nav .nav-link, .mobile-menu span {
          font-family: 'Regular', sans-serif !important;
          letter-spacing: 0.05em !important;
        }
        
        .menu-badge {
          background: #ef4444;
          color: #fff;
          font-size: 0.7rem;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          line-height: 0;
          padding: 0 4px;
          position: relative;
          top: -6px; /* Eleva a bolinha inteira para agir como expoente */
        }
      `}</style>

      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 100, 
        background: scrolled ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.4)', 
        backdropFilter: 'blur(20px) saturate(180%)', 
        WebkitBackdropFilter: 'blur(20px) saturate(180%)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        transition: 'all 0.3s ease', 
        padding: scrolled || mobileMenuOpen ? '0.5rem 0' : '0.9rem 0' 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
              <img src={logoImage} alt="EDAFS Logo" style={{ height: scrolled ? '50px' : '50px', width: 'auto', display: 'block', transition: 'height 0.3s ease' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Comum", sans-serif', fontWeight: 500, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                  ESQUADRILHA DA FUMAÇA VIRTUAL
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontFamily: '"Regular", sans-serif', fontWeight: 500, fontSize: '0.65rem', background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)', color: '#f8fafc', padding: '2px 10px', borderRadius: '4px', letterSpacing: '0.1em', transform: 'skewX(-35deg)' }}>
                    <span style={{ display: 'inline-block', transform: 'skewX(35deg)', fontStyle: 'italic', fontWeight: 500 }}>MICROSOFT FLIGHT SIMULATOR</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="desktop-nav">
            <span onClick={() => scrollToSection('pilotos')} className={`nav-link ${activeSection === 'pilotos' ? 'active' : ''}`}>Pilotos</span>
            <span onClick={() => scrollToSection('agenda')} className={`nav-link ${activeSection === 'agenda' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
              Agenda {agendaCount > 0 && <span className="menu-badge">{agendaCount}</span>}
            </span>
            {hasNoticias && (
              <span onClick={() => scrollToSection('noticias')} className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`}>Artigos</span>
            )}
            {hasLive && (
              <span onClick={() => scrollToSection('midias')} className={`nav-link ${activeSection === 'midias' ? 'active' : ''}`}>Mídias</span>
            )}
            <span onClick={() => scrollToSection('sobre')} className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}>Sobre</span>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} color="#ffffff" /> : <Menu size={24} color="#ffffff" />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className={activeSection === 'pilotos' ? 'active' : ''} onClick={() => scrollToSection('pilotos')}>Pilotos</span>
        <span className={activeSection === 'agenda' ? 'active' : ''} onClick={() => scrollToSection('agenda')} style={{ display: 'flex', alignItems: 'center' }}>
          Agenda {agendaCount > 0 && <span className="menu-badge">{agendaCount}</span>}
        </span>
        {hasNoticias && (
          <span className={activeSection === 'noticias' ? 'active' : ''} onClick={() => scrollToSection('noticias')}>Artigos</span>
        )}
        {hasLive && (
          <span className={activeSection === 'midias' ? 'active' : ''} onClick={() => scrollToSection('midias')}>Mídias</span>
        )}
        <span className={activeSection === 'sobre' ? 'active' : ''} onClick={() => scrollToSection('sobre')}>Sobre</span>
      </div>
    </>
  );
}