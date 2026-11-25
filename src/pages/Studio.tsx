"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, Plus, Trash2, Layers, Type, Image as ImageIcon,
  Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Grid, Sparkles,
  RotateCcw, Copy, ChevronUp, ChevronDown, Square, Wand2, Keyboard, Sliders, Check
} from 'lucide-react';

import logoEdafs from '../images/logo.png';
import mfLogo from '../images/mf.png';
import mfLogo24 from '../images/mf24.png';

import img1 from '../images/1.png';
import img2 from '../images/2.png';
import img3 from '../images/3.png';
import img4 from '../images/4.png';
import img5 from '../images/5.png';
import img6 from '../images/6.png';
import tucano2 from '../images/tucano2.jpg';
import tucano4 from '../images/tucano4.jpg';
import tucano10 from '../images/tucano10.png';

type PresetKey = 'square' | 'portrait' | 'reels';
type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type MobileTab = 'bg' | 'overlays' | 'elements' | 'inspector' | 'layers' | 'templates';

interface FormatPreset {
  label: string;
  shortLabel: string;
  sub: string;
  width: number;
  height: number;
}

const PRESETS: Record<PresetKey, FormatPreset> = {
  square: { label: 'Feed Quadrado', shortLabel: '1:1', sub: '1080 × 1080', width: 1080, height: 1080 },
  portrait: { label: 'Feed Retrato', shortLabel: '4:5', sub: '1080 × 1350', width: 1080, height: 1350 },
  reels: { label: 'Capa Reels / Story', shortLabel: '9:16', sub: '1080 × 1920', width: 1080, height: 1920 },
};

interface StudioLayer {
  id: string;
  type: 'text' | 'sticker' | 'glass';
  name: string;
  visible: boolean;
  x: number;
  y: number;
  opacity?: number;
  borderRadius?: number;

  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  useGradient?: boolean;
  color2?: string;
  gradientAngle?: number;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowOffsetY?: number;
  strokeWidth?: number;
  strokeColor?: string;
  glow?: boolean;
  glowColor?: string;
  glowBlur?: number;
  textBgGlass?: boolean;
  textBgPadding?: number;
  textBgRadius?: number;

  src?: string;
  scale?: number;
  stickerBorder?: number;
  stickerBorderColor?: string;

  boxWidth?: number;
  boxHeight?: number;
  glassBlur?: number;
  glassTint?: string;
  glassOpacity?: number;
  glassBorderOpacity?: number;
}

interface HitBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type DragAction =
  | { mode: 'layer'; id: string; startPctX: number; startPctY: number; origX: number; origY: number }
  | { mode: 'bg'; startPctX: number; startPctY: number; origX: number; origY: number }
  | {
      mode: 'resize';
      id: string;
      layerType: StudioLayer['type'];
      handle: HandleId;
      startPxX: number;
      startPxY: number;
      origBox: HitBox;
      origLayer: StudioLayer;
    };

const GALLERY_PRESETS = [
  { name: 'Formação 01', src: img5 },
  { name: 'Formação 02', src: img2 },
  { name: 'Acrobacia 01', src: img1 },
  { name: 'Acrobacia 02', src: img3 },
  { name: 'Voo Dorso', src: img4 },
  { name: 'Passagem Baixa', src: img6 },
  { name: 'A-29 Tático', src: tucano4 },
  { name: 'A-29 Detalhe', src: tucano10 },
  { name: 'Esquadrilha', src: tucano2 },
];

const FONT_OPTIONS = [
  { value: 'StratumNo2', label: 'Stratum (Tática)', fontPreview: 'StratumNo2' },
  { value: 'Comum', label: 'Comum (Títulos)', fontPreview: 'Comum' },
  { value: 'Regular', label: 'Regular (Corpo)', fontPreview: 'Regular' },
  { value: 'PosicaoFont', label: 'Posição (Números)', fontPreview: 'PosicaoFont' },
];

const QUALITY_OPTIONS = [
  { value: '2', label: 'Ultra HD 2x (Máxima)' },
  { value: '1', label: 'Original 1x (1080p)' },
];

const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

const getHandlePositions = (b: HitBox): Record<HandleId, { x: number; y: number }> => ({
  nw: { x: b.x, y: b.y },
  n: { x: b.x + b.w / 2, y: b.y },
  ne: { x: b.x + b.w, y: b.y },
  e: { x: b.x + b.w, y: b.y + b.h / 2 },
  se: { x: b.x + b.w, y: b.y + b.h },
  s: { x: b.x + b.w / 2, y: b.y + b.h },
  sw: { x: b.x, y: b.y + b.h },
  w: { x: b.x, y: b.y + b.h / 2 },
});

const drawRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = (hex || '#0f172a').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0');
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PrettySlider = ({
  label,
  valueDisplay,
  value,
  min,
  max,
  step = 1,
  onChange,
  accent = '#0ea5e9',
}: {
  label: string;
  valueDisplay: string | number;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: string;
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.36rem' }}>
      <div className="studio-label" style={{ marginBottom: 0 }}>
        <span>{label}</span>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{valueDisplay}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="pretty-range"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, #38bdf8 ${pct}%, rgba(255,255,255,0.09) ${pct}%, rgba(255,255,255,0.09) 100%)`,
        }}
      />
    </div>
  );
};

const StudioToggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.48rem 0.7rem',
      borderRadius: '11px',
      background: checked ? 'rgba(14, 165, 233, 0.12)' : 'rgba(0,0,0,0.25)',
      border: checked ? '1px solid rgba(14, 165, 233, 0.38)' : '1px solid rgba(255,255,255,0.07)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
    }}
  >
    <span style={{ fontSize: '0.78rem', color: checked ? '#f8fafc' : '#cbd5e1', fontWeight: 500 }}>{label}</span>
    <div
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '999px',
        background: checked ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255,255,255,0.14)',
        position: 'relative',
        transition: 'background 0.25s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#ffffff',
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          transition: 'left 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.45)',
        }}
      />
    </div>
  </div>
);

const StudioSelect = ({
  value,
  options,
  onChange,
  compact = false,
}: {
  value: string;
  options: { value: string; label: string; fontPreview?: string }[];
  onChange: (val: string) => void;
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: compact ? 'auto' : '100%', zIndex: open ? 80 : 1 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.78)',
          border: open ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.12)',
          color: '#f8fafc',
          padding: compact ? '0.45rem 0.7rem' : '0.55rem 0.75rem',
          borderRadius: '10px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          boxShadow: open ? '0 0 0 3px rgba(14,165,233,0.18)' : 'none',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: current?.fontPreview ? `"${current.fontPreview}", sans-serif` : 'inherit',
          }}
        >
          {current?.label}
        </span>
        <ChevronDown
          size={14}
          color="#94a3b8"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '175px',
            background: 'rgba(11, 15, 25, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(14, 165, 233, 0.35)',
            borderRadius: '12px',
            padding: '0.35rem',
            boxShadow: '0 16px 36px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {options.map((opt) => {
            const isSel = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  background: isSel ? 'rgba(14, 165, 233, 0.18)' : 'transparent',
                  border: 'none',
                  color: isSel ? '#38bdf8' : '#e2e8f0',
                  padding: '0.52rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: opt.fontPreview ? `"${opt.fontPreview}", sans-serif` : 'inherit',
                }}
              >
                <span>{opt.label}</span>
                {isSel && <Check size={13} color="#38bdf8" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ColorPill = ({
  label,
  color,
  onChange,
}: {
  label?: string;
  color: string;
  onChange: (hex: string) => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', flex: 1 }}>
    {label && <span className="studio-label" style={{ marginBottom: 0 }}>{label}</span>}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '0.3rem 0.55rem 0.3rem 0.35rem',
      }}
    >
      <label
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '7px',
          background: color,
          border: '1px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </label>
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f8fafc',
          fontSize: '0.76rem',
          fontFamily: 'monospace',
          width: '100%',
          outline: 'none',
          textTransform: 'uppercase',
        }}
      />
    </div>
  </div>
);

