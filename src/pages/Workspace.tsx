"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CalendarCheck2, Settings, LogOut, Plus, Trash2, Edit2, X, AlertTriangle, Newspaper, Link2, ChevronDown, CheckCircle2, ImagePlus, UserCircle, Menu, Calendar, Globe, BookOpen, PlaneTakeoff, Shield, Clock, ChevronRight, HelpCircle
} from 'lucide-react';

import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; 
import { signOut } from 'firebase/auth';

import logoImage from '../images/logo.png';
import faviconImage from '../images/favicon.png';
import headerImage from '../images/header.jpg';

interface Piloto { id?: string; posicao: string; nome: string; cidade: string; uf: string; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }
interface Mod { id?: string; titulo: string; desc: string; isMarketplace: boolean; buttonText: string; link: string; }
interface Voo { id?: string; pilotoNome: string; aeronave: string; tipoMissao: string; origem: string; destino: string; dataHora: string; status: string; }
interface Usuario { 
  id?: string; uid: string; nome: string; email: string; foto: string; role: string; 
  permissoes?: { logbook?: boolean; agenda?: boolean; mods?: boolean; header?: boolean; alistamento?: boolean; };
}

const appleFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, Arial, sans-serif';

const getPosicaoNome = (num: string) => {
  switch (num) {
    case '1': return 'Líder';
    case '2': return 'Ala Direita';
    case '3': return 'Ala Esquerda';
    case '4': return 'Ferrolho';
    case '5': return 'Ala Esq. Externa';
    case '6': return 'Ala Dir. Externa';
    case '7': return 'Isolado';
    default: return 'Não Definido';
  }
};

const ufsBrasileiros = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => ({ value: uf, label: uf }));

const aeronavesOpcoes = [
  { value: 'A-29 Super Tucano', label: 'A-29 Super Tucano' },
  { value: 'T-27 Tucano', label: 'T-27 Tucano' },
  { value: 'Extra 330', label: 'Extra 330' },
  { value: 'C-130 Hércules', label: 'C-130 Hércules' }
];

const missoesOpcoes = [
  { value: 'Treino de Formatura', label: 'Treino de Formatura' },
  { value: 'Demonstração Aérea', label: 'Demonstração Aérea' },
  { value: 'Traslado', label: 'Traslado' },
  { value: 'Navegação', label: 'Navegação' },
  { value: 'Voo de Avaliação', label: 'Voo de Avaliação' }
];

