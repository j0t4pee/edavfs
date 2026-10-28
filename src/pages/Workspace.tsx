/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { signOut } from 'firebase/auth';

import { 
  LayoutDashboard, Users, CalendarCheck2, Settings, LogOut, Plus, Trash2, Edit2, ShieldCheck, X, AlertTriangle, Newspaper, Link2, ChevronDown, CheckCircle2, ImagePlus, UserCircle, Menu, Calendar, Globe, Shield, Clock, ChevronRight, BellRing, AlertOctagon, Info, Loader2, EyeOff, Cloud, Search, Wind, Thermometer, Gauge, Briefcase, Activity, Map as MapIcon, Inbox, Check
} from 'lucide-react';

import logoImage from '../images/logo.png';
import faviconImage from '../images/favicon.png';
import mfLogo from '../images/mf.png';

interface Piloto { id?: string; posicao: string; nome: string; cidade: string; uf: string; oculto?: boolean; justificativa?: string; plataforma?: string; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; plataforma?: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }
interface Mod { id?: string; titulo: string; desc: string; isMarketplace: boolean; buttonText: string; link: string; }
interface Notam { id?: string; data: string; titulo: string; mensagem: string; autor: string; }
interface Estatistica { id?: string; icone: string; valor: string; rotulo: string; ordem: number; }
interface Solicitacao { id?: string; cidade: string; transmissao: string; canal: string; dataSolicitacao: string; status: string; }
interface Usuario { 
  id?: string; uid: string; nome: string; email: string; foto: string; role: string; 
  permissoes?: { agenda?: boolean; mods?: boolean; alistamento?: boolean; };
}

const getPosicaoNome = (num: string) => {
  switch (num) {
    case '1': return 'Líder'; case '2': return 'Ala Direita'; case '3': return 'Ala Esquerda'; 
    case '4': return 'Ferrolho'; case '5': return 'Ala Esq. Externa'; case '6': return 'Ala Dir. Externa'; 
    case '7': return 'Isolado'; default: return 'Não Definido';
  }
};

const ufsBrasileiros = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => ({ value: uf, label: uf }));

