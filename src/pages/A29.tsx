"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { GitCommit, Calendar, CheckCircle2, RefreshCw, Shield, Gauge, Cpu, Flame, Lock, Globe } from 'lucide-react';

import '../App.css';

import rpLogo from '../images/rp.png';
import heroImg from '../images/tucano8.png';
import a29Feature from '../images/tucano10.png';
import a29SpecsImg from '../images/a29.png';
import socialCoverImg from '../images/1.jpg';

const RP_DISCORD_URL = "https://discord.gg/nFkEd8vpHs";
const PAGE_TITLE = "RP Simulation | A-29";
const PAGE_DESCRIPTION = "Conheça o A-29 Super Tucano oficial da RP Simulation para Microsoft Flight Simulator 2020 e 2024. Aviônica completa, modelo de voo avançado, especificações e notas de atualização.";

interface ReleaseData {
  version: string;
  releaseDate: string;
  patchNotes: string[];
  updatedAt?: string;
}

const DiscordIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.098.246.198.373.292a.077.077 0 01-.007.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.031-.029zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function A29Page() {
  const navigate = useNavigate();
  const [release, setRelease] = useState<ReleaseData>({
    version: "v1.0.0",
    releaseDate: "--/--/----",
    patchNotes: [],
  });
  const [loadingRelease, setLoadingRelease] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('lang', 'pt-BR');

    const origin = window.location.origin;
    const canonicalUrl = `${origin}/a29`;
    const absoluteCoverUrl = socialCoverImg.startsWith('http')
      ? socialCoverImg
      : `${origin}${socialCoverImg.startsWith('/') ? '' : '/'}${socialCoverImg}`;

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', PAGE_DESCRIPTION);
    upsertMeta('name', 'keywords', 'RP Simulation, RP Simulations, A-29 Super Tucano, EMB-314, MSFS 2020, MSFS 2024, Microsoft Flight Simulator, Add-on A-29, Tucano simulador');
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('name', 'author', 'RP Simulation');
    upsertMeta('name', 'theme-color', '#0ea5e9');

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'RP Simulation');
    upsertMeta('property', 'og:title', PAGE_TITLE);
    upsertMeta('property', 'og:description', PAGE_DESCRIPTION);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', absoluteCoverUrl);
    upsertMeta('property', 'og:image:alt', 'RP Simulation | A-29 Super Tucano');
    upsertMeta('property', 'og:locale', 'pt_BR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', PAGE_TITLE);
    upsertMeta('name', 'twitter:description', PAGE_DESCRIPTION);
    upsertMeta('name', 'twitter:image', absoluteCoverUrl);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    const jsonLdId = 'rp-sim-a29-jsonld';
    let scriptLd = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!scriptLd) {
      scriptLd = document.createElement('script');
      scriptLd.id = jsonLdId;
      scriptLd.type = 'application/ld+json';
      document.head.appendChild(scriptLd);
    }
    scriptLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "RP Simulation | A-29 Super Tucano",
      "operatingSystem": "Windows, Xbox",
      "applicationCategory": "GameApplication",
      "description": PAGE_DESCRIPTION,
      "image": absoluteCoverUrl,
      "url": canonicalUrl,
      "author": {
        "@type": "Organization",
        "name": "RP Simulation",
        "sameAs": [RP_DISCORD_URL]
      }
    });

    const unsubA29 = onSnapshot(
      doc(db, 'config', 'a29'),
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setRelease({
            version: typeof d.version === 'string' && d.version.trim() ? d.version.trim() : "v1.0.0",
            releaseDate: typeof d.releaseDate === 'string' && d.releaseDate.trim() ? d.releaseDate.trim() : "--/--/----",
            patchNotes: Array.isArray(d.patchNotes)
              ? d.patchNotes.map((n: unknown) => String(n).trim()).filter(Boolean)
              : [],
            updatedAt: d.updatedAt || undefined,
          });
        }
        setLoadingRelease(false);
      },
      () => {
        setLoadingRelease(false);
      }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
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

  const roadmapItems = [
    { code: 'PRJ // 01', status: 'progress' },
    { code: 'PRJ // 02', status: 'classified' },
    { code: 'PRJ // 03', status: 'classified' },
    { code: 'PRJ // 04', status: 'classified' },
  ];

  return (
    <main id="top" className="a29-page-root">
      <style>{`
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }

        html, body {
          background: #07090e !important;
          max-width: 100vw;
          overflow-x: hidden;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #0ea5e9 #0a0d14;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0d14;
          border-left: 1px solid rgba(255, 255, 255, 0.04);
        }
        ::-webkit-scrollbar-thumb {
          background: #0ea5e9;
          border-radius: 999px;
          border: 2px solid #0a0d14;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #38bdf8;
        }

        .a29-page-root {
          background-color: #07090e;
          background-image:
            radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.09) 0%, transparent 50%),
            linear-gradient(to right, rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
          background-size: 100% 100%, 64px 64px, 64px 64px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          padding-bottom: 4.5rem;
          color: #d4d8e2;
          font-family: 'Regular', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-weight: 400;
        }

        .a29-page-root * {
          box-sizing: border-box;
        }

        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.65s ease-out, transform 0.65s ease-out;
        }
        .reveal-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-title-metallic {
          font-family: 'Comum', system-ui, -apple-system, sans-serif !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 58%, #7dd3fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.9));
          margin: 0;
          white-space: nowrap;
        }

        .section-heading-metallic {
          font-family: 'Comum', system-ui, -apple-system, sans-serif !important;
          font-weight: 500 !important;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ffffff 0%, #e2e8f0 60%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.03em;
          margin: 0;
        }

        .title-hollow-watermark {
          font-family: 'Comum', system-ui, sans-serif !important;
          font-weight: 600;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(56, 189, 248, 0.09);
          user-select: none;
          pointer-events: none;
          letter-spacing: 0.06em;
          line-height: 0.85;
          white-space: nowrap;
        }

        .accent-blue-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.48rem;
          background-color: #0284c7;
          border: 1px solid #38bdf8;
          color: #ffffff;
          padding: 0.46rem 1.05rem;
          border-radius: 999px;
          font-family: 'Comum', system-ui, sans-serif;
          font-weight: 600;
          font-size: 0.86rem;
          letter-spacing: 0.06em;
        }

        .subtle-divider-line {
          width: 100%;
          max-width: 460px;
          height: 1px;
          margin: 1.5rem auto;
          background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.55) 50%, transparent 100%);
        }

        .section-container {
          padding: 3.5rem 2rem;
          max-width: 1180px;
          margin: 0 auto;
          width: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.15rem;
        }
        .stat-card {
          background: rgba(15, 18, 26, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 2px solid #0ea5e9;
          border-radius: 14px;
          padding: 1.55rem 1.25rem;
          text-align: center;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56, 189, 248, 0.4);
        }
        .stat-number {
          font-family: 'Comum', system-ui, sans-serif;
          font-weight: 500;
          font-size: 1.9rem;
          letter-spacing: 0.02em;
          color: #f8fafc;
          display: block;
          line-height: 1.1;
        }
        .stat-caption {
          font-size: 0.76rem;
          color: #8b95a5;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 0.45rem;
          display: block;
          font-weight: 400;
        }

        .patch-panel {
          background: rgba(14, 17, 24, 0.88);
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 20px;
          padding: 2.4rem;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.55);
        }
        .patch-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          padding-bottom: 1.4rem;
          margin-bottom: 1.6rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .patch-notes-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.7rem;
        }
        .patch-note-row {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: rgba(0, 0, 0, 0.32);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.9rem 1.15rem;
          border-radius: 11px;
          color: #d1d5db;
          font-size: 0.94rem;
          font-weight: 400;
          line-height: 1.55;
        }
        .empty-patch-box {
          padding: 2.2rem 1.5rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.28);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #8b95a5;
          font-size: 0.94rem;
          letter-spacing: 0.02em;
        }

        .features-bento {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .bento-card {
          background: rgba(14, 17, 24, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .bento-card:hover {
          border-color: rgba(56, 189, 248, 0.38);
          transform: translateY(-3px);
        }
        .bento-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.28);
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.3rem;
        }

        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.15rem;
        }
        .classified-card {
          position: relative;
          background:
            repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.015),
              rgba(255, 255, 255, 0.015) 10px,
              transparent 10px,
              transparent 20px
            ),
            rgba(12, 15, 22, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          padding: 1.75rem 1.4rem;
          min-height: 170px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .classified-card.active-progress {
          border-color: rgba(14, 165, 233, 0.5);
          box-shadow: 0 14px 36px rgba(14, 165, 233, 0.14);
        }
        .classified-stamp {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Comum', system-ui, sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #64748b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.4);
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          width: fit-content;
        }
        .redacted-bar {
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.07);
          width: 75%;
          margin-top: 0.45rem;
        }

        @keyframes pulseBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .blink-progress {
          animation: pulseBlink 1.35s ease-in-out infinite;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #38bdf8;
          font-family: 'Comum', system-ui, sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .blink-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 12px #0ea5e9;
        }

        .specs-showcase {
          background: rgba(14, 17, 24, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          padding: 2.75rem 2.5rem;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 3rem;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .aircraft-render-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .aircraft-glow-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, transparent 70%);
          filter: blur(18px);
          pointer-events: none;
        }
        .specs-rows {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .spec-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1.15rem;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 11px;
        }
        .spec-row-label {
          color: #8b95a5;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 400;
        }
        .spec-row-val {
          color: #f8fafc;
          font-family: 'Comum', system-ui, sans-serif;
          font-weight: 500;
          font-size: 0.96rem;
          letter-spacing: 0.03em;
          text-align: right;
        }

        .btn-primary-blue {
          background: #0284c7;
          color: #ffffff;
          padding: 0.95rem 2.1rem;
          border-radius: 11px;
          border: 1px solid #38bdf8;
          font-family: 'Comum', system-ui, sans-serif;
          font-weight: 600;
          font-size: 0.92rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          box-shadow: 0 10px 28px rgba(2, 132, 199, 0.35);
          transition: all 0.2s ease;
        }
        .btn-primary-blue:hover {
          background: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(14, 165, 233, 0.45);
        }

        .btn-secondary-outline {
          background: rgba(7, 9, 14, 0.55);
          backdrop-filter: blur(10px);
          color: #f1f5f9;
          padding: 0.95rem 1.9rem;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-family: 'Comum', system-ui, sans-serif;
          font-weight: 500;
          font-size: 0.92rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: all 0.2s ease;
        }
        .btn-secondary-outline:hover {
          border-color: #38bdf8;
          color: #38bdf8;
          background: rgba(14, 165, 233, 0.08);
        }

        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spinSlow 1.2s linear infinite; }

        @media (max-width: 960px) {
          .stats-grid, .roadmap-grid { grid-template-columns: repeat(2, 1fr); }
          .features-bento, .specs-showcase { grid-template-columns: 1fr; gap: 2rem; }
          .specs-showcase { padding: 2rem 1.5rem; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions a, .hero-actions button { width: 100%; }
          .patch-panel { padding: 1.6rem; }
        }

        @media (max-width: 560px) {
          .roadmap-grid { grid-template-columns: 1fr; }
          .hero-title-metallic { white-space: normal; }
        }
      `}</style>

      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0 3.5rem', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.78,
            filter: 'brightness(1.12) contrast(1.05)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(7, 9, 14, 0.12) 0%, rgba(7, 9, 14, 0.74) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="title-hollow-watermark"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -54%)', fontSize: 'clamp(6rem, 20vw, 18rem)', zIndex: 2 }}
        >
          EMB-314
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1040px', width: '100%', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.8rem' }}>
            <img
              src={rpLogo}
              alt="RP Simulation"
              style={{
                height: '84px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.85))',
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <h1 className="hero-title-metallic" style={{ fontSize: 'clamp(1.85rem, 4.3vw, 3.7rem)', lineHeight: 1.08, letterSpacing: '0.03em' }}>
            A-29 SUPER TUCANO
          </h1>

          <div className="subtle-divider-line" />

          <p style={{ fontSize: '1.06rem', color: '#e2e8f0', fontWeight: 400, lineHeight: 1.65, margin: '0 auto 2.4rem', maxWidth: '640px', textShadow: '0 2px 14px rgba(0,0,0,0.85)' }}>
            Projeto oficial desenvolvido pela <span style={{ color: '#ffffff', fontWeight: 500 }}>RP Simulation</span> com fidelidade avançada de sistemas, aviônica e envelope de voo para o Microsoft Flight Simulator. Disponível exclusivamente no Marketplace oficial.
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: '0.95rem', justifyContent: 'center' }}>
            <a href={RP_DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-primary-blue">
              <DiscordIcon /> Discord Oficial
            </a>
            <a href="#atualizacoes" className="btn-secondary-outline">
              Notas da Versão
            </a>
          </div>
        </div>
      </section>

      <section className="section-container reveal-on-scroll" style={{ paddingTop: '0.5rem', paddingBottom: '2.5rem' }}>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">1.600 SHP</span>
            <span className="stat-caption">Pratt & Whitney PT6A-68C</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">280 KT</span>
            <span className="stat-caption">Velocidade de Cruzeiro</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">+7G / -3.5G</span>
            <span className="stat-caption">Envelope Acrobático</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">35.000 FT</span>
            <span className="stat-caption">Teto Operacional</span>
          </div>
        </div>
      </section>

      <section id="atualizacoes" className="section-container reveal-on-scroll">
        <div className="patch-panel" style={{ opacity: loadingRelease ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
          <div className="patch-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 className="section-heading-metallic" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.15rem)' }}>
                VERSÃO & PATCH NOTES
              </h2>
              {loadingRelease && <RefreshCw size={15} color="#38bdf8" className="spin-icon" />}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
              <span className="accent-blue-tag">
                <GitCommit size={15} color="#ffffff" />
                <span>{release.version}</span>
              </span>
              <span className="accent-blue-tag">
                <Calendar size={15} color="#ffffff" />
                <span>{release.releaseDate}</span>
              </span>
            </div>
          </div>

          {release.patchNotes.length === 0 ? (
            <div className="empty-patch-box">
              Esta versão não possui notas públicas.
            </div>
          ) : (
            <ul className="patch-notes-grid">
              {release.patchNotes.map((nota, idx) => (
                <li key={`${idx}-${nota.slice(0, 12)}`} className="patch-note-row">
                  <CheckCircle2 size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{nota}</span>
                </li>
              ))}
            </ul>
          )}

          {formatSyncTime(release.updatedAt) && (
            <div style={{ marginTop: '1.4rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.76rem', color: '#64748b', textAlign: 'right' }}>
              Sincronizado em {formatSyncTime(release.updatedAt)}
            </div>
          )}
        </div>
      </section>

      <section className="section-container reveal-on-scroll">
        <div style={{ marginBottom: '2.8rem', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.09)', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
          <img src={a29Feature} alt="A-29 Super Tucano RP Simulation em voo" style={{ width: '100%', display: 'block', maxHeight: '510px', objectFit: 'cover' }} />
        </div>

        <div style={{ marginBottom: '1.8rem' }}>
          <h2 className="section-heading-metallic" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)' }}>
            RECURSOS DA AERONAVE
          </h2>
        </div>

        <div className="features-bento">
          <div className="bento-card">
            <div className="bento-icon-wrap"><Shield size={19} /></div>
            <h3 style={{ fontSize: '1.12rem', color: '#f8fafc', fontWeight: 500 }}>Exterior PBR & Cabine Tandem</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.93rem', fontWeight: 400, lineHeight: 1.6, margin: 0 }}>
              Modelagem em alta definição com texturas PBR, operação completa nos assentos dianteiro e traseiro, múltiplas pinturas e animações externas fiéis.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-wrap"><Cpu size={19} /></div>
            <h3 style={{ fontSize: '1.12rem', color: '#f8fafc', fontWeight: 500 }}>Glass Cockpit: HUD, UFCP & MFDs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.93rem', fontWeight: 400, lineHeight: 1.6, margin: 0 }}>
              Suíte aviônica digital com EICAS, ADHSI, gerenciamento integrado de navegação com piloto automático e controle independente de iluminação noturna.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-wrap"><Flame size={19} /></div>
            <h3 style={{ fontSize: '1.12rem', color: '#f8fafc', fontWeight: 500 }}>Dinâmica de Voo & Fumaça</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.93rem', fontWeight: 400, lineHeight: 1.6, margin: 0 }}>
              Modelo de voo moderno calibrado para manobras de alto G e gerador de fumaça dedicado nas variantes de exibição aérea (acionado via <em>Logo Light</em>).
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-wrap"><Gauge size={19} /></div>
            <h3 style={{ fontSize: '1.12rem', color: '#f8fafc', fontWeight: 500 }}>Cargas SMS & Combustível</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.93rem', fontWeight: 400, lineHeight: 1.6, margin: 0 }}>
              Configuração dinâmica de tanques subalares nos pilones com lógica real de transferência e intertravamento de segurança do freio aerodinâmico.
            </p>
          </div>
        </div>
      </section>

      <section id="roadmap" className="section-container reveal-on-scroll">
        <div style={{ marginBottom: '1.8rem' }}>
          <h2 className="section-heading-metallic" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)' }}>
            ROADMAP
          </h2>
        </div>

        <div className="roadmap-grid">
          {roadmapItems.map((item) => {
            const isProgress = item.status === 'progress';
            return (
              <div key={item.code} className={`classified-card ${isProgress ? 'active-progress' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.1em' }}>{item.code}</span>
                  <span className="classified-stamp">
                    <Lock size={11} /> Classified
                  </span>
                </div>

                <div style={{ marginTop: '1.6rem' }}>
                  {isProgress ? (
                    <div className="blink-progress">
                      <span className="blink-dot" />
                      EM PROGRESSO...
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'Comum, system-ui, sans-serif', fontSize: '1.05rem', letterSpacing: '0.14em', color: '#475569', textTransform: 'uppercase' }}>
                      [ CLASSIFIED ]
                    </span>
                  )}
                  <div className="redacted-bar" />
                  <div className="redacted-bar" style={{ width: '48%', opacity: 0.5 }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="ficha" className="section-container reveal-on-scroll">
        <div className="specs-showcase">
          <div className="aircraft-render-box">
            <div className="aircraft-glow-orb" />
            <img
              src={a29SpecsImg}
              alt="Ficha técnica A-29 Super Tucano RP Simulation"
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: '480px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 22px 36px rgba(0, 0, 0, 0.85))',
              }}
            />
          </div>

          <div>
            <h2 className="section-heading-metallic" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: '1.4rem' }}>
              FICHA TÉCNICA
            </h2>

            <div className="specs-rows">
              <div className="spec-row-card">
                <span className="spec-row-label">Desenvolvedor</span>
                <span className="spec-row-val" style={{ color: '#38bdf8' }}>RP SIMULATION</span>
              </div>
              <div className="spec-row-card">
                <span className="spec-row-label">Disponibilidade</span>
                <span className="spec-row-val">MARKETPLACE MSFS 2020 / 2024</span>
              </div>
              <div className="spec-row-card">
                <span className="spec-row-label">Comprimento / Envergadura</span>
                <span className="spec-row-val">11,38 m / 11,14 m</span>
              </div>
              <div className="spec-row-card">
                <span className="spec-row-label">Peso Vazio</span>
                <span className="spec-row-val">3.200 kg (7.055 lb)</span>
              </div>
              <div className="spec-row-card">
                <span className="spec-row-label">Razão de Subida</span>
                <span className="spec-row-val">3.230 ft/min</span>
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.55, marginTop: '1.2rem', marginBottom: 0 }}>
              * Projeto desenvolvido com base em dados públicos para uso recreativo em simuladores civis.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '3.25rem',
            padding: '2.4rem 2.25rem',
            borderRadius: '20px',
            background: 'rgba(14, 17, 24, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div>
            <h3 className="section-heading-metallic" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)' }}>
              COMUNIDADE OFICIAL RP SIMULATION
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', fontWeight: 400, margin: '0.4rem 0 0' }}>
              Suporte direto com os desenvolvedores, avisos de atualizações e canal de feedback no Discord.
            </p>
          </div>

          <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <a href={RP_DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-primary-blue">
              <DiscordIcon /> Entrar no Discord Oficial
            </a>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary-outline">
              <Globe size={17} color="#38bdf8" /> Visitar EDAFS
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}