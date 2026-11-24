"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, Plus, Trash2, Layers, Type, Image as ImageIcon,
  Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Grid, Sparkles,
  RotateCcw, Copy, ChevronUp, ChevronDown, Square, Wand2, Keyboard
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

interface FormatPreset {
  label: string;
  sub: string;
  width: number;
  height: number;
}

const PRESETS: Record<PresetKey, FormatPreset> = {
  square: { label: 'Feed Quadrado', sub: '1080 × 1080 (1:1)', width: 1080, height: 1080 },
  portrait: { label: 'Feed Retrato', sub: '1080 × 1350 (4:5)', width: 1080, height: 1350 },
  reels: { label: 'Capa de Reels / Story', sub: '1080 × 1920 (9:16)', width: 1080, height: 1920 },
};

interface StudioLayer {
  id: string;
  type: 'text' | 'sticker' | 'glass';
  name: string;
  visible: boolean;
  x: number; // % (0 a 100)
  y: number; // % (0 a 100)
  opacity?: number;

  // Texto
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
  shadowBlur?: number;
  shadowOffsetY?: number;
  strokeWidth?: number;
  strokeColor?: string;
  glow?: boolean;
  glowColor?: string;
  glowBlur?: number;
  textBgGlass?: boolean;
  textBgPadding?: number;

  // Sticker / Imagem
  src?: string;
  scale?: number;

  // Glass Card
  boxWidth?: number; // % da largura do canvas
  boxHeight?: number; // % da altura do canvas
  borderRadius?: number;
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
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function Studio() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artboardWrapRef = useRef<HTMLDivElement | null>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bgCompositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noisePatternRef = useRef<CanvasPattern | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const layerBoundsRef = useRef<Record<string, HitBox>>({});

  // Configuração da Tela e Imagem Base
  const [preset, setPreset] = useState<PresetKey>('reels');
  const [bgSrc, setBgSrc] = useState<string>(img5);
  const [bgScale, setBgScale] = useState<number>(1.05);
  const [bgOffsetX, setBgOffsetX] = useState<number>(0);
  const [bgOffsetY, setBgOffsetY] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(100);
  const [bgContrast, setBgContrast] = useState<number>(105);
  const [bgSaturation, setBgSaturation] = useState<number>(105);

  // Efeitos de Sobreposição
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

  // Estado de Edição Inline (Duplo Clique no Texto)
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [artboardDisplaySize, setArtboardDisplaySize] = useState<{ w: number; h: number }>({ w: 540, h: 960 });