const PermissionToggle = ({ label, active, onChange }: { label: string, active: boolean, onChange: () => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Regular", sans-serif' }}>{label}</span>
    <div className={`toggle-switch ${active ? 'active' : ''}`} onClick={onChange} style={{ transform: 'scale(0.8)', margin: '-5px -5px -5px 0' }} />
  </div>
);

const SimToggle = ({ label, active, onChange }: { label: string, active: boolean, onChange: () => void }) => (
  <div onClick={onChange} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: active ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px', border: active ? '1px solid var(--fs-blue)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s', color: active ? '#f8fafc' : '#9ca3af', fontSize: '0.85rem', fontWeight: 500, fontFamily: '"Regular", sans-serif' }}>
    <div className={`toggle-switch ${active ? 'active' : ''}`} style={{ transform: 'scale(0.7)', margin: '-5px 0' }} />
    {label}
  </div>
);

const CustomSelect = ({ value, options, onChange, placeholder, searchable = false, inline = false }: { value: string, options: {value: string, label: string}[], onChange: (val: string) => void, placeholder?: string, searchable?: boolean, inline?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = searchable && search ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options;

  return (
    <div style={{ position: 'relative', fontFamily: '"Regular", sans-serif' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => { setIsOpen(false); setSearch(''); }} />}
      <div onClick={() => setIsOpen(true)} className="form-input custom-select-box" style={{ padding: inline ? '0.5rem' : '0.85rem 1.2rem', background: inline ? 'transparent' : 'rgba(0,0,0,0.3)', border: inline ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--fs-border)', color: selectedOption ? '#f8fafc' : '#64748b', borderRadius: '12px', fontSize: inline ? '0.85rem' : '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41, transition: 'all 0.2s' }}>
        {searchable && isOpen ? (
          <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', width: '100%', fontSize: '0.9rem', fontFamily: '"Regular", sans-serif' }} />
        ) : ( <span>{selectedOption ? selectedOption.label : placeholder}</span> )}
        <ChevronDown size={14} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0, marginLeft: '0.5rem' }} />
      </div>
      {isOpen && (
        <div className="modal-modern fs-card" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, minWidth: inline ? '150px' : 'auto', background: '#0b0f19', border: '1px solid var(--fs-border)', borderRadius: '12px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', padding: 0 }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div key={opt.value} className="custom-select-option" onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }} style={{ padding: '0.75rem 1rem', color: value === opt.value ? 'var(--fs-blue)' : '#cbd5e1', background: value === opt.value ? 'rgba(59,130,246,0.1)' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', borderLeft: value === opt.value ? '3px solid var(--fs-blue)' : '3px solid transparent', fontWeight: value === opt.value ? 600 : 400 }}>
                {opt.label}
              </div>
            ))
          ) : ( <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>Não encontrado</div> )}
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const parseDate = (val: string) => {
    if (!val) return new Date(); const parts = val.split('/');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return new Date();
  };
  const [viewDate, setViewDate] = useState(parseDate(value));
  const [selDate, setSelDate] = useState<Date | null>(value ? parseDate(value) : null);
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const handleConfirm = (d: Date) => {
    setSelDate(d);
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    onChange(`${day}/${m}/${y}`); setIsOpen(false);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = selDate && selDate.getDate() === i && selDate.getMonth() === viewDate.getMonth() && selDate.getFullYear() === viewDate.getFullYear();
    days.push(
      <div key={i} onClick={() => handleConfirm(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))}
           style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: isSelected ? 'var(--fs-blue)' : 'transparent', color: isSelected ? '#fff' : '#cbd5e1', fontWeight: isSelected ? '600' : 'normal', fontSize: '0.8rem' }}
           onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}>{i}</div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', fontFamily: '"Regular", sans-serif' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
      <div onClick={() => setIsOpen(!isOpen)} className="form-input custom-select-box" style={{ padding: '0.85rem 1.2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--fs-border)', color: value ? '#f8fafc' : '#64748b', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 41, position: 'relative', transition: 'all 0.2s' }}>
        {value || "DD/MM/AAAA"} <Calendar size={16} color="#64748b" />
      </div>
      {isOpen && (
        <div className="modal-modern fs-card" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#0b0f19', border: '1px solid var(--fs-border)', borderRadius: '12px', zIndex: 50, padding: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '260px', maxWidth: '90vw' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>&lt;</button>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem', textTransform: 'uppercase' }}>{meses[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>&gt;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
            {diasSemana.map((d,i) => <div key={i} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>{days}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--fs-border)' }}>
            <button type="button" onClick={() => { setSelDate(null); onChange(''); setIsOpen(false); }} style={{ background:'transparent', border:'none', color:'#ef4444', fontSize:'0.8rem', cursor:'pointer', fontWeight: 600 }}>Limpar</button>
            <button type="button" onClick={() => { const n = new Date(); setViewDate(n); handleConfirm(n); }} style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', color:'var(--fs-blue)', fontSize:'0.8rem', cursor:'pointer', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>Hoje</button>
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

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const handleConfirm = () => {
    if (!selDate) return;
    const y = selDate.getFullYear(); const m = String(selDate.getMonth() + 1).padStart(2, '0'); const d = String(selDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}T${hour}:${minute}`); setIsOpen(false);
  };

  let display = "dd/mm/aaaa --:--";
  if (value && value.includes('T')) {
    const [dPart, tPart] = value.split('T'); const [y, m, d] = dPart.split('-');
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
           style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: isSelected ? 'var(--fs-blue)' : 'transparent', color: isSelected ? '#fff' : '#cbd5e1', fontWeight: isSelected ? '600' : 'normal', fontSize: '0.8rem' }}
           onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}>{i}</div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', fontFamily: '"Regular", sans-serif' }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
      <div onClick={() => setIsOpen(!isOpen)} className="form-input custom-select-box" style={{ padding: '0.85rem 1.2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--fs-border)', color: value ? '#f8fafc' : '#64748b', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 41, position: 'relative', transition: 'all 0.2s' }}>
        {display} <Calendar size={16} color="#64748b" />
      </div>
      {isOpen && (
        <div className="modal-modern fs-card" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#0b0f19', border: '1px solid var(--fs-border)', borderRadius: '12px', zIndex: 50, padding: '1.25rem', boxShadow: '0 15px 30px rgba(0,0,0,0.5)', display: 'flex', gap: '1.5rem', width: '380px', maxWidth: '90vw' }}>
          <div style={{ flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>&lt;</button>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem', textTransform: 'uppercase' }}>{meses[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', cursor:'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>&gt;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
              {diasSemana.map((d,i) => <div key={i} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>{days}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--fs-border)' }}>
              <button type="button" onClick={() => { setSelDate(null); onChange(''); setIsOpen(false); }} style={{ background:'transparent', border:'none', color:'#ef4444', fontSize:'0.8rem', cursor:'pointer', fontWeight: 600 }}>Limpar</button>
              <button type="button" onClick={() => { const n = new Date(); setViewDate(n); setSelDate(n); }} style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', color:'var(--fs-blue)', fontSize:'0.8rem', cursor:'pointer', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>Hoje</button>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid var(--fs-border)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginBottom: '0.75rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '200px', overflowY: 'auto', gap: '2px', paddingRight: '2px' }} className="time-scroll">
                {Array.from({length: 24}).map((_, i) => {
                  const h = String(i).padStart(2, '0');
                  return <div key={h} onClick={() => setHour(h)} style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: hour === h ? 'rgba(59,130,246,0.1)' : 'transparent', color: hour === h ? 'var(--fs-blue)' : '#64748b', fontSize: '0.85rem', fontWeight: hour === h ? 600 : 400 }}>{h}</div>
                })}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '200px', overflowY: 'auto', gap: '2px', paddingRight: '2px' }} className="time-scroll">
                {Array.from({length: 60}).map((_, i) => {
                  const m = String(i).padStart(2, '0');
                  return <div key={m} onClick={() => setMinute(m)} style={{ padding: '6px 0', textAlign: 'center', cursor: 'pointer', borderRadius: '4px', background: minute === m ? 'rgba(59,130,246,0.1)' : 'transparent', color: minute === m ? 'var(--fs-blue)' : '#64748b', fontSize: '0.85rem', fontWeight: minute === m ? 600 : 400 }}>{m}</div>
                })}
              </div>
            </div>
            <button type="button" onClick={handleConfirm} style={{ background: 'var(--fs-blue)', border: 'none', color: '#fff', padding: '0.6rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', width: '100%', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fs-blue-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fs-blue)'}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [gerenciaisAberto, setGerenciaisAberto] = useState(true);
  const navigate = useNavigate();

  const [agora, setAgora] = useState(new Date());

  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [agendas, setAgendas] = useState<Demonstracao[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [notams, setNotams] = useState<Notam[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); 
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]); 
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  
  const [pilotoFilter, setPilotoFilter] = useState<'2020' | '2024' | 'Ambos'>('Ambos');
  const [agendaFilter, setAgendaFilter] = useState<'2020' | '2024' | 'Ambos'>('Ambos');

  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  const [solicitacaoAberta, setSolicitacaoAberta] = useState(true);
  
  // Configs Mídias / Discord
  const [ytUrl, setYtUrl] = useState('');
  const [twUrl, setTwUrl] = useState('');
  const [tkUrl, setTkUrl] = useState('');
  
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordColor, setDiscordColor] = useState('#ed333b');
  const [discordAuthorName, setDiscordAuthorName] = useState('ESQUADRILHA DA FUMAÇA VIRTUAL');
  const [discordAuthorIcon, setDiscordAuthorIcon] = useState('https://i.imgur.com/L79pB2z.png');
  const [discordImageUrl, setDiscordImageUrl] = useState('https://i.imgur.com/mJ2Zl3E.jpeg');
  const [discordFooter, setDiscordFooter] = useState('EDAV MSFS - Sistema de Operações');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false); 
  const [currentUserInfo, setCurrentUserInfo] = useState<Usuario | null>(null); 
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [metarIcao, setMetarIcao] = useState('');
  const [metarData, setMetarData] = useState<any>(null);
  const [metarLoading, setMetarLoading] = useState(false);

  // Form states
  const [novoPosicao, setNovoPosicao] = useState('1');
  const [novoNome, setNovoNome] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [novaUf, setNovaUf] = useState('');
  const [novoOculto, setNovoOculto] = useState(false);
  const [novoJustificativa, setNovoJustificativa] = useState('');
  
  const [plat2020Ativo, setPlat2020Ativo] = useState(true);
  const [plat2024Ativo, setPlat2024Ativo] = useState(false);

  const [agCidade, setAgCidade] = useState('');
  const [agDataHoraIso, setAgDataHoraIso] = useState('');
  const [agStatus, setAgStatus] = useState('Planejamento');

  const [notData, setNotData] = useState('');
  const [notTitulo, setNotTitulo] = useState('');
  const [notResumo, setNotResumo] = useState('');
  const [notImagem, setNotImagem] = useState('');

  const [notamTitulo, setNotamTitulo] = useState('');
  const [notamMensagem, setNotamMensagem] = useState('');
  const [notamData, setNotamData] = useState('');

  const [statIcone, setStatIcone] = useState('');
  const [statValor, setStatValor] = useState('');
  const [statRotulo, setStatRotulo] = useState('');
  const [statOrdem, setStatOrdem] = useState(1);
  
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

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link);
    }
    link.href = faviconImage;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login'); 
      else {
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
      onSnapshot(collection(db, 'estatisticas'), snap => {
        const arr: Estatistica[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Estatistica));
        arr.sort((a, b) => a.ordem - b.ordem); setEstatisticas(arr.slice(0, 5));
      }),
      onSnapshot(collection(db, 'notams'), snap => {
        const arr: Notam[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Notam));
        arr.sort((a, b) => {
          const dateA = a.data.split('/').reverse().join('-');
          const dateB = b.data.split('/').reverse().join('-');
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        setNotams(arr);
      }),
      onSnapshot(collection(db, 'usuarios'), snap => {
        const arr: Usuario[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Usuario));
        setUsuarios(arr);
      }),
      onSnapshot(collection(db, 'solicitacoes'), snap => {
        const arr: Solicitacao[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Solicitacao));
        arr.sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());
        setSolicitacoes(arr);
      }),
      onSnapshot(doc(db, 'config', 'geral'), docSnap => { 
        if (docSnap.exists()) {
          const d = docSnap.data();
          setAlistamentoAberto(d.alistamentoAberto || false); 
          setSolicitacaoAberta(d.solicitacaoAberta !== undefined ? d.solicitacaoAberta : true);
          setYtUrl(d.liveYouTubeUrl || '');
          setTwUrl(d.liveTwitchUrl || ''); 
          setTkUrl(d.liveTikTokUrl || '');
          setDiscordWebhook(d.discordWebhook || '');
          setDiscordColor(d.discordColor || '#ed333b');
          setDiscordAuthorName(d.discordAuthorName || 'ESQUADRILHA DA FUMAÇA VIRTUAL');
          setDiscordAuthorIcon(d.discordAuthorIcon || 'https://i.imgur.com/L79pB2z.png');
          setDiscordImageUrl(d.discordImageUrl || 'https://i.imgur.com/mJ2Zl3E.jpeg');
          setDiscordFooter(d.discordFooter || 'EDAV MSFS - Sistema de Operações');
        } 
      })
    ];
    return () => unsubs.forEach(u => u()); 
  }, [navigate]);

  const checkPermission = (action: string) => {
    if (currentUserInfo?.role === 'admin') return true;
    if (['dashboard', 'notam', 'meteorologia'].includes(action)) return true; 
    if (['pilotos', 'noticias', 'config', 'estatisticas', 'solicitacoes'].includes(action)) return false; 
    return !!currentUserInfo?.permissoes?.[action as keyof typeof currentUserInfo.permissoes];
  };

  const handleLogout = async () => {
    try { await signOut(auth); sessionStorage.clear(); localStorage.removeItem('edav_auth_token'); window.location.href = '/login'; } 
    catch { showToast("Erro ao sair da conta", "error"); }
  };

  const fecharFormulario = () => {
    setShowForm(false); setEditingId(null); setUploadProgress(null);
    setNovoPosicao('1'); setNovoNome(''); setNovaCidade(''); setNovaUf(''); setNovoOculto(false); setNovoJustificativa(''); setPlat2020Ativo(true); setPlat2024Ativo(false);
    setAgCidade(''); setAgDataHoraIso(''); setAgStatus('Planejamento');
    setNotData(''); setNotTitulo(''); setNotResumo(''); setNotImagem('');
    setNotamTitulo(''); setNotamMensagem(''); setNotamData('');
    setStatIcone(''); setStatValor(''); setStatRotulo(''); setStatOrdem(estatisticas.length + 1);
  };

  const parsePlatformToString = (p2020: boolean, p2024: boolean) => {
    if (p2020 && p2024) return 'Ambos';
    if (p2024) return '2024';
    return '2020'; 
  };

  const loadPlatformToState = (plataformaString: string | undefined) => {
    if (plataformaString === 'Ambos') { setPlat2020Ativo(true); setPlat2024Ativo(true); }
    else if (plataformaString === '2024') { setPlat2020Ativo(false); setPlat2024Ativo(true); }
    else { setPlat2020Ativo(true); setPlat2024Ativo(false); }
  };

  const matchesPlatformFilter = (itemPlat: string | undefined, currentFilter: string) => {
    if (currentFilter === 'Ambos') return true;
    const plat = itemPlat || '2020';
    if (plat === 'Ambos') return true;
    return plat === currentFilter;
  };

  const handleBuscarMetar = async (e?: React.FormEvent) => {
    if(e) e.preventDefault(); if(!metarIcao || metarIcao.length < 4) return showToast("Digite um código ICAO válido.", "error");
    setMetarLoading(true); setMetarData(null);
    try {
      const response = await fetch(`https://metar.vatsim.net/metar.php?id=${metarIcao.toUpperCase()}`);
      if (!response.ok) throw new Error("Erro de rede");
      const rawMetar = await response.text();
      if (!rawMetar || rawMetar.trim() === '') return setMetarData({ error: 'Nenhum METAR atual encontrado para este ICAO.' });

      let temp = "N/A"; let wdir = "N/A"; let wspd = "N/A"; let altim = "N/A";
      const windMatch = rawMetar.match(/(\d{3}|VRB)(\d{2,3})(?:G\d{2,3})?(KT|MPS)/);
      if (windMatch) { wdir = windMatch[1]; wspd = windMatch[2]; }
      const tempMatch = rawMetar.match(/\s(M?\d{2})\/(M?\d{2})?(?:\s|$)/);
      if (tempMatch) temp = tempMatch[1].replace('M', '-'); 
      const qnhMatch = rawMetar.match(/Q(\d{4})/); const altMatch = rawMetar.match(/A(\d{4})/);
      if (qnhMatch) altim = qnhMatch[1] + " hPa"; else if (altMatch) altim = altMatch[1].slice(0,2) + "." + altMatch[1].slice(2) + " inHg";

      setMetarData({
        icaoId: metarIcao.toUpperCase(), rawOb: rawMetar,
        receiptTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temp: temp !== "N/A" ? parseInt(temp) : null, wdir: wdir !== "N/A" ? wdir : null,
        wspd: wspd !== "N/A" ? parseInt(wspd) : null, altim: altim !== "N/A" ? altim : null,
      });
    } catch (err) { setMetarData({ error: 'Falha ao conectar com o serviço.' }); } 
    finally { setMetarLoading(false); }
  };

  const handleImageUploadNoticias = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkPermission('noticias')) return showToast("Acesso Negado.", "error");
    const file = e.target.files?.[0]; if (!file) return;
    const storageRef = ref(storage, `noticias/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', 
      (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100), 
      () => { showToast("Erro ao enviar", "error"); setUploadProgress(null); }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setNotImagem(downloadURL); setUploadProgress(null); showToast("Processado!", "success");
      }
    );
  };

  const handleDeletarItem = (id: string | undefined, colecao: string, nomeItem: string) => {
    if (!id) return;
    showConfirmModal("Remover Item", `Tem certeza que deseja remover ${nomeItem}?`, async () => {
      try { await deleteDoc(doc(db, colecao, id)); closeConfirmModal(); showToast("Removido", "success"); } 
      catch { showToast("Erro", "error"); }
    });
  };

  const handleToggleAlistamento = async () => {
    if (!checkPermission('config')) return showToast("Acesso Negado.", "error");
    try { await setDoc(doc(db, 'config', 'geral'), { alistamentoAberto: !alistamentoAberto }, { merge: true }); showToast(`Atualizado`, "success"); } 
    catch { showToast("Erro", "error"); }
  };

  const handleToggleSolicitacao = async () => {
    if (!checkPermission('config')) return showToast("Acesso Negado.", "error");
    try { await setDoc(doc(db, 'config', 'geral'), { solicitacaoAberta: !solicitacaoAberta }, { merge: true }); showToast(`Atualizado`, "success"); } 
    catch { showToast("Erro", "error"); }
  };

  const handleSalvarConfigsGerais = async (e: React.FormEvent) => {
    e.preventDefault(); if (currentUserInfo?.role !== 'admin') return showToast("Acesso Negado.", "error");
    try { 
      await setDoc(doc(db, 'config', 'geral'), { 
        liveYouTubeUrl: ytUrl, 
        liveTwitchUrl: twUrl, 
        liveTikTokUrl: tkUrl, 
        discordWebhook,
        discordColor,
        discordAuthorName,
        discordAuthorIcon,
        discordImageUrl,
        discordFooter
      }, { merge: true }); 
      showToast("Configurações Salvas!", "success"); 
    } catch { 
      showToast("Erro ao salvar.", "error"); 
    }
  };

  const handlePermissao = async (userId: string, campo: string, valor: boolean) => {
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins.", "error");
    try { await updateDoc(doc(db, 'usuarios', userId), { [`permissoes.${campo}`]: valor }); showToast("Atualizado!", "success"); } 
    catch { showToast("Falha", "error"); }
  };

  const handleMudarCargo = async (userId: string, newRole: string) => {
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins.", "error");
    try { await updateDoc(doc(db, 'usuarios', userId), { role: newRole }); showToast("Cargo atualizado!", "success"); } 
    catch { showToast("Falha", "error"); }
  };

  const handleMudarStatusSolicitacao = async (id: string, novoStatus: string) => {
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins.", "error");
    try {
      await updateDoc(doc(db, 'solicitacoes', id), { status: novoStatus });
      showToast(`Status atualizado com sucesso!`, "success");
    } catch {
      showToast("Erro ao atualizar status.", "error");
    }
  };

  const handleEditarPiloto = (p: Piloto) => { setEditingId(p.id || null); setNovoPosicao(p.posicao); setNovoNome(p.nome); setNovaCidade(p.cidade || ''); setNovaUf(p.uf || ''); setNovoOculto(p.oculto || false); setNovoJustificativa(p.justificativa || ''); loadPlatformToState(p.plataforma); setShowForm(true); };
  const handleEditarAgenda = (a: Demonstracao) => { setEditingId(a.id || null); setAgCidade(a.cidade); setAgStatus(a.status); loadPlatformToState(a.plataforma); if (a.dataHora && a.dataHora.includes(' às ')) { const [dPart, hPart] = a.dataHora.split(' às '); setAgDataHoraIso(`${dPart.split('/').reverse().join('-')}T${hPart}`); } else setAgDataHoraIso(''); setShowForm(true); };
  const handleEditarNoticia = (n: Noticia) => { setEditingId(n.id || null); setNotData(n.data); setNotTitulo(n.titulo); setNotResumo(n.resumo); setNotImagem(n.imagem); setShowForm(true); };
  const handleEditarNotam = (n: Notam) => { setEditingId(n.id || null); setNotamTitulo(n.titulo); setNotamMensagem(n.mensagem); setNotamData(n.data); setShowForm(true); };
  const handleEditarStat = (s: Estatistica) => { setEditingId(s.id || null); setStatIcone(s.icone); setStatValor(s.valor); setStatRotulo(s.rotulo); setStatOrdem(s.ordem); setShowForm(true); };

  const handleSalvarPiloto = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('pilotos')) return showToast("Acesso Negado", "error");
    try { 
      const data = { posicao: novoPosicao, nome: novoNome, cidade: novaCidade, uf: novaUf, oculto: novoOculto, justificativa: novoOculto ? novoJustificativa : '', plataforma: parsePlatformToString(plat2020Ativo, plat2024Ativo) }; 
      if (editingId) await updateDoc(doc(db, 'pilotos', editingId), data); else await addDoc(collection(db, 'pilotos'), data); fecharFormulario(); showToast("Salvo"); 
    } catch { showToast("Falha", "error"); }
  };
  
  const handleSalvarAgenda = async (e: React.FormEvent) => {
    e.preventDefault(); if (!checkPermission('agenda')) return showToast("Acesso Negado", "error"); if (!agDataHoraIso) return showToast("Selecione data", "error"); setLoadingGeocode(true);
    try { 
      let lat = 0; let lng = 0; try { const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(agCidade)}`); const geodata = await res.json(); if (geodata && geodata.length > 0) { lat = parseFloat(geodata[0].lat); lng = parseFloat(geodata[0].lon); } } catch {} 
      const [dPart, tPart] = agDataHoraIso.split('T'); 
      const data = { cidade: agCidade, dataHora: `${dPart.split('-').reverse().join('/')} às ${tPart}`, lat, lng, status: agStatus, cssClass: agStatus === 'Confirmado' ? 'status-ok' : 'status-warn', coordsText: lat !== 0 ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'S/ Coordenadas', tipo: 'M-PREC', plataforma: parsePlatformToString(plat2020Ativo, plat2024Ativo) }; 
      if (editingId) await updateDoc(doc(db, 'agenda', editingId), data); else await addDoc(collection(db, 'agenda'), data); fecharFormulario(); showToast("Salvo!"); 
    } catch { showToast("Falha", "error"); } finally { setLoadingGeocode(false); }
  };
  
  const handleSalvarNoticia = async (e: React.FormEvent) => { e.preventDefault(); if (!checkPermission('noticias')) return showToast("Acesso Negado", "error"); try { const data = { data: notData, titulo: notTitulo, resumo: notResumo, imagem: notImagem }; if (editingId) await updateDoc(doc(db, 'noticias', editingId), data); else await addDoc(collection(db, 'noticias'), data); fecharFormulario(); showToast("Publicada"); } catch { showToast("Falha", "error"); } };
  
  const handleSalvarNotam = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (currentUserInfo?.role !== 'admin') return showToast("Apenas admins", "error"); 
    
    try { 
      const data = { data: notamData, titulo: notamTitulo.toUpperCase(), mensagem: notamMensagem, autor: currentUserInfo?.nome || 'Admin' }; 
      
      if (editingId) {
        await updateDoc(doc(db, 'notams', editingId), data); 
      } else {
        await addDoc(collection(db, 'notams'), data); 
        
        // INTEGRAÇÃO DISCORD
        if (discordWebhook) {
          const hexColorToDec = (hex: string) => parseInt(hex.replace(/^#/, ''), 16) || 15548997;
          await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: "@everyone **NOVO NOTAM PUBLICADO!**",
              embeds: [{
                author: {
                  name: discordAuthorName || "ESQUADRILHA DA FUMAÇA VIRTUAL",
                  icon_url: discordAuthorIcon || "https://i.imgur.com/L79pB2z.png" 
                },
                title: data.titulo,
                description: data.mensagem,
                color: hexColorToDec(discordColor), 
                image: {
                  url: discordImageUrl || "https://i.imgur.com/mJ2Zl3E.jpeg" 
                },
                fields: [
                  { name: "Emitido em", value: data.data, inline: false }
                ],
                footer: { text: discordFooter || "EDAV MSFS - Sistema de Operações" }
              }]
            })
          }).catch(err => console.error("Erro Discord Webhook:", err));
        }
      }
      
      fecharFormulario(); 
      showToast("Publicado"); 
    } catch { 
      showToast("Falha", "error"); 
    } 
  };
  
  const handleSalvarStat = async (e: React.FormEvent) => { e.preventDefault(); if (currentUserInfo?.role !== 'admin') return showToast("Acesso Negado", "error"); if (!editingId && estatisticas.length >= 5) return showToast("Limite é 5", "error"); try { const data = { icone: statIcone, valor: statValor, rotulo: statRotulo, ordem: statOrdem }; if (editingId) await updateDoc(doc(db, 'estatisticas', editingId), data); else await addDoc(collection(db, 'estatisticas'), data); fecharFormulario(); showToast("Salvo"); } catch { showToast("Falha", "error"); } };

  const handleMenuClick = (tabName: string) => { setActiveTab(tabName); fecharFormulario(); setMobileSidebarOpen(false); };

  const horaAtual = agora.getHours(); let saudacao = 'Boa noite'; if (horaAtual >= 5 && horaAtual < 12) saudacao = 'Bom dia'; else if (horaAtual >= 12 && horaAtual < 18) saudacao = 'Boa tarde';
  const dataFormatada = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const DashboardCard = ({ title, value, icon, color }: { title: string, value: string|number, icon: React.ReactNode, color: string }) => (
    <div className="fs-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'default' }}>
      <div style={{ background: `rgba(${color === 'var(--fs-blue)' ? '59,130,246' : color === '#10b981' ? '16,185,129' : color === '#ef4444' ? '239,68,68' : '234,179,8'}, 0.1)`, padding: '1rem', borderRadius: '12px', color: color }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--fs-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Regular", sans-serif' }}>{title}</h4>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: '"Comum", sans-serif' }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fs-bg)', color: 'var(--text-main)', position: 'relative' }}>
      <style>{`
        :root {
          --fs-bg: #0b0f19;
          --fs-bg-alt: #131722;
          --fs-border: rgba(255,255,255,0.08);
          --fs-blue: #3b82f6;
          --fs-blue-hover: #2563eb;
          --text-main: #f3f4f6;
          --fs-muted: #9ca3af;
        }
        
        @font-face {
          font-family: 'Regular';
          src: url('/fonts/regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap; 
        }

        @font-face {
          font-family: 'Comum';
          src: url('/fonts/comum.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        
        @font-face {
          font-family: 'StratumNo2';
          src: url('/fonts/stratumno2_regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        * {
          font-family: 'Regular', system-ui, -apple-system, sans-serif !important;
        }
        h1, h2, h3, h4, h5, h6 { font-family: 'Comum', sans-serif !important; font-weight: bold; }

        body, html { margin: 0; padding: 0; background-color: var(--fs-bg); overflow-x: hidden; }
        input, textarea, button { font-family: 'Regular', system-ui, -apple-system, sans-serif !important; }
        input::placeholder, textarea::placeholder { color: #64748b !important; font-weight: 400; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        .fs-grid-bg {
          position: fixed; inset: 0; z-index: 0;
          background-size: 50px 50px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        .hero-glow-blue {
          position: fixed; top: 20%; left: 30%; transform: translate(-50%, -50%);
          width: 800px; height: 800px; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
          filter: blur(80px); z-index: 0; pointer-events: none;
        }

        .fs-card {
          background: rgba(255,255,255,0.02); border: 1px solid var(--fs-border); border-radius: 24px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          transition: all 0.4s ease;
        }
        .fs-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        
        .time-scroll::-webkit-scrollbar { width: 4px; }
        .time-scroll::-webkit-scrollbar-track { background: transparent; }
        .time-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .workspace-sidebar {
          width: 280px; background-color: rgba(11, 15, 25, 0.7); border-right: 1px solid var(--fs-border);
          backdrop-filter: blur(24px);
          display: flex; flex-direction: column; padding: 1.5rem 1rem;
          transition: transform 0.3s ease; z-index: 40;
        }
        
        .nav-item {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
          color: var(--fs-muted); border: none; background: transparent; border-radius: 12px;
          cursor: pointer; text-align: left; font-weight: 500; font-size: 0.9rem;
          transition: all 0.2s ease; border-left: 3px solid transparent; width: 100%; box-sizing: border-box;
          font-family: "Comum", sans-serif !important;
        }
        .nav-item:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
        .nav-item.active { color: var(--text-main); background: rgba(59, 130, 246, 0.15); border-left: 3px solid var(--fs-blue); font-weight: 600; }

        .list-row {
          display: grid; align-items: center; padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.02); border: 1px solid var(--fs-border);
          border-radius: 16px; margin-bottom: 0.75rem; transition: all 0.3s ease;
        }
        .list-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }

        .mobile-header { display: none; }
        .desktop-header { display: flex; }

        .form-input {
          padding: 0.85rem 1.2rem; background: rgba(0,0,0,0.3);
          border: 1px solid var(--fs-border); color: var(--text-main);
          border-radius: 12px; outline: none; font-size: 0.95rem;
          font-family: '"Regular", sans-serif'; width: 100%; box-sizing: border-box; text-transform: inherit;
          transition: all 0.2s ease;
        }
        .form-input:focus { border-color: var(--fs-blue); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15); background: rgba(255,255,255,0.03); }
        
        .form-label { font-size: 0.75rem; font-weight: 600; color: var(--fs-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: '"Regular", sans-serif'; display: block; }

        .toggle-switch {
          width: 40px; height: 22px; background: rgba(255,255,255,0.1); border-radius: 11px;
          position: relative; cursor: pointer; transition: background 0.3s;
        }
        .toggle-switch.active { background: var(--fs-blue); }
        .toggle-switch::after {
          content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          background: #fff; border-radius: 50%; transition: transform 0.3s;
        }
        .toggle-switch.active::after { transform: translateX(18px); }

        @keyframes modalEnter { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-modern { animation: modalEnter 0.2s ease-out forwards; }

        .platform-pill-btn {
          background: rgba(255,255,255,0.03); color: var(--fs-muted); border: 1px solid var(--fs-border); padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; font-family: '"Regular", sans-serif'; backdrop-filter: blur(10px);
        }
        .platform-pill-btn:hover { color: var(--text-main); border-color: rgba(255,255,255,0.2); }
        .platform-pill-btn.active { background: rgba(59, 130, 246, 0.15); border-color: var(--fs-blue); color: #fff; font-weight: 600; }
        
        .fs-badge { font-size: 0.65rem; border: 1px solid var(--fs-border); padding: 2px 6px; border-radius: 6px; font-weight: 600; font-family: 'Regular', sans-serif; }

        @media (max-width: 900px) {
          .workspace-sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
          .workspace-sidebar.open { transform: translateX(0); }
          .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: rgba(11, 15, 25, 0.9); border-bottom: 1px solid var(--fs-border); position: sticky; top: 0; z-index: 30; backdrop-filter: blur(12px); }
          .desktop-header { display: none !important; }
          .main-content { padding: 1rem !important; }
          .list-row { grid-template-columns: 1fr !important; gap: 0.75rem; padding: 1rem; }
        }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <div className="fs-grid-bg"></div>
      <div className="hero-glow-blue"></div>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, background: 'rgba(11, 15, 25, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid var(--fs-border)', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`, padding: '1.2rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideIn 0.3s ease-out' }}>
          {toast.type === 'success' ? <CheckCircle2 color="#10b981" size={20}/> : <AlertTriangle color="#ef4444" size={20}/>}
          <span style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{toast.msg}</span>
        </div>
      )}

      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-modern fs-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}><AlertTriangle size={28} /></div>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem', fontFamily: '"Comum", sans-serif' }}>{modal.title}</h3>
            </div>
            <p style={{ color: 'var(--fs-muted)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{modal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={closeConfirmModal} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--fs-border)', color: 'var(--text-main)', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', flexGrow: 1, fontFamily: '"Comum", sans-serif' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>Cancelar</button>
              <button onClick={() => { modal.onConfirm(); closeConfirmModal(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, flexGrow: 1, transition: 'all 0.2s', fontFamily: '"Comum", sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 35, backdropFilter: 'blur(5px)' }} />}

      <aside className={`workspace-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logoImage} alt="EDAV" style={{ height: '32px' }} />
            <h2 style={{ fontFamily: '"StratumNo2", sans-serif', fontSize: '1.1rem', color: '#f8fafc', margin: 0, letterSpacing: '0.05em' }}>WORKSPACE</h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setMobileSidebarOpen(false)} style={{ display: window.innerWidth <= 900 ? 'block' : 'none', background: 'transparent', border: 'none', color: 'var(--fs-muted)' }}><X size={24} /></button>
        </div>
        
        <div className="fs-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Clock size={16} color="var(--fs-blue)" /><span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600, fontFamily: '"Comum", sans-serif' }}>{horaFormatada}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Calendar size={16} color="#10b981" /><span style={{ fontSize: '0.8rem', color: 'var(--fs-muted)', textTransform: 'capitalize', fontWeight: 500 }}>{dataFormatada}</span></div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleMenuClick('dashboard')}><LayoutDashboard size={18} /> Visão Geral</button>
          
          <div style={{ height: '1px', background: 'var(--fs-border)', margin: '0.5rem' }} />
          
          <button className={`nav-item ${activeTab === 'notam' ? 'active' : ''}`} onClick={() => handleMenuClick('notam')} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BellRing size={16} /> NOTAM</div>
            {notams.length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '12px' }}>{notams.length}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'meteorologia' ? 'active' : ''}`} onClick={() => handleMenuClick('meteorologia')}><Cloud size={16} /> Meteorologia</button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
            <button className="nav-item" onClick={() => setGerenciaisAberto(!gerenciaisAberto)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Briefcase size={16} color="#0ea5e9" /> Gestão Tática</div>
              <ChevronDown size={14} style={{ transform: gerenciaisAberto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(14, 165, 233, 0.3)', marginLeft: '1rem', marginTop: '0.25rem', overflow: 'hidden', maxHeight: gerenciaisAberto ? '500px' : '0px', opacity: gerenciaisAberto ? 1 : 0, transition: 'all 0.3s' }}>
              {currentUserInfo?.role === 'admin' && <button className={`nav-item ${activeTab === 'estatisticas' ? 'active' : ''}`} onClick={() => handleMenuClick('estatisticas')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}><Activity size={14} /> Estatísticas</button>}
              <button className={`nav-item ${activeTab === 'pilotos' ? 'active' : ''}`} onClick={() => handleMenuClick('pilotos')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}><Users size={14} /> Pilotos</button>
              <button className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => handleMenuClick('agenda')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}><CalendarCheck2 size={14} /> Agenda</button>
              <button className={`nav-item ${activeTab === 'noticias' ? 'active' : ''}`} onClick={() => handleMenuClick('noticias')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}><Newspaper size={14} /> Notícias</button>
              
              {currentUserInfo?.role === 'admin' && (
                <button className={`nav-item ${activeTab === 'solicitacoes' ? 'active' : ''}`} onClick={() => handleMenuClick('solicitacoes')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Inbox size={14} /> Solicitações</div>
                  {solicitacoes.filter(s => s.status === 'Pendente').length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '12px' }}>{solicitacoes.filter(s => s.status === 'Pendente').length}</span>}
                </button>
              )}
            </div>
          </div>

          {currentUserInfo?.role === 'admin' && <button className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => handleMenuClick('config')} style={{ marginTop: '0.5rem' }}><Settings size={16} /> Config. e Acessos</button>}

          <div style={{ flexGrow: 1 }} />
          <div style={{ height: '1px', background: 'var(--fs-border)', margin: '0.5rem' }} />
          <button className="nav-item" onClick={() => window.open('/', '_blank')}><Globe size={16} /> Ir para o Site</button>
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><img src={logoImage} alt="EDAV" style={{ height: '24px' }} /><h1 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc', fontWeight: 600, fontFamily: '"StratumNo2", sans-serif', letterSpacing: '0.05em' }}>WORKSPACE</h1></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{currentUserInfo?.foto ? <img src={currentUserInfo.foto} alt="Perfil" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} /> : <UserCircle size={28} color="#f8fafc" />}</div>
              {userMenuOpen && <div className="modal-modern" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '150px', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}><button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><LogOut size={14}/> Sair</button></div>}
            </div>
            <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: 0, cursor: 'pointer' }}><Menu size={24} /></button>
          </div>
        </div>

        <header className="desktop-header" style={{ padding: '1rem 2rem', background: 'transparent', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', padding: '0.4rem 1rem 0.4rem 0.4rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.8)'}>
                {currentUserInfo?.foto ? <img src={currentUserInfo.foto} alt="Perfil" style={{ width: 32, height: 32, borderRadius: '50%' }} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}><UserCircle size={18}/></div>}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f8fafc' }}>{saudacao}, {currentUserInfo ? currentUserInfo.nome.split(' ')[0] : 'Comandante'}</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 400 }}>{currentUserInfo?.role === 'admin' ? 'Administrador' : 'Piloto'}</span>
                </div>
                <ChevronDown size={14} color="#94a3b8" style={{ marginLeft: '0.5rem' }} />
              </div>
              {userMenuOpen && (
                <div className="modal-modern" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', width: '160px', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><LogOut size={14}/> Terminar Sessão</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="main-content" style={{ padding: '1rem 2rem 2rem', position: 'relative', zIndex: 10, flexGrow: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 500, color: '#f8fafc', letterSpacing: '0.05em', fontFamily: '"StratumNo2", sans-serif', textTransform: 'uppercase' }}>
              {activeTab === 'dashboard' ? 'Painel Geral' : activeTab === 'notam' ? 'Avisos (NOTAM)' : activeTab === 'meteorologia' ? 'Meteorologia' : activeTab === 'estatisticas' ? 'Estatísticas' : activeTab === 'pilotos' ? 'Pilotos' : activeTab === 'agenda' ? 'Agenda' : activeTab === 'noticias' ? 'Notícias' : activeTab === 'solicitacoes' ? 'Solicitações de Eventos' : 'Config. e Acessos'}
            </h2>
            
            {['pilotos', 'agenda', 'noticias', 'estatisticas'].includes(activeTab) && checkPermission(activeTab) && (
              <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}><Plus size={16} /> Adicionar Novo</button>
            )}

            {activeTab === 'notam' && currentUserInfo?.role === 'admin' && (
              <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}><AlertOctagon size={16} /> Publicar NOTAM</button>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <DashboardCard title="Pilotos Ativos" value={pilotos.filter(p => !p.oculto).length} icon={<Users size={24} />} color="#0ea5e9" />
                <DashboardCard title="Próximos Eventos" value={agendas.length} icon={<CalendarCheck2 size={24} />} color="#10b981" />
                <DashboardCard title="Avisos NOTAM" value={notams.length} icon={<BellRing size={24} />} color="#ef4444" />
                <DashboardCard title="Solicitações" value={solicitacoes.filter(s => s.status === 'Pendente').length} icon={<Inbox size={24} />} color="#f59e0b" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><Calendar size={18} color="#0ea5e9"/> Próximos Voos</h3>
                  {agendas.slice(0, 3).length === 0 ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhum evento próximo.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {agendas.slice(0, 3).map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          <div><div style={{ color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' }}>{a.dataHora}</div><div style={{ color: '#f8fafc', fontWeight: 500 }}>{a.cidade}</div></div>
                          <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: a.status === 'Confirmado' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: a.status === 'Confirmado' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><AlertOctagon size={18} color="#ef4444"/> Último NOTAM</h3>
                  {notams.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sistema sem alertas operacionais.</p> : (
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '4px solid #ef4444', padding: '1.25rem', borderRadius: '8px' }}>
                      <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem' }}>{notams[0].data}</div>
                      <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.75rem' }}>{notams[0].titulo}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{notams[0].mensagem.length > 80 ? notams[0].mensagem.substring(0, 80) + '...' : notams[0].mensagem}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solicitacoes' && currentUserInfo?.role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr', padding: '0 1.5rem 0.75rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>Data do Pedido</span><span>Cidade / Evento</span><span>Transmissão</span><span style={{ textAlign: 'right' }}>Ações / Status</span>
              </div>
              
              {solicitacoes.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Inbox size={48} color="#64748b" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Não existem solicitações pendentes no sistema.</p>
                </div>
              ) : (
                solicitacoes.map((s) => (
                  <div key={s.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? '1fr 1.5fr 1fr 1.5fr' : '1fr', opacity: s.status !== 'Pendente' ? 0.6 : 1, padding: '1.25rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(s.dataSolicitacao).toLocaleDateString('pt-BR')} <br/> <span style={{ fontSize: '0.7rem' }}>{new Date(s.dataSolicitacao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{s.cidade}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: s.transmissao === 'sim' ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' }}>{s.transmissao === 'sim' ? 'Com Transmissão' : 'Sem Transmissão'}</span>
                      {s.transmissao === 'sim' && <a href={s.canal} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}><Link2 size={12}/> Acessar Canal</a>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}>
                      {s.status === 'Pendente' ? (
                        <>
                          <button onClick={() => handleMudarStatusSolicitacao(s.id!, 'Aprovado')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, fontSize: '0.75rem' }}><Check size={14}/> Aprovar</button>
                          <button onClick={() => handleMudarStatusSolicitacao(s.id!, 'Recusado')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, fontSize: '0.75rem' }}><X size={14}/> Recusar</button>
                        </>
                      ) : (
                        <span style={{ color: s.status === 'Aprovado' ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '0.3rem 0.8rem', background: s.status === 'Aprovado' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>{s.status}</span>
                      )}
                      <button onClick={() => handleDeletarItem(s.id, 'solicitacoes', `Solicitação de ${s.cidade}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'meteorologia' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', maxWidth: '800px' }}>
              <div style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Código ICAO do aeródromo para consulta METAR via VATSIM.</p>
                <form onSubmit={handleBuscarMetar} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" maxLength={4} value={metarIcao} onChange={e => setMetarIcao(e.target.value)} placeholder="ICAO (ex: SBBR)" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', fontSize: '1rem', textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#0ea5e9'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}/>
                  </div>
                  <button type="submit" disabled={metarLoading} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', border: 'none', padding: '0 1.5rem', borderRadius: '8px', fontWeight: 500, cursor: metarLoading ? 'wait' : 'pointer', fontSize: '0.9rem' }}>Buscar</button>
                </form>
                {metarData && metarData.error && <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>{metarData.error}</div>}
                {metarData && !metarData.error && (
                  <div className="modal-modern" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 500 }}>METAR {metarData.icaoId}</h4>
                      <p style={{ margin: 0, color: '#f8fafc', fontFamily: 'monospace', fontSize: '1.05rem', lineHeight: 1.5 }}>{metarData.rawOb}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}><Thermometer size={20} color="#ef4444" style={{ marginBottom: '0.5rem' }} /><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>TEMP</div><div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{metarData.temp !== null ? `${metarData.temp} °C` : 'N/A'}</div></div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}><Wind size={20} color="#0ea5e9" style={{ marginBottom: '0.5rem' }} /><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>VENTO</div><div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{metarData.wdir !== null ? (metarData.wdir === 'VRB' ? 'VRB' : `${metarData.wdir}°`) : 'N/A'} / {metarData.wspd !== null ? `${metarData.wspd} KT` : 'N/A'}</div></div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}><Gauge size={20} color="#10b981" style={{ marginBottom: '0.5rem' }} /><div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>QNH</div><div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{metarData.altim !== null ? metarData.altim : 'N/A'}</div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'estatisticas' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content modal-modern" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Estatística</h3><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button></div>
                    <form onSubmit={handleSalvarStat} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="form-label">Classe Ícone</label><input required type="text" value={statIcone} onChange={e => setStatIcone(e.target.value)} className="form-input" placeholder="fa-solid fa-plane" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}><div><label className="form-label">Valor</label><input required type="text" value={statValor} onChange={e => setStatValor(e.target.value)} className="form-input" /></div><div><label className="form-label">Ordem</label><input required type="number" min="1" max="5" value={statOrdem} onChange={e => setStatOrdem(parseInt(e.target.value))} className="form-input" /></div></div>
                        <div><label className="form-label">Descrição</label><input required type="text" value={statRotulo} onChange={e => setStatRotulo(e.target.value)} className="form-input" /></div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancelar</button><button type="submit" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Salvar</button></div>
                    </form>
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {estatisticas.map(stat => (
                  <div key={stat.id} className="list-row" style={{ gridTemplateColumns: '1fr', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', color: '#0ea5e9', fontSize: '0.65rem', background: 'rgba(14,165,233,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>ORD {stat.ordem}</div>
                    <div style={{ color: '#0ea5e9', marginBottom: '0.5rem' }}><i className={stat.icone} style={{ fontSize: '1.8rem' }}></i></div>
                    <span style={{ fontSize: '2rem', color: '#f8fafc', fontWeight: 500 }}>{stat.valor}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>{stat.rotulo}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', justifyContent: 'center' }}>
                      <button onClick={() => handleEditarStat(stat)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDeletarItem(stat.id!, 'estatisticas', stat.rotulo)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pilotos' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content modal-modern" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Piloto</h3><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button></div>
                    <form onSubmit={handleSalvarPiloto} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}><div><label className="form-label">Pos</label><input type="number" min="1" max="7" value={novoPosicao} onChange={e => setNovoPosicao(e.target.value)} className="form-input" /></div><div><label className="form-label">Nome Completo</label><input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="form-input" /></div></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}><div><label className="form-label">Cidade</label><input required type="text" value={novaCidade} onChange={e => setNovaCidade(e.target.value)} className="form-input" /></div><div><label className="form-label">UF</label><CustomSelect searchable value={novaUf} onChange={(val) => setNovaUf(val)} options={ufsBrasileiros} placeholder="Sel" /></div></div>
                        
                        <div>
                          <label className="form-label">Exibir Piloto no Simulador:</label>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <SimToggle label="MSFS 2020" active={plat2020Ativo} onChange={() => {
                              if (plat2020Ativo && !plat2024Ativo) return; 
                              setPlat2020Ativo(!plat2020Ativo);
                            }} />
                            <SimToggle label="MSFS 2024" active={plat2024Ativo} onChange={() => {
                              if (plat2024Ativo && !plat2020Ativo) return; 
                              setPlat2024Ativo(!plat2024Ativo);
                            }} />
                          </div>
                        </div>

                        <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}><div className={`toggle-switch ${novoOculto ? 'active' : ''}`} onClick={() => setNovoOculto(!novoOculto)} style={{ background: novoOculto ? '#ef4444' : '#334155' }} /> Ocultar (Reserva)</label>
                          {novoOculto && <div style={{ marginTop: '1rem' }}><label className="form-label" style={{ color: '#ef4444' }}>Motivo</label><input required type="text" value={novoJustificativa} onChange={e => setNovoJustificativa(e.target.value)} className="form-input" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }} /></div>}
                        </div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancelar</button><button type="submit" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Salvar</button></div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', width: 'max-content' }}>
                <button className={`platform-pill-btn ${pilotoFilter === 'Ambos' ? 'active' : ''}`} onClick={() => setPilotoFilter('Ambos')}>Todos</button>
                <button className={`platform-pill-btn ${pilotoFilter === '2020' ? 'active' : ''}`} onClick={() => setPilotoFilter('2020')}><img src={mfLogo} alt="MSFS" style={{ height: '14px', filter: pilotoFilter === '2020' ? 'none' : 'grayscale(100%) opacity(60%)' }}/> MSFS 2020</button>
                <button className={`platform-pill-btn ${pilotoFilter === '2024' ? 'active' : ''}`} onClick={() => setPilotoFilter('2024')}><img src={mfLogo} alt="MSFS" style={{ height: '14px', filter: pilotoFilter === '2024' ? 'none' : 'grayscale(100%) opacity(60%)' }}/> MSFS 2024</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: checkPermission('pilotos') ? '1fr 2.5fr 2fr 1fr' : '1fr 2.5fr 2fr', padding: '0 1rem 0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}><span>Pos</span><span>Piloto</span><span>Local</span>{checkPermission('pilotos') && <span style={{ textAlign: 'right' }}>Ações</span>}</div>
                {pilotos.filter(p => matchesPlatformFilter(p.plataforma, pilotoFilter)).map((p) => (
                  <div key={p.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? (checkPermission('pilotos') ? '1fr 2.5fr 2fr 1fr' : '1fr 2.5fr 2fr') : '1fr', opacity: p.oculto ? 0.5 : 1, padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#0ea5e9', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '1rem', fontWeight: 600 }}>{p.posicao}</span><span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>{getPosicaoNome(p.posicao)}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontWeight: 500, color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>{p.nome} {p.plataforma === '2024' || p.plataforma === 'Ambos' ? <span style={{fontSize:'0.6rem', color:'#f59e0b', border:'1px solid #f59e0b', padding:'1px 4px', borderRadius:'4px'}}>2024</span> : null} {p.oculto && <span style={{ fontSize: '0.65rem', background: '#ef4444', padding: '2px 4px', borderRadius: '4px' }}>RES</span>}</div>{p.oculto && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{p.justificativa}</span>}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}><MapIcon size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}}/>{p.cidade} {p.uf ? `- ${p.uf}` : ''}</div>
                    {checkPermission('pilotos') && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}><button onClick={() => handleEditarPiloto(p)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}><Edit2 size={14} /></button><button onClick={() => handleDeletarItem(p.id, 'pilotos', p.nome)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></div>
                    )}
                  </div>
                ))}
                {pilotos.filter(p => matchesPlatformFilter(p.plataforma, pilotoFilter)).length === 0 && (
                  <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Nenhum piloto configurado para o filtro selecionado.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content modal-modern" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '500px', margin: 'auto' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Evento</h3><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button></div>
                    <form onSubmit={handleSalvarAgenda} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div><label className="form-label">Cidade / Local</label><input required type="text" value={agCidade} onChange={e => setAgCidade(e.target.value)} className="form-input" /></div>
                        <div><label className="form-label">Data e Hora (Z)</label><CustomDateTimePicker value={agDataHoraIso} onChange={(val) => setAgDataHoraIso(val)} /></div>
                        
                        <div>
                          <label className="form-label">Exibir Evento no Simulador:</label>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <SimToggle label="MSFS 2020" active={plat2020Ativo} onChange={() => {
                              if (plat2020Ativo && !plat2024Ativo) return; 
                              setPlat2020Ativo(!plat2020Ativo);
                            }} />
                            <SimToggle label="MSFS 2024" active={plat2024Ativo} onChange={() => {
                              if (plat2024Ativo && !plat2020Ativo) return; 
                              setPlat2024Ativo(!plat2024Ativo);
                            }} />
                          </div>
                        </div>

                        <div><label className="form-label">Status do Voo</label><CustomSelect value={agStatus} onChange={(val) => setAgStatus(val)} options={[{ value: 'Planejamento', label: 'Planejamento' }, { value: 'Confirmado', label: 'Confirmado' }, { value: 'Cancelado', label: 'Cancelado' }]} /></div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}><button type="button" onClick={fecharFormulario} disabled={loadingGeocode} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancelar</button><button type="submit" disabled={loadingGeocode} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Salvar</button></div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', width: 'max-content' }}>
                <button className={`platform-pill-btn ${agendaFilter === 'Ambos' ? 'active' : ''}`} onClick={() => setAgendaFilter('Ambos')}>Todos</button>
                <button className={`platform-pill-btn ${agendaFilter === '2020' ? 'active' : ''}`} onClick={() => setAgendaFilter('2020')}><img src={mfLogo} alt="MSFS" style={{ height: '14px', filter: agendaFilter === '2020' ? 'none' : 'grayscale(100%) opacity(60%)' }}/> MSFS 2020</button>
                <button className={`platform-pill-btn ${agendaFilter === '2024' ? 'active' : ''}`} onClick={() => setAgendaFilter('2024')}><img src={mfLogo} alt="MSFS" style={{ height: '14px', filter: agendaFilter === '2024' ? 'none' : 'grayscale(100%) opacity(60%)' }}/> MSFS 2024</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: checkPermission('agenda') ? '2.5fr 1fr 1fr' : '2.5fr 1fr', padding: '0 1rem 0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}><span>Local/Data</span><span>Status</span>{checkPermission('agenda') && <span style={{ textAlign: 'right' }}>Ações</span>}</div>
                {agendas.filter(a => matchesPlatformFilter(a.plataforma, agendaFilter)).map((a) => (
                  <div key={a.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? (checkPermission('agenda') ? '2.5fr 1fr 1fr' : '2.5fr 1fr') : '1fr', padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 500 }}>{a.dataHora}</span><span style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, display:'flex', alignItems:'center', gap:'6px' }}>{a.cidade} {a.plataforma === '2024' || a.plataforma === 'Ambos' ? <span style={{fontSize:'0.6rem', color:'#f59e0b', border:'1px solid #f59e0b', padding:'1px 4px', borderRadius:'4px'}}>2024</span> : null}</span></div>
                    <div><span style={{ background: a.status === 'Confirmado' ? 'rgba(16,185,129,0.1)' : a.status === 'Cancelado' ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)', color: a.status === 'Confirmado' ? '#10b981' : a.status === 'Cancelado' ? '#ef4444' : '#0ea5e9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{a.status}</span></div>
                    {checkPermission('agenda') && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: window.innerWidth > 900 ? 'flex-end' : 'flex-start' }}><button onClick={() => handleEditarAgenda(a)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}><Edit2 size={14} /></button><button onClick={() => handleDeletarItem(a.id, 'agenda', a.cidade)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></div>
                    )}
                  </div>
                ))}
                {agendas.filter(a => matchesPlatformFilter(a.plataforma, agendaFilter)).length === 0 && (
                  <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Nenhuma demonstração para o filtro selecionado.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'noticias' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content modal-modern" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>Notícia</h3><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button></div>
                    <form onSubmit={handleSalvarNoticia} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}><div><label className="form-label">Data</label><input type="text" value={notData} onChange={e => setNotData(e.target.value)} className="form-input" /></div><div><label className="form-label">Título</label><input type="text" value={notTitulo} onChange={e => setNotTitulo(e.target.value)} className="form-input" /></div></div>
                        <div>
                          <label className="form-label">Imagem</label>
                          <label style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            {uploadProgress !== null ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> : <ImagePlus size={16}/>} {uploadProgress !== null ? `Enviando... ${Math.round(uploadProgress)}%` : 'Selecionar Imagem'}
                            <input type="file" accept="image/*" onChange={handleImageUploadNoticias} style={{ display: 'none' }} disabled={uploadProgress !== null} />
                          </label>
                        </div>
                        {notImagem && uploadProgress === null && <div style={{ height: '100px', borderRadius: '8px', backgroundImage: `url(${notImagem})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }} />}
                        <div><label className="form-label">Resumo</label><textarea required value={notResumo} onChange={e => setNotResumo(e.target.value)} rows={3} className="form-input" style={{ resize: 'none' }} /></div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancelar</button><button type="submit" disabled={uploadProgress !== null} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Salvar</button></div>
                    </form>
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {noticias.map((n) => (
                  <div key={n.id} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {n.imagem ? <div style={{ height: '120px', backgroundImage: `url(${n.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }} /> : <div style={{ height: '120px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImagePlus size={24} color="#1e293b"/></div>}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500 }}>{n.titulo}</h4><span style={{ color: '#0ea5e9', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{n.data}</span>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4, margin: '0 0 1rem 0', flexGrow: 1 }}>{n.resumo}</p>
                      {checkPermission('noticias') && <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}><button onClick={() => handleEditarNoticia(n)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', flexGrow: 1 }}><Edit2 size={14} /></button><button onClick={() => handleDeletarItem(n.id, 'noticias', n.titulo)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', flexGrow: 1 }}><Trash2 size={14} /></button></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notam' && (
            <div>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div className="form-modal-content modal-modern" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><AlertOctagon size={18} color="#ef4444" /> {editingId ? 'Editar NOTAM' : 'Publicar NOTAM'}</h3><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button></div>
                    <form onSubmit={handleSalvarNotam} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="form-label">Data</label><CustomDatePicker value={notamData} onChange={(val) => setNotamData(val)} /></div>
                        <div><label className="form-label">Assunto</label><input required type="text" value={notamTitulo} onChange={e => setNotamTitulo(e.target.value)} className="form-input" style={{ textTransform: 'uppercase', color: '#ef4444' }} /></div>
                        <div><label className="form-label">Mensagem</label><textarea required value={notamMensagem} onChange={e => setNotamMensagem(e.target.value)} rows={4} className="form-input" style={{ resize: 'none' }} /></div>
                      </div>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}><button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancelar</button><button type="submit" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none' }}>Emitir</button></div>
                    </form>
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '800px' }}>
                {notams.map((n) => (
                  <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div><span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 600 }}>NOTAM</span><h4 style={{ margin: '0.25rem 0 0 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500 }}>{n.titulo}</h4></div>
                      <span style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#94a3b8', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>{n.data}</span>
                    </div>
                    <p style={{ color: '#cbd5e1', margin: '0 0 1.5rem 0', lineHeight: 1.5, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{n.mensagem}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Emitido por: {n.autor}</span>
                      {currentUserInfo?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}><button onClick={() => handleEditarNotam(n)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}><Edit2 size={14} /></button><button onClick={() => handleDeletarItem(n.id, 'notams', 'NOTAM')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && currentUserInfo?.role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px' }}>
              
              <div className="fs-card" style={{ padding: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: '"Comum", sans-serif' }}>Mídias Sociais & Integrações</h4>
                <form onSubmit={handleSalvarConfigsGerais} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
                  
                  <div><label className="form-label">YouTube Link (Stream)</label><input type="text" value={ytUrl} onChange={e => setYtUrl(e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Twitch Link (Stream)</label><input type="text" value={twUrl} onChange={e => setTwUrl(e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">TikTok Link (Stream)</label><input type="text" value={tkUrl} onChange={e => setTkUrl(e.target.value)} className="form-input" /></div>
                  
                  <div style={{ borderTop: '1px solid var(--fs-border)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h5 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>Configuração do Webhook Discord</h5>
                    <p style={{ margin: 0, color: 'var(--fs-muted)', fontSize: '0.85rem' }}>Preencha os dados abaixo para formatar o alerta automático enviado para o Discord quando publica um novo NOTAM.</p>
                    
                    <div>
                      <label className="form-label" style={{ color: '#0ea5e9' }}>URL do Webhook</label>
                      <input type="url" value={discordWebhook} onChange={e => setDiscordWebhook(e.target.value)} className="form-input" placeholder="https://discord.com/api/webhooks/..." />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="form-label">Cor do Embed (HEX)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="color" value={discordColor} onChange={e => setDiscordColor(e.target.value)} style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} />
                          <input type="text" value={discordColor} onChange={e => setDiscordColor(e.target.value)} className="form-input" placeholder="#ED333B" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Nome do Autor (Topo)</label>
                        <input type="text" value={discordAuthorName} onChange={e => setDiscordAuthorName(e.target.value)} className="form-input" placeholder="Ex: ESQUADRILHA VIRTUAL" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">URL da Imagem do Autor (Logotipo Redondo)</label>
                      <input type="url" value={discordAuthorIcon} onChange={e => setDiscordAuthorIcon(e.target.value)} className="form-input" placeholder="https://imgur.com/...png" />
                    </div>

                    <div>
                      <label className="form-label">URL da Imagem de Capa (Banner Grande)</label>
                      <input type="url" value={discordImageUrl} onChange={e => setDiscordImageUrl(e.target.value)} className="form-input" placeholder="https://imgur.com/...jpg" />
                    </div>

                    <div>
                      <label className="form-label">Texto do Rodapé (Footer)</label>
                      <input type="text" value={discordFooter} onChange={e => setDiscordFooter(e.target.value)} className="form-input" placeholder="EDAV MSFS - Sistema de Operações" />
                    </div>
                  </div>

                  <button type="submit" style={{ background: 'var(--fs-blue)', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '1rem' }}>Salvar Configurações</button>
                </form>
              </div>

              <div className="fs-card" style={{ padding: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: '"Comum", sans-serif' }}>Recursos Públicos</h4>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Gira a exibição de botões e formulários no site público.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.85rem' }}>Alistamento: <span style={{ color: alistamentoAberto ? '#10b981' : '#94a3b8' }}>{alistamentoAberto ? 'Aberto' : 'Fechado'}</span></span>
                    <div className={`toggle-switch ${alistamentoAberto ? 'active' : ''}`} onClick={handleToggleAlistamento} style={{ transform: 'scale(0.9)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.85rem' }}>Solicitar Demo: <span style={{ color: solicitacaoAberta ? '#10b981' : '#94a3b8' }}>{solicitacaoAberta ? 'Visível' : 'Oculto'}</span></span>
                    <div className={`toggle-switch ${solicitacaoAberta ? 'active' : ''}`} onClick={handleToggleSolicitacao} style={{ transform: 'scale(0.9)' }} />
                  </div>
                </div>
              </div>

              <div className="fs-card" style={{ padding: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: '"Comum", sans-serif' }}>Gestão de Acessos</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <div style={{ display: window.innerWidth > 900 ? 'grid' : 'none', gridTemplateColumns: '2fr 1fr 1.5fr', padding: '0 1.5rem 0.75rem', color: 'var(--fs-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}><span>Utilizador Registado</span><span>Cargo Atribuído</span><span style={{ textAlign: 'center' }}>Permissões Modulares</span></div>
                  {usuarios.map((u) => (
                    <div key={u.id} className="list-row" style={{ gridTemplateColumns: window.innerWidth > 900 ? '2fr 1fr 1.5fr' : '1fr', gap: '1.5rem', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{u.foto ? <img src={u.foto} alt="Perfil" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--fs-border)' }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--fs-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fs-blue)' }}><UserCircle size={24}/></div>}<div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600, fontFamily: '"Comum", sans-serif', marginBottom: '2px' }}>{u.nome}</span><span style={{ color: 'var(--fs-muted)', fontSize: '0.85rem' }}>{u.email}</span></div></div>
                      <div><CustomSelect inline value={u.role} onChange={(val) => handleMudarCargo(u.id as string, val)} options={[{ value: 'admin', label: 'Admin (Total)' }, { value: 'piloto', label: 'Piloto' }, { value: 'pendente', label: 'Pendente' }]} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--fs-border)' }}>
                        <PermissionToggle label="Gestão de Agenda" active={!!u.permissoes?.agenda} onChange={() => handlePermissao(u.id!, 'agenda', !u.permissoes?.agenda)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}