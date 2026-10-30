import React from 'react';
import { Mail } from 'lucide-react';
import logoImage from '../images/logo.png';

interface FooterProps {
  hasNoticias: boolean;
  onOpenLegal: (tab: 'privacidade' | 'termos' | 'cookies' | 'disclaimer') => void;
}

export default function Footer({ hasNoticias, onOpenLegal }: FooterProps) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <div className="footer-grid" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <img src={logoImage} alt="EDAFS Logo" style={{ height: '36px', width: 'auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontFamily: '"Comum", sans-serif', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', lineHeight: 1.1 }}>ESQUADRILHA DA FUMAÇA VIRTUAL</span>
              <div style={{ display: 'flex' }}>
                <span style={{ fontFamily: '"Regular", sans-serif', fontWeight: 500, fontSize: '0.65rem', background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)', color: '#f8fafc', padding: '3px 12px', borderRadius: '4px', letterSpacing: '0.1em', transform: 'skewX(-35deg)', display: 'inline-block' }}>
                  <span style={{ display: 'inline-block', transform: 'skewX(35deg)', fontStyle: 'italic', fontWeight: 500 }}>MICROSOFT FLIGHT SIMULATOR</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="footer-pills" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <a href="https://www.instagram.com/eda.msfs/" target="_blank" rel="noreferrer" title="Instagram" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#0ea5e9'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f8fafc'; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="mailto:fumacavirtualmfs@gmail.com" title="Email" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#0ea5e9'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f8fafc'; }}>
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 className="footer-heading">Navegação</h4>
          <a onClick={() => scrollToSection('pilotos')} className="footer-link">Pilotos</a>
          <a onClick={() => scrollToSection('agenda')} className="footer-link">Agenda</a>
          <a onClick={() => scrollToSection('aeronave')} className="footer-link">Aeronave</a>
          {hasNoticias && <a onClick={() => scrollToSection('noticias')} className="footer-link">Artigos</a>}
          <a onClick={() => scrollToSection('sobre')} className="footer-link">O Esquadrão</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 className="footer-heading">Simuladores</h4>
          <a className="footer-link">Microsoft Flight Simulator 2020</a>
          <a className="footer-link">Microsoft Flight Simulator 2024</a>
        </div>

      </div>

      <div className="footer-bottom" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span>© 2026 EDAFS. Todos os direitos reservados.</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: 1.6, margin: 0, textAlign: 'justify', fontFamily: '"Regular", Arial, sans-serif' }}>
            AVISO LEGAL: A Esquadrilha da Fumaça Virtual é uma organização civil e independente, voltada exclusivamente à simulação de voo e esporte eletrônico (e-sports) no software Microsoft Flight Simulator. Não possuímos nenhum tipo de vínculo institucional, afiliação, endosso ou patrocínio com a Força Aérea Brasileira (FAB) ou com o Esquadrão de Demonstração Aérea (EDA) oficial. Logotipos e insígnias inspirados são utilizados estritamente em ambiente de simulação e lazer, visando homenagear a aviação brasileira.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span onClick={() => onOpenLegal('privacidade')} className="legal-footer-link">Privacidade</span>
          <span onClick={() => onOpenLegal('termos')} className="legal-footer-link">Termos de Uso</span>
          <span onClick={() => onOpenLegal('cookies')} className="legal-footer-link">Cookies</span>
          <span onClick={() => onOpenLegal('disclaimer')} className="legal-footer-link">Aviso Legal</span>
        </div>
      </div>
    </footer>
  );
}