  // Camadas Iniciais
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
      borderRadius: 32,
      glassBlur: 18,
      glassTint: '#0f172a',
      glassOpacity: 42,
      glassBorderOpacity: 35,
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
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('main-title');
  const [activeLeftTab, setActiveLeftTab] = useState<'bg' | 'overlays' | 'elements' | 'templates'>('bg');
  const [dragState, setDragState] = useState<DragAction | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedId) || null;
  const editingLayer = layers.find((l) => l.id === editingTextId && l.type === 'text') || null;
  const currentSpec = PRESETS[preset];

  // Monitora tamanho real em tela do Artboard para alinhar o editor de texto inline
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setArtboardDisplaySize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    if (artboardWrapRef.current) obs.observe(artboardWrapRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [preset]);

  // Foca e seleciona o texto automaticamente ao abrir edição com duplo clique
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
    borderAlpha: number
  ) => {
    ctx.save();
    drawRoundedRectPath(ctx, x, y, w, h, radius);
    ctx.clip();

    if (blurPx > 0) {
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(bgSourceCanvas, -20, -20, bgSourceCanvas.width + 40, bgSourceCanvas.height + 40);
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

  // Desenha Bounding Box estilo Photoshop com 8 Alças (Handles)
  const drawTransformHandles = (ctx: CanvasRenderingContext2D, box: HitBox) => {
    ctx.save();
    ctx.globalAlpha = 1;

    // Contorno contínuo azul
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 8 Alças quadradas com preenchimento branco e borda azul
    const handles = getHandlePositions(box);
    const size = 16; // Tamanho em pixels do canvas (1080p)
    (Object.keys(handles) as HandleId[]).forEach((hKey) => {
      const pt = handles[hKey];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(pt.x - size / 2, pt.y - size / 2, size, size);
      ctx.fill();
      ctx.stroke();
    });

    // Ponto central (pivô)
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(box.x + box.w / 2, box.y + box.h / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Motor Principal de Renderização
  const renderCanvas = useCallback(
    async (exportMode = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = currentSpec.width;
      const H = currentSpec.height;
      canvas.width = W;
      canvas.height = H;

      if (!bgCompositeCanvasRef.current) {
        bgCompositeCanvasRef.current = document.createElement('canvas');
      }
      const bgCanvas = bgCompositeCanvasRef.current;
      bgCanvas.width = W;
      bgCanvas.height = H;
      const bgCtx = bgCanvas.getContext('2d')!;

      bgCtx.fillStyle = '#030712';
      bgCtx.fillRect(0, 0, W, H);

      // 1. Foto Base
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
        bgCtx.filter = `brightness(${bgBrightness}%) contrast(${bgContrast}%) saturate(${bgSaturation}%)`;
        bgCtx.drawImage(bgImg, drawX, drawY, drawW, drawH);
        bgCtx.restore();
      } catch {}

      // 2. Degradê Atmosférico Duotone
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

      // 3. Vinheta Radial
      if (radialVignette > 0) {
        const outerR = Math.hypot(W, H) * 0.62;
        const innerR = Math.min(W, H) * 0.22;
        const radGrad = bgCtx.createRadialGradient(W / 2, H / 2, innerR, W / 2, H / 2, outerR);
        radGrad.addColorStop(0, 'rgba(3, 7, 18, 0)');
        radGrad.addColorStop(1, `rgba(2, 5, 14, ${(radialVignette / 100) * 0.92})`);
        bgCtx.fillStyle = radGrad;
        bgCtx.fillRect(0, 0, W, H);
      }

      // 4. Degradê do Topo
      if (topGradient > 0) {
        const gradTop = bgCtx.createLinearGradient(0, 0, 0, H * 0.42);
        gradTop.addColorStop(0, `rgba(2, 6, 17, ${(topGradient / 100) * 0.92})`);
        gradTop.addColorStop(1, 'rgba(2, 6, 17, 0)');
        bgCtx.fillStyle = gradTop;
        bgCtx.fillRect(0, 0, W, H * 0.42);
      }

      // 5. Sombra Inferior
      if (bottomShadow > 0 && bottomShadowHeight > 0) {
        const startY = H * (1 - bottomShadowHeight / 100);
        const gradBot = bgCtx.createLinearGradient(0, startY, 0, H);
        gradBot.addColorStop(0, 'rgba(2, 6, 17, 0)');
        gradBot.addColorStop(0.55, `rgba(2, 6, 17, ${(bottomShadow / 100) * 0.68})`);
        gradBot.addColorStop(1, `rgba(2, 6, 17, ${Math.min(0.99, (bottomShadow / 100) * 1.05)})`);
        bgCtx.fillStyle = gradBot;
        bgCtx.fillRect(0, startY, W, H - startY);
      }

      ctx.drawImage(bgCanvas, 0, 0);

      const nextBounds: Record<string, HitBox> = {};

      // 6. Renderizar Camadas
      for (const layer of layers) {
        if (!layer.visible) continue;
        const posX = (layer.x / 100) * W;
        const posY = (layer.y / 100) * H;
        const layerAlpha = (layer.opacity ?? 100) / 100;

        ctx.save();
        ctx.globalAlpha = layerAlpha;

        // --- GLASS CARD ---
        if (layer.type === 'glass') {
          const boxW = ((layer.boxWidth ?? 80) / 100) * W;
          const boxH = ((layer.boxHeight ?? 22) / 100) * H;
          const boxX = posX - boxW / 2;
          const boxY = posY - boxH / 2;

          ctx.save();
          drawRoundedRectPath(ctx, boxX, boxY, boxW, boxH, layer.borderRadius ?? 28);
          ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
          ctx.shadowBlur = 35;
          ctx.shadowOffsetY = 14;
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
            (layer.glassBorderOpacity ?? 35) / 100
          );

          nextBounds[layer.id] = { x: boxX, y: boxY, w: boxW, h: boxH };
        }

        // --- STICKER / IMAGEM ---
        if (layer.type === 'sticker' && layer.src) {
          try {
            const stImg = await loadImg(layer.src);
            const scale = layer.scale ?? 0.5;
            const targetW = stImg.width * scale;
            const targetH = stImg.height * scale;
            const drawX = posX - targetW / 2;
            const drawY = posY - targetH / 2;

            ctx.shadowColor = 'rgba(0,0,0,0.55)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 8;
            ctx.drawImage(stImg, drawX, drawY, targetW, targetH);

            nextBounds[layer.id] = { x: drawX, y: drawY, w: targetW, h: targetH };
          } catch {}
        }

        // --- TEXTO RICO ---
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
          if (layer.textBgGlass) {
            renderGlassBox(
              ctx,
              bgCanvas,
              boxX - pad * 1.3,
              boxY - pad * 0.75,
              maxLineW + pad * 2.6,
              totalHeight + pad * 1.5,
              22,
              16,
              '#0f172a',
              0.48,
              0.4
            );
          }

          // Se este texto estiver sendo editado inline com duplo clique, não desenha as letras duplicadas no canvas
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
              ctx.shadowBlur = layer.glowBlur ?? 32;
              lines.forEach((line, idx) => ctx.fillText(line, posX, startY + idx * lineHeight));
              ctx.restore();
            }

            ctx.save();
            if (layer.shadow) {
              ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.85)';
              ctx.shadowBlur = layer.shadowBlur ?? 24;
              ctx.shadowOffsetY = layer.shadowOffsetY ?? 8;
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

          nextBounds[layer.id] = { x: boxX - 16, y: boxY - 12, w: maxLineW + 32, h: totalHeight + 24 };
        }

        ctx.restore();
      }

      layerBoundsRef.current = nextBounds;

      // 7. Scanlines & Film Grain
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

      // 8. Guias Seguras + Bounding Box com Alças de Redimensionamento
      if (!exportMode) {
        if (showSafeGuides) {
          ctx.save();
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
          ctx.restore();
        }

        if (selectedId && selectedId !== editingTextId && nextBounds[selectedId]) {
          drawTransformHandles(ctx, nextBounds[selectedId]);
        }
      }
    },
    [
      currentSpec, bgSrc, bgScale, bgOffsetX, bgOffsetY, bgBrightness, bgContrast, bgSaturation,
      bottomShadow, bottomShadowHeight, topGradient, radialVignette, gradOverlayOpacity,
      gradColorA, gradColorB, gradAngle, scanlines, filmGrain, layers, selectedId, editingTextId, showSafeGuides, preset, loadImg
    ]
  );

  useEffect(() => {
    document.title = 'Social Studio | CIOEDAFS';
    document.fonts?.ready.then(() => renderCanvas(false));
    renderCanvas(false);
  }, [renderCanvas]);

  // ATALHOS DE TECLADO
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

  // Detecta se o ponteiro está sobre uma das 8 alças da camada selecionada
  const hitTestHandles = (pxX: number, pxY: number): HandleId | null => {
    if (!selectedId || editingTextId) return null;
    const box = layerBoundsRef.current[selectedId];
    if (!box) return null;
    const handles = getHandlePositions(box);
    const hitRadius = 22; // Área generosa de clique em pixels do canvas
    for (const hKey of Object.keys(handles) as HandleId[]) {
      const pt = handles[hKey];
      if (Math.abs(pxX - pt.x) <= hitRadius && Math.abs(pxY - pt.y) <= hitRadius) {
        return hKey;
      }
    }
    return null;
  };

  // Clique para Redimensionar pelas Alças, Mover Camada ou Arrastar Foto de Fundo
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingTextId) {
      setEditingTextId(null);
      return;
    }

    const { pxX, pxY, pctX, pctY } = getCanvasPointer(e);

    // 1. Primeiro verifica se clicou em uma das 8 Alças (Handles) de Redimensionamento
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

    // 2. Verifica se clicou dentro de alguma camada (de cima para baixo)
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (!l.visible) continue;
      const b = layerBoundsRef.current[l.id];
      if (b && pxX >= b.x - 8 && pxX <= b.x + b.w + 8 && pxY >= b.y - 8 && pxY <= b.y + b.h + 8) {
        setSelectedId(l.id);
        setDragState({ mode: 'layer', id: l.id, startPctX: pctX, startPctY: pctY, origX: l.x, origY: l.y });
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }

    // 3. Clicou no fundo vazio -> Move a foto de fundo
    setSelectedId(null);
    setDragState({ mode: 'bg', startPctX: pctX, startPctY: pctY, origX: bgOffsetX, origY: bgOffsetY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { pxX, pxY, pctX, pctY } = getCanvasPointer(e);

    // Atualiza cursor dinâmico quando não está arrastando
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

    // MODO 1: MOVENDO CAMADA
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

    // MODO 2: MOVENDO FOTO DE FUNDO
    if (dragState.mode === 'bg') {
      const deltaX = pctX - dragState.startPctX;
      const deltaY = pctY - dragState.startPctY;
      setBgOffsetX(Math.max(-85, Math.min(85, Math.round(dragState.origX + deltaX))));
      setBgOffsetY(Math.max(-85, Math.min(85, Math.round(dragState.origY + deltaY))));
      return;
    }

    // MODO 3: REDIMENSIONANDO PELA ALÇA (FREE TRANSFORM)
    if (dragState.mode === 'resize') {
      const { handle, origBox, origLayer, id } = dragState;
      const W = currentSpec.width;
      const H = currentSpec.height;
      const symmetric = e.altKey; // Segurar Alt redimensiona a partir do centro

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

      // Redimensionamento livre (Largura + Altura + Âncora de Posição) para Cards Glassmorphism
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

      // Escala proporcional fluida para Stickers/Logos e Textos
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

  // DUPLO CLIQUE NO CANVAS -> Abre Edição Inline no próprio elemento de texto!
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
        shadowBlur: 24,
        shadowOffsetY: 8,
        letterSpacing: 2,
        lineHeight: 1.1,
      },
    ]);
    setSelectedId(id);
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
        borderRadius: 28,
        glassBlur: 18,
        glassTint: '#0f172a',
        glassOpacity: 42,
        glassBorderOpacity: 40,
        opacity: 100,
      },
    ]);
    setSelectedId(id);
  };

  const addStickerLayer = (name: string, src: string) => {
    const id = `stk-${Date.now()}`;
    setLayers((prev) => [...prev, { id, type: 'sticker', name, visible: true, x: 50, y: 28, src, scale: 0.42, opacity: 100 }]);
    setSelectedId(id);
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
        { id: 'gr1', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 34, src: logoEdafs, scale: 0.36, opacity: 100 },
        { id: 'gr2', type: 'glass', name: 'Card Central 1:1', visible: true, x: 50, y: 54, boxWidth: 86, boxHeight: 20, borderRadius: 32, glassBlur: 20, glassTint: '#0b1120', glassOpacity: 45, glassBorderOpacity: 45, opacity: 100 },
        { id: 'gr3', type: 'text', name: 'Título Reels', visible: true, x: 50, y: 52, text: 'NA ALA DO LÍDER', fontFamily: 'StratumNo2', fontSize: 82, color: '#ffffff', useGradient: true, color2: '#93c5fd', gradientAngle: 180, align: 'center', uppercase: true, shadow: true, shadowColor: '#000000', shadowBlur: 20, shadowOffsetY: 6, letterSpacing: 2, lineHeight: 1.05 },
        { id: 'gr4', type: 'text', name: 'Subtítulo', visible: true, x: 50, y: 59, text: 'REELS OFICIAL • A-29 SUPER TUCANO', fontFamily: 'Comum', fontSize: 28, color: '#38bdf8', align: 'center', uppercase: true, shadow: true, letterSpacing: 5, lineHeight: 1.2 },
      ]);
    } else if (kind === 'agenda_gold') {
      setPreset('portrait');
      setBottomShadow(92);
      setBottomShadowHeight(62);
      setGradOverlayOpacity(18);
      setGradColorA('#f59e0b');
      setGradColorB('#030712');
      setLayers([
        { id: 'ag1', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 11, src: logoEdafs, scale: 0.42, opacity: 100 },
        { id: 'ag2', type: 'text', name: 'Overline', visible: true, x: 50, y: 71, text: 'DEMONSTRAÇÃO CONFIRMADA', fontFamily: 'Comum', fontSize: 30, color: '#fde047', align: 'center', uppercase: true, glow: true, glowColor: '#f59e0b', glowBlur: 24, shadow: true, letterSpacing: 6, lineHeight: 1.2 },
        { id: 'ag3', type: 'text', name: 'Localidade', visible: true, x: 50, y: 80, text: 'FLORIANÓPOLIS', fontFamily: 'StratumNo2', fontSize: 98, color: '#ffffff', useGradient: true, color2: '#fde68a', gradientAngle: 180, align: 'center', uppercase: true, shadow: true, shadowBlur: 30, shadowOffsetY: 10, letterSpacing: 2, lineHeight: 1.05 },
        { id: 'ag4', type: 'text', name: 'Info Voo', visible: true, x: 50, y: 90, text: 'SÁBADO • 19H30 BRT • SBFL', fontFamily: 'Regular', fontSize: 30, color: '#e2e8f0', textBgGlass: true, textBgPadding: 18, align: 'center', uppercase: true, shadow: false, letterSpacing: 4, lineHeight: 1.2 },
      ]);
    } else if (kind === 'notam_hud') {
      setPreset('square');
      setScanlines(45);
      setRadialVignette(65);
      setGradOverlayOpacity(35);
      setGradColorA('#ef4444');
      setGradColorB('#030712');
      setLayers([
        { id: 'nh1', type: 'glass', name: 'Painel NOTAM', visible: true, x: 50, y: 54, boxWidth: 86, boxHeight: 62, borderRadius: 24, glassBlur: 22, glassTint: '#090d16', glassOpacity: 62, glassBorderOpacity: 35, opacity: 100 },
        { id: 'nh2', type: 'sticker', name: 'Brasão EDAFS', visible: true, x: 50, y: 33, src: logoEdafs, scale: 0.36, opacity: 100 },
        { id: 'nh3', type: 'text', name: 'Tag NOTAM', visible: true, x: 50, y: 47, text: 'COMUNICADO OPERACIONAL', fontFamily: 'Comum', fontSize: 30, color: '#ef4444', glow: true, glowColor: '#ef4444', glowBlur: 22, align: 'center', uppercase: true, shadow: true, letterSpacing: 6 },
        { id: 'nh4', type: 'text', name: 'Mensagem', visible: true, x: 50, y: 59, text: 'RECRUTAMENTO\nENCERRADO', fontFamily: 'StratumNo2', fontSize: 84, color: '#ffffff', align: 'center', uppercase: true, shadow: true, letterSpacing: 2, lineHeight: 1.08 },
        { id: 'nh5', type: 'text', name: 'Assinatura', visible: true, x: 50, y: 76, text: 'COMANDO GERAL • EDAFS', fontFamily: 'Regular', fontSize: 24, color: '#94a3b8', align: 'center', uppercase: true, letterSpacing: 5 },
      ]);
    }
    setSelectedId(null);
  };

  const handleExportPNG = async () => {
    setEditingTextId(null);
    await renderCanvas(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `EDAFS-${preset}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    renderCanvas(false);
  };

  // Escala entre pixels internos do canvas (1080p) e tamanho visual em tela para o Editor Inline
  const scaleDisplayFactor = artboardDisplaySize.w / currentSpec.width;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#060911', color: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: 'Regular'; src: url('/fonts/regular.otf') format('opentype'); font-display: swap; }
        @font-face { font-family: 'Comum'; src: url('/fonts/comum.otf') format('opentype'); }
        @font-face { font-family: 'StratumNo2'; src: url('/fonts/stratumno2_regular.otf') format('opentype'); }
        @font-face { font-family: 'PosicaoFont'; src: url('/fonts/posicao.otf') format('opentype'); }

        * { box-sizing: border-box; font-family: 'Regular', system-ui, sans-serif; }
        .studio-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; padding: 0.55rem 0.7rem; border-radius: 8px; font-size: 0.82rem; outline: none; }
        .studio-input:focus { border-color: #0ea5e9; }
        .studio-label { font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 0.3rem; display: flex; justify-content: space-between; align-items: center; }
        .studio-slider { width: 100%; accent-color: #0ea5e9; cursor: pointer; height: 5px; }
        .tool-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; padding: 0.45rem 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.18s; }
        .tool-pill:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .tool-pill.active { background: rgba(14, 165, 233, 0.18); border-color: #0ea5e9; color: #ffffff; font-weight: 600; }
        .panel-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.65rem; }
      `}</style>

      {/* HEADER DO ESTÚDIO */}
      <header style={{ height: '58px', background: '#0b0f19', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => navigate('/intranet')} className="tool-pill">
            <ArrowLeft size={15} /> Workspace
          </button>
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: '1.05rem', letterSpacing: '0.06em' }}>
            EDAFS <span style={{ color: '#0ea5e9' }}>PRO STUDIO</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button key={key} className={`tool-pill ${preset === key ? 'active' : ''}`} onClick={() => { setEditingTextId(null); setPreset(key); }}>
              <span>{PRESETS[key].label}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>{PRESETS[key].sub}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <button className={`tool-pill ${showSafeGuides ? 'active' : ''}`} onClick={() => setShowSafeGuides(!showSafeGuides)} title="Mostrar guias e corte 1:1 do Reels">
            <Grid size={14} /> Guias
          </button>
          <button
            onClick={handleExportPNG}
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', border: 'none', padding: '0.52rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Download size={15} /> Exportar PNG
          </button>
        </div>
      </header>

      {/* CORPO DE 3 COLUNAS */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* COLUNA ESQUERDA */}
        <aside style={{ width: '325px', background: '#0b0f19', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

          <div style={{ padding: '0.9rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeLeftTab === 'bg' && (
              <>
                <div className="panel-section">
                  <span className="studio-label">Upload ou Arraste para o Palco</span>
                  <label className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', borderStyle: 'dashed' }}>
                    <Upload size={15} color="#0ea5e9" /> Escolher Foto do PC
                    <input type="file" accept="image/*" onChange={handleUploadBg} style={{ display: 'none' }} />
                  </label>
                </div>

                <div className="panel-section">
                  <div className="studio-label">
                    <span>Enquadramento & Cor</span>
                    <button onClick={() => { setBgScale(1); setBgOffsetX(0); setBgOffsetY(0); setBgBrightness(100); setBgContrast(100); setBgSaturation(100); }} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <RotateCcw size={11} /> Resetar
                    </button>
                  </div>
                  <div>
                    <span className="studio-label"><span>Zoom (ou Scroll na foto)</span><span>{Math.round(bgScale * 100)}%</span></span>
                    <input type="range" min="0.6" max="3" step="0.02" value={bgScale} onChange={(e) => setBgScale(parseFloat(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Brilho</span><span>{bgBrightness}%</span></span>
                    <input type="range" min="40" max="160" value={bgBrightness} onChange={(e) => setBgBrightness(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Contraste</span><span>{bgContrast}%</span></span>
                    <input type="range" min="50" max="170" value={bgContrast} onChange={(e) => setBgContrast(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Saturação</span><span>{bgSaturation}%</span></span>
                    <input type="range" min="0" max="180" value={bgSaturation} onChange={(e) => setBgSaturation(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                </div>

                <div>
                  <span className="studio-label">Galeria Rápida EDAFS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginTop: '0.35rem' }}>
                    {GALLERY_PRESETS.map((item, idx) => (
                      <div key={idx} onClick={() => setBgSrc(item.src)} style={{ aspectRatio: '16/10', borderRadius: '7px', overflow: 'hidden', cursor: 'pointer', border: bgSrc === item.src ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={item.src} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeLeftTab === 'overlays' && (
              <>
                <div className="panel-section">
                  <span className="studio-label" style={{ color: '#38bdf8' }}>Sombra Inferior & Vinheta</span>
                  <div>
                    <span className="studio-label"><span>Intensidade Sombra Inferior</span><span>{bottomShadow}%</span></span>
                    <input type="range" min="0" max="100" value={bottomShadow} onChange={(e) => setBottomShadow(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Altura da Sombra Inferior</span><span>{bottomShadowHeight}%</span></span>
                    <input type="range" min="15" max="90" value={bottomShadowHeight} onChange={(e) => setBottomShadowHeight(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Sombra Superior (Topo)</span><span>{topGradient}%</span></span>
                    <input type="range" min="0" max="100" value={topGradient} onChange={(e) => setTopGradient(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Vinheta Radial nas Bordas</span><span>{radialVignette}%</span></span>
                    <input type="range" min="0" max="100" value={radialVignette} onChange={(e) => setRadialVignette(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                </div>

                <div className="panel-section">
                  <span className="studio-label" style={{ color: '#f59e0b' }}>Sobreposição Degradê (Duotone)</span>
                  <div>
                    <span className="studio-label"><span>Opacidade do Degradê</span><span>{gradOverlayOpacity}%</span></span>
                    <input type="range" min="0" max="85" value={gradOverlayOpacity} onChange={(e) => setGradOverlayOpacity(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span className="studio-label">Cor Inicial</span>
                      <input type="color" value={gradColorA} onChange={(e) => setGradColorA(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <span className="studio-label">Cor Final</span>
                      <input type="color" value={gradColorB} onChange={(e) => setGradColorB(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                    </div>
                  </div>
                  <div>
                    <span className="studio-label"><span>Ângulo do Degradê</span><span>{gradAngle}°</span></span>
                    <input type="range" min="0" max="360" value={gradAngle} onChange={(e) => setGradAngle(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                </div>

                <div className="panel-section">
                  <span className="studio-label" style={{ color: '#10b981' }}>Texturas Táticas</span>
                  <div>
                    <span className="studio-label"><span>Linhas HUD / Scanlines</span><span>{scanlines}%</span></span>
                    <input type="range" min="0" max="100" value={scanlines} onChange={(e) => setScanlines(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                  <div>
                    <span className="studio-label"><span>Granulação Cinema (Grain)</span><span>{filmGrain}%</span></span>
                    <input type="range" min="0" max="100" value={filmGrain} onChange={(e) => setFilmGrain(parseInt(e.target.value))} className="studio-slider" />
                  </div>
                </div>
              </>
            )}

            {activeLeftTab === 'elements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={addTextLayer} className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', background: 'rgba(14,165,233,0.14)', borderColor: 'rgba(14,165,233,0.4)', color: '#fff' }}>
                  <Type size={16} /> Nova Camada de Texto
                </button>

                <button onClick={addGlassCardLayer} className="tool-pill" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  <Square size={16} color="#38bdf8" /> Novo Card Glassmorphism
                </button>

                <div className="panel-section">
                  <span className="studio-label">Insígnias & Logos</span>
                  <button onClick={() => addStickerLayer('Brasão EDAFS', logoEdafs)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem' }}>
                    <span>Brasão EDAFS</span>
                    <img src={logoEdafs} alt="EDAFS" style={{ height: '22px' }} />
                  </button>
                  <button onClick={() => addStickerLayer('Logo MSFS 2024', mfLogo24)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem' }}>
                    <span>Logo MSFS 2024</span>
                    <img src={mfLogo24} alt="MSFS 2024" style={{ height: '20px' }} />
                  </button>
                  <button onClick={() => addStickerLayer('Logo MSFS 2020', mfLogo)} className="tool-pill" style={{ justifyContent: 'space-between', padding: '0.65rem' }}>
                    <span>Logo MSFS 2020</span>
                    <img src={mfLogo} alt="MSFS 2020" style={{ height: '15px' }} />
                  </button>
                  <label className="tool-pill" style={{ justifyContent: 'center', padding: '0.65rem', borderStyle: 'dashed' }}>
                    <Upload size={14} /> Importar PNG / Sticker
                    <input type="file" accept="image/*" onChange={handleUploadSticker} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}

            {activeLeftTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span className="studio-label">Composições com Efeitos</span>
                <button className="tool-pill" style={{ padding: '0.8rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }} onClick={() => applyQuickTemplate('glass_reels')}>
                  <strong style={{ color: '#fff' }}>Capa de Reels Glassmorphism (9:16)</strong>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Card de vidro fosco centralizado no corte 1:1</span>
                </button>
                <button className="tool-pill" style={{ padding: '0.8rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }} onClick={() => applyQuickTemplate('agenda_gold')}>
                  <strong style={{ color: '#fff' }}>Agenda Ouro & Degradê (4:5)</strong>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Texto metálico com glow dourado e badge de vidro</span>
                </button>
                <button className="tool-pill" style={{ padding: '0.8rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }} onClick={() => applyQuickTemplate('notam_hud')}>
                  <strong style={{ color: '#fff' }}>Comunicado Tático HUD (1:1)</strong>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Scanlines militares, alerta neon e painel fosco</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ÁREA CENTRAL DE EDIÇÃO (PALCO COM BOUNDING BOX + INLINE TEXT EDITOR) */}
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

            {/* EDITOR DE TEXTO INLINE (ATIVADO COM DUPLO CLIQUE DIRETO NO ELEMENTO) */}
            {editingLayer && (
              <textarea
                ref={inlineTextareaRef}
                value={editingLayer.text || ''}
                onChange={(e) =>
                  setLayers((prev) => prev.map((l) => (l.id === editingLayer.id ? { ...l, text: e.target.value } : l)))
                }
                onBlur={() => setEditingTextId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingTextId(null);
                  }
                }}
                rows={Math.max(1, (editingLayer.text || '').split('\n').length)}
                style={{
                  position: 'absolute',
                  left: `${editingLayer.x}%`,
                  top: `${editingLayer.y}%`,
                  transform:
                    editingLayer.align === 'left'
                      ? 'translate(0%, -50%)'
                      : editingLayer.align === 'right'
                      ? 'translate(-100%, -50%)'
                      : 'translate(-50%, -50%)',
                  minWidth: '180px',
                  width: '88%',
                  background: 'rgba(3, 7, 18, 0.35)',
                  backdropFilter: 'blur(4px)',
                  border: '2px solid #0ea5e9',
                  borderRadius: '8px',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  padding: '6px 10px',
                  margin: 0,
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
            <span><strong>Alças Azuis:</strong> Redimensionar (Alt = Centro)</span>
            <span><strong>Del:</strong> Apagar</span>
            <span><strong>Ctrl+D:</strong> Duplicar</span>
            <span><strong>Fundo Vazio:</strong> Arrastar Foto</span>
          </div>
        </main>

        {/* COLUNA DIREITA: INSPETOR + CAMADAS */}
        <aside style={{ width: '345px', background: '#0b0f19', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ padding: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flex: 1, overflowY: 'auto' }}>
            <div className="studio-label">
              <span>Propriedades & Posição</span>
              {selectedLayer && (
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={() => duplicateLayer(selectedLayer.id)} className="tool-pill" style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem' }} title="Duplicar (Ctrl+D)">
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => { setLayers((prev) => prev.filter((l) => l.id !== selectedLayer.id)); setSelectedId(null); }}
                    className="tool-pill"
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    title="Excluir (Delete)"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {!selectedLayer ? (
              <div style={{ padding: '2rem 0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                Clique em qualquer elemento para puxar pelas alças de tamanho, ou dê <strong>duplo clique em um texto</strong> para digitar direto na imagem.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                
                {/* COORDENADAS X / Y EXATAS PARA QUALQUER ELEMENTO */}
                <div className="panel-section">
                  <span className="studio-label">Posição & Alinhamento Rápido</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span className="studio-label"><span>Eixo X</span><span>{selectedLayer.x.toFixed(1)}%</span></span>
                      <input type="range" min="0" max="100" step="0.5" value={selectedLayer.x} onChange={(e) => updateSelectedLayer({ x: parseFloat(e.target.value) })} className="studio-slider" />
                    </div>
                    <div>
                      <span className="studio-label"><span>Eixo Y</span><span>{selectedLayer.y.toFixed(1)}%</span></span>
                      <input type="range" min="0" max="100" step="0.5" value={selectedLayer.y} onChange={(e) => updateSelectedLayer({ y: parseFloat(e.target.value) })} className="studio-slider" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button className="tool-pill" style={{ flex: 1, justifyContent: 'center' }} onClick={() => updateSelectedLayer({ x: 50 })}>Centrar X</button>
                    <button className="tool-pill" style={{ flex: 1, justifyContent: 'center' }} onClick={() => updateSelectedLayer({ y: 50 })}>Centrar Y</button>
                  </div>
                </div>

                {/* INSPETOR DE TEXTO */}
                {selectedLayer.type === 'text' && (
                  <>
                    <div className="panel-section">
                      <div className="studio-label">
                        <span>Texto & Tipografia</span>
                        <button onClick={() => setEditingTextId(selectedLayer.id)} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}>
                          Editar na Tela
                        </button>
                      </div>
                      <textarea rows={2} className="studio-input" value={selectedLayer.text || ''} onChange={(e) => updateSelectedLayer({ text: e.target.value })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                        <select className="studio-input" value={selectedLayer.fontFamily} onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}>
                          <option value="StratumNo2">Stratum (Tática)</option>
                          <option value="Comum">Comum (Títulos)</option>
                          <option value="Regular">Regular (Corpo)</option>
                          <option value="PosicaoFont">Posição (Números)</option>
                        </select>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className={`tool-pill ${selectedLayer.align === 'left' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }} onClick={() => updateSelectedLayer({ align: 'left' })}><AlignLeft size={14} /></button>
                          <button className={`tool-pill ${selectedLayer.align === 'center' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }} onClick={() => updateSelectedLayer({ align: 'center' })}><AlignCenter size={14} /></button>
                          <button className={`tool-pill ${selectedLayer.align === 'right' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }} onClick={() => updateSelectedLayer({ align: 'right' })}><AlignRight size={14} /></button>
                          <button className={`tool-pill ${selectedLayer.uppercase ? 'active' : ''}`} style={{ padding: '0.4rem 0.5rem' }} onClick={() => updateSelectedLayer({ uppercase: !selectedLayer.uppercase })}>AA</button>
                        </div>
                      </div>
                      <div>
                        <span className="studio-label"><span>Tamanho</span><span>{selectedLayer.fontSize}px</span></span>
                        <input type="range" min="14" max="260" value={selectedLayer.fontSize || 64} onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value) })} className="studio-slider" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <span className="studio-label"><span>Espaçamento</span><span>{selectedLayer.letterSpacing || 0}px</span></span>
                          <input type="range" min="0" max="24" value={selectedLayer.letterSpacing || 0} onChange={(e) => updateSelectedLayer({ letterSpacing: parseInt(e.target.value) })} className="studio-slider" />
                        </div>
                        <div>
                          <span className="studio-label"><span>Entrelinha</span><span>{(selectedLayer.lineHeight ?? 1.12).toFixed(2)}</span></span>
                          <input type="range" min="0.85" max="1.8" step="0.03" value={selectedLayer.lineHeight ?? 1.12} onChange={(e) => updateSelectedLayer({ lineHeight: parseFloat(e.target.value) })} className="studio-slider" />
                        </div>
                      </div>
                    </div>

                    {/* COR & DEGRADÊ DO TEXTO */}
                    <div className="panel-section">
                      <div className="studio-label">
                        <span>Cor & Degradê no Texto</span>
                        <input type="checkbox" checked={!!selectedLayer.useGradient} onChange={(e) => updateSelectedLayer({ useGradient: e.target.checked })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: selectedLayer.useGradient ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input type="color" value={selectedLayer.color || '#ffffff'} onChange={(e) => updateSelectedLayer({ color: e.target.value })} style={{ width: '34px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                          <input type="text" className="studio-input" value={selectedLayer.color || '#ffffff'} onChange={(e) => updateSelectedLayer({ color: e.target.value })} />
                        </div>
                        {selectedLayer.useGradient && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input type="color" value={selectedLayer.color2 || '#38bdf8'} onChange={(e) => updateSelectedLayer({ color2: e.target.value })} style={{ width: '34px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                            <input type="text" className="studio-input" value={selectedLayer.color2 || '#38bdf8'} onChange={(e) => updateSelectedLayer({ color2: e.target.value })} />
                          </div>
                        )}
                      </div>
                      {selectedLayer.useGradient && (
                        <div>
                          <span className="studio-label"><span>Ângulo do Degradê</span><span>{selectedLayer.gradientAngle ?? 180}°</span></span>
                          <input type="range" min="0" max="360" value={selectedLayer.gradientAngle ?? 180} onChange={(e) => updateSelectedLayer({ gradientAngle: parseInt(e.target.value) })} className="studio-slider" />
                        </div>
                      )}
                    </div>

                    {/* EFEITOS DE TEXTO */}
                    <div className="panel-section">
                      <span className="studio-label" style={{ color: '#38bdf8' }}>Efeitos Especiais de Texto</span>

                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <span>Fundo Glassmorphism no texto</span>
                        <input type="checkbox" checked={!!selectedLayer.textBgGlass} onChange={(e) => updateSelectedLayer({ textBgGlass: e.target.checked })} />
                      </label>
                      {selectedLayer.textBgGlass && (
                        <div>
                          <span className="studio-label"><span>Margem do Vidro</span><span>{selectedLayer.textBgPadding ?? 24}px</span></span>
                          <input type="range" min="8" max="60" value={selectedLayer.textBgPadding ?? 24} onChange={(e) => updateSelectedLayer({ textBgPadding: parseInt(e.target.value) })} className="studio-slider" />
                        </div>
                      )}

                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <span>Brilho Neon (Outer Glow)</span>
                        <input type="checkbox" checked={!!selectedLayer.glow} onChange={(e) => updateSelectedLayer({ glow: e.target.checked })} />
                      </label>
                      {selectedLayer.glow && (
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="color" value={selectedLayer.glowColor || '#0ea5e9'} onChange={(e) => updateSelectedLayer({ glowColor: e.target.value })} style={{ width: '36px', height: '28px', border: 'none', background: 'none' }} />
                          <input type="range" min="5" max="70" value={selectedLayer.glowBlur ?? 28} onChange={(e) => updateSelectedLayer({ glowBlur: parseInt(e.target.value) })} className="studio-slider" />
                        </div>
                      )}

                      <div>
                        <span className="studio-label"><span>Contorno (Stroke)</span><span>{selectedLayer.strokeWidth || 0}px</span></span>
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="color" value={selectedLayer.strokeColor || '#030712'} onChange={(e) => updateSelectedLayer({ strokeColor: e.target.value })} style={{ width: '36px', height: '28px', border: 'none', background: 'none' }} />
                          <input type="range" min="0" max="16" value={selectedLayer.strokeWidth || 0} onChange={(e) => updateSelectedLayer({ strokeWidth: parseInt(e.target.value) })} className="studio-slider" />
                        </div>
                      </div>

                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <span>Sombra Projetada</span>
                        <input type="checkbox" checked={!!selectedLayer.shadow} onChange={(e) => updateSelectedLayer({ shadow: e.target.checked })} />
                      </label>
                      {selectedLayer.shadow && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <span className="studio-label">Suavidade</span>
                            <input type="range" min="0" max="60" value={selectedLayer.shadowBlur ?? 24} onChange={(e) => updateSelectedLayer({ shadowBlur: parseInt(e.target.value) })} className="studio-slider" />
                          </div>
                          <div>
                            <span className="studio-label">Distância Y</span>
                            <input type="range" min="0" max="35" value={selectedLayer.shadowOffsetY ?? 8} onChange={(e) => updateSelectedLayer({ shadowOffsetY: parseInt(e.target.value) })} className="studio-slider" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* INSPETOR DE CARD GLASSMORPHISM */}
                {selectedLayer.type === 'glass' && (
                  <div className="panel-section">
                    <span className="studio-label" style={{ color: '#38bdf8' }}>Tamanho & Vidro (ou puxe pelas alças)</span>
                    <div>
                      <span className="studio-label"><span>Largura do Box</span><span>{selectedLayer.boxWidth ?? 80}%</span></span>
                      <input type="range" min="6" max="100" step="0.5" value={selectedLayer.boxWidth ?? 80} onChange={(e) => updateSelectedLayer({ boxWidth: parseFloat(e.target.value) })} className="studio-slider" />
                    </div>
                    <div>
                      <span className="studio-label"><span>Altura do Box</span><span>{selectedLayer.boxHeight ?? 22}%</span></span>
                      <input type="range" min="4" max="100" step="0.5" value={selectedLayer.boxHeight ?? 22} onChange={(e) => updateSelectedLayer({ boxHeight: parseFloat(e.target.value) })} className="studio-slider" />
                    </div>
                    <div>
                      <span className="studio-label"><span>Arredondamento</span><span>{selectedLayer.borderRadius ?? 28}px</span></span>
                      <input type="range" min="0" max="120" value={selectedLayer.borderRadius ?? 28} onChange={(e) => updateSelectedLayer({ borderRadius: parseInt(e.target.value) })} className="studio-slider" />
                    </div>
                    <div>
                      <span className="studio-label"><span>Desfoque do Fundo (Blur)</span><span>{selectedLayer.glassBlur ?? 18}px</span></span>
                      <input type="range" min="0" max="45" value={selectedLayer.glassBlur ?? 18} onChange={(e) => updateSelectedLayer({ glassBlur: parseInt(e.target.value) })} className="studio-slider" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="color" value={selectedLayer.glassTint || '#0f172a'} onChange={(e) => updateSelectedLayer({ glassTint: e.target.value })} style={{ width: '38px', height: '30px', border: 'none', background: 'none' }} />
                      <div>
                        <span className="studio-label"><span>Opacidade do Vidro</span><span>{selectedLayer.glassOpacity ?? 42}%</span></span>
                        <input type="range" min="5" max="90" value={selectedLayer.glassOpacity ?? 42} onChange={(e) => updateSelectedLayer({ glassOpacity: parseInt(e.target.value) })} className="studio-slider" />
                      </div>
                    </div>
                    <div>
                      <span className="studio-label"><span>Brilho da Borda</span><span>{selectedLayer.glassBorderOpacity ?? 35}%</span></span>
                      <input type="range" min="0" max="100" value={selectedLayer.glassBorderOpacity ?? 35} onChange={(e) => updateSelectedLayer({ glassBorderOpacity: parseInt(e.target.value) })} className="studio-slider" />
                    </div>
                  </div>
                )}

                {/* INSPETOR DE STICKER / LOGO */}
                {selectedLayer.type === 'sticker' && (
                  <div className="panel-section">
                    <span className="studio-label">Ajustes da Imagem / Logo</span>
                    <div>
                      <span className="studio-label"><span>Escala</span><span>{Math.round((selectedLayer.scale || 0.5) * 100)}%</span></span>
                      <input type="range" min="0.06" max="3" step="0.02" value={selectedLayer.scale || 0.5} onChange={(e) => updateSelectedLayer({ scale: parseFloat(e.target.value) })} className="studio-slider" />
                    </div>
                  </div>
                )}

                {/* OPACIDADE GERAL */}
                <div className="panel-section">
                  <div>
                    <span className="studio-label"><span>Opacidade da Camada</span><span>{selectedLayer.opacity ?? 100}%</span></span>
                    <input type="range" min="10" max="100" value={selectedLayer.opacity ?? 100} onChange={(e) => updateSelectedLayer({ opacity: parseInt(e.target.value) })} className="studio-slider" />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* LISTA DE CAMADAS */}
          <div style={{ height: '225px', padding: '0.85rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span className="studio-label" style={{ marginBottom: '0.45rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Layers size={13} color="#0ea5e9" /> Camadas ({layers.length})</span>
            </span>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[...layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => { setEditingTextId(null); setSelectedId(layer.id); }}
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
                    padding: '0.45rem 0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedId === layer.id ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.03)',
                    border: selectedId === layer.id ? '1px solid rgba(14,165,233,0.55)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                    {layer.type === 'text' ? <Type size={13} color="#0ea5e9" /> : layer.type === 'glass' ? <Square size={13} color="#38bdf8" /> : <ImageIcon size={13} color="#f59e0b" />}
                    <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: layer.visible ? '#f8fafc' : '#64748b' }}>
                      {layer.type === 'text' ? (layer.text?.replace(/\n/g, ' ') || layer.name) : layer.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(layer.id, 'up'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Trazer para frente"><ChevronUp size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayerOrder(layer.id, 'down'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }} title="Enviar para trás"><ChevronDown size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}>
                      {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.filter((l) => l.id !== layer.id)); if (selectedId === layer.id) setSelectedId(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}