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
import a29Cutout from '../images/a-29.png';

import img1 from '../images/1.png';
import img2 from '../images/2.png';
import img3 from '../images/3.png';
import img4 from '../images/4.png';
import img5 from '../images/5.png';
import img6 from '../images/6.png';
import tucano2 from '../images/tucano2.jpg';
import tucano4 from '../images/tucano4.jpg';
import tucano10 from '../images/tucano10.png';

type PresetKey = 'landscape' | 'square' | 'portrait' | 'reels';
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
  landscape: { label: 'Live / Paisagem', shortLabel: '16:9', sub: '1920 × 1080', width: 1920, height: 1080 },
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
  blendMode?: GlobalCompositeOperation;

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
  hollowText?: boolean;
  behindSubject?: boolean;
  depthSensitivity?: number;
  motionTrail?: boolean;
  motionDistance?: number;
  motionAngle?: number;
  motionOpacity?: number;
  anamorphicStreak?: boolean;
  streakWidth?: number;
  streakColor?: string;
  streakOpacity?: number;
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

const BLEND_OPTIONS = [
  { value: 'source-over', label: 'Normal (Padrão)' },
  { value: 'overlay', label: 'Overlay (Mesclar Luz)' },
  { value: 'soft-light', label: 'Luz Suave (Fumaça)' },
  { value: 'screen', label: 'Screen (Clarear)' },
  { value: 'difference', label: 'Difference (Contraste)' },
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
  const rawPhotoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskHelperCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noisePatternRef = useRef<CanvasPattern | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const layerBoundsRef = useRef<Record<string, HitBox>>({});

  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 960 : false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('inspector');

  const [preset, setPreset] = useState<PresetKey>('landscape');
  const [exportScale, setExportScale] = useState<string>('2');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [bgSrc, setBgSrc] = useState<string>(img5);
  const [bgBaseColor, setBgBaseColor] = useState<string>('#061526');
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [bgScale, setBgScale] = useState<number>(1.04);
  const [bgOffsetX, setBgOffsetX] = useState<number>(0);
  const [bgOffsetY, setBgOffsetY] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(102);
  const [bgContrast, setBgContrast] = useState<number>(108);
  const [bgSaturation, setBgSaturation] = useState<number>(110);
  const [artboardRadius, setArtboardRadius] = useState<number>(0);

  const [diagLines, setDiagLines] = useState<number>(48);
  const [diagSpacing, setDiagSpacing] = useState<number>(10);
  const [scanlines, setScanlines] = useState<number>(10);
  const [rgbShift, setRgbShift] = useState<number>(1.5);
  const [frameEnabled, setFrameEnabled] = useState<boolean>(true);
  const [frameColor, setFrameColor] = useState<string>('#38bdf8');
  const [frameOpacity, setFrameOpacity] = useState<number>(78);
  const [frameInset, setFrameInset] = useState<number>(32);
  const [frameRadius, setFrameRadius] = useState<number>(42);
  const [frameThickness, setFrameThickness] = useState<number>(3);

  const [bottomShadow, setBottomShadow] = useState<number>(40);
  const [bottomShadowHeight, setBottomShadowHeight] = useState<number>(36);
  const [topGradient, setTopGradient] = useState<number>(22);
  const [radialVignette, setRadialVignette] = useState<number>(30);
  const [gradOverlayOpacity, setGradOverlayOpacity] = useState<number>(28);
  const [gradColorA, setGradColorA] = useState<string>('#38bdf8');
  const [gradColorB, setGradColorB] = useState<string>('#041536');
  const [gradAngle, setGradAngle] = useState<number>(25);
  const [filmGrain, setFilmGrain] = useState<number>(10);

  const [showSafeGuides, setShowSafeGuides] = useState<boolean>(false);
  const [isDropHover, setIsDropHover] = useState<boolean>(false);
  const [hoverCursor, setHoverCursor] = useState<string>('default');

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [artboardDisplaySize, setArtboardDisplaySize] = useState<{ w: number; h: number }>({ w: 960, h: 540 });

  const [layers, setLayers] = useState<StudioLayer[]>([
    {
      id: 'speed-main-title',
      type: 'text',
      name: 'Título Arrasto (EM AÇÃO)',
      visible: true,
      x: 64,
      y: 61,
      text: 'EM AÇÃO',
      fontFamily: 'StratumNo2',
      fontSize: 235,
      color: '#67e8f9',
      useGradient: true,
      color2: '#1d4ed8',
      gradientAngle: 0,
      align: 'center',
      uppercase: true,
      hollowText: false,
      behindSubject: true,
      depthSensitivity: 44,
      motionTrail: true,
      motionDistance: 115,
      motionAngle: 180,
      motionOpacity: 62,
      shadow: true,
      shadowColor: '#020617',
      shadowOpacity: 40,
      shadowBlur: 24,
      shadowOffsetY: 8,
      letterSpacing: 10,
      lineHeight: 0.95,
      opacity: 96,
    },
    {
      id: 'streak-subtitle',
      type: 'text',
      name: 'Subtítulo com Feixe',
      visible: true,
      x: 64,
      y: 73,
      text: 'DEMONSTRAÇÕES DO 1° SEMESTRE',
      fontFamily: 'Comum',
      fontSize: 34,
      color: '#f8fafc',
      align: 'center',
      uppercase: true,
      behindSubject: true,
      depthSensitivity: 44,
      anamorphicStreak: true,
      streakWidth: 92,
      streakColor: '#7dd3fc',
      streakOpacity: 75,
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 70,
      shadowBlur: 14,
      shadowOffsetY: 3,
      letterSpacing: 9,
      lineHeight: 1.1,
      opacity: 98,
    },
    {
      id: 'sig-edafs',
      type: 'text',
      name: 'Assinatura Fumaça',
      visible: true,
      x: 18,
      y: 86,
      text: 'FUMAÇA VIRTUAL',
      fontFamily: 'StratumNo2',
      fontSize: 44,
      color: '#ffffff',
      align: 'center',
      uppercase: true,
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 65,
      shadowBlur: 16,
      shadowOffsetY: 4,
      letterSpacing: 4,
      opacity: 95,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('speed-main-title');
  const [activeLeftTab, setActiveLeftTab] = useState<'bg' | 'overlays' | 'elements' | 'templates'>('templates');
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

  const renderAnamorphicStreak = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    canvasW: number,
    widthPct: number,
    hexColor: string,
    opacityPct: number
  ) => {
    const streakW = (widthPct / 100) * canvasW;
    const x0 = centerX - streakW / 2;
    const x1 = centerX + streakW / 2;
    const alpha = (opacityPct / 100) * 0.85;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const glowGrad = ctx.createLinearGradient(x0, centerY, x1, centerY);
    glowGrad.addColorStop(0, hexToRgba(hexColor, 0));
    glowGrad.addColorStop(0.22, hexToRgba(hexColor, alpha * 0.35));
    glowGrad.addColorStop(0.5, hexToRgba('#ffffff', Math.min(1, alpha * 0.85)));
    glowGrad.addColorStop(0.78, hexToRgba(hexColor, alpha * 0.35));
    glowGrad.addColorStop(1, hexToRgba(hexColor, 0));

    const vertGlow = ctx.createLinearGradient(centerX, centerY - 22, centerX, centerY + 22);
    vertGlow.addColorStop(0, 'rgba(0,0,0,0)');
    vertGlow.addColorStop(0.5, hexToRgba(hexColor, alpha * 0.32));
    vertGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vertGlow;
    ctx.fillRect(x0, centerY - 22, streakW, 44);

    ctx.fillStyle = glowGrad;
    ctx.fillRect(x0, centerY - 2.2, streakW, 4.4);
    ctx.fillRect(x0 + streakW * 0.1, centerY - 12, streakW * 0.8, 1.5);
    ctx.fillRect(x0 + streakW * 0.1, centerY + 11, streakW * 0.8, 1.5);

    ctx.restore();
  };

  const applySubjectForegroundMask = (
    ctx: CanvasRenderingContext2D,
    rawPhotoCanvas: HTMLCanvasElement,
    styledBgCanvas: HTMLCanvasElement,
    region: HitBox,
    W: number,
    H: number,
    sensitivity: number,
    scaleFactor: number
  ) => {
    const rx = Math.max(0, Math.floor(region.x));
    const ry = Math.max(0, Math.floor(region.y));
    const rw = Math.min(W - rx, Math.ceil(region.w));
    const rh = Math.min(H - ry, Math.ceil(region.h));
    if (rw <= 4 || rh <= 4) return;

    const rawCtx = rawPhotoCanvas.getContext('2d', { willReadFrequently: true });
    if (!rawCtx) return;

    const samplePts = [
      [Math.floor(W * 0.06), Math.floor(H * 0.06)],
      [Math.floor(W * 0.5), Math.floor(H * 0.04)],
      [Math.floor(W * 0.94), Math.floor(H * 0.06)],
      [Math.floor(W * 0.12), Math.max(2, ry)],
      [Math.floor(W * 0.88), Math.max(2, ry)],
    ];

    let sR = 0;
    let sG = 0;
    let sB = 0;
    samplePts.forEach(([sx, sy]) => {
      const p = rawCtx.getImageData(Math.min(W - 1, Math.max(0, sx)), Math.min(H - 1, Math.max(0, sy)), 1, 1).data;
      sR += p[0];
      sG += p[1];
      sB += p[2];
    });
    sR /= samplePts.length;
    sG /= samplePts.length;
    sB /= samplePts.length;

    const patch = rawCtx.getImageData(rx, ry, rw, rh);
    const data = patch.data;
    const thresh = Math.max(12, 108 - sensitivity * 0.95);
    const feather = 26;

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - sR;
      const dg = data[i + 1] - sG;
      const db = data[i + 2] - sB;
      const dist = Math.sqrt(dr * dr * 0.32 + dg * dg * 0.42 + db * db * 0.26) * 1.65;

      let alpha = 0;
      if (dist > thresh + feather) {
        alpha = 255;
      } else if (dist > thresh) {
        alpha = Math.round(((dist - thresh) / feather) * 255);
      }
      data[i + 3] = alpha;
    }

    if (!maskHelperCanvasRef.current) {
      maskHelperCanvasRef.current = document.createElement('canvas');
    }
    const maskC = maskHelperCanvasRef.current;
    maskC.width = rw;
    maskC.height = rh;
    const mCtx = maskC.getContext('2d')!;
    mCtx.putImageData(patch, 0, 0);

    mCtx.globalCompositeOperation = 'source-in';
    mCtx.drawImage(
      styledBgCanvas,
      rx * scaleFactor,
      ry * scaleFactor,
      rw * scaleFactor,
      rh * scaleFactor,
      0,
      0,
      rw,
      rh
    );
    mCtx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(maskC, rx, ry, rw, rh);
    ctx.restore();
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

      const needsDepthMask = layers.some((l) => l.visible && l.type === 'text' && l.behindSubject);
      if (needsDepthMask) {
        if (!rawPhotoCanvasRef.current) {
          rawPhotoCanvasRef.current = document.createElement('canvas');
        }
        rawPhotoCanvasRef.current.width = W;
        rawPhotoCanvasRef.current.height = H;
        const rCtx = rawPhotoCanvasRef.current.getContext('2d', { willReadFrequently: true })!;
        rCtx.fillStyle = bgBaseColor || '#030712';
        rCtx.fillRect(0, 0, W, H);
      }

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

          if (needsDepthMask && rawPhotoCanvasRef.current) {
            const rCtx = rawPhotoCanvasRef.current.getContext('2d', { willReadFrequently: true })!;
            rCtx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          }
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
        ctx.globalCompositeOperation = layer.blendMode || 'source-over';

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

          const extraTrailPad = layer.motionTrail ? (layer.motionDistance ?? 95) + 20 : 0;
          const computedTextBounds: HitBox = {
            x: boxX - 20 - extraTrailPad,
            y: boxY - 16 - extraTrailPad * 0.35,
            w: maxLineW + 40 + extraTrailPad * 2,
            h: totalHeight + 32 + extraTrailPad * 0.7,
          };

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

          if (layer.anamorphicStreak) {
            renderAnamorphicStreak(
              ctx,
              posX,
              posY,
              W,
              layer.streakWidth ?? 88,
              layer.streakColor || '#7dd3fc',
              layer.streakOpacity ?? 75
            );
          }

          const isEditingThis = !exportMode && editingTextId === layer.id;

          if (!isEditingThis) {
            let paintStyle: string | CanvasGradient = layer.color || '#ffffff';
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
              paintStyle = tGrad;
            }

            if (layer.motionTrail && (layer.motionDistance ?? 0) > 0) {
              const dist = layer.motionDistance ?? 95;
              const angRad = ((layer.motionAngle ?? 180) * Math.PI) / 180;
              const dx = Math.cos(angRad);
              const dy = Math.sin(angRad);
              const maxTrailAlpha = ((layer.motionOpacity ?? 58) / 100) * layerAlpha;
              const steps = 28;

              ctx.save();
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              for (let s = steps; s >= 1; s--) {
                const t = s / steps;
                const offsetDist = t * dist;
                const falloff = Math.pow(1 - t, 2.15);
                ctx.globalAlpha = Math.max(0.005, maxTrailAlpha * falloff * 0.24);

                if (layer.hollowText) {
                  ctx.lineWidth = Math.max(2, layer.strokeWidth || 4);
                  ctx.strokeStyle = paintStyle;
                  lines.forEach((line, idx) =>
                    ctx.strokeText(line, posX + dx * offsetDist, startY + idx * lineHeight + dy * offsetDist)
                  );
                } else {
                  ctx.fillStyle = paintStyle;
                  lines.forEach((line, idx) =>
                    ctx.fillText(line, posX + dx * offsetDist, startY + idx * lineHeight + dy * offsetDist)
                  );
                }
              }
              ctx.restore();
            }

            if (layer.hollowText) {
              const hollowStrokeW = Math.max(2, layer.strokeWidth || 4);
              ctx.save();
              ctx.lineWidth = hollowStrokeW;
              ctx.strokeStyle = (layer.strokeWidth ?? 0) > 0 && layer.strokeColor ? layer.strokeColor : paintStyle;
              ctx.lineJoin = 'round';
              if (layer.glow) {
                ctx.shadowColor = layer.glowColor || '#0ea5e9';
                ctx.shadowBlur = (layer.glowBlur ?? 28) * scaleFactor;
              } else if (layer.shadow) {
                const textShadowAlpha = (layer.shadowOpacity ?? 75) / 100;
                ctx.shadowColor = hexToRgba(layer.shadowColor || '#000000', textShadowAlpha);
                ctx.shadowBlur = (layer.shadowBlur ?? 20) * scaleFactor;
                ctx.shadowOffsetY = (layer.shadowOffsetY ?? 6) * scaleFactor;
              }
              lines.forEach((line, idx) => ctx.strokeText(line, posX, startY + idx * lineHeight));
              ctx.restore();
            } else {
              ctx.fillStyle = paintStyle;

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

            if (layer.behindSubject && rawPhotoCanvasRef.current) {
              applySubjectForegroundMask(
                ctx,
                rawPhotoCanvasRef.current,
                bgCanvas,
                computedTextBounds,
                W,
                H,
                layer.depthSensitivity ?? 42,
                scaleFactor
              );
            }
          }

          if (!exportMode) {
            nextBounds[layer.id] = { x: boxX - 18, y: boxY - 14, w: maxLineW + 36, h: totalHeight + 28 };
          }
        }

        ctx.restore();
      }

      if (!exportMode) {
        layerBoundsRef.current = nextBounds;
      }

      if (rgbShift > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.22;
        const shiftPx = rgbShift * scaleFactor;
        ctx.drawImage(targetCanvas, shiftPx, 0);
        ctx.restore();
      }

      if (diagLines > 0) {
        ctx.save();
        const step = Math.max(5, diagSpacing);
        const alpha = (diagLines / 100) * 0.28;
        ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
        ctx.lineWidth = 1.6;
        const diagSpan = W + H;
        ctx.beginPath();
        for (let x = -H; x < diagSpan; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x + H * 0.42, H);
        }
        ctx.stroke();

        ctx.strokeStyle = `rgba(2, 6, 23, ${alpha * 0.85})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = -H + step / 2; x < diagSpan; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x + H * 0.42, H);
        }
        ctx.stroke();
        ctx.restore();
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

      if (frameEnabled && frameOpacity > 0) {
        ctx.save();
        const inset = frameInset;
        const fw = Math.max(40, W - inset * 2);
        const fh = Math.max(40, H - inset * 2);
        drawRoundedRectPath(ctx, inset, inset, fw, fh, frameRadius);
        const fGrad = ctx.createLinearGradient(inset, inset, inset + fw, inset + fh);
        fGrad.addColorStop(0, hexToRgba(frameColor, frameOpacity / 100));
        fGrad.addColorStop(1, hexToRgba('#2563eb', (frameOpacity / 100) * 0.9));
        ctx.strokeStyle = fGrad;
        ctx.lineWidth = frameThickness;
        ctx.shadowColor = hexToRgba(frameColor, (frameOpacity / 100) * 0.55);
        ctx.shadowBlur = 12 * scaleFactor;
        ctx.stroke();
        ctx.restore();
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
      diagLines, diagSpacing, scanlines, rgbShift, frameEnabled, frameColor, frameOpacity, frameInset, frameRadius, frameThickness,
      bottomShadow, bottomShadowHeight, topGradient, radialVignette, gradOverlayOpacity,
      gradColorA, gradColorB, gradAngle, filmGrain, layers, selectedId, editingTextId, showSafeGuides, preset, isMobile, loadImg
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
        const nextFont = Math.max(14, Math.min(420, Math.round(baseFont * ratio)));
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
        fontSize: 78,
        color: '#ffffff',
        useGradient: false,
        color2: '#38bdf8',
        gradientAngle: 180,
        align: 'center',
        uppercase: true,
        hollowText: false,
        behindSubject: false,
        depthSensitivity: 42,
        motionTrail: false,
        motionDistance: 105,
        motionAngle: 180,
        motionOpacity: 60,
        anamorphicStreak: false,
        streakWidth: 88,
        streakColor: '#7dd3fc',
        streakOpacity: 75,
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
        y: 50,
        src,
        scale: 0.45,
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

  const applyQuickTemplate = (
    kind: 'speed_em_acao' | 'broadcast_bauru' | 'hollow_editorial' | 'live_stream' | 'glass_reels' | 'agenda_gold' | 'notam_hud'
  ) => {
    setEditingTextId(null);
    if (kind === 'speed_em_acao') {
      setPreset('landscape');
      setBgSrc(img5);
      setDiagLines(48);
      setDiagSpacing(10);
      setScanlines(10);
      setRgbShift(1.5);
      setFrameEnabled(true);
      setFrameColor('#38bdf8');
      setFrameOpacity(78);
      setFrameInset(32);
      setFrameRadius(42);
      setBottomShadow(40);
      setGradOverlayOpacity(28);
      setGradColorA('#38bdf8');
      setGradColorB('#041536');
      setGradAngle(25);
      setLayers([
        {
          id: 'sa1',
          type: 'text',
          name: 'Título Arrasto (EM AÇÃO)',
          visible: true,
          x: 64,
          y: 61,
          text: 'EM AÇÃO',
          fontFamily: 'StratumNo2',
          fontSize: 235,
          color: '#67e8f9',
          useGradient: true,
          color2: '#1d4ed8',
          gradientAngle: 0,
          align: 'center',
          uppercase: true,
          behindSubject: true,
          depthSensitivity: 44,
          motionTrail: true,
          motionDistance: 115,
          motionAngle: 180,
          motionOpacity: 62,
          shadow: true,
          shadowColor: '#020617',
          shadowOpacity: 40,
          shadowBlur: 24,
          shadowOffsetY: 8,
          letterSpacing: 10,
          lineHeight: 0.95,
          opacity: 96,
        },
        {
          id: 'sa2',
          type: 'text',
          name: 'Subtítulo com Feixe',
          visible: true,
          x: 64,
          y: 73,
          text: 'DEMONSTRAÇÕES DO 1° SEMESTRE',
          fontFamily: 'Comum',
          fontSize: 34,
          color: '#f8fafc',
          align: 'center',
          uppercase: true,
          behindSubject: true,
          depthSensitivity: 44,
          anamorphicStreak: true,
          streakWidth: 92,
          streakColor: '#7dd3fc',
          streakOpacity: 75,
          shadow: true,
          shadowOpacity: 70,
          shadowBlur: 14,
          shadowOffsetY: 3,
          letterSpacing: 9,
          opacity: 98,
        },
        {
          id: 'sa3',
          type: 'text',
          name: 'Assinatura Fumaça',
          visible: true,
          x: 18,
          y: 86,
          text: 'FUMAÇA VIRTUAL',
          fontFamily: 'StratumNo2',
          fontSize: 44,
          color: '#ffffff',
          align: 'center',
          uppercase: true,
          shadow: true,
          shadowOpacity: 65,
          shadowBlur: 16,
          shadowOffsetY: 4,
          letterSpacing: 4,
          opacity: 95,
        },
      ]);
    } else if (kind === 'broadcast_bauru') {
      setPreset('landscape');
      setBgSrc(tucano10);
      setDiagLines(52);
      setDiagSpacing(10);
      setScanlines(12);
      setRgbShift(2);
      setFrameEnabled(true);
      setFrameColor('#38bdf8');
      setFrameOpacity(80);
      setFrameInset(32);
      setFrameRadius(42);
      setBottomShadow(45);
      setGradOverlayOpacity(28);
      setGradColorA('#0284c7');
      setGradColorB('#041324');
      setLayers([
        { id: 'bb1', type: 'text', name: 'Evento Topo', visible: true, x: 38, y: 12, text: '10° ARRAIÁ AÉREO', fontFamily: 'Comum', fontSize: 48, color: '#f8fafc', align: 'center', uppercase: true, shadow: true, shadowOpacity: 55, shadowBlur: 18, shadowOffsetY: 4, letterSpacing: 14, opacity: 95 },
        { id: 'bb2', type: 'text', name: 'Cidade Atrás do Avião', visible: true, x: 50, y: 29, text: 'BAURU', fontFamily: 'StratumNo2', fontSize: 315, color: '#ffffff', useGradient: true, color2: '#dbeafe', gradientAngle: 180, align: 'center', uppercase: true, behindSubject: true, depthSensitivity: 42, motionTrail: true, motionDistance: 55, motionAngle: 180, motionOpacity: 35, shadow: true, shadowOpacity: 40, shadowBlur: 24, shadowOffsetY: 8, letterSpacing: 16, lineHeight: 0.95, opacity: 96 },
        { id: 'bb3', type: 'text', name: 'Assinatura Canto', visible: true, x: 16, y: 83, text: 'FUMAÇA VIRTUAL', fontFamily: 'StratumNo2', fontSize: 44, color: '#ffffff', align: 'center', uppercase: true, shadow: true, shadowOpacity: 65, shadowBlur: 16, shadowOffsetY: 4, letterSpacing: 4, opacity: 95 },
      ]);
    } else if (kind === 'hollow_editorial') {
      setPreset('portrait');
      setDiagLines(35);
      setScanlines(0);
      setFrameEnabled(true);
      setFrameColor('#ffffff');
      setFrameOpacity(35);
      setFrameInset(28);
      setFrameRadius(32);
      setBottomShadow(85);
      setBottomShadowHeight(55);
      setLayers([
        { id: 'he1', type: 'text', name: 'Fundo Vazado Gigante', visible: true, x: 50, y: 22, text: 'SUPER\nTUCANO', fontFamily: 'StratumNo2', fontSize: 195, color: '#38bdf8', hollowText: true, strokeWidth: 4, align: 'center', uppercase: true, behindSubject: true, depthSensitivity: 40, motionTrail: true, motionDistance: 65, motionAngle: 180, motionOpacity: 45, letterSpacing: 6, lineHeight: 0.9, opacity: 75 },
        { id: 'he2', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 72, src: logoEdafs, scale: 0.36, shadow: true, shadowOpacity: 45, shadowBlur: 28, shadowOffsetY: 6, opacity: 100 },
        { id: 'he3', type: 'text', name: 'Chamada Sólida', visible: true, x: 50, y: 84, text: 'ESQUADRILHA DA FUMAÇA', fontFamily: 'StratumNo2', fontSize: 64, color: '#ffffff', align: 'center', uppercase: true, shadow: true, letterSpacing: 3, opacity: 100 },
        { id: 'he4', type: 'text', name: 'Sub Rodapé', visible: true, x: 50, y: 90, text: 'DEMONSTRAÇÃO AÉREA • MSFS 2024', fontFamily: 'Comum', fontSize: 26, color: '#38bdf8', anamorphicStreak: true, streakWidth: 85, streakColor: '#38bdf8', streakOpacity: 60, align: 'center', uppercase: true, letterSpacing: 6, opacity: 95 },
      ]);
    } else if (kind === 'live_stream') {
      setPreset('landscape');
      setDiagLines(45);
      setScanlines(25);
      setRgbShift(3);
      setFrameEnabled(true);
      setFrameColor('#ef4444');
      setFrameOpacity(65);
      setFrameInset(30);
      setFrameRadius(36);
      setBottomShadow(82);
      setLayers([
        { id: 'ls1', type: 'text', name: 'Badge Ao Vivo', visible: true, x: 14, y: 12, text: '● TRANSMISSÃO AO VIVO', fontFamily: 'Comum', fontSize: 28, color: '#ffffff', textBgGlass: true, textBgPadding: 18, textBgRadius: 999, glow: true, glowColor: '#ef4444', glowBlur: 25, align: 'center', uppercase: true, letterSpacing: 4, opacity: 100 },
        { id: 'ls2', type: 'text', name: 'Título Vazado Fundo', visible: true, x: 50, y: 34, text: 'LIVE SHOW', fontFamily: 'StratumNo2', fontSize: 270, color: '#ffffff', hollowText: true, strokeWidth: 5, behindSubject: true, depthSensitivity: 42, motionTrail: true, motionDistance: 85, motionAngle: 180, motionOpacity: 50, align: 'center', uppercase: true, letterSpacing: 12, opacity: 65 },
        { id: 'ls3', type: 'text', name: 'Local Principal', visible: true, x: 50, y: 80, text: 'PIRASSUNUNGA • AFA', fontFamily: 'StratumNo2', fontSize: 104, color: '#ffffff', useGradient: true, color2: '#93c5fd', gradientAngle: 180, align: 'center', uppercase: true, shadow: true, shadowOpacity: 80, shadowBlur: 28, shadowOffsetY: 8, letterSpacing: 4, opacity: 100 },
        { id: 'ls4', type: 'text', name: 'Horário', visible: true, x: 50, y: 90, text: 'HOJE ÀS 20H00 BRT • YOUTUBE & TWITCH', fontFamily: 'Comum', fontSize: 32, color: '#fde047', anamorphicStreak: true, streakWidth: 80, streakColor: '#f59e0b', streakOpacity: 55, align: 'center', uppercase: true, letterSpacing: 6, shadow: true, opacity: 100 },
      ]);
    } else if (kind === 'glass_reels') {
      setPreset('reels');
      setDiagLines(25);
      setFrameEnabled(true);
      setFrameColor('#38bdf8');
      setFrameOpacity(45);
      setFrameInset(26);
      setFrameRadius(40);
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
      setDiagLines(20);
      setFrameEnabled(false);
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
      setDiagLines(30);
      setScanlines(40);
      setFrameEnabled(true);
      setFrameColor('#ef4444');
      setFrameOpacity(50);
      setRadialVignette(65);
      setGradOverlayOpacity(35);
      setGradColorA('#ef4444');
      setGradColorB('#030712');
      setLayers([
        { id: 'nh1', type: 'glass', name: 'Painel NOTAM', visible: true, x: 50, y: 54, boxWidth: 84, boxHeight: 60, borderRadius: 28, glassBlur: 22, glassTint: '#090d16', glassOpacity: 62, glassBorderOpacity: 35, opacity: 100 },
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
        <span className="studio-label" style={{ color: '#38bdf8' }}>Transmissão Broadcast & Moldura</span>
        <PrettySlider label="Linhas Diagonais (Broadcast)" valueDisplay={`${diagLines}%`} min={0} max={100} value={diagLines} onChange={setDiagLines} />
        {diagLines > 0 && (
          <PrettySlider label="Espaçamento Diagonal" valueDisplay={`${diagSpacing}px`} min={5} max={26} value={diagSpacing} onChange={setDiagSpacing} />
        )}
        <PrettySlider label="Linhas Horizontais (CRT)" valueDisplay={`${scanlines}%`} min={0} max={100} value={scanlines} onChange={setScanlines} />
        <PrettySlider label="Aberração Cromática (RGB TV)" valueDisplay={`${rgbShift}px`} min={0} max={10} step={0.5} value={rgbShift} onChange={setRgbShift} />
        <PrettySlider label="Granulação Cinema (Grain)" valueDisplay={`${filmGrain}%`} min={0} max={100} value={filmGrain} onChange={setFilmGrain} />

        <StudioToggle label="Moldura Interna Broadcast" checked={frameEnabled} onChange={setFrameEnabled} />
        {frameEnabled && (
          <>
            <ColorPill label="Cor da Moldura" color={frameColor} onChange={setFrameColor} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <PrettySlider label="Opacidade" valueDisplay={`${frameOpacity}%`} min={10} max={100} value={frameOpacity} onChange={setFrameOpacity} />
              <PrettySlider label="Espessura" valueDisplay={`${frameThickness}px`} min={1} max={10} step={0.5} value={frameThickness} onChange={setFrameThickness} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <PrettySlider label="Margem Interna" valueDisplay={`${frameInset}px`} min={10} max={90} value={frameInset} onChange={setFrameInset} />
              <PrettySlider label="Arredondamento" valueDisplay={`${frameRadius}px`} min={0} max={100} value={frameRadius} onChange={setFrameRadius} />
            </div>
          </>
        )}
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
        <span className="studio-label" style={{ color: '#10b981' }}>Sombra Inferior & Vinheta</span>
        <PrettySlider label="Intensidade Sombra Inferior" valueDisplay={`${bottomShadow}%`} min={0} max={100} value={bottomShadow} onChange={setBottomShadow} accent="#10b981" />
        <PrettySlider label="Altura Sombra Inferior" valueDisplay={`${bottomShadowHeight}%`} min={15} max={90} value={bottomShadowHeight} onChange={setBottomShadowHeight} accent="#10b981" />
        <PrettySlider label="Sombra do Topo" valueDisplay={`${topGradient}%`} min={0} max={100} value={topGradient} onChange={setTopGradient} accent="#10b981" />
        <PrettySlider label="Vinheta Radial nas Bordas" valueDisplay={`${radialVignette}%`} min={0} max={100} value={radialVignette} onChange={setRadialVignette} accent="#10b981" />
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
        <span className="studio-label">Insígnias & Recortes PNG</span>
        <button onClick={() => addStickerLayer('Brasão EDAFS', logoEdafs)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem', borderRadius: '10px' }}>
          <span>Brasão EDAFS</span>
          <img src={logoEdafs} alt="EDAFS" style={{ height: '22px' }} />
        </button>
        <button onClick={() => addStickerLayer('A-29 Recortado (Sobrepor)', a29Cutout)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem', borderRadius: '10px' }}>
          <span>A-29 Super Tucano (PNG)</span>
          <img src={a29Cutout} alt="A-29" style={{ height: '22px' }} />
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
          <Upload size={14} color="#0ea5e9" /> Importar Avião PNG / Sticker
          <input type="file" accept="image/*" onChange={handleUploadSticker} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );

  const renderTemplatesPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <span className="studio-label">Presets Modernos (1 Clique)</span>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px', borderColor: 'rgba(103,232,249,0.55)', background: 'rgba(14,165,233,0.16)' }} onClick={() => applyQuickTemplate('speed_em_acao')}>
        <strong style={{ color: '#fff' }}>Speed Motion • Em Ação (16:9)</strong>
        <span style={{ fontSize: '0.7rem', color: '#bae6fd' }}>Arrasto de velocidade na fonte, feixe óptico e aviões à frente</span>
      </button>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('broadcast_bauru')}>
        <strong style={{ color: '#fff' }}>Broadcast Airshow • Texto Atrás (16:9)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Linhas diagonais, moldura visor e título atrás da aeronave</span>
      </button>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('hollow_editorial')}>
        <strong style={{ color: '#fff' }}>Pôster Vazado Editorial (4:5)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tipografia gigante vazada (outline) com rasto suave</span>
      </button>
      <button className="tool-pill" style={{ padding: '0.85rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRadius: '12px' }} onClick={() => applyQuickTemplate('live_stream')}>
        <strong style={{ color: '#fff' }}>Capa Live / Transmissão Oficial (16:9)</strong>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tag Ao Vivo neon, efeito RGB de TV e texto vazado</span>
      </button>
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
          Toque ou clique em qualquer elemento na imagem para ativar <strong>Arrasto de Velocidade</strong>, <strong>Texto Atrás do Avião</strong>, <strong>Texto Vazado</strong> ou dê <strong>2 cliques em um texto</strong> para editar na tela.
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
          <div>
            <span className="studio-label">Modo de Mesclagem (Blend)</span>
            <StudioSelect
              value={selectedLayer.blendMode || 'source-over'}
              options={BLEND_OPTIONS}
              onChange={(val) => updateSelectedLayer({ blendMode: val as GlobalCompositeOperation })}
            />
          </div>
        </div>

        {selectedLayer.type === 'text' && (
          <>
            <div className="panel-section" style={{ borderColor: 'rgba(56, 189, 248, 0.32)', background: 'rgba(14, 165, 233, 0.06)' }}>
              <span className="studio-label" style={{ color: '#38bdf8' }}>Arrasto de Velocidade, Profundidade & Vazado</span>

              <StudioToggle
                label="Arrasto de Velocidade (Motion Trail)"
                checked={!!selectedLayer.motionTrail}
                onChange={(v) => updateSelectedLayer({ motionTrail: v })}
              />
              {selectedLayer.motionTrail && (
                <>
                  <PrettySlider
                    label="Comprimento do Arrasto"
                    valueDisplay={`${selectedLayer.motionDistance ?? 110}px`}
                    min={15}
                    max={260}
                    value={selectedLayer.motionDistance ?? 110}
                    onChange={(v) => updateSelectedLayer({ motionDistance: v })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <PrettySlider
                      label="Direção (Ângulo)"
                      valueDisplay={`${selectedLayer.motionAngle ?? 180}°`}
                      min={0}
                      max={360}
                      value={selectedLayer.motionAngle ?? 180}
                      onChange={(v) => updateSelectedLayer({ motionAngle: v })}
                    />
                    <PrettySlider
                      label="Força do Rasto"
                      valueDisplay={`${selectedLayer.motionOpacity ?? 62}%`}
                      min={10}
                      max={100}
                      value={selectedLayer.motionOpacity ?? 62}
                      onChange={(v) => updateSelectedLayer({ motionOpacity: v })}
                    />
                  </div>
                </>
              )}

              <StudioToggle
                label="Feixe de Luz Horizontal (Lens Streak)"
                checked={!!selectedLayer.anamorphicStreak}
                onChange={(v) => updateSelectedLayer({ anamorphicStreak: v })}
              />
              {selectedLayer.anamorphicStreak && (
                <>
                  <ColorPill label="Cor do Feixe" color={selectedLayer.streakColor || '#7dd3fc'} onChange={(hex) => updateSelectedLayer({ streakColor: hex })} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <PrettySlider
                      label="Largura do Feixe"
                      valueDisplay={`${selectedLayer.streakWidth ?? 90}%`}
                      min={20}
                      max={100}
                      value={selectedLayer.streakWidth ?? 90}
                      onChange={(v) => updateSelectedLayer({ streakWidth: v })}
                    />
                    <PrettySlider
                      label="Brilho do Feixe"
                      valueDisplay={`${selectedLayer.streakOpacity ?? 75}%`}
                      min={10}
                      max={100}
                      value={selectedLayer.streakOpacity ?? 75}
                      onChange={(v) => updateSelectedLayer({ streakOpacity: v })}
                    />
                  </div>
                </>
              )}

              <StudioToggle
                label="Colocar Texto Atrás do Avião"
                checked={!!selectedLayer.behindSubject}
                onChange={(v) => updateSelectedLayer({ behindSubject: v })}
              />
              {selectedLayer.behindSubject && (
                <PrettySlider
                  label="Sensibilidade Avião / Fumaça"
                  valueDisplay={`${selectedLayer.depthSensitivity ?? 42}%`}
                  min={10}
                  max={85}
                  value={selectedLayer.depthSensitivity ?? 42}
                  onChange={(v) => updateSelectedLayer({ depthSensitivity: v })}
                />
              )}

              <StudioToggle
                label="Texto Vazado (Só Contorno)"
                checked={!!selectedLayer.hollowText}
                onChange={(v) =>
                  updateSelectedLayer({
                    hollowText: v,
                    strokeWidth: v && !selectedLayer.strokeWidth ? 4 : selectedLayer.strokeWidth,
                  })
                }
              />
              {selectedLayer.hollowText && (
                <PrettySlider
                  label="Espessura da Linha Vazada"
                  valueDisplay={`${selectedLayer.strokeWidth || 4}px`}
                  min={1}
                  max={18}
                  value={selectedLayer.strokeWidth || 4}
                  onChange={(v) => updateSelectedLayer({ strokeWidth: v })}
                />
              )}
            </div>

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

              <PrettySlider label="Tamanho da Fonte" valueDisplay={`${selectedLayer.fontSize || 64}px`} min={14} max={400} value={selectedLayer.fontSize || 64} onChange={(v) => updateSelectedLayer({ fontSize: v })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <PrettySlider label="Espaçamento" valueDisplay={`${selectedLayer.letterSpacing || 0}px`} min={0} max={40} value={selectedLayer.letterSpacing || 0} onChange={(v) => updateSelectedLayer({ letterSpacing: v })} />
                <PrettySlider label="Entrelinha" valueDisplay={(selectedLayer.lineHeight ?? 1.12).toFixed(2)} min={0.8} max={1.8} step={0.03} value={selectedLayer.lineHeight ?? 1.12} onChange={(v) => updateSelectedLayer({ lineHeight: v })} />
              </div>
            </div>

            <div className="panel-section">
              <StudioToggle label="Degradê de Duas Cores" checked={!!selectedLayer.useGradient} onChange={(v) => updateSelectedLayer({ useGradient: v })} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ColorPill label={selectedLayer.useGradient ? 'Cor 1' : 'Cor Principal'} color={selectedLayer.color || '#ffffff'} onChange={(hex) => updateSelectedLayer({ color: hex })} />
                {selectedLayer.useGradient && (
                  <ColorPill label="Cor 2" color={selectedLayer.color2 || '#38bdf8'} onChange={(hex) => updateSelectedLayer({ color2: hex })} />
                )}
              </div>
              {selectedLayer.useGradient && (
                <PrettySlider label="Ângulo do Degradê" valueDisplay={`${selectedLayer.gradientAngle ?? 0}°`} min={0} max={360} value={selectedLayer.gradientAngle ?? 0} onChange={(v) => updateSelectedLayer({ gradientAngle: v })} />
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

              {!selectedLayer.hollowText && (
                <>
                  <PrettySlider label="Espessura do Contorno (Stroke)" valueDisplay={`${selectedLayer.strokeWidth || 0}px`} min={0} max={16} value={selectedLayer.strokeWidth || 0} onChange={(v) => updateSelectedLayer({ strokeWidth: v })} />
                  {(selectedLayer.strokeWidth ?? 0) > 0 && (
                    <ColorPill label="Cor do Contorno" color={selectedLayer.strokeColor || '#030712'} onChange={(hex) => updateSelectedLayer({ strokeColor: hex })} />
                  )}
                </>
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

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button
              key={key}
              className={`tool-pill ${preset === key ? 'active' : ''}`}
              style={{ padding: isMobile ? '0.38rem 0.55rem' : undefined, flexShrink: 0 }}
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
          <aside style={{ width: '335px', background: '#0b0f19', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

          <aside style={{ width: '365px', background: '#0b0f19', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
              height: '44dvh',
              minHeight: '235px',
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
                maxHeight: '100%',
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
            <button className={`tool-pill ${mobileTab === 'templates' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('templates')}>
              <Sparkles size={13} /> Presets
            </button>
            <button className={`tool-pill ${mobileTab === 'overlays' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('overlays')}>
              <Wand2 size={13} /> Efeitos
            </button>
            <button className={`tool-pill ${mobileTab === 'elements' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('elements')}>
              <Plus size={13} /> Inserir
            </button>
            <button className={`tool-pill ${mobileTab === 'bg' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('bg')}>
              <ImageIcon size={13} /> Foto
            </button>
            <button className={`tool-pill ${mobileTab === 'layers' ? 'active' : ''}`} style={{ flexShrink: 0 }} onClick={() => setMobileTab('layers')}>
              <Layers size={13} /> Camadas ({layers.length})
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