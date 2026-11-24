"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Importação do CSS global
import '../App.css';

import Header from './Header';
import Footer from './Footer';

// Imagens
import logoImage from '../images/logo.png';
import rpLogo from '../images/rp.png';
import heroImg from '../images/tucano4.jpg';
import a29Feature from '../images/tucano10.png';
import a29Specs from '../images/tucano8.png';

export default function A29Page() {
  const navigate = useNavigate();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [solicitacaoAberta, setSolicitacaoAberta] = useState(true);

  useEffect(() => {
    document.title = "A-29 Super Tucano | EDAFS & RP Simulations";
    document.documentElement.setAttribute('data-theme', 'dark');

    const timer = setTimeout(() => setIsAppLoading(false), 400);

    const unsubConfig = onSnapshot(doc(db, 'config', 'geral'), (docSnap: any) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setAlistamentoAberto(d.alistamentoAberto || false);
        setSolicitacaoAberta(d.solicitacaoAberta !== undefined ? d.solicitacaoAberta : true);
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    const handleScroll = () => {
      if (window.scrollY > 100) setActiveSection('a29');
      else setActiveSection('');
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      unsubConfig();
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div id="top" style={{ backgroundColor: '#030712', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); }
        @font-face { font-family: 'StratumNo2'; src: url('/fonts/stratumno2_regular.otf') format('opentype'); }

        * { font-family: 'Regular', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Comum', sans-serif !important; margin: 0; }

        body, html { 
          background: #030712 !important; max-width: 100vw; overflow-x: hidden; scroll-behavior: smooth; color: #e2e8f0;
        }

        .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }

        .clean-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .text-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }

        .feature-list {
          list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
        }
        
        .feature-item {
          border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;
        }
        
        .feature-title {
          font-family: 'Comum', sans-serif; font-size: 1.1rem; color: #f8fafc; margin-bottom: 0.5rem; display: block;
        }
        
        .feature-desc {
          font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin: 0;
        }

        .spec-table {
          width: 100%; border-collapse: collapse;
        }
        .spec-table tr {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .spec-table td {
          padding: 1.5rem 0;
        }
        .spec-label {
          color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; width: 40%;
        }
        .spec-value {
          color: #f8fafc; font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: bold; text-align: right;
        }

        .btn-primary {
          background: #f8fafc; color: #030712; padding: 1rem 2.5rem; border-radius: 4px; border: none; font-weight: bold; font-size: 1rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s ease; text-decoration: none; display: inline-flex; justify-content: center;
        }
        .btn-primary:hover { background: #cbd5e1; }

        .btn-secondary {
          background: transparent; color: #f8fafc; padding: 1rem 2.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-weight: 500; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; justify-content: center;
        }
        .btn-secondary:hover { border-color: #f8fafc; }

        /* HEADER & FOOTER STYLES */
        .desktop-nav { display: flex; align-items: center; gap: 2rem; }
        .nav-link { color: #ffffff; text-decoration: none; font-weight: 500; font-size: 0.95rem; letter-spacing: 0.02em; transition: color 0.3s ease; cursor: pointer; }
        .nav-link:hover { color: #0ea5e9; }
        .nav-link.active { color: #0ea5e9; font-weight: 500; }
        .mobile-toggle { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; }
        .mobile-menu { position: fixed; top: 0; left: 0; width: 100%; height: auto; max-height: 95vh; padding: 6rem 2rem 2rem; background: rgba(15, 23, 42, 0.98); z-index: 99; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 1.5rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-bottom: 1px solid rgba(255,255,255,0.1); border-radius: 0 0 32px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow-y: auto; }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-menu a, .mobile-menu span { color: #f8fafc; font-size: 1.25rem; text-decoration: none; font-weight: 500; letter-spacing: 0.02em; transition: color 0.3s ease; cursor: pointer; }
        .mobile-menu a:hover, .mobile-menu span:hover, .mobile-menu .active { color: #0ea5e9; }
        
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

        @media (max-width: 900px) {
          .text-grid { grid-template-columns: 1fr; gap: 2rem; }
          .feature-list { grid-template-columns: 1fr; }
          .spec-label { width: 50%; }
          .buttons-container { flex-direction: column; width: 100%; }
          .buttons-container a { width: 100%; }
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .footer-grid { grid-template-columns: 1fr; } 
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* HEADER FIXO */}
      <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100 }}>
        <Header activeSection={activeSection} alistamentoAberto={alistamentoAberto} solicitacaoAberta={solicitacaoAberta} onOpenAlistamento={() => {}} onOpenDemo={() => navigate('/solicitacao')} hasLive={false} hasNoticias={false} />
      </div>

      {/* 1. HERO SECTION MINIMALISTA */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1, opacity: 0.3, maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', width: '100%', padding: '0 2rem', textAlign: 'center', animation: 'fadeIn 1s ease-out' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            <img src={logoImage} alt="EDAFS" style={{ height: '50px', objectFit: 'contain' }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '2rem', fontWeight: 300 }}>+</span>
            <img src={rpLogo} alt="RP Simulations" style={{ height: '35px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, margin: '0 0 1.5rem 0', fontFamily: '"StratumNo2", sans-serif', color: '#ffffff' }}>
            EMB-314 SUPER TUCANO
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 auto 3rem auto', fontWeight: 300, maxWidth: '700px' }}>
            A excelência da engenharia aeronáutica. O vetor oficial da Esquadrilha da Fumaça Virtual, recriado com precisão pela RP Simulations para o Microsoft Flight Simulator 2020 e 2024.
          </p>
          
          <div className="buttons-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="https://discord.gg/rpsimulations" target="_blank" rel="noreferrer" className="btn-primary">
              Comunidade RP Sim
            </a>
            <a href="#detalhes" className="btn-secondary">
              Descubra a Aeronave
            </a>
          </div>
        </div>
      </section>

      {/* 2. INSTITUCIONAL E HISTÓRIA (TEXT GRID) */}
      <section id="detalhes" className="clean-section reveal-on-scroll">
        <div className="text-grid">
          <div>
            <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '1.5rem', lineHeight: 1.2 }}>Uma Aeronave de Treinamento Tático e Ataque Leve Provada em Missões.</h2>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
              O A-29 Super Tucano é uma aeronave militar turboélice desenvolvida pela Embraer para missões de ataque leve, reconhecimento e treinamento avançado de pilotos. O EMB-314 (seu designador de fábrica) evoluiu a partir do clássico EMB-312 Tucano, realizando o seu voo inaugural em 1999 e entrando em serviço oficial em 2003.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.8, textAlign: 'justify' }}>
              Na Esquadrilha da Fumaça Virtual (EDAFS), exigimos um vetor capaz de suportar as acrobacias High-G com estabilidade impecável em voo de ala. A recriação da RP Simulations entrega exatamente esta precisão térmica, aerodinâmica e de sistemas no ambiente do MSFS.
            </p>
          </div>
        </div>
      </section>

      {/* IMAGEM DE DESTAQUE LARGE */}
      <section className="reveal-on-scroll" style={{ padding: '0 2rem', maxWidth: '1400px', margin: '0 auto 6rem auto' }}>
        <img src={a29Feature} alt="A-29 Super Tucano EDAFS" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} />
      </section>

      {/* 3. DESTAQUES DO ADD-ON (FEATURES LIST) */}
      <section className="clean-section reveal-on-scroll" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '3rem' }}>Recursos da Simulação</h2>
        <ul className="feature-list">
          <li className="feature-item">
            <span className="feature-title">Cockpit e Exterior</span>
            <p className="feature-desc">Modelagem customizada altamente detalhada. Inclui texturas PBR de alta resolução, múltiplas pinturas operacionais e de demonstração, além de componentes animados (speed brake, trem de pouso, flaps e canopy).</p>
          </li>
          <li className="feature-item">
            <span className="feature-title">Glass Cockpit Avançado</span>
            <p className="feature-desc">Telas multifuncionais customizadas, Head-Up Display (HUD), UFCP, EICAS e ADHSI funcionais. O cockpit também suporta as posições de pilotagem dianteira e traseira com iluminação regulável.</p>
          </li>
          <li className="feature-item">
            <span className="feature-title">Fumaça de Demonstração</span>
            <p className="feature-desc">Efeito visual de fumaça implementado especificamente para as variantes de demonstração (ativado via comando de <em>Logo Light</em>), permitindo operações precisas em apresentações da EDAFS.</p>
          </li>
          <li className="feature-item">
            <span className="feature-title">Gestão e Sistemas</span>
            <p className="feature-desc">Sistema de gerenciamento de itens externos (SMS) para tanques de combustível configuráveis. Inclui lógica funcional de transferência de combustível com intertravamento para o tanque central.</p>
          </li>
        </ul>
      </section>

      {/* 4. ESPECIFICAÇÕES TÉCNICAS (TABELA LIMPA) */}
      <section className="clean-section reveal-on-scroll" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-grid" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '1.5rem' }}>Especificações</h2>
            <img src={a29Specs} alt="Planta A-29" style={{ width: '100%', maxWidth: '300px', opacity: 0.8 }} />
          </div>
          <div>
            <table className="spec-table">
              <tbody>
                <tr>
                  <td className="spec-label">Motorização</td>
                  <td className="spec-value">Pratt & Whitney PT6A-68C (1.600 shp)</td>
                </tr>
                <tr>
                  <td className="spec-label">Velocidade de Cruzeiro</td>
                  <td className="spec-value">280 KT</td>
                </tr>
                <tr>
                  <td className="spec-label">Comprimento</td>
                  <td className="spec-value">37 ft 4 in</td>
                </tr>
                <tr>
                  <td className="spec-label">Envergadura</td>
                  <td className="spec-value">36 ft 6 in</td>
                </tr>
                <tr>
                  <td className="spec-label">Peso Vazio</td>
                  <td className="spec-value">7.055 lb</td>
                </tr>
                <tr>
                  <td className="spec-label">Teto Operacional</td>
                  <td className="spec-value">35.000 pés</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. DISCLAIMER MILITAR */}
      <section className="clean-section reveal-on-scroll" style={{ paddingBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Aviso Legal (Disclaimer)</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, textAlign: 'justify' }}>
            O A-29 Super Tucano é uma aeronave militar em atividade. Informações técnicas detalhadas sobre sistemas de guerra eletrônica, sensores, autoproteção e armamentos são restritas ou confidenciais. Por este motivo, este produto não se destina a ser uma reprodução *study-level* de todos os sistemas de combate da vida real. O desenvolvimento baseou-se em dados de domínio público para fins exclusivos de simulação e entretenimento civil. Utilize o Modelo de Voo MODERN no simulador.
          </p>
        </div>
      </section>

      {/* FOOTER EXISTENTE */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto' }}>
        <Footer hasNoticias={false} onOpenLegal={() => {}} />
      </div>
    </div>
  );
}