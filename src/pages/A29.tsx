"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, GitCommit, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

import '../App.css';

import rpLogo from '../images/rp.png';
import heroImg from '../images/5.png';
import a29Feature from '../images/tucano8.png';
import a29Specs from '../images/tucano8.png';

const RP_DISCORD_URL = "https://discord.gg/nFkEd8vpHs";

const FALLBACK_RELEASE = {
  version: "v1.2.0",
  releaseDate: "05/11/2026",
  patchNotes: [
    "Compatibilidade e otimização de performance para o Microsoft Flight Simulator 2024.",
    "Ajuste fino de resposta do turboélice PT6A-68C em manobras acrobáticas.",
    "Aprimoramento visual na dispersão da fumaça para voos de demonstração.",
    "Revisão na lógica de transferência dos tanques externos e freio aerodinâmico.",
    "Calibragem de brilho nos painéis MFD, UFCP e HUD em voos noturnos."
  ]
};

interface ReleaseData {
  version: string;
  releaseDate: string;
  patchNotes: string[];
  updatedAt?: string;
  updatedBy?: string;
}

const DiscordIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.098.246.198.373.292a.077.077 0 01-.007.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.031-.029zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function A29Page() {
  const navigate = useNavigate();
  const [release, setRelease] = useState<ReleaseData>(FALLBACK_RELEASE);
  const [loadingRelease, setLoadingRelease] = useState(true);

  useEffect(() => {
    document.title = "A-29 Super Tucano | RP Simulations";
    document.documentElement.setAttribute('data-theme', 'dark');

    const unsubA29 = onSnapshot(
      doc(db, 'config', 'a29'),
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setRelease({
            version: typeof d.version === 'string' && d.version.trim() ? d.version.trim() : FALLBACK_RELEASE.version,
            releaseDate: typeof d.releaseDate === 'string' && d.releaseDate.trim() ? d.releaseDate.trim() : FALLBACK_RELEASE.releaseDate,
            patchNotes:
              Array.isArray(d.patchNotes) && d.patchNotes.filter(Boolean).length > 0
                ? d.patchNotes.map((n: unknown) => String(n).trim()).filter(Boolean)
                : FALLBACK_RELEASE.patchNotes,
            updatedAt: d.updatedAt || undefined,
            updatedBy: d.updatedBy || undefined,
          });
        }
        setLoadingRelease(false);
      },
      (err) => {
        console.error("Erro ao sincronizar config/a29:", err);
        setLoadingRelease(false);
      }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      unsubA29();
      observer.disconnect();
    };
  }, []);

  const formatSyncTime = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div id="top" style={{ backgroundColor: '#030712', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', paddingBottom: '4rem' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); }
        @font-face { font-family: 'StratumNo2'; src: url('/fonts/stratumno2_regular.otf') format('opentype'); }
        @font-face { font-family: 'PosicaoFont'; src: url('/fonts/posicao.otf') format('opentype'); }

        * { font-family: 'Regular', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Comum', sans-serif; margin: 0; }

        body, html {
          background: #030712 !important; max-width: 100vw; overflow-x: hidden; scroll-behavior: smooth; color: #e2e8f0;
        }

        .reveal-on-scroll { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }

        .back-floating-btn {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          z-index: 60;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          padding: 0.6rem 1.15rem;
          border-radius: 999px;
          font-size: 0.82rem;
          font-family: 'Comum', sans-serif;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-floating-btn:hover {
          background: rgba(14, 165, 233, 0.18);
          border-color: #38bdf8;
          color: #38bdf8;
        }

        .title-gradient {
          font-family: 'StratumNo2', sans-serif !important;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 48%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 12px 28px rgba(14, 165, 233, 0.25));
        }

        .title-hollow-bg {
          font-family: 'StratumNo2', sans-serif !important;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(56, 189, 248, 0.15);
          user-select: none;
          pointer-events: none;
          letter-spacing: 0.08em;
          line-height: 0.85;
          white-space: nowrap;
        }

        .overline-glow {
          font-family: 'Comum', sans-serif;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          font-size: 0.78rem;
          text-shadow: 0 0 18px rgba(56, 189, 248, 0.55);
        }

        .anamorphic-line {
          width: 100%;
          max-width: 520px;
          height: 2px;
          margin: 1.4rem auto;
          background: linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.65) 35%, #ffffff 50%, rgba(56,189,248,0.65) 65%, transparent 100%);
          box-shadow: 0 0 18px rgba(56, 189, 248, 0.65);
        }

        .section-wrap {
          padding: 4rem 2rem;
          max-width: 1180px;
          margin: 0 auto;
          width: 100%;
        }

        .hud-stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
        }
        .hud-stat-cell {
          background: rgba(9, 14, 26, 0.92);
          padding: 1.6rem 1.25rem;
          text-align: center;
        }
        .hud-stat-val {
          font-family: 'StratumNo2', sans-serif;
          font-size: 2.1rem;
          background: linear-gradient(90deg, #ffffff 0%, #7dd3fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          line-height: 1.05;
        }
        .hud-stat-lbl {
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-top: 0.35rem;
          display: block;
          font-weight: 600;
        }

        .feature-grid-4 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .feature-box {
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1.6rem;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .feature-box:hover {
          border-color: rgba(56, 189, 248, 0.35);
          transform: translateY(-3px);
        }
        .feature-num {
          font-family: 'StratumNo2', sans-serif;
          font-size: 0.9rem;
          color: #0ea5e9;
          letter-spacing: 0.12em;
          display: block;
          margin-bottom: 0.35rem;
        }

        .patch-card {
          background: linear-gradient(160deg, rgba(15, 23, 42, 0.72) 0%, rgba(7, 11, 22, 0.9) 100%);
          border: 1px solid rgba(56, 189, 248, 0.22);
          border-radius: 18px;
          padding: 2.2rem;
          position: relative;
          overflow: hidden;
        }
        .patch-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 1.4rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .patch-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(14, 165, 233, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.38);
          color: #7dd3fc;
          padding: 0.42rem 0.9rem;
          border-radius: 999px;
          font-family: 'StratumNo2', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
        }
        .patch-date {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #94a3b8;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.42rem 0.9rem;
          border-radius: 999px;
        }
        .patch-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .patch-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: #cbd5e1;
          font-size: 0.94rem;
          line-height: 1.55;
        }

        .spec-split {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 3rem;
          align-items: center;
        }
        .spec-table { width: 100%; border-collapse: collapse; }
        .spec-table tr { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .spec-table td { padding: 1.05rem 0; }
        .spec-label { color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .spec-value { color: #f8fafc; font-family: 'StratumNo2', monospace; font-size: 1.15rem; letter-spacing: 0.04em; text-align: right; }

        .btn-discord {
          background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
          color: #ffffff;
          padding: 0.95rem 2.2rem;
          border-radius: 10px;
          border: none;
          font-family: 'Comum', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          box-shadow: 0 10px 28px rgba(14, 165, 233, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-discord:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(14, 165, 233, 0.5);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.04);
          color: #f8fafc;
          padding: 0.95rem 2rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.16);
          font-family: 'Comum', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover { border-color: #38bdf8; color: #38bdf8; }

        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spinSlow 1.2s linear infinite; }

        @media (max-width: 900px) {
          .back-floating-btn { top: 1rem; left: 1rem; padding: 0.5rem 0.9rem; font-size: 0.76rem; }
          .hud-stats-bar { grid-template-columns: repeat(2, 1fr); }
          .feature-grid-4, .spec-split { grid-template-columns: 1fr; gap: 1.5rem; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions a { width: 100%; }
          .patch-card { padding: 1.5rem; }
        }
      `}</style>

      

      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.42,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="title-hollow-bg"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -54%)', fontSize: 'clamp(7rem, 22vw, 21rem)', zIndex: 2 }}
        >
          EMB-314
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '920px', width: '100%', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.2rem' }}>
            <img
              src={rpLogo}
              alt="RP Simulations"
              style={{
                height: '76px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.65))',
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <span className="overline-glow"> {release.version}</span>

          <h1 className="title-gradient" style={{ fontSize: 'clamp(2.9rem, 6.8vw, 5.6rem)', lineHeight: 0.98, margin: '0.6rem 0 0', letterSpacing: '0.03em' }}>
            A-29 SUPER TUCANO
          </h1>

          <div className="anamorphic-line" />

          <p style={{ fontSize: '1.08rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 auto 2.4rem', maxWidth: '640px' }}>
            Aeronave desenvolvida pela <strong>RP Simulations</strong> e utilizada nas demonstrações da Esquadrilha da Fumaça Virtual. Disponível diretamente no <strong>Marketplace oficial do simulador</strong>.
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center' }}>
            <a href={RP_DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-discord">
              <DiscordIcon />RP Simulations
            </a>
            <a href="#atualizacoes" className="btn-ghost">
              Patch Notes ({release.version})
            </a>
          </div>
        </div>
      </section>

      {/* 2. MÉTRICAS RÁPIDAS */}
      <section className="section-wrap reveal-on-scroll" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
        <div className="hud-stats-bar">
          <div className="hud-stat-cell">
            <span className="hud-stat-val">1.600 SHP</span>
            <span className="hud-stat-lbl">Pratt & Whitney PT6A-68C</span>
          </div>
          <div className="hud-stat-cell">
            <span className="hud-stat-val">280 KT</span>
            <span className="hud-stat-lbl">Velocidade de Cruzeiro</span>
          </div>
          <div className="hud-stat-cell">
            <span className="hud-stat-val">+7G / -3.5G</span>
            <span className="hud-stat-lbl">Envelope Acrobático</span>
          </div>
          <div className="hud-stat-cell">
            <span className="hud-stat-val">35.000 FT</span>
            <span className="hud-stat-lbl">Teto Operacional</span>
          </div>
        </div>
      </section>

      
      <section id="atualizacoes" className="section-wrap reveal-on-scroll">
        <div className="patch-card" style={{ opacity: loadingRelease ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
          <div className="patch-header">
            <div>
              <span className="overline-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Registro de Alterações
                {loadingRelease && <RefreshCw size={12} className="spin-icon" />}
              </span>
              <h2 className="title-gradient" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', marginTop: '0.35rem' }}>
                VERSÃO & PATCH NOTES
              </h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
              <span className="patch-badge">
                <GitCommit size={16} /> {release.version}
              </span>
              <span className="patch-date">
                <Calendar size={15} color="#38bdf8" /> {release.releaseDate}
              </span>
            </div>
          </div>

          <ul className="patch-list">
            {release.patchNotes.map((nota, idx) => (
              <li key={`${idx}-${nota.slice(0, 12)}`} className="patch-item">
                <CheckCircle2 size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{nota}</span>
              </li>
            ))}
          </ul>

          {formatSyncTime(release.updatedAt) && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
              Atualizado no painel oficial em {formatSyncTime(release.updatedAt)}
            </div>
          )}
        </div>
      </section>

      <section className="section-wrap reveal-on-scroll">
        <div style={{ marginBottom: '2.5rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={a29Feature} alt="A-29 Super Tucano em voo" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <span className="overline-glow">Recursos da Aeronave</span>
          <h2 className="title-gradient" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)', marginTop: '0.4rem' }}>
            PRECISÃO PARA VOO EM FORMAÇÃO
          </h2>
        </div>

        <div className="feature-grid-4">
          <div className="feature-box">
            <span className="feature-num">01 // MODELAGEM PBR</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.45rem' }}>Exterior & Cabine Dupla</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Acabamento externo em alta resolução, pilotagem dianteira e traseira, pinturas operacionais e de demonstração com superfícies totalmente animadas.
            </p>
          </div>

          <div className="feature-box">
            <span className="feature-num">02 // GLASS COCKPIT</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.45rem' }}>HUD, UFCP & MFDs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Aviônica digital dedicada com EICAS, ADHSI, gerenciamento de navegação acoplado ao piloto automático e ajuste independente de iluminação interna.
            </p>
          </div>

          <div className="feature-box">
            <span className="feature-num">03 // DEMONSTRAÇÃO AÉREA</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.45rem' }}>Gerador de Fumaça</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Traço de fumaça exclusivo para exibições aéreas (acionado pelo atalho de <em>Logo Light</em>) e envelope aerodinâmico ajustado para o modelo de voo moderno.
            </p>
          </div>

          <div className="feature-box">
            <span className="feature-num">04 // SISTEMAS INTERNOS</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.45rem' }}>Cargas & Combustível</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Gerenciamento de tanques externos nos pilones com rotina real de transferência de combustível e bloqueio de segurança no tanque central.
            </p>
          </div>
        </div>
      </section>

      <section id="ficha" className="section-wrap reveal-on-scroll" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="spec-split">
          <div style={{ textAlign: 'center' }}>
            <img src={a29Specs} alt="Planta A-29 Super Tucano" style={{ width: '100%', maxWidth: '290px', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.75))' }} />
          </div>

          <div>
            <span className="overline-glow">Ficha Técnica</span>
            <h2 className="title-gradient" style={{ fontSize: '2.2rem', margin: '0.35rem 0 1.5rem' }}>
              ESPECIFICAÇÕES
            </h2>

            <table className="spec-table">
              <tbody>
                <tr>
                  <td className="spec-label">Desenvolvedor</td>
                  <td className="spec-value" style={{ color: '#38bdf8' }}>RP SIMULATIONS</td>
                </tr>
                <tr>
                  <td className="spec-label">Plataforma</td>
                  <td className="spec-value">MARKETPLACE MSFS 2020 / 2024</td>
                </tr>
                <tr>
                  <td className="spec-label">Dimensões (Comp. / Env.)</td>
                  <td className="spec-value">11,38 m / 11,14 m</td>
                </tr>
                <tr>
                  <td className="spec-label">Peso Vazio</td>
                  <td className="spec-value">3.200 kg (7.055 lb)</td>
                </tr>
                <tr>
                  <td className="spec-label">Razão de Subida</td>
                  <td className="spec-value">3.230 ft/min</td>
                </tr>
              </tbody>
            </table>

            <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, marginTop: '1.25rem' }}>
              * Projeto desenvolvido com base em dados públicos para uso recreativo em simuladores civis.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '3.5rem',
            padding: '2.5rem 2rem',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(15,23,42,0.75) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3 className="title-gradient" style={{ fontSize: '1.75rem' }}>ACOMPANHE A RP SIMULATIONS</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.35rem 0 0' }}>
              Suporte oficial, avisos de novas versões e comunidade no Discord.
            </p>
          </div>
          <a href={RP_DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-discord">
            <DiscordIcon /> Entrar no Discord Oficial
          </a>
        </div>
      </section>
    </div>
  );
}