// Componente Toggle para as Permissões
const PermissionToggle = ({ label, active, onChange }: { label: string, active: boolean, onChange: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
    <div className={`toggle-switch ${active ? 'active' : ''}`} onClick={onChange} style={{ transform: 'scale(0.85)', margin: '-5px -5px -5px 0' }} />
  </div>
);

const CustomSelect = ({ value, options, onChange, placeholder, searchable = false, customFont = appleFontStack, inline = false }: { value: string, options: {value: string, label: string}[], onChange: (val: string) => void, placeholder?: string, searchable?: boolean, customFont?: string, inline?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = searchable && search 
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div style={{ position: 'relative', fontFamily: customFont }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => { setIsOpen(false); setSearch(''); }} />}
      <div onClick={() => setIsOpen(true)} style={{ padding: inline ? '0.5rem' : '0.75rem 1rem', background: inline ? 'transparent' : 'rgba(0, 0, 0, 0.4)', border: inline ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)', color: selectedOption ? '#f8fafc' : '#64748b', borderRadius: '6px', fontSize: inline ? '0.85rem' : '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41 }}>
        
        {searchable && isOpen ? (
          <input 
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', width: '100%', fontSize: '0.95rem', fontFamily: customFont }}
          />
        ) : (
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        )}
        
        <ChevronDown size={14} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '0.5rem' }} />
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, minWidth: inline ? '150px' : 'auto', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div key={opt.value} className="custom-select-option" onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }} style={{ padding: '0.75rem 1rem', color: value === opt.value ? '#f8fafc' : '#94a3b8', background: value === opt.value ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                {opt.label}
              </div>
            ))
          ) : (
            <div style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>Não encontrado</div>
          )}
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const parseDate = (val: string) => {
    if (!val) return new Date();
    const parts = val.split('/');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return new Date();
  };
  
  const [viewDate, setViewDate] = useState(parseDate(value));
  const [selDate, setSelDate] = useState<Date | null>(value ? parseDate(value) : null);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleConfirm = (d: Date) => {
    setSelDate(d);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${day}/${m}/${y}`);
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = selDate && selDate.getDate() === i && selDate.getMonth() === viewDate.getMonth() && selDate.getFullYear() === viewDate.getFullYear();
    days.push(
      <div key={i} onClick={() => handleConfirm(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))}
           style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: isSelected ? '#f59e0b' : 'transparent', color: isSelected ? '#000' : '#cbd5e1', fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.85rem' }}
           onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
           onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}>
        {i}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: value ? '#f8fafc' : '#64748b', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 41, position: 'relative', width: '100%', boxSizing: 'border-box' }}>
        {value || "DD/MM/AAAA"}
        <Calendar size={16} color="#64748b" />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'rgba(11, 17, 33, 0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 50, padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', width: '280px', maxWidth: '90vw' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button type="button" onClick={prevMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>&lt;</button>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{meses[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" onClick={nextMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>&gt;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
            {diasSemana.map((d,i) => <div key={i} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button type="button" onClick={() => { setSelDate(null); onChange(''); setIsOpen(false); }} style={{ background:'transparent', border:'none', color:'#ef4444', fontSize:'0.8rem', cursor:'pointer', fontWeight: 500 }}>Limpar</button>
            <button type="button" onClick={() => { const n = new Date(); setViewDate(n); handleConfirm(n); }} style={{ background:'transparent', border:'none', color:'#38bdf8', fontSize:'0.8rem', cursor:'pointer', fontWeight: 500 }}>Hoje</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDateTimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value.split('T')[0] + 'T12:00:00') : new Date());
  const [selDate, setSelDate] = useState<Date | null>(value ? new Date(value.split('T')[0] + 'T12:00:00') : null);
  const [hour, setHour] = useState(value ? value.split('T')[1].split(':')[0] : '15');
  const [minute, setMinute] = useState(value ? value.split('T')[1].split(':')[1] : '00');

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleConfirm = () => {
    if (!selDate) return;
    const y = selDate.getFullYear();
    const m = String(selDate.getMonth() + 1).padStart(2, '0');
    const d = String(selDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}T${hour}:${minute}`);
    setIsOpen(false);
  };

  let display = "dd/mm/aaaa --:--";
  if (value && value.includes('T')) {
    const [dPart, tPart] = value.split('T');
    const [y, m, d] = dPart.split('-');
    display = `${d}/${m}/${y} ${tPart}Z`;
  }

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = selDate && selDate.getDate() === i && selDate.getMonth() === viewDate.getMonth() && selDate.getFullYear() === viewDate.getFullYear();
    days.push(
      <div key={i} onClick={() => setSelDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))}
           style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: isSelected ? '#f59e0b' : 'transparent', color: isSelected ? '#000' : '#cbd5e1', fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.85rem' }}
           onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
           onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}>
        {i}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: value ? '#f8fafc' : '#64748b', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 41, position: 'relative', width: '100%', boxSizing: 'border-box' }}>
        {display}
        <Calendar size={16} color="#64748b" />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'rgba(11, 17, 33, 0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 50, padding: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', display: 'flex', gap: '1.5rem', width: '380px', maxWidth: '90vw' }}>
          
          <div style={{ flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button type="button" onClick={prevMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>&lt;</button>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{meses[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              <button type="button" onClick={nextMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>&gt;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
              {diasSemana.map((d,i) => <div key={i} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {days}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button type="button" onClick={() => { setSelDate(null); onChange(''); setIsOpen(false); }} style={{ background:'transparent', border:'none', color:'#ef4444', fontSize:'0.8rem', cursor:'pointer', fontWeight: 500 }}>Limpar</button>
              <button type="button" onClick={() => { const n = new Date(); setViewDate(n); setSelDate(n); }} style={{ background:'transparent', border:'none', color:'#38bdf8', fontSize:'0.8rem', cursor:'pointer', fontWeight: 500 }}>Hoje</button>
            </div>
          </div>
          
          <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginBottom: '0.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '220px', overflowY: 'auto', gap: '2px', paddingRight: '2px' }} className="time-scroll">
                {Array.from({length: 24}).map((_, i) => {
                  const h = String(i).padStart(2, '0');
                  return <div key={h} onClick={() => setHour(h)} style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: hour === h ? 'rgba(255,255,255,0.1)' : 'transparent', color: hour === h ? '#f59e0b' : '#94a3b8', fontSize: '0.85rem', fontWeight: hour === h ? 600 : 400 }}>{h}</div>
                })}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '220px', overflowY: 'auto', gap: '2px', paddingRight: '2px' }} className="time-scroll">
                {Array.from({length: 60}).map((_, i) => {
                  const m = String(i).padStart(2, '0');
                  return <div key={m} onClick={() => setMinute(m)} style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: minute === m ? 'rgba(255,255,255,0.1)' : 'transparent', color: minute === m ? '#f59e0b' : '#94a3b8', fontSize: '0.85rem', fontWeight: minute === m ? 600 : 400 }}>{m}</div>
                })}
              </div>
            </div>
            <button type="button" onClick={handleConfirm} style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '0.6rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', width: '100%', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#d97706'} onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('logbook');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [agora, setAgora] = useState(new Date());

  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [agendas, setAgendas] = useState<Demonstracao[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [mods, setMods] = useState<Mod[]>([]);
  const [voos, setVoos] = useState<Voo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); 
  
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false); 
  const [currentUserInfo, setCurrentUserInfo] = useState<Usuario | null>(null); 

  // Estados Form
  const [novoPosicao, setNovoPosicao] = useState('1');
  const [novoNome, setNovoNome] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [novaUf, setNovaUf] = useState('');

  const [agCidade, setAgCidade] = useState('');
  const [agDataHoraIso, setAgDataHoraIso] = useState('');
  const [agStatus, setAgStatus] = useState('Planejamento');

  const [notData, setNotData] = useState('');
  const [notTitulo, setNotTitulo] = useState('');
  const [notResumo, setNotResumo] = useState('');
  const [notImagem, setNotImagem] = useState('');

  const [modTitulo, setModTitulo] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modLink, setModLink] = useState('');
  const [modMarketplace, setModMarketplace] = useState(false);

  const [vooPiloto, setVooPiloto] = useState('');
  const [vooAeronave, setVooAeronave] = useState('A-29 Super Tucano');
  const [vooMissao, setVooMissao] = useState('Treino de Formatura');
  const [vooOrigem, setVooOrigem] = useState('');
  const [vooDestino, setVooDestino] = useState('');
  const [vooData, setVooData] = useState('');
  const [vooStatus, setVooStatus] = useState('Planeado');

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => setModal({ isOpen: true, title, message, onConfirm });
  const closeConfirmModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = "Workspace | EDAV";
    document.documentElement.setAttribute('data-theme', 'dark');

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login'); 
      } else {
        onSnapshot(doc(db, 'usuarios', user.uid), (docSnap) => {
          if (docSnap.exists()) setCurrentUserInfo(docSnap.data() as Usuario);
        });
      }
    });

    const unsubs = [
      unsubscribeAuth,
      onSnapshot(collection(db, 'pilotos'), snap => {
        const arr: Piloto[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Piloto));
        arr.sort((a, b) => parseInt(a.posicao) - parseInt(b.posicao)); setPilotos(arr);
      }),
      onSnapshot(collection(db, 'agenda'), snap => {
        const arr: Demonstracao[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Demonstracao));
        setAgendas(arr);
      }),
      onSnapshot(collection(db, 'noticias'), snap => {
        const arr: Noticia[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Noticia)); setNoticias(arr);
      }),
      onSnapshot(collection(db, 'mods'), snap => {
        const arr: Mod[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Mod)); setMods(arr);
      }),
      onSnapshot(collection(db, 'voos'), snap => {
        const arr: Voo[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Voo));
        arr.reverse(); 
        setVoos(arr);
      }),
      onSnapshot(collection(db, 'usuarios'), snap => {
        const arr: Usuario[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Usuario));
        setUsuarios(arr);
      }),
      onSnapshot(doc(db, 'config', 'geral'), docSnap => { 
        if (docSnap.exists()) {
          const d = docSnap.data();
          setAlistamentoAberto(d.alistamentoAberto || false);
          if (d.headerImageUrl) setCustomHeader(d.headerImageUrl);
        } 
      })
    ];
    return () => unsubs.forEach(u => u()); 
  }, [navigate]);

  // Função Verificadora de Permissões
  const checkPermission = (action: string) => {
    if (currentUserInfo?.role === 'admin') return true;
    if (action === 'manual') return true; // Todos podem ver o manual
    if (['pilotos', 'noticias', 'parametros'].includes(action)) return false; 
    return !!currentUserInfo?.permissoes?.[action as keyof typeof currentUserInfo.permissoes];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem('edav_auth_token');
      window.location.href = '/login'; 
    } catch {
      showToast("Erro ao sair da conta", "error");
    }
  };

  const fecharFormulario = () => {
    setShowForm(false); setEditingId(null);
    setNovoPosicao('1'); setNovoNome(''); setNovaCidade(''); setNovaUf('');
    setAgCidade(''); setAgDataHoraIso(''); setAgStatus('Planejamento');
    setNotData(''); setNotTitulo(''); setNotResumo(''); setNotImagem('');
    setModTitulo(''); setModDesc(''); setModLink(''); setModMarketplace(false);
    setVooPiloto(''); setVooAeronave('A-29 Super Tucano'); setVooMissao('Treino de Formatura'); setVooOrigem(''); setVooDestino(''); setVooData(''); setVooStatus('Planeado');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkPermission('noticias')) return showToast("Acesso Negado.", "error");
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNotImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeletarItem = (id: string | undefined, colecao: string, nomeItem: string, tabReq: string) => {
    if (!checkPermission(tabReq)) return showToast("Acesso Negado.", "error");
    if (!id) return;
    showConfirmModal("Remover Item", `Tem certeza que deseja remover ${nomeItem}?`, async () => {
      try { await deleteDoc(doc(db, colecao, id)); closeConfirmModal(); showToast("Item removido", "success"); } 
      catch { showToast("Erro ao remover", "error"); }
    });
  };

  const handleToggleAlistamento = async () => {
    if (!checkPermission('alistamento')) return showToast("Acesso Negado.", "error");
    try { await setDoc(doc(db, 'config', 'geral'), { alistamentoAberto: !alistamentoAberto }, { merge: true }); showToast(`Alistamento ${!alistamentoAberto ? 'Aberto' : 'Fechado'}`, "success"); } 
    catch { showToast("Erro", "error"); }
  };

  const handlePermissao = async (userId: string, campo: string, valor: boolean) => {
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins podem alterar permissões.", "error");
    try {
      await updateDoc(doc(db, 'usuarios', userId), { [`permissoes.${campo}`]: valor });
      showToast("Permissão atualizada!", "success");
    } catch {
      showToast("Falha ao atualizar.", "error");
    }
  };

  const handleMudarCargo = async (userId: string, newRole: string) => {
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins podem alterar cargos.", "error");
    try { await updateDoc(doc(db, 'usuarios', userId), { role: newRole }); showToast("Cargo atualizado!", "success"); } 
    catch { showToast("Falha", "error"); }
  };

  const handleEditarPiloto = (p: Piloto) => {
    if (!checkPermission('pilotos')) return showToast("Acesso Negado.", "error");
    setEditingId(p.id || null); setNovoPosicao(p.posicao); setNovoNome(p.nome);
    setNovaCidade(p.cidade || ''); setNovaUf(p.uf || ''); setShowForm(true);
  };

  const handleEditarAgenda = (a: Demonstracao) => {
    if (!checkPermission('agenda')) return showToast("Acesso Negado.", "error");
    setEditingId(a.id || null); setAgCidade(a.cidade); setAgStatus(a.status);
    if (a.dataHora && a.dataHora.includes(' às ')) {
      const [dPart, hPart] = a.dataHora.split(' às ');
      setAgDataHoraIso(`${dPart.split('/').reverse().join('-')}T${hPart}`);
    } else setAgDataHoraIso('');
    setShowForm(true);
  };

  const handleEditarNoticia = (n: Noticia) => {
    if (!checkPermission('noticias')) return showToast("Acesso Negado.", "error");
    setEditingId(n.id || null); setNotData(n.data); setNotTitulo(n.titulo);
    setNotResumo(n.resumo); setNotImagem(n.imagem); setShowForm(true);
  };

  const handleEditarMod = (m: Mod) => {
    if (!checkPermission('mods')) return showToast("Acesso Negado.", "error");
    setEditingId(m.id || null); setModTitulo(m.titulo); setModDesc(m.desc);
    setModLink(m.link); setModMarketplace(m.isMarketplace); setShowForm(true);
  };

  const handleEditarVoo = (v: Voo) => {
    if (!checkPermission('logbook')) return showToast("Acesso Negado.", "error");
    setEditingId(v.id || null); setVooPiloto(v.pilotoNome); setVooAeronave(v.aeronave); setVooMissao(v.tipoMissao);
    setVooOrigem(v.origem); setVooDestino(v.destino); setVooData(v.dataHora); setVooStatus(v.status);
    setShowForm(true);
  };

  // Funções Salvar
  const handleSalvarPiloto = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('pilotos')) return showToast("Acesso Negado", "error");
    try {
      const data = { posicao: novoPosicao, nome: novoNome, cidade: novaCidade, uf: novaUf };
      if (editingId) await updateDoc(doc(db, 'pilotos', editingId), data); else await addDoc(collection(db, 'pilotos'), data);
      fecharFormulario(); showToast("Dados salvos com sucesso");
    } catch { showToast("Falha ao salvar", "error"); }
  };

  const handleSalvarAgenda = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('agenda')) return showToast("Acesso Negado", "error");
    if (!agDataHoraIso) return showToast("Selecione data e hora", "error");
    setLoadingGeocode(true);
    try {
      let lat = 0; let lng = 0;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(agCidade)}`);
        const geodata = await res.json();
        if (geodata && geodata.length > 0) { lat = parseFloat(geodata[0].lat); lng = parseFloat(geodata[0].lon); }
      } catch {}
      const [dPart, tPart] = agDataHoraIso.split('T');
      const data = { cidade: agCidade, dataHora: `${dPart.split('-').reverse().join('/')} às ${tPart}`, lat, lng, status: agStatus, cssClass: agStatus === 'Confirmado' ? 'status-ok' : 'status-warn', coordsText: lat !== 0 ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'S/ Coordenadas', tipo: 'M-PREC' };
      if (editingId) await updateDoc(doc(db, 'agenda', editingId), data); else await addDoc(collection(db, 'agenda'), data);
      fecharFormulario(); showToast("Evento salvo!");
    } catch { showToast("Falha ao salvar", "error"); } finally { setLoadingGeocode(false); }
  };

  const handleSalvarNoticia = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('noticias')) return showToast("Acesso Negado", "error");
    if (!notData) return showToast("Selecione a data", "error");
    try {
      const data = { data: notData, titulo: notTitulo, resumo: notResumo, imagem: notImagem };
      if (editingId) await updateDoc(doc(db, 'noticias', editingId), data); else await addDoc(collection(db, 'noticias'), data);
      fecharFormulario(); showToast("Notícia publicada");
    } catch { showToast("Falha", "error"); }
  };

  const handleSalvarMod = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('mods')) return showToast("Acesso Negado", "error");
    try {
      const data = { titulo: modTitulo, desc: modDesc, link: modLink, isMarketplace: modMarketplace, buttonText: modMarketplace ? 'Loja MSFS' : 'Download' };
      if (editingId) await updateDoc(doc(db, 'mods', editingId), data); else await addDoc(collection(db, 'mods'), data);
      fecharFormulario(); showToast("Salvo");
    } catch { showToast("Falha", "error"); }
  };

  const handleSalvarVoo = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('logbook')) return showToast("Acesso Negado", "error");
    if (!vooData || !vooPiloto) return showToast("Campos inválidos", "error");
    try {
      const [dPart, tPart] = vooData.split('T');
      const data = { pilotoNome: vooPiloto, aeronave: vooAeronave, tipoMissao: vooMissao, origem: vooOrigem.toUpperCase(), destino: vooDestino.toUpperCase(), dataHora: `${dPart.split('-').reverse().join('/')} às ${tPart}`, status: vooStatus };
      if (editingId) await updateDoc(doc(db, 'voos', editingId), data); else await addDoc(collection(db, 'voos'), data);
      fecharFormulario(); showToast("Plano de voo registado");
    } catch { showToast("Falha", "error"); }
  };

  const handleMenuClick = (tabName: string) => {
    setActiveTab(tabName); fecharFormulario(); setMobileSidebarOpen(false);
  };

  const horaAtual = agora.getHours();
  let saudacao = 'Boa noite';
  if (horaAtual >= 5 && horaAtual < 12) saudacao = 'Bom dia';
  else if (horaAtual >= 12 && horaAtual < 18) saudacao = 'Boa tarde';

  const dataString = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const dataFormatada = dataString.charAt(0).toUpperCase() + dataString.slice(1);
  const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const pilotosOpcoes = pilotos.map(p => ({ value: p.nome, label: p.nome }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${customHeader || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: '#f8fafc', fontFamily: appleFontStack, position: 'relative' }}>
      
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(20px)', zIndex: 0 }} />

      <style>{`
        body, html { margin: 0; padding: 0; background-color: #030712; overflow-x: hidden; }
        input::placeholder, textarea::placeholder { color: #64748b !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .custom-select-option:hover { background: rgba(255,255,255,0.1) !important; color: #f8fafc !important; }
        
        .time-scroll::-webkit-scrollbar { width: 4px; }
        .time-scroll::-webkit-scrollbar-track { background: transparent; }
        .time-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .workspace-sidebar {
          width: 260px;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          transition: transform 0.3s ease;
          z-index: 40;
        }
        
        .nav-item {
          display: flex; alignItems: center; gap: 0.75rem; padding: 0.75rem 1rem;
          color: #94a3b8; border: none; background: transparent; border-radius: 6px;
          cursor: pointer; text-align: left; font-weight: 500; font-size: 0.95rem;
          transition: all 0.2s ease; border-left: 3px solid transparent;
        }
        .nav-item:hover { color: #f8fafc; background: rgba(255,255,255,0.02); }
        .nav-item.active {
          color: #f8fafc; background: linear-gradient(90deg, rgba(245,158,11,0.1) 0%, transparent 100%);
          border-left: 3px solid #f59e0b;
        }

        .list-row {
          display: grid; align-items: center; padding: 1rem 1.5rem;
          background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px; margin-bottom: 0.5rem; transition: background 0.2s;
        }
        .list-row:hover { background: rgba(30, 41, 59, 0.6); }

        .mobile-header { display: none; }
        .desktop-header { display: flex; }

        .form-input {
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f8fafc;
          border-radius: 6px;
          outline: none;
          font-size: 0.95rem;
          font-family: ${appleFontStack};
          width: 100%;
          box-sizing: border-box;
          text-transform: inherit;
        }
        
        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
          letter-spacing: 0.05em;
        }

        .toggle-switch {
          width: 48px; height: 26px; background: #334155; border-radius: 13px;
          position: relative; cursor: pointer; transition: background 0.3s;
        }
        .toggle-switch.active { background: #f59e0b; }
        .toggle-switch::after {
          content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
          background: #fff; border-radius: 50%; transition: transform 0.3s;
        }
        .toggle-switch.active::after { transform: translateX(22px); }

        @media (max-width: 900px) {
          .workspace-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            transform: translateX(-100%); background-color: rgba(15, 23, 42, 0.95);
          }
          .workspace-sidebar.open { transform: translateX(0); }
          .mobile-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem 1.5rem; background: rgba(15, 23, 42, 0.8); border-bottom: 1px solid rgba(255,255,255,0.05);
            position: sticky; top: 0; z-index: 30; backdrop-filter: blur(10px);
          }
          .desktop-header { display: none !important; }
          .main-content { padding: 1rem !important; }
          .list-row { grid-template-columns: 1fr !important; gap: 0.75rem; padding: 1rem; }
          .form-modal-content { width: 95% !important; padding: 0 !important; }
          .action-buttons { flex-direction: column; width: 100%; }
          .action-buttons button { width: 100%; justify-content: center; margin-top: 0.5rem; }
          .news-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`, padding: '1rem 1.5rem', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideIn 0.3s ease-out' }}>
          {toast.type === 'success' ? <CheckCircle2 color="#10b981" size={20}/> : <AlertTriangle color="#ef4444" size={20}/>}
          <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{toast.msg}</span>
        </div>
      )}

      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <AlertTriangle size={26} color="#ef4444" />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{modal.title}</h3>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{modal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={closeConfirmModal} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', flexGrow: 1 }}>Cancelar</button>
              <button onClick={() => { modal.onConfirm(); closeConfirmModal(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flexGrow: 1 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 35, backdropFilter: 'blur(4px)' }} />
      )}

      <aside className={`workspace-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '32px' }} />
            <h2 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '1.15rem', color: '#f8fafc', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>WORKSPACE</h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setMobileSidebarOpen(false)} style={{ display: window.innerWidth <= 900 ? 'block' : 'none', background: 'transparent', border: 'none', color: '#cbd5e1' }}><X size={24} /></button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
          <button className={`nav-item ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => handleMenuClick('manual')}><HelpCircle size={18} color={activeTab === 'manual' ? '#f59e0b' : '#94a3b8'} /> Manual de Uso</button>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0.5rem' }} />
          <button className={`nav-item ${activeTab === 'logbook' ? 'active' : ''}`} onClick={() => handleMenuClick('logbook')}><BookOpen size={18} color={activeTab === 'logbook' ? '#f59e0b' : '#94a3b8'} /> Logbook</button>
          <button className={`nav-item ${activeTab === 'pilotos' ? 'active' : ''}`} onClick={() => handleMenuClick('pilotos')}><Users size={18} color={activeTab === 'pilotos' ? '#f59e0b' : '#94a3b8'} /> Pilotos</button>
          <button className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => handleMenuClick('agenda')}><CalendarCheck2 size={18} color={activeTab === 'agenda' ? '#f59e0b' : '#94a3b8'} /> Agenda</button>
          <button className={`nav-item ${activeTab === 'noticias' ? 'active' : ''}`} onClick={() => handleMenuClick('noticias')}><Newspaper size={18} color={activeTab === 'noticias' ? '#f59e0b' : '#94a3b8'} /> Notícias</button>
          <button className={`nav-item ${activeTab === 'mods' ? 'active' : ''}`} onClick={() => handleMenuClick('mods')}><Link2 size={18} color={activeTab === 'mods' ? '#f59e0b' : '#94a3b8'} /> Utilitários</button>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0.5rem' }} />
          <button className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => handleMenuClick('config')}><Settings size={18} color={activeTab === 'config' ? '#f59e0b' : '#94a3b8'} /> Ajustes do Site</button>
          
          {currentUserInfo?.role === 'admin' && (
            <button className={`nav-item ${activeTab === 'parametros' ? 'active' : ''}`} onClick={() => handleMenuClick('parametros')}><Shield size={18} color={activeTab === 'parametros' ? '#f59e0b' : '#94a3b8'} /> Parâmetros de Acesso</button>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <Clock size={16} />
            <span style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>{horaFormatada}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{dataFormatada}</span>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={logoImage} alt="EDAV Logo" style={{ height: '24px' }} />
            <h1 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc', fontWeight: 600 }}>Workspace</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                {currentUserInfo?.foto ? (
                  <img src={currentUserInfo.foto} alt="Perfil" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                ) : (
                  <UserCircle size={24} color="#f8fafc" />
                )}
              </div>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', width: '160px', zIndex: 50 }}>
                  <button onClick={() => { window.open('/', '_blank'); setUserMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #1e293b', color: '#f8fafc', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Globe size={14}/> Ver Site</button>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><LogOut size={14}/> Sair</button>
                </div>
              )}
            </div>
            <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: 0 }}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        <header className="desktop-header" style={{ padding: '1.25rem 3rem', background: 'transparent', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                
                {currentUserInfo?.foto ? (
                  <img src={currentUserInfo.foto} alt="Perfil" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', border: '1px solid rgba(255,255,255,0.1)' }}><UserCircle size={20}/></div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{saudacao}, {currentUserInfo ? currentUserInfo.nome.split(' ')[0] : 'Comandante'}</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{currentUserInfo?.role === 'admin' ? 'Administrador' : 'Piloto'}</span>
                </div>
                <ChevronDown size={14} color="#94a3b8" />
              </div>
              
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', width: '160px', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                  <button onClick={() => { window.open('/', '_blank'); setUserMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #1e293b', color: '#f8fafc', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Globe size={14}/> Ver Site</button>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><LogOut size={14}/> Terminar Sessão</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="main-content" style={{ padding: '2rem 3rem', position: 'relative', zIndex: 10, flexGrow: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>
              {activeTab === 'manual' && 'MANUAL DO SISTEMA'}
              {activeTab === 'logbook' && 'MEU DIÁRIO DE VOO'}
              {activeTab === 'pilotos' && 'PILOTOS DA ESQUADRILHA'}
              {activeTab === 'agenda' && 'AGENDA DE DEMONSTRAÇÕES'}
              {activeTab === 'noticias' && 'GERIR NOTÍCIAS'}
              {activeTab === 'mods' && 'UTILITÁRIOS E DOWNLOADS'}
              {activeTab === 'config' && 'AJUSTES GLOBAIS'}
              {activeTab === 'parametros' && 'PARÂMETROS DE ACESSO'}
            </h2>
            {activeTab !== 'config' && activeTab !== 'parametros' && activeTab !== 'manual' && checkPermission(activeTab) && (
              <button onClick={() => setShowForm(true)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#d97706'} onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}>
                <Plus size={16} /> Adicionar Novo
              </button>
            )}
          </div>

          {activeTab === 'manual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '1000px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2rem' }}>
                <h3 style={{ marginTop: 0, color: '#f59e0b', fontSize: '1.2rem', textTransform: 'uppercase' }}>Bem-vindo ao Workspace do EDAV</h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>Este é o painel de comando do seu esquadrão. Aqui você pode gerir toda a informação que alimenta o site público, além de controlar os acessos internos e registrar as atividades dos pilotos. O Workspace é modular e as permissões de edição são atribuídas individualmente pelo Administrador.</p>
                
                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={18} color="#f59e0b" /> Meu Diário de Voo (Logbook)</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Área dedicada ao registro operacional. Os pilotos com permissão podem lançar seus voos de treinamento, traslado ou demonstração. Selecione a aeronave utilizada, insira os códigos ICAO dos aeroportos de partida e chegada, defina o horário Zulu e altere o status para "Concluído" assim que o voo terminar.</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#f59e0b" /> Pilotos da Esquadrilha</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Módulo de escalação oficial. Aqui você cadastra os pilotos ativos que serão exibidos no site público. Ao cadastrar, a escolha da "Posição na Esquadrilha" (Líder, Alas, Ferrolho) é crucial, pois ditará a ordem e o design em que o piloto aparecerá para o público.</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarCheck2 size={18} color="#f59e0b" /> Agenda de Demonstrações</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Planejamento de shows aéreos. Basta inserir o nome da cidade e a Data Zulu. Ao salvar, <strong>o sistema busca automaticamente as coordenadas geográficas via satélite</strong> e marca o ponto no mapa 3D do site. Fique à vontade para alternar o status do evento entre "Planejamento (M-PREC)", "Confirmado" ou "Cancelado".</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Newspaper size={18} color="#f59e0b" /> Gerir Notícias</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>O blog do esquadrão. Você pode redigir comunicados, relatórios pós-voo ou avisos de recrutamento. <strong>Dica importante:</strong> Para poupar o armazenamento do banco de dados, tente fazer o upload de imagens de capa leves (recomendado abaixo de 1MB).</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Link2 size={18} color="#f59e0b" /> Utilitários e Downloads</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Biblioteca do esquadrão. Adicione links para download de texturas oficiais, mods essenciais, manuais ou pacotes de cenários. Marque a opção "Marketplace" se o item tiver que ser adquirido diretamente dentro do simulador MSFS.</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={18} color="#f59e0b" /> Ajustes Globais</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>Nesta tela, com um simples clique você pode habilitar ou desabilitar o recebimento de formulários de recrutamento no site público. Também é aqui que se altera a grande imagem de fundo (Header) exibida tanto na página inicial quanto no fundo escurecido deste painel.</p>

                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} color="#f59e0b" /> Parâmetros de Acesso (Exclusivo Admin)</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>O coração da segurança. O Comandante (Administrador) tem acesso a esta aba onde pode ver todos os usuários que entraram usando a conta Google. A partir daqui, é possível mudar cargos gerais ou liberar chaves de acesso granulares (por exemplo: permitir que o usuário X possa adicionar itens na Agenda, mas não nas Notícias).</p>
              </div>
            </div>
          )}

          {activeTab === 'logbook' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <div className="form-modal-content" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'visible', margin: '5vh auto' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{editingId ? 'Editar Plano de Voo' : 'Registar Novo Voo'}</h3>
                      <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarVoo} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Piloto</label>
                          <CustomSelect searchable value={vooPiloto} onChange={(val) => setVooPiloto(val)} options={pilotosOpcoes} placeholder="Selecione o piloto..." />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">Aeronave</label>
                            <CustomSelect value={vooAeronave} onChange={(val) => setVooAeronave(val)} options={aeronavesOpcoes} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">Tipo de Missão</label>
                            <CustomSelect value={vooMissao} onChange={(val) => setVooMissao(val)} options={missoesOpcoes} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">ICAO Origem</label>
                            <input required type="text" maxLength={4} value={vooOrigem} onChange={e => setVooOrigem(e.target.value)} className="form-input" placeholder="SBBR" style={{ textTransform: 'uppercase' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">ICAO Destino</label>
                            <input required type="text" maxLength={4} value={vooDestino} onChange={e => setVooDestino(e.target.value)} className="form-input" placeholder="SBYS" style={{ textTransform: 'uppercase' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">Data e Hora Zulu (Z)</label>
                            <CustomDateTimePicker value={vooData} onChange={(val) => setVooData(val)} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="form-label">Status do Voo</label>
                            <CustomSelect value={vooStatus} onChange={(val) => setVooStatus(val)} options={[{value: 'Planeado', label: 'Planeado'}, {value: 'Em Voo', label: 'Em Voo'}, {value: 'Concluído', label: 'Concluído'}]} />
                          </div>
                        </div>

                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Salvar Voo</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: checkPermission('logbook') ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr', padding: '0 1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Piloto & Missão</span>
                  <span>Rota</span>
                  <span>Data/Hora</span>
                  <span>Status</span>
                  {checkPermission('logbook') && <span style={{ textAlign: 'right' }}>Ações</span>}
                </div>

                {voos.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <PlaneTakeoff size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum plano de voo registado.</p>
                  </div>
                ) : (
                  voos.map((v) => (
                    <div key={v.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? (checkPermission('logbook') ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr') : '1fr' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, marginBottom: '2px' }}>{v.pilotoNome}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{v.aeronave} • {v.tipoMissao}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {v.origem} <ChevronRight size={14} color="#f59e0b" /> {v.destino}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {v.dataHora}
                      </div>
                      <div>
                        <span style={{ 
                          background: v.status === 'Concluído' ? 'rgba(16, 185, 129, 0.1)' : v.status === 'Em Voo' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: v.status === 'Concluído' ? '#10b981' : v.status === 'Em Voo' ? '#38bdf8' : '#f59e0b',
                          border: v.status === 'Concluído' ? '1px solid rgba(16, 185, 129, 0.3)' : v.status === 'Em Voo' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
                        }}>
                          {v.status}
                        </span>
                      </div>
                      
                      {checkPermission('logbook') && (
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}>
                          <button onClick={() => handleEditarVoo(v)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeletarItem(v.id, 'voos', 'este voo', 'logbook')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'pilotos' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <div className="form-modal-content" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'visible', margin: '5vh auto' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{editingId ? 'Editar Piloto' : 'Cadastrar Piloto'}</h3>
                      <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarPiloto} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Nome Completo</label>
                          <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="form-input" placeholder="Ex: João Silva" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Cidade</label>
                          <input required type="text" value={novaCidade} onChange={e => setNovaCidade(e.target.value)} className="form-input" placeholder="Ex: São Paulo" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">UF</label>
                          <CustomSelect searchable value={novaUf} onChange={(val) => setNovaUf(val)} options={ufsBrasileiros} placeholder="Selecione..." />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Posição na Esquadrilha</label>
                          <CustomSelect 
                            value={novoPosicao} onChange={(val) => setNovoPosicao(val)}
                            options={[
                              { value: '1', label: '#1 - Líder' }, { value: '2', label: '#2 - Ala Direita' }, { value: '3', label: '#3 - Ala Esquerda' },
                              { value: '4', label: '#4 - Ferrolho' }, { value: '5', label: '#5 - Ala Esq. Externa' }, { value: '6', label: '#6 - Ala Dir. Externa' }, { value: '7', label: '#7 - Isolado' }
                            ]}
                          />
                        </div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Salvar Piloto</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: checkPermission('pilotos') ? '1.5fr 2fr 2fr 1fr' : '1.5fr 2fr 2fr', padding: '0 1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Posição</span>
                  <span>Piloto</span>
                  <span>Localidade</span>
                  {checkPermission('pilotos') && <span style={{ textAlign: 'right' }}>Ações</span>}
                </div>

                {pilotos.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Users size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum piloto cadastrado.</p>
                  </div>
                ) : (
                  pilotos.map((p) => (
                    <div key={p.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? (checkPermission('pilotos') ? '1.5fr 2fr 2fr 1fr' : '1.5fr 2fr 2fr') : '1fr' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '1.25rem', fontFamily: '"PosicaoFont", sans-serif', lineHeight: 1 }}>{p.posicao}</span>
                        <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 500 }}>{getPosicaoNome(p.posicao)}</span>
                      </div>
                      <div style={{ fontWeight: 400, color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {p.nome}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {p.cidade || 'City'} {p.uf ? `- ${p.uf}` : '- UF'}
                      </div>
                      
                      {checkPermission('pilotos') && (
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}>
                          <button onClick={() => handleEditarPiloto(p)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeletarItem(p.id, 'pilotos', 'este piloto', 'pilotos')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <div className="form-modal-content" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'visible', margin: '5vh auto' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{editingId ? 'Editar Evento' : 'Nova Demonstração'}</h3>
                      <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarAgenda} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Cidade do Evento</label>
                          <input required type="text" value={agCidade} onChange={e => setAgCidade(e.target.value)} className="form-input" placeholder="Ex: Brasília - DF" />
                          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>As coordenadas do mapa serão buscadas automaticamente via satélite.</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Data e Hora Zulu (Z)</label>
                          <CustomDateTimePicker value={agDataHoraIso} onChange={(val) => setAgDataHoraIso(val)} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Status da Missão</label>
                          <CustomSelect 
                            value={agStatus} onChange={(val) => setAgStatus(val)}
                            options={[{ value: 'Planejamento', label: 'Planejamento (M-PREC)' }, { value: 'Confirmado', label: 'Confirmado' }, { value: 'Cancelado', label: 'Cancelado' }]}
                          />
                        </div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} disabled={loadingGeocode} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" disabled={loadingGeocode} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: loadingGeocode ? 'wait' : 'pointer', opacity: loadingGeocode ? 0.7 : 1, fontFamily: appleFontStack }}>
                          {loadingGeocode ? 'Buscando...' : 'Salvar Evento'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: checkPermission('agenda') ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr', padding: '0 1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Data / Local</span>
                  <span>Status</span>
                  <span>Status Real</span>
                  {checkPermission('agenda') && <span style={{ textAlign: 'right' }}>Ações</span>}
                </div>

                {agendas.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CalendarCheck2 size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum evento na agenda.</p>
                  </div>
                ) : (
                  agendas.map((a) => (
                    <div key={a.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? (checkPermission('agenda') ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr') : '1fr' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '2px' }}>{a.dataHora}</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{a.cidade}</span>
                      </div>
                      <div>
                        <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                          M-PREC
                        </span>
                      </div>
                      <div>
                        <span style={{ 
                          background: a.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.1)' : a.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: a.status === 'Confirmado' ? '#10b981' : a.status === 'Cancelado' ? '#ef4444' : '#f59e0b',
                          border: a.status === 'Confirmado' ? '1px solid rgba(16, 185, 129, 0.3)' : a.status === 'Cancelado' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' 
                        }}>
                          {a.status}
                        </span>
                      </div>
                      
                      {checkPermission('agenda') && (
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}>
                          <button onClick={() => handleEditarAgenda(a)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeletarItem(a.id, 'agenda', 'este evento', 'agenda')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'noticias' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <div className="form-modal-content" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'visible', margin: '5vh auto' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{editingId ? 'Editar Publicação' : 'Nova Notícia'}</h3>
                      <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarNoticia} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Título da Notícia</label>
                          <input required type="text" value={notTitulo} onChange={e => setNotTitulo(e.target.value)} className="form-input" placeholder="Ex: Apresentação Confirmada!" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Data da Publicação</label>
                          <CustomDatePicker value={notData} onChange={(val) => setNotData(val)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Imagem de Capa</label>
                          <label style={{ padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <ImagePlus size={18} color="#f59e0b"/> {notImagem ? 'Trocar Imagem' : 'Selecionar Imagem (Até 1MB)...'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                          </label>
                        </div>
                        
                        {notImagem && (
                          <div style={{ width: '100%', height: '140px', borderRadius: '6px', backgroundImage: `url(${notImagem})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }} />
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Resumo (Texto curto)</label>
                          <textarea required value={notResumo} onChange={e => setNotResumo(e.target.value)} rows={3} className="form-input" style={{ resize: 'none' }} placeholder="Digite o resumo da notícia..." />
                        </div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Publicar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {noticias.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Newspaper size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhuma notícia publicada.</p>
                  </div>
                ) : (
                  noticias.map((n) => (
                    <div key={n.id} style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}>
                      {n.imagem ? (
                        <div style={{ height: '140px', backgroundImage: `url(${n.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                      ) : (
                        <div style={{ height: '140px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImagePlus size={32} color="#64748b"/></div>
                      )}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>{n.titulo}</h4>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{n.data}</span>
                        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.5rem 0', flexGrow: 1 }}>{n.resumo.length > 80 ? n.resumo.substring(0, 80) + '...' : n.resumo}</p>
                        
                        {checkPermission('noticias') && (
                          <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                            <button onClick={() => handleEditarNoticia(n)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', flexGrow: 1, display: 'flex', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f8fafc'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}><Edit2 size={16} /></button>
                            <button onClick={() => handleDeletarItem(n.id, 'noticias', 'esta notícia', 'noticias')} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', flexGrow: 1, display: 'flex', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'mods' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'visible', margin: '5vh auto' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{editingId ? 'Editar Link' : 'Cadastrar Utilitário'}</h3>
                      <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarMod} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Título do Arquivo/Link</label>
                          <input required type="text" value={modTitulo} onChange={e => setModTitulo(e.target.value)} className="form-input" placeholder="Ex: Textura A-29" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Link URL</label>
                          <input required type="url" value={modLink} onChange={e => setModLink(e.target.value)} className="form-input" placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label className="form-label">Descrição</label>
                          <input required type="text" value={modDesc} onChange={e => setModDesc(e.target.value)} className="form-input" placeholder="Ex: Texturas oficiais do esquadrão..." />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                          <div className={`toggle-switch ${modMarketplace ? 'active' : ''}`} onClick={() => setModMarketplace(!modMarketplace)} />
                          É um item pago do Marketplace oficial?
                        </label>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Salvar Link</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {mods.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Link2 size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum utilitário salvo.</p>
                  </div>
                ) : (
                  mods.map((m) => (
                    <div key={m.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? 'auto 1fr auto' : '1fr', gap: '1.5rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Link2 size={24} color="#64748b" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.2rem' }}>{m.titulo}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{m.desc}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{m.isMarketplace ? 'Loja do Jogo' : 'Link Externo'}</span>
                        
                        {checkPermission('mods') && (
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => handleEditarMod(m)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><Edit2 size={16} /></button>
                            <button onClick={() => handleDeletarItem(m.id, 'mods', 'este link', 'mods')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1000px' }}>
              
              <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>Alistamento</h4>
                <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Habilite para exibir o formulário de recrutamento na página principal.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.95rem' }}>{alistamentoAberto ? 'Inscrições Abertas' : 'Inscrições Fechadas'}</span>
                  
                  {checkPermission('alistamento') ? (
                    <div className={`toggle-switch ${alistamentoAberto ? 'active' : ''}`} onClick={handleToggleAlistamento} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Bloqueado</span>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>Imagem de Fundo</h4>
                <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Altere a imagem de cabeçalho do site (Recomendado imagens até 1MB).</p>
                
                {customHeader && (
                  <div style={{ height: '100px', backgroundImage: `url(${customHeader})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                )}

                {checkPermission('header') ? (
                  <label style={{ padding: '0.85rem 1rem', background: '#f59e0b', color: '#000', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#d97706'} onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}>
                    <ImagePlus size={18} /> Atualizar Imagem
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(255,255,255,0.2)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', cursor: 'not-allowed' }}>
                    Sem permissão para alterar
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'parametros' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: '2fr 2fr 1fr', padding: '0 1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Utilizador</span>
                <span>E-mail</span>
                <span>Cargo Geral</span>
              </div>

              {usuarios.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Shield size={48} color="#334155" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum utilizador registado.</p>
                </div>
              ) : (
                usuarios.map((u) => (
                  <div key={u.id} className="list-row" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', padding: '1.5rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '2fr 2fr 1fr' : '1fr', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {u.foto ? (
                          <img src={u.foto} alt="Perfil" style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><UserCircle size={24}/></div>
                        )}
                        <span style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>{u.nome}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {u.email}
                      </div>
                      <div>
                        <CustomSelect 
                          inline 
                          value={u.role} 
                          onChange={(val) => handleMudarCargo(u.id as string, val)}
                          options={[
                            { value: 'admin', label: 'Administrador' },
                            { value: 'piloto', label: 'Piloto' },
                            { value: 'pendente', label: 'Pendente' }
                          ]} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                      <PermissionToggle label="Logbook" active={!!u.permissoes?.logbook} onChange={() => handlePermissao(u.id!, 'logbook', !u.permissoes?.logbook)} />
                      <PermissionToggle label="Adicionar Agenda" active={!!u.permissoes?.agenda} onChange={() => handlePermissao(u.id!, 'agenda', !u.permissoes?.agenda)} />
                      <PermissionToggle label="Adicionar Mod" active={!!u.permissoes?.mods} onChange={() => handlePermissao(u.id!, 'mods', !u.permissoes?.mods)} />
                      <PermissionToggle label="Alterar Header" active={!!u.permissoes?.header} onChange={() => handlePermissao(u.id!, 'header', !u.permissoes?.header)} />
                      <PermissionToggle label="Abrir Alistamento" active={!!u.permissoes?.alistamento} onChange={() => handlePermissao(u.id!, 'alistamento', !u.permissoes?.alistamento)} />
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}