export default function Studio() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artboardWrapRef = useRef<HTMLDivElement | null>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bgCompositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noisePatternRef = useRef<CanvasPattern | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const layerBoundsRef = useRef<Record<string, HitBox>>({});

  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 960 : false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('inspector');

  const [preset, setPreset] = useState<PresetKey>('reels');
  const [exportScale, setExportScale] = useState<string>('2');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [bgSrc, setBgSrc] = useState<string>(img5);
  const [bgBaseColor, setBgBaseColor] = useState<string>('#030712');
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [bgScale, setBgScale] = useState<number>(1.05);
  const [bgOffsetX, setBgOffsetX] = useState<number>(0);
  const [bgOffsetY, setBgOffsetY] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(100);
  const [bgContrast, setBgContrast] = useState<number>(105);
  const [bgSaturation, setBgSaturation] = useState<number>(105);
  const [artboardRadius, setArtboardRadius] = useState<number>(0);

  const [bottomShadow, setBottomShadow] = useState<number>(85);
  const [bottomShadowHeight, setBottomShadowHeight] = useState<number>(55);
  const [topGradient, setTopGradient] = useState<number>(40);
  const [radialVignette, setRadialVignette] = useState<number>(45);
  const [gradOverlayOpacity, setGradOverlayOpacity] = useState<number>(22);
  const [gradColorA, setGradColorA] = useState<string>('#0ea5e9');
  const [gradColorB, setGradColorB] = useState<string>('#020617');
  const [gradAngle, setGradAngle] = useState<number>(135);
  const [scanlines, setScanlines] = useState<number>(0);
  const [filmGrain, setFilmGrain] = useState<number>(12);

  const [showSafeGuides, setShowSafeGuides] = useState<boolean>(true);
  const [isDropHover, setIsDropHover] = useState<boolean>(false);
  const [hoverCursor, setHoverCursor] = useState<string>('default');

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [artboardDisplaySize, setArtboardDisplaySize] = useState<{ w: number; h: number }>({ w: 540, h: 960 });

  const [layers, setLayers] = useState<StudioLayer[]>([
    {
      id: 'logo-edafs',
      type: 'sticker',
      name: 'Brasão EDAFS',
      visible: true,
      x: 50,
      y: 14,
      src: logoEdafs,
      scale: 0.44,
      borderRadius: 0,
      stickerBorder: 0,
      stickerBorderColor: '#ffffff',
      shadow: true,
      shadowOpacity: 45,
      shadowBlur: 32,
      shadowOffsetY: 6,
      opacity: 100,
    },
    {
      id: 'glass-card-main',
      type: 'glass',
      name: 'Card Glassmorphism',
      visible: true,
      x: 50,
      y: 79,
      boxWidth: 86,
      boxHeight: 24,
      borderRadius: 36,
      glassBlur: 18,
      glassTint: '#0f172a',
      glassOpacity: 42,
      glassBorderOpacity: 38,
      opacity: 100,
    },
    {
      id: 'tag-overline',
      type: 'text',
      name: 'Tag Superior',
      visible: true,
      x: 50,
      y: 71,
      text: 'AGENDA OFICIAL • MSFS',
      fontFamily: 'Comum',
      fontSize: 30,
      color: '#38bdf8',
      useGradient: false,
      color2: '#0ea5e9',
      gradientAngle: 90,
      align: 'center',
      uppercase: true,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 16,
      shadowOffsetY: 4,
      letterSpacing: 6,
      lineHeight: 1.15,
      textBgRadius: 20,
      opacity: 100,
    },
    {
      id: 'main-title',
      type: 'text',
      name: 'Título Principal',
      visible: true,
      x: 50,
      y: 78.5,
      text: 'DEMONSTRAÇÃO\nAÉREA',
      fontFamily: 'StratumNo2',
      fontSize: 92,
      color: '#ffffff',
      useGradient: true,
      color2: '#cbd5e1',
      gradientAngle: 180,
      align: 'center',
      uppercase: true,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 28,
      shadowOffsetY: 10,
      letterSpacing: 2,
      lineHeight: 1.05,
      textBgRadius: 24,
      opacity: 100,
    },
    {
      id: 'sub-info',
      type: 'text',
      name: 'Data e Local',
      visible: true,
      x: 50,
      y: 87.5,
      text: 'DOMINGO • 16H00Z • PIRASSUNUNGA (SBYS)',
      fontFamily: 'Regular',
      fontSize: 27,
      color: '#fde047',
      useGradient: false,
      color2: '#f59e0b',
      gradientAngle: 90,
      align: 'center',
      uppercase: true,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 14,
      shadowOffsetY: 4,
      letterSpacing: 3,
      lineHeight: 1.2,
      textBgRadius: 999,
      opacity: 100,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('main-title');
  const [activeLeftTab, setActiveLeftTab] = useState<'bg' | 'overlays' | 'elements' | 'templates'>('bg');
  const [dragState, setDragState] = useState<DragAction | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedId) || null;
  const editingLayer = layers.find((l) => l.id === editingTextId && l.type === 'text') || null;
  const currentSpec = PRESETS[preset];

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 960);
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setArtboardDisplaySize({ w: rect.width, h: rect.height });
      }
    };
    onResize();
    const obs = new ResizeObserver(onResize);
    if (artboardWrapRef.current) obs.observe(artboardWrapRef.current);
    window.addEventListener('resize', onResize);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [preset]);

  useEffect(() => {
    if (editingTextId && inlineTextareaRef.current) {
      const el = inlineTextareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editingTextId]);

  const getNoisePattern = (ctx: CanvasRenderingContext2D) => {
    if (noisePatternRef.current) return noisePatternRef.current;
    const nCanvas = document.createElement('canvas');
    nCanvas.width = 140;
    nCanvas.height = 140;
    const nCtx = nCanvas.getContext('2d');
    if (nCtx) {
      const imgData = nCtx.createImageData(140, 140);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.random() * 255;
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = 255;
      }
      nCtx.putImageData(imgData, 0, 0);
      noisePatternRef.current = ctx.createPattern(nCanvas, 'repeat');
    }
    return noisePatternRef.current;
  };

  const loadImg = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCache.current[src] && imageCache.current[src].complete) {
        resolve(imageCache.current[src]);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current[src] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const renderGlassBox = (
    ctx: CanvasRenderingContext2D,
    bgSourceCanvas: HTMLCanvasElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    blurPx: number,
    tintHex: string,
    tintAlpha: number,
    borderAlpha: number,
    resMultiplier = 1
  ) => {
    ctx.save();
    drawRoundedRectPath(ctx, x, y, w, h, radius);
    ctx.clip();

    if (blurPx > 0) {
      ctx.filter = `blur(${blurPx * resMultiplier}px)`;
      const pad = 24 * resMultiplier;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bgSourceCanvas, -pad, -pad, bgSourceCanvas.width + pad * 2, bgSourceCanvas.height + pad * 2);
      ctx.restore();
      ctx.filter = 'none';
    }

    ctx.fillStyle = hexToRgba(tintHex, tintAlpha);
    ctx.fillRect(x, y, w, h);

    const sheen = ctx.createLinearGradient(x, y, x + w * 0.8, y + h);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    sheen.addColorStop(0.45, 'rgba(255, 255, 255, 0.04)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h);

    ctx.restore();

    if (borderAlpha > 0) {
      ctx.save();
      drawRoundedRectPath(ctx, x, y, w, h, radius);
      const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      borderGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, borderAlpha * 1.4)})`);
      borderGrad.addColorStop(0.5, `rgba(255, 255, 255, ${borderAlpha * 0.35})`);
      borderGrad.addColorStop(1, `rgba(14, 165, 233, ${borderAlpha * 0.9})`);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawTransformHandles = (ctx: CanvasRenderingContext2D, box: HitBox, mobileTouch: boolean) => {
    ctx.save();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    const handles = getHandlePositions(box);
    const size = mobileTouch ? 26 : 16;
    (Object.keys(handles) as HandleId[]).forEach((hKey) => {
      const pt = handles[hKey];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      drawRoundedRectPath(ctx, pt.x - size / 2, pt.y - size / 2, size, size, 5);
      ctx.fill();
      ctx.stroke();
    });

    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(box.x + box.w / 2, box.y + box.h / 2, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const renderSceneToCanvas = useCallback(
    async (targetCanvas: HTMLCanvasElement, exportMode: boolean, scaleFactor = 1) => {
      const ctx = targetCanvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const W = currentSpec.width;
      const H = currentSpec.height;
      const realW = Math.round(W * scaleFactor);
      const realH = Math.round(H * scaleFactor);

      targetCanvas.width = realW;
      targetCanvas.height = realH;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (!bgCompositeCanvasRef.current) {
        bgCompositeCanvasRef.current = document.createElement('canvas');
      }
      const bgCanvas = bgCompositeCanvasRef.current;
      bgCanvas.width = realW;
      bgCanvas.height = realH;
      const bgCtx = bgCanvas.getContext('2d')!;
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.imageSmoothingQuality = 'high';
      bgCtx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

      bgCtx.fillStyle = bgBaseColor || '#030712';
      bgCtx.fillRect(0, 0, W, H);

      if (bgOpacity > 0) {
        try {
          const bgImg = await loadImg(bgSrc);
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = W / H;
          let drawW = W;
          let drawH = H;

          if (imgRatio > canvasRatio) {
            drawH = H;
            drawW = H * imgRatio;
          } else {
            drawW = W;
            drawH = W / imgRatio;
          }

          drawW *= bgScale;
          drawH *= bgScale;

          const drawX = (W - drawW) / 2 + (bgOffsetX / 100) * W;
          const drawY = (H - drawH) / 2 + (bgOffsetY / 100) * H;

          bgCtx.save();
          bgCtx.globalAlpha = bgOpacity / 100;
          bgCtx.filter = `brightness(${bgBrightness}%) contrast(${bgContrast}%) saturate(${bgSaturation}%)`;
          bgCtx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          bgCtx.restore();
        } catch {}
      }

      if (gradOverlayOpacity > 0) {
        const rad = (gradAngle * Math.PI) / 180;
        const cx = W / 2;
        const cy = H / 2;
        const len = Math.hypot(W, H) / 2;
        const duotone = bgCtx.createLinearGradient(
          cx - Math.cos(rad) * len,
          cy - Math.sin(rad) * len,
          cx + Math.cos(rad) * len,
          cy + Math.sin(rad) * len
        );
        duotone.addColorStop(0, hexToRgba(gradColorA, gradOverlayOpacity / 100));
        duotone.addColorStop(1, hexToRgba(gradColorB, (gradOverlayOpacity / 100) * 0.9));
        bgCtx.fillStyle = duotone;
        bgCtx.fillRect(0, 0, W, H);
      }

      if (radialVignette > 0) {
        const outerR = Math.hypot(W, H) * 0.62;
        const innerR = Math.min(W, H) * 0.22;
        const radGrad = bgCtx.createRadialGradient(W / 2, H / 2, innerR, W / 2, H / 2, outerR);
        radGrad.addColorStop(0, 'rgba(3, 7, 18, 0)');
        radGrad.addColorStop(1, `rgba(2, 5, 14, ${(radialVignette / 100) * 0.92})`);
        bgCtx.fillStyle = radGrad;
        bgCtx.fillRect(0, 0, W, H);
      }

      if (topGradient > 0) {
        const gradTop = bgCtx.createLinearGradient(0, 0, 0, H * 0.42);
        gradTop.addColorStop(0, `rgba(2, 6, 17, ${(topGradient / 100) * 0.92})`);
        gradTop.addColorStop(1, 'rgba(2, 6, 17, 0)');
        bgCtx.fillStyle = gradTop;
        bgCtx.fillRect(0, 0, W, H * 0.42);
      }

      if (bottomShadow > 0 && bottomShadowHeight > 0) {
        const startY = H * (1 - bottomShadowHeight / 100);
        const gradBot = bgCtx.createLinearGradient(0, startY, 0, H);
        gradBot.addColorStop(0, 'rgba(2, 6, 17, 0)');
        gradBot.addColorStop(0.55, `rgba(2, 6, 17, ${(bottomShadow / 100) * 0.68})`);
        gradBot.addColorStop(1, `rgba(2, 6, 17, ${Math.min(0.99, (bottomShadow / 100) * 1.05)})`);
        bgCtx.fillStyle = gradBot;
        bgCtx.fillRect(0, startY, W, H - startY);
      }

      ctx.save();
      ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
      if (artboardRadius > 0) {
        ctx.clearRect(0, 0, W, H);
        drawRoundedRectPath(ctx, 0, 0, W, H, artboardRadius);
        ctx.clip();
      }

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.restore();

      const nextBounds: Record<string, HitBox> = {};

      for (const layer of layers) {
        if (!layer.visible) continue;
        const posX = (layer.x / 100) * W;
        const posY = (layer.y / 100) * H;
        const layerAlpha = Math.max(0, Math.min(1, (layer.opacity ?? 100) / 100));

        ctx.save();
        ctx.globalAlpha = layerAlpha;

        if (layer.type === 'glass') {
          const boxW = ((layer.boxWidth ?? 80) / 100) * W;
          const boxH = ((layer.boxHeight ?? 22) / 100) * H;
          const boxX = posX - boxW / 2;
          const boxY = posY - boxH / 2;

          ctx.save();
          drawRoundedRectPath(ctx, boxX, boxY, boxW, boxH, layer.borderRadius ?? 28);
          ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
          ctx.shadowBlur = 35 * scaleFactor;
          ctx.shadowOffsetY = 12 * scaleFactor;
          ctx.fillStyle = 'rgba(0,0,0,0.01)';
          ctx.fill();
          ctx.restore();

          renderGlassBox(
            ctx,
            bgCanvas,
            boxX,
            boxY,
            boxW,
            boxH,
            layer.borderRadius ?? 28,
            layer.glassBlur ?? 18,
            layer.glassTint || '#0f172a',
            (layer.glassOpacity ?? 40) / 100,
            (layer.glassBorderOpacity ?? 35) / 100,
            scaleFactor
          );

          if (!exportMode) nextBounds[layer.id] = { x: boxX, y: boxY, w: boxW, h: boxH };
        }

        if (layer.type === 'sticker' && layer.src) {
          try {
            const stImg = await loadImg(layer.src);
            const scale = layer.scale ?? 0.5;
            const targetW = stImg.width * scale;
            const targetH = stImg.height * scale;
            const drawX = posX - targetW / 2;
            const drawY = posY - targetH / 2;
            const radius = layer.borderRadius ?? 0;

            const hasShadow = layer.shadow !== false;
            const sBlur = (layer.shadowBlur ?? 32) * scaleFactor;
            const sOffY = (layer.shadowOffsetY ?? 6) * scaleFactor;
            const sAlpha = (layer.shadowOpacity ?? 45) / 100;
            const sColor = hexToRgba(layer.shadowColor || '#000000', sAlpha);

            if (radius > 0) {
              const tempC = document.createElement('canvas');
              tempC.width = Math.max(1, Math.ceil(targetW * scaleFactor));
              tempC.height = Math.max(1, Math.ceil(targetH * scaleFactor));
              const tCtx = tempC.getContext('2d');
              if (tCtx) {
                tCtx.scale(scaleFactor, scaleFactor);
                drawRoundedRectPath(tCtx, 0, 0, targetW, targetH, radius);
                tCtx.clip();
                tCtx.drawImage(stImg, 0, 0, targetW, targetH);

                if ((layer.stickerBorder ?? 0) > 0) {
                  drawRoundedRectPath(tCtx, 0, 0, targetW, targetH, radius);
                  tCtx.strokeStyle = layer.stickerBorderColor || '#ffffff';
                  tCtx.lineWidth = layer.stickerBorder!;
                  tCtx.stroke();
                }
              }

              ctx.save();
              if (hasShadow) {
                ctx.shadowColor = sColor;
                ctx.shadowBlur = sBlur;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = sOffY;
              }
              ctx.drawImage(tempC, drawX, drawY, targetW, targetH);
              ctx.restore();
            } else {
              const tempC = document.createElement('canvas');
              tempC.width = Math.max(1, Math.ceil(targetW * scaleFactor));
              tempC.height = Math.max(1, Math.ceil(targetH * scaleFactor));
              const tCtx = tempC.getContext('2d');
              if (tCtx) {
                tCtx.scale(scaleFactor, scaleFactor);
                tCtx.drawImage(stImg, 0, 0, targetW, targetH);
              }

              ctx.save();
              if (hasShadow) {
                ctx.shadowColor = sColor;
                ctx.shadowBlur = sBlur;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = sOffY;
              }
              ctx.drawImage(tempC, drawX, drawY, targetW, targetH);
              ctx.restore();

              if ((layer.stickerBorder ?? 0) > 0) {
                ctx.save();
                ctx.strokeStyle = layer.stickerBorderColor || '#ffffff';
                ctx.lineWidth = layer.stickerBorder!;
                ctx.strokeRect(drawX, drawY, targetW, targetH);
                ctx.restore();
              }
            }

            if (!exportMode) nextBounds[layer.id] = { x: drawX, y: drawY, w: targetW, h: targetH };
          } catch {}
        }

        if (layer.type === 'text' && layer.text !== undefined) {
          const fontSize = layer.fontSize ?? 64;
          const fontFam = layer.fontFamily || 'Comum';
          ctx.font = `bold ${fontSize}px "${fontFam}", sans-serif`;
          ctx.textAlign = layer.align || 'center';
          ctx.textBaseline = 'middle';

          if ('letterSpacing' in ctx) {
            (ctx as any).letterSpacing = `${layer.letterSpacing ?? 0}px`;
          }

          const rawText = layer.uppercase ? layer.text.toUpperCase() : layer.text;
          const lines = (rawText || ' ').split('\n');
          const lhFactor = layer.lineHeight ?? 1.12;
          const lineHeight = fontSize * lhFactor;
          const totalHeight = Math.max(fontSize, lines.length * lineHeight);
          const startY = posY - totalHeight / 2 + lineHeight / 2;

          let maxLineW = 40;
          lines.forEach((line) => {
            const m = ctx.measureText(line || ' ');
            if (m.width > maxLineW) maxLineW = m.width;
          });

          let boxX = posX - maxLineW / 2;
          if (layer.align === 'left') boxX = posX;
          if (layer.align === 'right') boxX = posX - maxLineW;
          const boxY = posY - totalHeight / 2;

          const pad = layer.textBgPadding ?? 24;
          const bgRad = layer.textBgRadius ?? 22;
          if (layer.textBgGlass) {
            renderGlassBox(
              ctx,
              bgCanvas,
              boxX - pad * 1.3,
              boxY - pad * 0.75,
              maxLineW + pad * 2.6,
              totalHeight + pad * 1.5,
              bgRad,
              16,
              '#0f172a',
              0.48,
              0.4,
              scaleFactor
            );
          }

          const isEditingThis = !exportMode && editingTextId === layer.id;

          if (!isEditingThis) {
            if (layer.useGradient) {
              const ang = ((layer.gradientAngle ?? 180) * Math.PI) / 180;
              const cx = boxX + maxLineW / 2;
              const cy = boxY + totalHeight / 2;
              const r = Math.max(maxLineW, totalHeight) / 2;
              const tGrad = ctx.createLinearGradient(
                cx - Math.cos(ang) * r,
                cy - Math.sin(ang) * r,
                cx + Math.cos(ang) * r,
                cy + Math.sin(ang) * r
              );
              tGrad.addColorStop(0, layer.color || '#ffffff');
              tGrad.addColorStop(1, layer.color2 || '#38bdf8');
              ctx.fillStyle = tGrad;
            } else {
              ctx.fillStyle = layer.color || '#ffffff';
            }

            if (layer.glow) {
              ctx.save();
              ctx.shadowColor = layer.glowColor || '#0ea5e9';
              ctx.shadowBlur = (layer.glowBlur ?? 32) * scaleFactor;
              lines.forEach((line, idx) => ctx.fillText(line, posX, startY + idx * lineHeight));
              ctx.restore();
            }

            ctx.save();
            if (layer.shadow) {
              const textShadowAlpha = (layer.shadowOpacity ?? 75) / 100;
              ctx.shadowColor = hexToRgba(layer.shadowColor || '#000000', textShadowAlpha);
              ctx.shadowBlur = (layer.shadowBlur ?? 24) * scaleFactor;
              ctx.shadowOffsetY = (layer.shadowOffsetY ?? 8) * scaleFactor;
            }
            lines.forEach((line, idx) => ctx.fillText(line, posX, startY + idx * lineHeight));
            ctx.restore();

            if ((layer.strokeWidth ?? 0) > 0) {
              ctx.save();
              ctx.lineWidth = layer.strokeWidth!;
              ctx.strokeStyle = layer.strokeColor || '#030712';
              ctx.lineJoin = 'round';
              lines.forEach((line, idx) => ctx.strokeText(line, posX, startY + idx * lineHeight));
              ctx.restore();
            }
          }

          if (!exportMode) {
            nextBounds[layer.id] = { x: boxX - 16, y: boxY - 12, w: maxLineW + 32, h: totalHeight + 24 };
          }
        }

        ctx.restore();
      }

      if (!exportMode) {
        layerBoundsRef.current = nextBounds;
      }

      if (scanlines > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${(scanlines / 100) * 0.35})`;
        for (let y = 0; y < H; y += 6) {
          ctx.fillRect(0, y, W, 2);
        }
        ctx.restore();
      }

      if (filmGrain > 0) {
        const pattern = getNoisePattern(ctx);
        if (pattern) {
          ctx.save();
          ctx.globalAlpha = (filmGrain / 100) * 0.18;
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
      }

      ctx.restore();

      if (!exportMode) {
        ctx.save();
        ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

        if (showSafeGuides) {
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([12, 10]);
          ctx.beginPath();
          ctx.moveTo(W / 2, 0);
          ctx.lineTo(W / 2, H);
          ctx.moveTo(0, H / 2);
          ctx.lineTo(W, H / 2);
          ctx.stroke();

          if (preset === 'reels') {
            const cropTop = (H - W) / 2;
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
            ctx.lineWidth = 3;
            ctx.strokeRect(20, cropTop, W - 40, W);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('CORTE 1:1 DA GRADE DO PERFIL', 40, cropTop + 36);
          }
        }

        if (selectedId && selectedId !== editingTextId && nextBounds[selectedId]) {
          drawTransformHandles(ctx, nextBounds[selectedId], isMobile);
        }
        ctx.restore();
      }
    },
    [
      currentSpec, bgSrc, bgBaseColor, bgOpacity, bgScale, bgOffsetX, bgOffsetY, bgBrightness, bgContrast, bgSaturation, artboardRadius,
      bottomShadow, bottomShadowHeight, topGradient, radialVignette, gradOverlayOpacity,
      gradColorA, gradColorB, gradAngle, scanlines, filmGrain, layers, selectedId, editingTextId, showSafeGuides, preset, isMobile, loadImg
    ]
  );

  useEffect(() => {
    document.title = 'Social Studio | CIOEDAFS';
    if (canvasRef.current) {
      document.fonts?.ready.then(() => {
        if (canvasRef.current) renderSceneToCanvas(canvasRef.current, false, 1);
      });
      renderSceneToCanvas(canvasRef.current, false, 1);
    }
  }, [renderSceneToCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isTyping || editingTextId) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        setLayers((prev) => prev.filter((l) => l.id !== selectedId));
        setSelectedId(null);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (e.key === 'Enter' && selectedLayer?.type === 'text') {
        e.preventDefault();
        setEditingTextId(selectedLayer.id);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        setLayers((prev) => {
          const orig = prev.find((l) => l.id === selectedId);
          if (!orig) return prev;
          const copyId = `${orig.type}-${Date.now()}`;
          const copy: StudioLayer = { ...orig, id: copyId, name: `${orig.name} (Cópia)`, x: Math.min(95, orig.x + 3), y: Math.min(95, orig.y + 3) };
          setTimeout(() => setSelectedId(copyId), 0);
          return [...prev, copy];
        });
      } else if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 2.0 : 0.35;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        setLayers((prev) =>
          prev.map((l) => (l.id === selectedId ? { ...l, x: Math.max(0, Math.min(100, l.x + dx)), y: Math.max(0, Math.min(100, l.y + dy)) } : l))
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedLayer, editingTextId]);

  const getCanvasPointer = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const pxX = ((e.clientX - rect.left) / rect.width) * currentSpec.width;
    const pxY = ((e.clientY - rect.top) / rect.height) * currentSpec.height;
    const pctX = (pxX / currentSpec.width) * 100;
    const pctY = (pxY / currentSpec.height) * 100;
    return { pxX, pxY, pctX, pctY };
  };

  const hitTestHandles = (pxX: number, pxY: number): HandleId | null => {
    if (!selectedId || editingTextId) return null;
    const box = layerBoundsRef.current[selectedId];
    if (!box) return null;
    const handles = getHandlePositions(box);
    const hitRadius = isMobile ? 38 : 22;
    for (const hKey of Object.keys(handles) as HandleId[]) {
      const pt = handles[hKey];
      if (Math.abs(pxX - pt.x) <= hitRadius && Math.abs(pxY - pt.y) <= hitRadius) {
        return hKey;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingTextId) {
      setEditingTextId(null);
      return;
    }

    const { pxX, pxY, pctX, pctY } = getCanvasPointer(e);

    const hitHandle = hitTestHandles(pxX, pxY);
    if (hitHandle && selectedId) {
      const origLayer = layers.find((l) => l.id === selectedId);
      const origBox = layerBoundsRef.current[selectedId];
      if (origLayer && origBox) {
        setDragState({
          mode: 'resize',
          id: selectedId,
          layerType: origLayer.type,
          handle: hitHandle,
          startPxX: pxX,
          startPxY: pxY,
          origBox: { ...origBox },
          origLayer: { ...origLayer },
        });
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }

    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (!l.visible) continue;
      const b = layerBoundsRef.current[l.id];
      if (b && pxX >= b.x - 10 && pxX <= b.x + b.w + 10 && pxY >= b.y - 10 && pxY <= b.y + b.h + 10) {
        setSelectedId(l.id);
        if (isMobile) setMobileTab('inspector');
        setDragState({ mode: 'layer', id: l.id, startPctX: pctX, startPctY: pctY, origX: l.x, origY: l.y });
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }

    setSelectedId(null);
    setDragState({ mode: 'bg', startPctX: pctX, startPctY: pctY, origX: bgOffsetX, origY: bgOffsetY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { pxX, pxY, pctX, pctY } = getCanvasPointer(e);

    if (!dragState) {
      const h = hitTestHandles(pxX, pxY);
      if (h) {
        setHoverCursor(HANDLE_CURSORS[h]);
        return;
      }
      let overLayer = false;
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        if (!l.visible) continue;
        const b = layerBoundsRef.current[l.id];
        if (b && pxX >= b.x && pxX <= b.x + b.w && pxY >= b.y && pxY <= b.y + b.h) {
          overLayer = true;
          break;
        }
      }
      setHoverCursor(overLayer ? 'move' : 'grab');
      return;
    }

    if (dragState.mode === 'layer') {
      const deltaX = pctX - dragState.startPctX;
      const deltaY = pctY - dragState.startPctY;
      let nextX = Math.max(1, Math.min(99, dragState.origX + deltaX));
      let nextY = Math.max(1, Math.min(99, dragState.origY + deltaY));
      if (Math.abs(nextX - 50) < 1.3) nextX = 50;
      if (Math.abs(nextY - 50) < 1.3) nextY = 50;
      setLayers((prev) => prev.map((l) => (l.id === dragState.id ? { ...l, x: nextX, y: nextY } : l)));
      return;
    }

    if (dragState.mode === 'bg') {
      const deltaX = pctX - dragState.startPctX;
      const deltaY = pctY - dragState.startPctY;
      setBgOffsetX(Math.max(-85, Math.min(85, Math.round(dragState.origX + deltaX))));
      setBgOffsetY(Math.max(-85, Math.min(85, Math.round(dragState.origY + deltaY))));
      return;
    }

    if (dragState.mode === 'resize') {
      const { handle, origBox, origLayer, id } = dragState;
      const W = currentSpec.width;
      const H = currentSpec.height;
      const symmetric = e.altKey;

      let left = origBox.x;
      let right = origBox.x + origBox.w;
      let top = origBox.y;
      let bottom = origBox.y + origBox.h;
      const cx = origBox.x + origBox.w / 2;
      const cy = origBox.y + origBox.h / 2;

      if (handle.includes('w')) {
        left = Math.min(pxX, right - 40);
        if (symmetric) right = cx + (cx - left);
      }
      if (handle.includes('e')) {
        right = Math.max(pxX, left + 40);
        if (symmetric) left = cx - (right - cx);
      }
      if (handle.includes('n')) {
        top = Math.min(pxY, bottom - 30);
        if (symmetric) bottom = cy + (cy - top);
      }
      if (handle.includes('s')) {
        bottom = Math.max(pxY, top + 30);
        if (symmetric) top = cy - (bottom - cy);
      }

      const newW = Math.max(40, right - left);
      const newH = Math.max(30, bottom - top);
      const newCenterX = ((left + newW / 2) / W) * 100;
      const newCenterY = ((top + newH / 2) / H) * 100;

      if (origLayer.type === 'glass') {
        setLayers((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  x: Math.max(2, Math.min(98, newCenterX)),
                  y: Math.max(2, Math.min(98, newCenterY)),
                  boxWidth: Math.max(6, Math.min(100, Number(((newW / W) * 100).toFixed(1)))),
                  boxHeight: Math.max(4, Math.min(100, Number(((newH / H) * 100).toFixed(1)))),
                }
              : l
          )
        );
        return;
      }

      let ratio = 1;
      if (handle === 'e' || handle === 'w') {
        ratio = newW / Math.max(1, origBox.w);
      } else if (handle === 'n' || handle === 's') {
        ratio = newH / Math.max(1, origBox.h);
      } else {
        ratio = Math.max(newW / Math.max(1, origBox.w), newH / Math.max(1, origBox.h));
      }

      if (origLayer.type === 'sticker') {
        const baseScale = origLayer.scale ?? 0.5;
        const nextScale = Math.max(0.06, Math.min(3.5, Number((baseScale * ratio).toFixed(3))));
        setLayers((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  scale: nextScale,
                  x: symmetric ? origLayer.x : newCenterX,
                  y: symmetric ? origLayer.y : newCenterY,
                }
              : l
          )
        );
      } else if (origLayer.type === 'text') {
        const baseFont = origLayer.fontSize ?? 64;
        const nextFont = Math.max(14, Math.min(280, Math.round(baseFont * ratio)));
        setLayers((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  fontSize: nextFont,
                  x: symmetric || origLayer.align !== 'center' ? origLayer.x : newCenterX,
                  y: symmetric ? origLayer.y : newCenterY,
                }
              : l
          )
        );
      }
    }
  };

  const handlePointerUp = () => setDragState(null);

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { pxX, pxY } = getCanvasPointer(e);
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (!l.visible || l.type !== 'text') continue;
      const b = layerBoundsRef.current[l.id];
      if (b && pxX >= b.x - 10 && pxX <= b.x + b.w + 10 && pxY >= b.y - 10 && pxY <= b.y + b.h + 10) {
        setSelectedId(l.id);
        setDragState(null);
        setEditingTextId(l.id);
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          setArtboardDisplaySize({ w: rect.width, h: rect.height });
        }
        return;
      }
    }
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (editingTextId) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setBgScale((prev) => Math.max(0.6, Math.min(3.0, Number((prev + delta).toFixed(2)))));
  };

  const handleDropFile = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDropHover(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);

    if (e.shiftKey) {
      addStickerLayer(file.name.substring(0, 16), url);
    } else {
      setBgSrc(url);
      setBgScale(1);
      setBgOffsetX(0);
      setBgOffsetY(0);
    }
  };

  const updateSelectedLayer = (patch: Partial<StudioLayer>) => {
    if (!selectedId) return;
    setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, ...patch } : l)));
  };

  const moveLayerOrder = (id: string, dir: 'up' | 'down') => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
  };

  const duplicateLayer = (id: string) => {
    const orig = layers.find((l) => l.id === id);
    if (!orig) return;
    const newId = `${orig.type}-${Date.now()}`;
    setLayers((prev) => [...prev, { ...orig, id: newId, name: `${orig.name} (Cópia)`, x: Math.min(94, orig.x + 3), y: Math.min(94, orig.y + 3) }]);
    setSelectedId(newId);
  };

  const addTextLayer = () => {
    const id = `txt-${Date.now()}`;
    setLayers((prev) => [
      ...prev,
      {
        id,
        type: 'text',
        name: 'Novo Texto',
        visible: true,
        x: 50,
        y: 50,
        text: 'CLIQUE 2X PARA EDITAR',
        fontFamily: 'StratumNo2',
        fontSize: 72,
        color: '#ffffff',
        useGradient: false,
        color2: '#38bdf8',
        gradientAngle: 180,
        align: 'center',
        uppercase: true,
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 75,
        shadowBlur: 24,
        shadowOffsetY: 8,
        letterSpacing: 2,
        lineHeight: 1.1,
        textBgRadius: 22,
        opacity: 100,
      },
    ]);
    setSelectedId(id);
    if (isMobile) setMobileTab('inspector');
  };

  const addGlassCardLayer = () => {
    const id = `glass-${Date.now()}`;
    setLayers((prev) => [
      ...prev,
      {
        id,
        type: 'glass',
        name: 'Painel Glassmorphism',
        visible: true,
        x: 50,
        y: 50,
        boxWidth: 80,
        boxHeight: 22,
        borderRadius: 32,
        glassBlur: 18,
        glassTint: '#0f172a',
        glassOpacity: 42,
        glassBorderOpacity: 40,
        opacity: 100,
      },
    ]);
    setSelectedId(id);
    if (isMobile) setMobileTab('inspector');
  };

  const addStickerLayer = (name: string, src: string) => {
    const id = `stk-${Date.now()}`;
    setLayers((prev) => [
      ...prev,
      {
        id,
        type: 'sticker',
        name,
        visible: true,
        x: 50,
        y: 28,
        src,
        scale: 0.42,
        borderRadius: 0,
        stickerBorder: 0,
        stickerBorderColor: '#ffffff',
        shadow: true,
        shadowOpacity: 45,
        shadowBlur: 32,
        shadowOffsetY: 6,
        opacity: 100,
      },
    ]);
    setSelectedId(id);
    if (isMobile) setMobileTab('inspector');
  };

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgSrc(URL.createObjectURL(file));
    setBgScale(1);
    setBgOffsetX(0);
    setBgOffsetY(0);
  };

  const handleUploadSticker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addStickerLayer(file.name.substring(0, 14), URL.createObjectURL(file));
  };

  const applyQuickTemplate = (kind: 'glass_reels' | 'agenda_gold' | 'notam_hud') => {
    setEditingTextId(null);
    if (kind === 'glass_reels') {
      setPreset('reels');
      setBottomShadow(80);
      setGradOverlayOpacity(20);
      setGradColorA('#0ea5e9');
      setGradColorB('#020617');
      setLayers([
        { id: 'gr1', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 34, src: logoEdafs, scale: 0.36, borderRadius: 0, shadow: true, shadowOpacity: 45, shadowBlur: 32, shadowOffsetY: 6, opacity: 100 },
        { id: 'gr2', type: 'glass', name: 'Card Central 1:1', visible: true, x: 50, y: 54, boxWidth: 86, boxHeight: 20, borderRadius: 36, glassBlur: 20, glassTint: '#0b1120', glassOpacity: 45, glassBorderOpacity: 45, opacity: 100 },
        { id: 'gr3', type: 'text', name: 'Título Reels', visible: true, x: 50, y: 52, text: 'NA ALA DO LÍDER', fontFamily: 'StratumNo2', fontSize: 82, color: '#ffffff', useGradient: true, color2: '#93c5fd', gradientAngle: 180, align: 'center', uppercase: true, shadow: true, shadowColor: '#000000', shadowBlur: 20, shadowOffsetY: 6, letterSpacing: 2, lineHeight: 1.05, opacity: 100 },
        { id: 'gr4', type: 'text', name: 'Subtítulo', visible: true, x: 50, y: 59, text: 'REELS OFICIAL • A-29 SUPER TUCANO', fontFamily: 'Comum', fontSize: 28, color: '#38bdf8', align: 'center', uppercase: true, shadow: true, letterSpacing: 5, lineHeight: 1.2, opacity: 100 },
      ]);
    } else if (kind === 'agenda_gold') {
      setPreset('portrait');
      setBottomShadow(92);
      setBottomShadowHeight(62);
      setGradOverlayOpacity(18);
      setGradColorA('#f59e0b');
      setGradColorB('#030712');
      setLayers([
        { id: 'ag1', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 11, src: logoEdafs, scale: 0.42, borderRadius: 0, shadow: true, shadowOpacity: 45, shadowBlur: 32, shadowOffsetY: 6, opacity: 100 },
        { id: 'ag2', type: 'text', name: 'Overline', visible: true, x: 50, y: 71, text: 'DEMONSTRAÇÃO CONFIRMADA', fontFamily: 'Comum', fontSize: 30, color: '#fde047', align: 'center', uppercase: true, glow: true, glowColor: '#f59e0b', glowBlur: 24, shadow: true, letterSpacing: 6, lineHeight: 1.2, opacity: 100 },
        { id: 'ag3', type: 'text', name: 'Localidade', visible: true, x: 50, y: 80, text: 'FLORIANÓPOLIS', fontFamily: 'StratumNo2', fontSize: 98, color: '#ffffff', useGradient: true, color2: '#fde68a', gradientAngle: 180, align: 'center', uppercase: true, shadow: true, shadowBlur: 30, shadowOffsetY: 10, letterSpacing: 2, lineHeight: 1.05, opacity: 100 },
        { id: 'ag4', type: 'text', name: 'Info Voo', visible: true, x: 50, y: 90, text: 'SÁBADO • 19H30 BRT • SBFL', fontFamily: 'Regular', fontSize: 30, color: '#e2e8f0', textBgGlass: true, textBgPadding: 18, textBgRadius: 999, align: 'center', uppercase: true, shadow: false, letterSpacing: 4, lineHeight: 1.2, opacity: 100 },
      ]);
    } else if (kind === 'notam_hud') {
      setPreset('square');
      setScanlines(45);
      setRadialVignette(65);
      setGradOverlayOpacity(35);
      setGradColorA('#ef4444');
      setGradColorB('#030712');
      setLayers([
        { id: 'nh1', type: 'glass', name: 'Painel NOTAM', visible: true, x: 50, y: 54, boxWidth: 86, boxHeight: 62, borderRadius: 28, glassBlur: 22, glassTint: '#090d16', glassOpacity: 62, glassBorderOpacity: 35, opacity: 100 },
        { id: 'nh2', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 33, src: logoEdafs, scale: 0.36, borderRadius: 0, shadow: true, shadowOpacity: 45, shadowBlur: 32, shadowOffsetY: 6, opacity: 100 },
        { id: 'nh3', type: 'text', name: 'Tag NOTAM', visible: true, x: 50, y: 47, text: 'COMUNICADO OPERACIONAL', fontFamily: 'Comum', fontSize: 30, color: '#ef4444', glow: true, glowColor: '#ef4444', glowBlur: 22, align: 'center', uppercase: true, shadow: true, letterSpacing: 6, opacity: 100 },
        { id: 'nh4', type: 'text', name: 'Mensagem', visible: true, x: 50, y: 59, text: 'RECRUTAMENTO\nENCERRADO', fontFamily: 'StratumNo2', fontSize: 84, color: '#ffffff', align: 'center', uppercase: true, shadow: true, letterSpacing: 2, lineHeight: 1.08, opacity: 100 },
        { id: 'nh5', type: 'text', name: 'Assinatura', visible: true, x: 50, y: 76, text: 'COMANDO GERAL • EDAFS', fontFamily: 'Regular', fontSize: 24, color: '#94a3b8', align: 'center', uppercase: true, letterSpacing: 5, opacity: 100 },
      ]);
    }
    setSelectedId(null);
  };

  const handleExportMaxQualityPNG = async () => {
    setEditingTextId(null);
    setIsExporting(true);
    try {
      const mult = parseInt(exportScale, 10) || 2;
      const offscreen = document.createElement('canvas');
      await renderSceneToCanvas(offscreen, true, mult);

      offscreen.toBlob(
        (blob) => {
          if (!blob) return;
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const finalW = currentSpec.width * mult;
          const finalH = currentSpec.height * mult;
          link.download = `EDAFS-${preset}-${finalW}x${finalH}-MAX.png`;
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          setIsExporting(false);
          if (canvasRef.current) renderSceneToCanvas(canvasRef.current, false, 1);
        },
        'image/png',
        1.0
      );
    } catch {
      setIsExporting(false);
    }
  };

  const scaleDisplayFactor = artboardDisplaySize.w / currentSpec.width;

  const renderBgPanel = () => (
    <>
      <div className="panel-section">
        <span className="studio-label">Upload ou Arraste para o Palco</span>
        <label className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderStyle: 'dashed', borderRadius: '11px' }}>
          <Upload size={15} color="#0ea5e9" /> Escolher Foto da Galeria / PC
          <input type="file" accept="image/*" onChange={handleUploadBg} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="panel-section">
        <div className="studio-label">
          <span>Transparência, Enquadramento & Cor</span>
          <button
            onClick={() => {
              setBgOpacity(100);
              setBgBaseColor('#030712');
              setBgScale(1);
              setBgOffsetX(0);
              setBgOffsetY(0);
              setBgBrightness(100);
              setBgContrast(100);
              setBgSaturation(100);
              setArtboardRadius(0);
            }}
            style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <RotateCcw size={11} /> Resetar
          </button>
        </div>
        <PrettySlider label="Opacidade da Foto de Fundo" valueDisplay={`${bgOpacity}%`} min={0} max={100} value={bgOpacity} onChange={setBgOpacity} />
        <ColorPill label="Cor Sólida de Base (Atrás da Foto)" color={bgBaseColor} onChange={setBgBaseColor} />
        <PrettySlider label="Zoom da Foto" valueDisplay={`${Math.round(bgScale * 100)}%`} min={0.6} max={3} step={0.02} value={bgScale} onChange={setBgScale} />
        <PrettySlider label="Arredondamento da Arte" valueDisplay={`${artboardRadius}px`} min={0} max={120} value={artboardRadius} onChange={setArtboardRadius} />
        <PrettySlider label="Brilho" valueDisplay={`${bgBrightness}%`} min={40} max={160} value={bgBrightness} onChange={setBgBrightness} />
        <PrettySlider label="Contraste" valueDisplay={`${bgContrast}%`} min={50} max={170} value={bgContrast} onChange={setBgContrast} />
        <PrettySlider label="Saturação" valueDisplay={`${bgSaturation}%`} min={0} max={180} value={bgSaturation} onChange={setBgSaturation} />
      </div>

      <div>
        <span className="studio-label">Acervo Rápido EDAFS</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.35rem' }}>
          {GALLERY_PRESETS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setBgSrc(item.src)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: bgSrc === item.src ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: bgSrc === item.src ? '0 0 0 3px rgba(14,165,233,0.25)' : 'none',
              }}
            >
              <img src={item.src} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderOverlaysPanel = () => (
    <>
      <div className="panel-section">
        <span className="studio-label" style={{ color: '#38bdf8' }}>Sombra Inferior & Vinheta</span>
        <PrettySlider label="Intensidade Sombra Inferior" valueDisplay={`${bottomShadow}%`} min={0} max={100} value={bottomShadow} onChange={setBottomShadow} />
        <PrettySlider label="Altura Sombra Inferior" valueDisplay={`${bottomShadowHeight}%`} min={15} max={90} value={bottomShadowHeight} onChange={setBottomShadowHeight} />
        <PrettySlider label="Sombra do Topo" valueDisplay={`${topGradient}%`} min={0} max={100} value={topGradient} onChange={setTopGradient} />
        <PrettySlider label="Vinheta Radial nas Bordas" valueDisplay={`${radialVignette}%`} min={0} max={100} value={radialVignette} onChange={setRadialVignette} />
      </div>

      <div className="panel-section">
        <span className="studio-label" style={{ color: '#f59e0b' }}>Sobreposição Degradê (Duotone)</span>
        <PrettySlider label="Opacidade do Degradê" valueDisplay={`${gradOverlayOpacity}%`} min={0} max={85} value={gradOverlayOpacity} onChange={setGradOverlayOpacity} accent="#f59e0b" />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ColorPill label="Cor Inicial" color={gradColorA} onChange={setGradColorA} />
          <ColorPill label="Cor Final" color={gradColorB} onChange={setGradColorB} />
        </div>
        <PrettySlider label="Ângulo do Degradê" valueDisplay={`${gradAngle}°`} min={0} max={360} value={gradAngle} onChange={setGradAngle} accent="#f59e0b" />
      </div>

      <div className="panel-section">
        <span className="studio-label" style={{ color: '#10b981' }}>Texturas Táticas</span>
        <PrettySlider label="Linhas HUD / Scanlines" valueDisplay={`${scanlines}%`} min={0} max={100} value={scanlines} onChange={setScanlines} accent="#10b981" />
        <PrettySlider label="Granulação Cinema (Grain)" valueDisplay={`${filmGrain}%`} min={0} max={100} value={filmGrain} onChange={setFilmGrain} accent="#10b981" />
      </div>
    </>
  );

  const renderElementsPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button onClick={addTextLayer} className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: 'rgba(14,165,233,0.14)', borderColor: 'rgba(14,165,233,0.4)', color: '#fff', borderRadius: '12px' }}>
        <Type size={16} /> Nova Camada de Texto
      </button>

      <button onClick={addGlassCardLayer} className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px' }}>
        <Square size={16} color="#38bdf8" /> Novo Card Glassmorphism
      </button>

      <div className="panel-section">
        <span className="studio-label">Insígnias & Imagens Sobrepostas</span>
        <button onClick={() => addStickerLayer('Brasão EDAFS', logoEdafs)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem', borderRadius: '10px' }}>
          <span>Brasão EDAFS</span>
          <img src={logoEdafs} alt="EDAFS" style={{ height: '22px' }} />
        </button>
        <button onClick={() => addStickerLayer('Logo MSFS 2024', mfLogo24)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem', borderRadius: '10px' }}>
          <span>Logo MSFS 2024</span>
          <img src={mfLogo24} alt="MSFS 2024" style={{ height: '20px' }} />
        </button>
        <button onClick={() => addStickerLayer('Logo MSFS 2020', mfLogo)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem', borderRadius: '10px' }}>
          <span>Logo MSFS 2020</span>
          <img src={mfLogo} alt="MSFS 2020" style={{ height: '15px' }} />
        </button>
        <label className="tool-pill" style={{ justifyContent: 'center', padding: '0.7rem', borderStyle: 'dashed', borderRadius: '10px' }}>
          <Upload size={14} color="#0ea5e9" /> Importar Foto / PNG Sobreposto
          <input type="file" accept="image/*" onChange={handleUploadSticker} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );

  const renderTemplatesPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <span className="studio-label">Composições Prontas (1 Clique)</span>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('glass_reels')}>
        <strong style={{ color: '#fff' }}>Capa de Reels Glassmorphism (9:16)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Card de vidro fosco centralizado no corte 1:1</span>
      </button>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('agenda_gold')}>
        <strong style={{ color: '#fff' }}>Agenda Ouro & Degradê (4:5)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Texto metálico com glow dourado e pílula de vidro</span>
      </button>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('notam_hud')}>
        <strong style={{ color: '#fff' }}>Comunicado Tático HUD (1:1)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Scanlines militares, alerta neon e painel fosco</span>
      </button>
    </div>
  );

  const renderInspectorPanel = () => {
    if (!selectedLayer) {
      return (
        <div style={{ padding: '2rem 0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
          Toque ou clique em qualquer elemento na imagem para ajustar transparência, tamanho, arredondamento, cores e efeitos — ou dê <strong>2 cliques em um texto</strong> para editar na tela.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => updateSelectedLayer({ x: 50 })} className="tool-pill" style={{ flex: 1, justifyContent: 'center' }}>Centrar X</button>
          <button onClick={() => updateSelectedLayer({ y: 50 })} className="tool-pill" style={{ flex: 1, justifyContent: 'center' }}>Centrar Y</button>
          <button onClick={() => duplicateLayer(selectedLayer.id)} className="tool-pill" title="Duplicar"><Copy size={14} /></button>
          <button
            onClick={() => { setLayers((prev) => prev.filter((l) => l.id !== selectedLayer.id)); setSelectedId(null); }}
            className="tool-pill"
            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.35)' }}
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="panel-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <PrettySlider label="Posição X" valueDisplay={`${selectedLayer.x.toFixed(0)}%`} min={0} max={100} step={0.5} value={selectedLayer.x} onChange={(v) => updateSelectedLayer({ x: v })} />
            <PrettySlider label="Posição Y" valueDisplay={`${selectedLayer.y.toFixed(0)}%`} min={0} max={100} step={0.5} value={selectedLayer.y} onChange={(v) => updateSelectedLayer({ y: v })} />
          </div>
          <PrettySlider
            label={selectedLayer.type === 'sticker' ? 'Opacidade da Imagem / Logo' : 'Opacidade da Camada'}
            valueDisplay={`${selectedLayer.opacity ?? 100}%`}
            min={0}
            max={100}
            value={selectedLayer.opacity ?? 100}
            onChange={(v) => updateSelectedLayer({ opacity: v })}
          />
        </div>

        {selectedLayer.type === 'sticker' && (
          <div className="panel-section">
            <span className="studio-label" style={{ color: '#f59e0b' }}>Imagem: Escala, Bordas & Sombra</span>
            <PrettySlider label="Escala da Imagem" valueDisplay={`${Math.round((selectedLayer.scale || 0.5) * 100)}%`} min={0.06} max={3} step={0.02} value={selectedLayer.scale || 0.5} onChange={(v) => updateSelectedLayer({ scale: v })} accent="#f59e0b" />
            <PrettySlider
              label="Transparência"
              valueDisplay={`${100 - (selectedLayer.opacity ?? 100)}%`}
              min={0}
              max={100}
              value={100 - (selectedLayer.opacity ?? 100)}
              onChange={(transp) => updateSelectedLayer({ opacity: 100 - transp })}
              accent="#f59e0b"
            />
            <PrettySlider label="Arredondamento dos Cantos" valueDisplay={`${selectedLayer.borderRadius ?? 0}px`} min={0} max={250} value={selectedLayer.borderRadius ?? 0} onChange={(v) => updateSelectedLayer({ borderRadius: v })} accent="#f59e0b" />

            <StudioToggle label="Sombra Suave na Imagem" checked={selectedLayer.shadow !== false} onChange={(v) => updateSelectedLayer({ shadow: v })} />
            {selectedLayer.shadow !== false && (
              <>
                <PrettySlider
                  label="Intensidade da Sombra"
                  valueDisplay={`${selectedLayer.shadowOpacity ?? 45}%`}
                  min={5}
                  max={95}
                  value={selectedLayer.shadowOpacity ?? 45}
                  onChange={(v) => updateSelectedLayer({ shadowOpacity: v })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <PrettySlider label="Difusão (Blur)" valueDisplay={`${selectedLayer.shadowBlur ?? 32}px`} min={0} max={80} value={selectedLayer.shadowBlur ?? 32} onChange={(v) => updateSelectedLayer({ shadowBlur: v })} />
                  <PrettySlider label="Distância Y" valueDisplay={`${selectedLayer.shadowOffsetY ?? 6}px`} min={0} max={40} value={selectedLayer.shadowOffsetY ?? 6} onChange={(v) => updateSelectedLayer({ shadowOffsetY: v })} />
                </div>
              </>
            )}

            <PrettySlider label="Espessura da Moldura" valueDisplay={`${selectedLayer.stickerBorder ?? 0}px`} min={0} max={20} value={selectedLayer.stickerBorder ?? 0} onChange={(v) => updateSelectedLayer({ stickerBorder: v })} />
            {(selectedLayer.stickerBorder ?? 0) > 0 && (
              <ColorPill label="Cor da Moldura" color={selectedLayer.stickerBorderColor || '#ffffff'} onChange={(hex) => updateSelectedLayer({ stickerBorderColor: hex })} />
            )}
          </div>
        )}

        {selectedLayer.type === 'text' && (
          <>
            <div className="panel-section">
              <div className="studio-label">
                <span>Conteúdo & Tipografia</span>
                <button onClick={() => setEditingTextId(selectedLayer.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                  Editar no Palco
                </button>
              </div>
              <textarea rows={2} className="studio-input" value={selectedLayer.text || ''} onChange={(e) => updateSelectedLayer({ text: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.45rem', alignItems: 'center' }}>
                <StudioSelect
                  value={selectedLayer.fontFamily || 'Comum'}
                  options={FONT_OPTIONS}
                  onChange={(val) => updateSelectedLayer({ fontFamily: val })}
                />
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className={`tool-pill ${selectedLayer.align === 'left' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.48rem 0' }} onClick={() => updateSelectedLayer({ align: 'left' })}><AlignLeft size={14} /></button>
                  <button className={`tool-pill ${selectedLayer.align === 'center' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.48rem 0' }} onClick={() => updateSelectedLayer({ align: 'center' })}><AlignCenter size={14} /></button>
                  <button className={`tool-pill ${selectedLayer.align === 'right' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.48rem 0' }} onClick={() => updateSelectedLayer({ align: 'right' })}><AlignRight size={14} /></button>
                  <button className={`tool-pill ${selectedLayer.uppercase ? 'active' : ''}`} style={{ padding: '0.48rem 0.45rem' }} onClick={() => updateSelectedLayer({ uppercase: !selectedLayer.uppercase })}>AA</button>
                </div>
              </div>

              <PrettySlider label="Tamanho da Fonte" valueDisplay={`${selectedLayer.fontSize || 64}px`} min={14} max={260} value={selectedLayer.fontSize || 64} onChange={(v) => updateSelectedLayer({ fontSize: v })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <PrettySlider label="Espaçamento" valueDisplay={`${selectedLayer.letterSpacing || 0}px`} min={0} max={24} value={selectedLayer.letterSpacing || 0} onChange={(v) => updateSelectedLayer({ letterSpacing: v })} />
                <PrettySlider label="Entrelinha" valueDisplay={(selectedLayer.lineHeight ?? 1.12).toFixed(2)} min={0.85} max={1.8} step={0.03} value={selectedLayer.lineHeight ?? 1.12} onChange={(v) => updateSelectedLayer({ lineHeight: v })} />
              </div>
            </div>

            <div className="panel-section">
              <StudioToggle label="Degradê de Duas Cores" checked={!!selectedLayer.useGradient} onChange={(v) => updateSelectedLayer({ useGradient: v })} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ColorPill label={selectedLayer.useGradient ? 'Cor 1' : 'Cor do Texto'} color={selectedLayer.color || '#ffffff'} onChange={(hex) => updateSelectedLayer({ color: hex })} />
                {selectedLayer.useGradient && (
                  <ColorPill label="Cor 2" color={selectedLayer.color2 || '#38bdf8'} onChange={(hex) => updateSelectedLayer({ color2: hex })} />
                )}
              </div>
              {selectedLayer.useGradient && (
                <PrettySlider label="Ângulo do Degradê" valueDisplay={`${selectedLayer.gradientAngle ?? 180}°`} min={0} max={360} value={selectedLayer.gradientAngle ?? 180} onChange={(v) => updateSelectedLayer({ gradientAngle: v })} />
              )}
            </div>

            <div className="panel-section">
              <span className="studio-label" style={{ color: '#38bdf8' }}>Caixa de Vidro & Efeitos</span>

              <StudioToggle label="Caixa Glassmorphism no Texto" checked={!!selectedLayer.textBgGlass} onChange={(v) => updateSelectedLayer({ textBgGlass: v })} />
              {selectedLayer.textBgGlass && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <PrettySlider label="Espaço Interno" valueDisplay={`${selectedLayer.textBgPadding ?? 24}px`} min={8} max={65} value={selectedLayer.textBgPadding ?? 24} onChange={(v) => updateSelectedLayer({ textBgPadding: v })} />
                  <PrettySlider label="Arredondamento" valueDisplay={`${selectedLayer.textBgRadius ?? 22}px`} min={0} max={120} value={selectedLayer.textBgRadius ?? 22} onChange={(v) => updateSelectedLayer({ textBgRadius: v })} />
                </div>
              )}

              <StudioToggle label="Brilho Neon (Outer Glow)" checked={!!selectedLayer.glow} onChange={(v) => updateSelectedLayer({ glow: v })} />
              {selectedLayer.glow && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ColorPill label="Cor do Brilho" color={selectedLayer.glowColor || '#0ea5e9'} onChange={(hex) => updateSelectedLayer({ glowColor: hex })} />
                  <PrettySlider label="Intensidade do Brilho" valueDisplay={`${selectedLayer.glowBlur ?? 28}px`} min={5} max={75} value={selectedLayer.glowBlur ?? 28} onChange={(v) => updateSelectedLayer({ glowBlur: v })} />
                </div>
              )}

              <PrettySlider label="Espessura do Contorno (Stroke)" valueDisplay={`${selectedLayer.strokeWidth || 0}px`} min={0} max={16} value={selectedLayer.strokeWidth || 0} onChange={(v) => updateSelectedLayer({ strokeWidth: v })} />
              {(selectedLayer.strokeWidth ?? 0) > 0 && (
                <ColorPill label="Cor do Contorno" color={selectedLayer.strokeColor || '#030712'} onChange={(hex) => updateSelectedLayer({ strokeColor: hex })} />
              )}

              <StudioToggle label="Sombra Projetada" checked={!!selectedLayer.shadow} onChange={(v) => updateSelectedLayer({ shadow: v })} />
              {selectedLayer.shadow && (
                <>
                  <PrettySlider
                    label="Intensidade da Sombra"
                    valueDisplay={`${selectedLayer.shadowOpacity ?? 75}%`}
                    min={5}
                    max={100}
                    value={selectedLayer.shadowOpacity ?? 75}
                    onChange={(v) => updateSelectedLayer({ shadowOpacity: v })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <PrettySlider label="Suavidade" valueDisplay={`${selectedLayer.shadowBlur ?? 24}px`} min={0} max={60} value={selectedLayer.shadowBlur ?? 24} onChange={(v) => updateSelectedLayer({ shadowBlur: v })} />
                    <PrettySlider label="Distância Y" valueDisplay={`${selectedLayer.shadowOffsetY ?? 8}px`} min={0} max={35} value={selectedLayer.shadowOffsetY ?? 8} onChange={(v) => updateSelectedLayer({ shadowOffsetY: v })} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {selectedLayer.type === 'glass' && (
          <div className="panel-section">
            <span className="studio-label" style={{ color: '#38bdf8' }}>Dimensões, Arredondamento & Vidro</span>
            <PrettySlider label="Largura do Box" valueDisplay={`${selectedLayer.boxWidth ?? 80}%`} min={6} max={100} step={0.5} value={selectedLayer.boxWidth ?? 80} onChange={(v) => updateSelectedLayer({ boxWidth: v })} />
            <PrettySlider label="Altura do Box" valueDisplay={`${selectedLayer.boxHeight ?? 22}%`} min={4} max={100} step={0.5} value={selectedLayer.boxHeight ?? 22} onChange={(v) => updateSelectedLayer({ boxHeight: v })} />
            <PrettySlider label="Arredondamento dos Cantos" valueDisplay={`${selectedLayer.borderRadius ?? 32}px`} min={0} max={180} value={selectedLayer.borderRadius ?? 32} onChange={(v) => updateSelectedLayer({ borderRadius: v })} />
            <PrettySlider label="Desfoque do Fundo (Blur)" valueDisplay={`${selectedLayer.glassBlur ?? 18}px`} min={0} max={45} value={selectedLayer.glassBlur ?? 18} onChange={(v) => updateSelectedLayer({ glassBlur: v })} />
            <ColorPill label="Tonalidade do Vidro" color={selectedLayer.glassTint || '#0f172a'} onChange={(hex) => updateSelectedLayer({ glassTint: hex })} />
            <PrettySlider label="Preenchimento do Vidro" valueDisplay={`${selectedLayer.glassOpacity ?? 42}%`} min={5} max={90} value={selectedLayer.glassOpacity ?? 42} onChange={(v) => updateSelectedLayer({ glassOpacity: v })} />
            <PrettySlider label="Brilho da Borda" valueDisplay={`${selectedLayer.glassBorderOpacity ?? 35}%`} min={0} max={100} value={selectedLayer.glassBorderOpacity ?? 35} onChange={(v) => updateSelectedLayer({ glassBorderOpacity: v })} />
          </div>
        )}
      </div>
    );
  };

  const renderLayersList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {[...layers].reverse().map((layer) => (
        <div
          key={layer.id}
          onClick={() => {
            setEditingTextId(null);
            setSelectedId(layer.id);
            if (isMobile) setMobileTab('inspector');
          }}
          onDoubleClick={() => {
            if (layer.type === 'text') {
              setSelectedId(layer.id);
              setEditingTextId(layer.id);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.52rem 0.65rem',
            borderRadius: '10px',
            cursor: 'pointer',
            background: selectedId === layer.id ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.03)',
            border: selectedId === layer.id ? '1px solid rgba(14,165,233,0.55)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            {layer.type === 'text' ? <Type size={14} color="#0ea5e9" /> : layer.type === 'glass' ? <Square size={14} color="#38bdf8" /> : <ImageIcon size={14} color="#f59e0b" />}
            <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: layer.visible ? '#f8fafc' : '#64748b' }}>
              {layer.type === 'text' ? (layer.text?.replace(/\n/g, ' ') || layer.name) : layer.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(layer.id, 'up'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }} title="Subir camada"><ChevronUp size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(layer.id, 'down'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }} title="Descer camada"><ChevronDown size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }}>
              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.filter((l) => l.id !== layer.id)); if (selectedId === layer.id) setSelectedId(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', background: '#060911', color: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); }
        @font-face { font-family: 'StratumNo2'; src: url('/fonts/stratumno2_regular.otf') format('opentype'); }
        @font-face { font-family: 'PosicaoFont'; src: url('/fonts/posicao.otf') format('opentype'); }

        * { box-sizing: border-box; font-family: 'Regular', system-ui, sans-serif; }

        .studio-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255,255,255,0.11);
          color: #f8fafc;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .studio-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
        }

        .studio-label {
          font-size: 0.68rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
          margin-bottom: 0.3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pretty-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          transition: filter 0.15s;
        }
        .pretty-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #0ea5e9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 0 3px rgba(14, 165, 233, 0.18);
          cursor: grab;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .pretty-range::-webkit-slider-thumb:hover {
          transform: scale(1.14);
          box-shadow: 0 2px 10px rgba(14, 165, 233, 0.55), 0 0 0 5px rgba(14, 165, 233, 0.25);
        }
        .pretty-range::-moz-range-thumb {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #0ea5e9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          cursor: grab;
        }

        .tool-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #cbd5e1;
          padding: 0.46rem 0.78rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.18s ease;
        }
        .tool-pill:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .tool-pill.active {
          background: rgba(14, 165, 233, 0.18);
          border-color: #0ea5e9;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.16);
        }

        .panel-section {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 13px;
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .studio-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .studio-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
      `}</style>

      <header
        style={{
          minHeight: isMobile ? '54px' : '60px',
          background: '#0b0f19',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0.4rem 0.75rem' : '0 1.25rem',
          gap: '0.5rem',
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={() => navigate('/intranet')} className="tool-pill" style={{ padding: isMobile ? '0.42rem 0.6rem' : undefined }}>
            <ArrowLeft size={15} /> {!isMobile && 'Workspace'}
          </button>
          {!isMobile && <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />}
          <span style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: isMobile ? '0.92rem' : '1.05rem', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            EDAFS <span style={{ color: '#0ea5e9' }}>STUDIO</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button
              key={key}
              className={`tool-pill ${preset === key ? 'active' : ''}`}
              style={{ padding: isMobile ? '0.38rem 0.6rem' : undefined }}
              onClick={() => {
                setEditingTextId(null);
                setPreset(key);
              }}
            >
              <span>{isMobile ? PRESETS[key].shortLabel : PRESETS[key].label}</span>
              {!isMobile && <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>{PRESETS[key].sub}</span>}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            className={`tool-pill ${showSafeGuides ? 'active' : ''}`}
            style={{ padding: isMobile ? '0.42rem 0.55rem' : undefined }}
            onClick={() => setShowSafeGuides(!showSafeGuides)}
            title="Mostrar/Ocultar Guias e Corte 1:1"
          >
            <Grid size={14} /> {!isMobile && 'Guias'}
          </button>

          {!isMobile && (
            <StudioSelect compact value={exportScale} options={QUALITY_OPTIONS} onChange={setExportScale} />
          )}

          <button
            onClick={handleExportMaxQualityPNG}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#fff',
              border: 'none',
              padding: isMobile ? '0.45rem 0.75rem' : '0.54rem 1.1rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: isMobile ? '0.76rem' : '0.82rem',
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 18px rgba(14, 165, 233, 0.32)',
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={15} /> {isExporting ? 'Gerando...' : isMobile ? 'Baixar HD' : 'Exportar PNG'}
          </button>
        </div>
      </header>

      {!isMobile ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <aside style={{ width: '330px', background: '#0b0f19', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '0.5rem', gap: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button className={`tool-pill ${activeLeftTab === 'bg' ? 'active' : ''}`} style={{ justifyContent: 'center', padding: '0.45rem 0.2rem', fontSize: '0.72rem' }} onClick={() => setActiveLeftTab('bg')}>
                <ImageIcon size={13} /> Foto
              </button>
              <button className={`tool-pill ${activeLeftTab === 'overlays' ? 'active' : ''}`} style={{ justifyContent: 'center', padding: '0.45rem 0.2rem', fontSize: '0.72rem' }} onClick={() => setActiveLeftTab('overlays')}>
                <Wand2 size={13} /> Efeitos
              </button>
              <button className={`tool-pill ${activeLeftTab === 'elements' ? 'active' : ''}`} style={{ justifyContent: 'center', padding: '0.45rem 0.2rem', fontSize: '0.72rem' }} onClick={() => setActiveLeftTab('elements')}>
                <Plus size={13} /> Inserir
              </button>
              <button className={`tool-pill ${activeLeftTab === 'templates' ? 'active' : ''}`} style={{ justifyContent: 'center', padding: '0.45rem 0.2rem', fontSize: '0.72rem' }} onClick={() => setActiveLeftTab('templates')}>
                <Sparkles size={13} /> Presets
              </button>
            </div>

            <div className="studio-scroll" style={{ padding: '0.9rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {activeLeftTab === 'bg' && renderBgPanel()}
              {activeLeftTab === 'overlays' && renderOverlaysPanel()}
              {activeLeftTab === 'elements' && renderElementsPanel()}
              {activeLeftTab === 'templates' && renderTemplatesPanel()}
            </div>
          </aside>

          <main
            onDragOver={(e) => { e.preventDefault(); setIsDropHover(true); }}
            onDragLeave={() => setIsDropHover(false)}
            onDrop={handleDropFile}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              background: isDropHover
                ? 'radial-gradient(circle at center, rgba(14,165,233,0.22) 0%, #05070c 100%)'
                : 'radial-gradient(circle at center, #111827 0%, #05070c 100%)',
              border: isDropHover ? '2px dashed #0ea5e9' : '2px solid transparent',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              ref={artboardWrapRef}
              style={{
                position: 'relative',
                maxHeight: 'calc(100vh - 118px)',
                maxWidth: '100%',
                aspectRatio: `${currentSpec.width} / ${currentSpec.height}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: `${artboardRadius * scaleDisplayFactor}px`,
              }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                onWheel={handleWheelZoom}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  cursor: dragState ? (dragState.mode === 'resize' ? HANDLE_CURSORS[dragState.handle] : 'grabbing') : hoverCursor,
                  touchAction: 'none',
                  display: 'block',
                }}
              />

              {editingLayer && (
                <textarea
                  ref={inlineTextareaRef}
                  value={editingLayer.text || ''}
                  onChange={(e) => setLayers((prev) => prev.map((l) => (l.id === editingLayer.id ? { ...l, text: e.target.value } : l)))}
                  onBlur={() => setEditingTextId(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setEditingTextId(null); } }}
                  rows={Math.max(1, (editingLayer.text || '').split('\n').length)}
                  style={{
                    position: 'absolute',
                    left: `${editingLayer.x}%`,
                    top: `${editingLayer.y}%`,
                    transform: editingLayer.align === 'left' ? 'translate(0%, -50%)' : editingLayer.align === 'right' ? 'translate(-100%, -50%)' : 'translate(-50%, -50%)',
                    minWidth: '180px',
                    width: '88%',
                    background: 'rgba(3, 7, 18, 0.45)',
                    backdropFilter: 'blur(6px)',
                    border: '2px solid #0ea5e9',
                    borderRadius: '10px',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    padding: '6px 10px',
                    color: editingLayer.color || '#ffffff',
                    fontFamily: `"${editingLayer.fontFamily || 'Comum'}", sans-serif`,
                    fontWeight: 'bold',
                    fontSize: `${Math.max(12, (editingLayer.fontSize ?? 64) * scaleDisplayFactor)}px`,
                    lineHeight: editingLayer.lineHeight ?? 1.12,
                    letterSpacing: `${(editingLayer.letterSpacing ?? 0) * scaleDisplayFactor}px`,
                    textAlign: editingLayer.align || 'center',
                    textTransform: editingLayer.uppercase ? 'uppercase' : 'none',
                    zIndex: 30,
                    boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.25)',
                  }}
                />
              )}
            </div>

            <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.1rem', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
              <span><Keyboard size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> <strong>2x Clique no Texto:</strong> Editar na Tela</span>
              <span><strong>Alças:</strong> Redimensionar (Alt = Centro)</span>
              <span><strong>Del:</strong> Apagar</span>
              <span><strong>Ctrl+D:</strong> Duplicar</span>
              <span><strong>Arrastar Vazio / Scroll:</strong> Mover & Zoom Foto</span>
            </div>
          </main>

          <aside style={{ width: '355px', background: '#0b0f19', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="studio-scroll" style={{ padding: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flex: 1, overflowY: 'auto' }}>
              <span className="studio-label" style={{ marginBottom: '0.6rem' }}>Propriedades do Elemento</span>
              {renderInspectorPanel()}
            </div>

            <div style={{ height: '220px', padding: '0.85rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span className="studio-label" style={{ marginBottom: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Layers size={13} color="#0ea5e9" /> Camadas ({layers.length})</span>
              </span>
              <div className="studio-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                {renderLayersList()}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              height: '46dvh',
              minHeight: '250px',
              background: 'radial-gradient(circle at center, #111827 0%, #05070c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.65rem',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              ref={artboardWrapRef}
              style={{
                position: 'relative',
                height: '100%',
                maxWidth: '100%',
                aspectRatio: `${currentSpec.width} / ${currentSpec.height}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 14px 35px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                style={{ width: '100%', height: '100%', objectFit: 'contain', touchAction: 'none', display: 'block' }}
              />

              {editingLayer && (
                <textarea
                  ref={inlineTextareaRef}
                  value={editingLayer.text || ''}
                  onChange={(e) => setLayers((prev) => prev.map((l) => (l.id === editingLayer.id ? { ...l, text: e.target.value } : l)))}
                  onBlur={() => setEditingTextId(null)}
                  rows={Math.max(1, (editingLayer.text || '').split('\n').length)}
                  style={{
                    position: 'absolute',
                    left: `${editingLayer.x}%`,
                    top: `${editingLayer.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '92%',
                    background: 'rgba(3, 7, 18, 0.72)',
                    border: '2px solid #0ea5e9',
                    borderRadius: '10px',
                    outline: 'none',
                    resize: 'none',
                    padding: '6px 8px',
                    color: editingLayer.color || '#ffffff',
                    fontFamily: `"${editingLayer.fontFamily || 'Comum'}", sans-serif`,
                    fontWeight: 'bold',
                    fontSize: `${Math.max(13, (editingLayer.fontSize ?? 64) * scaleDisplayFactor)}px`,
                    textAlign: editingLayer.align || 'center',
                    textTransform: editingLayer.uppercase ? 'uppercase' : 'none',
                    zIndex: 30,
                  }}
                />
              )}
            </div>
          </div>

          <div
            className="studio-scroll"
            style={{
              display: 'flex',
              gap: '0.35rem',
              padding: '0.45rem 0.65rem',
              background: '#0b0f19',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            <button className={`tool-pill ${mobileTab === 'inspector' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('inspector')}>
              <Sliders size={13} /> Editar Item
            </button>
            <button className={`tool-pill ${mobileTab === 'elements' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('elements')}>
              <Plus size={13} /> Inserir
            </button>
            <button className={`tool-pill ${mobileTab === 'bg' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('bg')}>
              <ImageIcon size={13} /> Foto
            </button>
            <button className={`tool-pill ${mobileTab === 'overlays' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('overlays')}>
              <Wand2 size={13} /> Efeitos
            </button>
            <button className={`tool-pill ${mobileTab === 'layers' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('layers')}>
              <Layers size={13} /> Camadas ({layers.length})
            </button>
            <button className={`tool-pill ${mobileTab === 'templates' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('templates')}>
              <Sparkles size={13} /> Presets
            </button>
          </div>

          <div className="studio-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', background: '#090d16', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mobileTab === 'inspector' && renderInspectorPanel()}
            {mobileTab === 'elements' && renderElementsPanel()}
            {mobileTab === 'bg' && renderBgPanel()}
            {mobileTab === 'overlays' && renderOverlaysPanel()}
            {mobileTab === 'templates' && renderTemplatesPanel()}
            {mobileTab === 'layers' && (
              <div className="panel-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="studio-label" style={{ margin: 0 }}>Qualidade de Exportação</span>
                  <StudioSelect compact value={exportScale} options={QUALITY_OPTIONS} onChange={setExportScale} />
                </div>
                {renderLayersList()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}