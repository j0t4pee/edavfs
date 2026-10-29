import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
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
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease', padding: scrolled || mobileMenuOpen ? '0.3rem 0' : '0.6rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={scrollToTop} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '1rem', cursor: 'pointer' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: scrolled ? '30px' : '38px', width: 'auto', display: 'block', transition: 'height 0.3s ease' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"Comum", sans-serif', fontWeight: 500, fontSize: '0.9rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                ESQUADRILHA DA FUMAÇA VIRTUAL
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontFamily: '"Regular", sans-serif', fontWeight: 500, fontSize: '0.65rem', background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)', color: '#f8fafc', padding: '2px 10px', borderRadius: '4px', letterSpacing: '0.1em', transform: 'skewX(-35deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skewX(35deg)', fontStyle: 'italic', fontWeight: 500 }}>MICROSOFT FLIGHT SIMULATOR</span>
                </span>
              </div>
            </div>
          </div>

          <div className="desktop-nav">
            <span onClick={() => scrollToSection('pilotos')} className={`nav-link ${activeSection === 'pilotos' ? 'active' : ''}`}>Pilotos</span>
            <span onClick={() => scrollToSection('agenda')} className={`nav-link ${activeSection === 'agenda' ? 'active' : ''}`}>Agenda</span>
            <span onClick={() => scrollToSection('aeronave')} className={`nav-link ${activeSection === 'aeronave' ? 'active' : ''}`}>Aeronave</span>
            {hasNoticias && (
              <span onClick={() => scrollToSection('noticias')} className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`}>Artigos</span>
            )}
            {hasLive && (
              <span onClick={() => scrollToSection('midias')} className={`nav-link ${activeSection === 'midias' ? 'active' : ''}`}>Mídias</span>
            )}
            <span onClick={() => scrollToSection('sobre')} className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}>Sobre</span>
            
            <div style={{ position: 'relative', marginLeft: '0.5rem', height: '100%', display: 'flex', alignItems: 'center' }} onMouseEnter={() => setLangMenuOpen(true)} onMouseLeave={() => setLangMenuOpen(false)}>
              <button style={{ 
                padding: '0.5rem', 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                border: 'none', 
                background: 'transparent',
                color: langMenuOpen ? '#0ea5e9' : '#f8fafc',
                fontWeight: 400,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}>
                <Globe size={16} /> PT-BR <ChevronDown size={14} style={{ opacity: 0.7, transform: langMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>
              
              {langMenuOpen && (
                <div className="lang-dropdown-wrapper">
                  <div className="lang-dropdown">
                    <div className="lang-item" onClick={() => navigate('/en')}>
                      <Globe size={14} /> EN-US
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} color="#ffffff" /> : <Menu size={24} color="#ffffff" />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className={activeSection === 'pilotos' ? 'active' : ''} onClick={() => scrollToSection('pilotos')}>Pilotos</span>
        <span className={activeSection === 'agenda' ? 'active' : ''} onClick={() => scrollToSection('agenda')}>Agenda</span>
        <span className={activeSection === 'aeronave' ? 'active' : ''} onClick={() => scrollToSection('aeronave')}>Aeronave</span>
        {hasNoticias && (
          <span className={activeSection === 'noticias' ? 'active' : ''} onClick={() => scrollToSection('noticias')}>Artigos</span>
        )}
        {hasLive && (
          <span className={activeSection === 'midias' ? 'active' : ''} onClick={() => scrollToSection('midias')}>Mídias</span>
        )}
        <span className={activeSection === 'sobre' ? 'active' : ''} onClick={() => scrollToSection('sobre')}>Sobre</span>
        
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Language</span>
          <button className="tb-button" onClick={() => navigate('/en')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> EN-US
          </button>
        </div>
      </div>
    </>
  );
}