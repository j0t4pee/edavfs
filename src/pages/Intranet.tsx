"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CalendarX2, Settings, LogOut, Plus, Trash2, Edit2, X, AlertTriangle, Newspaper, Link2, ChevronDown, CheckCircle2, ImagePlus, Calendar, Clock
} from 'lucide-react';

import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

import logoImage from '../images/logo.png';

interface Piloto { id?: string; posicao: string; nome: string; callsign: string; cidade?: string; }
interface Demonstracao { id?: string; cidade: string; coordsText: string; lat: number; lng: number; status: string; cssClass: string; dataHora: string; }
interface Noticia { id?: string; data: string; titulo: string; resumo: string; imagem: string; }
interface Mod { id?: string; titulo: string; desc: string; isMarketplace: boolean; buttonText: string; link: string; }

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

const CustomSelect = ({ value, options, onChange, placeholder }: { value: string, options: {value: string, label: string}[], onChange: (val: string) => void, placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', fontFamily: appleFontStack }}>
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
      <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: selectedOption ? '#f8fafc' : '#64748b', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41 }}>
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          {options.map(opt => (
            <div key={opt.value} className="custom-select-option" onClick={() => { onChange(opt.value); setIsOpen(false); }} style={{ padding: '0.75rem 1rem', color: value === opt.value ? '#f8fafc' : '#94a3b8', background: value === opt.value ? '#1e293b' : 'transparent', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Intranet() {
  const [activeTab, setActiveTab] = useState('pilotos');
  const navigate = useNavigate();

  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [agendas, setAgendas] = useState<Demonstracao[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [mods, setMods] = useState<Mod[]>([]);
  const [alistamentoAberto, setAlistamentoAberto] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false); 

  const [novoPosicao, setNovoPosicao] = useState('1');
  const [novoNome, setNovoNome] = useState('');
  const [novoCallsign, setNovoCallsign] = useState('');
  const [novaCidade, setNovaCidade] = useState('');

  const [agCidade, setAgCidade] = useState('');
  const [agData, setAgData] = useState('');
  const [agHora, setAgHora] = useState('');
  const [agStatus, setAgStatus] = useState('Planejamento');

  const [notData, setNotData] = useState('');
  const [notTitulo, setNotTitulo] = useState('');
  const [notResumo, setNotResumo] = useState('');
  const [notImagem, setNotImagem] = useState('');

  const [modTitulo, setModTitulo] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modLink, setModLink] = useState('');
  const [modMarketplace, setModMarketplace] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => setModal({ isOpen: true, title, message, onConfirm });
  const closeConfirmModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => {
    document.title = "Workspace | EDAV";
    const unsubs = [
      onSnapshot(collection(db, 'pilotos'), snap => {
        const arr: Piloto[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Piloto));
        arr.sort((a, b) => parseInt(a.posicao) - parseInt(b.posicao)); setPilotos(arr);
      }),
      onSnapshot(collection(db, 'agenda'), snap => {
        const arr: Demonstracao[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Demonstracao));
        // Ordenação opcional por data pode ser feita aqui
        setAgendas(arr);
      }),
      onSnapshot(collection(db, 'noticias'), snap => {
        const arr: Noticia[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Noticia)); setNoticias(arr);
      }),
      onSnapshot(collection(db, 'mods'), snap => {
        const arr: Mod[] = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() } as Mod)); setMods(arr);
      }),
      onSnapshot(doc(db, 'config', 'geral'), docSnap => { if (docSnap.exists()) setAlistamentoAberto(docSnap.data().alistamentoAberto || false); })
    ];
    return () => unsubs.forEach(u => u()); 
  }, []);

  const fecharFormulario = () => {
    setShowForm(false); setEditingId(null);
    setNovoPosicao('1'); setNovoNome(''); setNovoCallsign(''); setNovaCidade('');
    setAgCidade(''); setAgData(''); setAgHora(''); setAgStatus('Planejamento');
    setNotData(''); setNotTitulo(''); setNotResumo(''); setNotImagem('');
    setModTitulo(''); setModDesc(''); setModLink(''); setModMarketplace(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNotImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeletarItem = (id: string | undefined, colecao: string, nomeItem: string) => {
    if (!id) return;
    showConfirmModal("Remover Item", `Tem certeza que deseja remover ${nomeItem}? Esta ação não pode ser desfeita.`, async () => {
      try { await deleteDoc(doc(db, colecao, id)); closeConfirmModal(); showToast("Item removido com sucesso", "success"); } 
      catch { showToast("Erro ao remover item", "error"); }
    });
  };

  const handleToggleAlistamento = async () => {
    try { await setDoc(doc(db, 'config', 'geral'), { alistamentoAberto: !alistamentoAberto }, { merge: true }); showToast(`Alistamento ${!alistamentoAberto ? 'Aberto' : 'Fechado'}`, "success"); } 
    catch { showToast("Erro ao alterar configuração", "error"); }
  };

  const handleDateMask = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
    if (val.length > 5) val = val.slice(0,5) + '/' + val.slice(5, 9);
    setter(val);
  };

  const handleTimeMask = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0,2) + ':' + val.slice(2, 4);
    setter(val);
  };

  const handleEditarPiloto = (p: Piloto) => {
    setEditingId(p.id || null); setNovoPosicao(p.posicao); setNovoNome(p.nome);
    setNovoCallsign(p.callsign); setNovaCidade(p.cidade || ''); setShowForm(true);
  };

  const handleEditarAgenda = (a: Demonstracao) => {
    setEditingId(a.id || null);
    setAgCidade(a.cidade);
    if (a.dataHora && a.dataHora.includes(' às ')) {
      const [dPart, hPart] = a.dataHora.split(' às ');
      setAgData(dPart);
      setAgHora(hPart.replace('z', '').replace('Z', '').trim());
    } else {
      setAgData(''); setAgHora('');
    }
    setAgStatus(a.status);
    setShowForm(true);
  };

  const handleEditarNoticia = (n: Noticia) => {
    setEditingId(n.id || null);
    setNotData(n.data); setNotTitulo(n.titulo);
    setNotResumo(n.resumo); setNotImagem(n.imagem); setShowForm(true);
  };

  const handleEditarMod = (m: Mod) => {
    setEditingId(m.id || null);
    setModTitulo(m.titulo); setModDesc(m.desc);
    setModLink(m.link); setModMarketplace(m.isMarketplace); setShowForm(true);
  };

  const handleSalvarPiloto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { posicao: novoPosicao, nome: novoNome, callsign: novoCallsign, cidade: novaCidade };
      if (editingId) await updateDoc(doc(db, 'pilotos', editingId), data);
      else await addDoc(collection(db, 'pilotos'), data);
      fecharFormulario(); showToast("Dados salvos com sucesso");
    } catch { showToast("Falha ao salvar dados", "error"); }
  };

  const handleSalvarAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingGeocode(true);
    try {
      let lat = 0; let lng = 0;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(agCidade)}`);
        const geodata = await res.json();
        if (geodata && geodata.length > 0) {
          lat = parseFloat(geodata[0].lat);
          lng = parseFloat(geodata[0].lon);
        } else {
          showToast("Cidade não encontrada no mapa", "error");
        }
      } catch (err) {
        console.error("Erro na geocodificação", err);
      }

      let css = agStatus === 'Confirmado' ? 'status-ok' : 'status-warn';
      // Nova formatação de data: sem o "z"
      const dataFormFormatada = `${agData} às ${agHora}`;
      const data = { 
        cidade: agCidade, 
        dataHora: dataFormFormatada, 
        lat, lng, 
        status: agStatus, 
        cssClass: css, 
        coordsText: lat !== 0 ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'S/ Coordenadas', 
        tipo: 'M-PREC' 
      };
      
      if (editingId) await updateDoc(doc(db, 'agenda', editingId), data);
      else await addDoc(collection(db, 'agenda'), data);
      
      fecharFormulario(); showToast("Agenda e coordenadas atualizadas!");
    } catch { 
      showToast("Falha ao salvar agenda", "error"); 
    } finally {
      setLoadingGeocode(false);
    }
  };

  const handleSalvarNoticia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { data: notData, titulo: notTitulo, resumo: notResumo, imagem: notImagem };
      if (editingId) await updateDoc(doc(db, 'noticias', editingId), data);
      else await addDoc(collection(db, 'noticias'), data);
      fecharFormulario(); showToast("Notícia publicada com sucesso");
    } catch { showToast("Falha ao salvar notícia", "error"); }
  };

  const handleSalvarMod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { titulo: modTitulo, desc: modDesc, link: modLink, isMarketplace: modMarketplace, buttonText: modMarketplace ? 'Loja MSFS' : 'Download' };
      if (editingId) await updateDoc(doc(db, 'mods', editingId), data);
      else await addDoc(collection(db, 'mods'), data);
      fecharFormulario(); showToast("Utilitário salvo com sucesso");
    } catch { showToast("Falha ao salvar utilitário", "error"); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: appleFontStack }}>
      
      <style>{`
        input::placeholder, textarea::placeholder { color: #64748b !important; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        .custom-select-option:hover { background: #1e293b !important; color: #f8fafc !important; }
        
        .custom-date-time {
          padding: 0.75rem 1rem;
          background: transparent;
          color: #f8fafc;
          border: none;
          outline: none;
          font-size: 0.95rem;
          width: 100%;
          position: relative;
          z-index: 2;
        }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, background: '#0f172a', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`, padding: '1rem 1.5rem', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideIn 0.3s ease-out' }}>
          {toast.type === 'success' ? <CheckCircle2 color="#10b981" size={20}/> : <AlertTriangle color="#ef4444" size={20}/>}
          <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{toast.msg}</span>
        </div>
      )}

      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <AlertTriangle size={26} color="#ef4444" />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{modal.title}</h3>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{modal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={closeConfirmModal} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>Cancelar</button>
              <button onClick={() => { modal.onConfirm(); closeConfirmModal(); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <aside style={{ width: '260px', backgroundColor: '#020617', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
        <div style={{ padding: '0 0.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logoImage} alt="EDAV Logo" style={{ height: '36px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '1.1rem', color: '#f8fafc', margin: 0, letterSpacing: '0.05em' }}>EDAV</h2>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Workspace</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <button onClick={() => {setActiveTab('pilotos'); fecharFormulario();}} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: activeTab === 'pilotos' ? '#0f172a' : 'transparent', color: activeTab === 'pilotos' ? '#f8fafc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s ease', fontSize: '0.9rem' }}><Users size={18} color={activeTab === 'pilotos' ? '#f59e0b' : '#64748b'} /> Pilotos</button>
          <button onClick={() => {setActiveTab('agenda'); fecharFormulario();}} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: activeTab === 'agenda' ? '#0f172a' : 'transparent', color: activeTab === 'agenda' ? '#f8fafc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s ease', fontSize: '0.9rem' }}><CalendarX2 size={18} color={activeTab === 'agenda' ? '#f59e0b' : '#64748b'} /> Agenda</button>
          <button onClick={() => {setActiveTab('noticias'); fecharFormulario();}} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: activeTab === 'noticias' ? '#0f172a' : 'transparent', color: activeTab === 'noticias' ? '#f8fafc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s ease', fontSize: '0.9rem' }}><Newspaper size={18} color={activeTab === 'noticias' ? '#f59e0b' : '#64748b'} /> Notícias</button>
          <button onClick={() => {setActiveTab('mods'); fecharFormulario();}} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: activeTab === 'mods' ? '#0f172a' : 'transparent', color: activeTab === 'mods' ? '#f8fafc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s ease', fontSize: '0.9rem' }}><Link2 size={18} color={activeTab === 'mods' ? '#f59e0b' : '#64748b'} /> Utilitários</button>
          <div style={{ height: '1px', background: '#1e293b', margin: '1rem 0.5rem' }} />
          <button onClick={() => {setActiveTab('config'); fecharFormulario();}} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: activeTab === 'config' ? '#0f172a' : 'transparent', color: activeTab === 'config' ? '#f8fafc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s ease', fontSize: '0.9rem' }}><Settings size={18} color={activeTab === 'config' ? '#f59e0b' : '#64748b'} /> Ajustes do Site</button>
        </nav>

        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease', fontSize: '0.9rem', fontWeight: 500 }} onMouseEnter={e => {e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = '#0f172a'}} onMouseLeave={e => {e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'}}>
          <LogOut size={16} /> Voltar ao Site
        </button>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#020617' }}>
        
        <header style={{ padding: '2rem 3rem', borderBottom: '1px solid #1e293b', background: '#020617', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30 }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#f8fafc', fontWeight: 600 }}>
            {activeTab === 'pilotos' && 'Gestão do Esquadrão'}
            {activeTab === 'agenda' && 'Agenda de Demonstrações'}
            {activeTab === 'noticias' && 'Publicações e Notícias'}
            {activeTab === 'mods' && 'Links e Utilitários'}
            {activeTab === 'config' && 'Ajustes Globais'}
          </h1>
          
          {activeTab !== 'config' && (
            <button onClick={() => setShowForm(true)} style={{ background: '#f8fafc', color: '#0f172a', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Plus size={16} /> Adicionar Novo
            </button>
          )}
        </header>

        <div style={{ padding: '3rem', position: 'relative', zIndex: 10, flexGrow: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          {activeTab === 'pilotos' && (
            <>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? 'Editar Piloto' : 'Cadastrar Piloto'}</h3>
                      <button onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarPiloto} style={{ padding: '2rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Nome Completo</label>
                          <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: João Silva" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Callsign</label>
                          <input required type="text" value={novoCallsign} onChange={e => setNovoCallsign(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: Eagle" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Cidade / UF</label>
                          <input required type="text" value={novaCidade} onChange={e => setNovaCidade(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: São Paulo - SP" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Posição na Esquadrilha</label>
                          <CustomSelect 
                            value={novoPosicao} onChange={(val) => setNovoPosicao(val)}
                            options={[
                              { value: '1', label: '#1 - Líder' }, { value: '2', label: '#2 - Ala Direita' }, { value: '3', label: '#3 - Ala Esquerda' },
                              { value: '4', label: '#4 - Ferrolho' }, { value: '5', label: '#5 - Ala Esq. Externa' }, { value: '6', label: '#6 - Ala Dir. Externa' }, { value: '7', label: '#7 - Isolado' }
                            ]}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Salvar Piloto</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1e293b' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posição</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Piloto</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade / UF</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotos.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}><Users size={48} color="#334155" style={{ marginBottom: '1rem' }} /><p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum piloto cadastrado.</p></td></tr>
                    ) : (
                      pilotos.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>{p.posicao}</span>
                              <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>{getPosicaoNome(p.posicao)}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontWeight: 500, color: '#f8fafc', marginBottom: '0.2rem' }}>{p.nome}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>"{p.callsign}"</div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{p.cidade || '-'}</td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <button onClick={() => handleEditarPiloto(p)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem', borderRadius: '6px' }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeletarItem(p.id, 'pilotos', 'este piloto')} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'agenda' && (
            <>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? 'Editar Evento' : 'Nova Demonstração'}</h3>
                      <button onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarAgenda} style={{ padding: '2rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Cidade do Evento</label>
                          <input required type="text" value={agCidade} onChange={e => setAgCidade(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: Brasília - DF" />
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>As coordenadas do mapa serão buscadas automaticamente via satélite.</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Data</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #334155', borderRadius: '6px' }}>
                            <input required type="text" value={agData} onChange={e => handleDateMask(e, setAgData)} placeholder="DD/MM/AAAA" className="custom-date-time" style={{ fontFamily: appleFontStack }} />
                            <Calendar size={18} style={{ position: 'absolute', right: '1rem', color: '#64748b', pointerEvents: 'none' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Horário Zulu (Z)</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #334155', borderRadius: '6px' }}>
                            <input required type="text" value={agHora} onChange={e => handleTimeMask(e, setAgHora)} placeholder="HH:MM" className="custom-date-time" style={{ fontFamily: appleFontStack }} />
                            <Clock size={18} style={{ position: 'absolute', right: '1rem', color: '#64748b', pointerEvents: 'none' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Status da Missão</label>
                          <CustomSelect 
                            value={agStatus} onChange={(val) => setAgStatus(val)}
                            options={[{ value: 'Planejamento', label: 'Planejamento (M-PREC)' }, { value: 'Confirmado', label: 'Confirmado' }, { value: 'Cancelado', label: 'Cancelado' }]}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} disabled={loadingGeocode} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" disabled={loadingGeocode} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: loadingGeocode ? 'wait' : 'pointer', opacity: loadingGeocode ? 0.7 : 1, fontFamily: appleFontStack }}>
                          {loadingGeocode ? 'Buscando Localização...' : 'Salvar Evento'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1e293b' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data/Hora</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendas.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}><CalendarX2 size={48} color="#334155" style={{ marginBottom: '1rem' }} /><p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhum evento na agenda.</p></td></tr>
                    ) : (
                      agendas.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: '#f8fafc' }}>{a.cidade}</td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'Arial, sans-serif' }}>{a.dataHora}</td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{ 
                              background: a.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.1)' : a.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                              color: a.status === 'Confirmado' ? '#10b981' : a.status === 'Cancelado' ? '#ef4444' : '#f59e0b', 
                              padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' 
                            }}>{a.status === 'Planejamento' ? 'M-PREC' : a.status.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <button onClick={() => handleEditarAgenda(a)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem', borderRadius: '6px' }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeletarItem(a.id, 'agenda', 'este evento')} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'noticias' && (
            <>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? 'Editar Publicação' : 'Nova Notícia'}</h3>
                      <button onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarNoticia} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Título da Notícia</label>
                          <input required type="text" value={notTitulo} onChange={e => setNotTitulo(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: Apresentação Confirmada!" />
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Data da Publicação</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #334155', borderRadius: '6px' }}>
                              <input required type="text" value={notData} onChange={e => handleDateMask(e, setNotData)} placeholder="DD/MM/AAAA" className="custom-date-time" style={{ fontFamily: appleFontStack }} />
                              <Calendar size={18} style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: '#64748b' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Imagem de Capa (Envio direto)</label>
                            <label style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                              <ImagePlus size={18} color="#f59e0b"/> {notImagem ? 'Trocar Imagem' : 'Selecionar Imagem...'}
                              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                            </label>
                          </div>
                        </div>
                        
                        {notImagem && (
                          <div style={{ width: '100%', height: '140px', borderRadius: '6px', backgroundImage: `url(${notImagem})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #334155' }} />
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Resumo (Texto curto)</label>
                          <textarea required value={notResumo} onChange={e => setNotResumo(e.target.value)} rows={3} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack, resize: 'none' }} placeholder="Digite o resumo da notícia..." />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Publicar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1e293b' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capa</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Título</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticias.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}><Newspaper size={48} color="#334155" style={{ marginBottom: '1rem' }} /><p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Nenhuma notícia publicada.</p></td></tr>
                    ) : (
                      noticias.map((n) => (
                        <tr key={n.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            {n.imagem ? (
                              <div style={{ width: '60px', height: '40px', borderRadius: '4px', backgroundImage: `url(${n.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #334155' }} />
                            ) : (
                              <div style={{ width: '60px', height: '40px', borderRadius: '4px', background: '#020617', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImagePlus size={16} color="#64748b"/></div>
                            )}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{n.data}</td>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: '#f8fafc' }}>{n.titulo}</td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <button onClick={() => handleEditarNoticia(n)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem', borderRadius: '6px' }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeletarItem(n.id, 'noticias', 'esta notícia')} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'mods' && (
            <>
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9990, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{editingId ? 'Editar Link' : 'Cadastrar Utilitário'}</h3>
                      <button onClick={fecharFormulario} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSalvarMod} style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Título do Arquivo/Link</label>
                          <input required type="text" value={modTitulo} onChange={e => setModTitulo(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: Textura A-29" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Link URL</label>
                          <input required type="url" value={modLink} onChange={e => setModLink(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>Descrição</label>
                          <input required type="text" value={modDesc} onChange={e => setModDesc(e.target.value)} style={{ padding: '0.75rem 1rem', background: '#020617', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', outline: 'none', fontSize: '0.95rem', fontFamily: appleFontStack }} placeholder="Ex: Texturas oficiais do esquadrão..." />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input type="checkbox" checked={modMarketplace} onChange={e => setModMarketplace(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#f8fafc' }} />
                          É um item pago do Marketplace oficial?
                        </label>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={fecharFormulario} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', fontFamily: appleFontStack }}>Cancelar</button>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#0f172a', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: appleFontStack }}>Salvar Link</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1e293b' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Título</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mods.length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: '4rem', textAlign: 'center' }}><Link2 size={48} color="#334155" style={{ marginBottom: '1rem' }} /><p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Nenhum utilitário salvo.</p></td></tr>
                    ) : (
                      mods.map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: '#f8fafc' }}>{m.titulo}</td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8' }}>
                            <span style={{ background: '#020617', border: '1px solid #334155', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>{m.isMarketplace ? 'Loja do Jogo' : 'Link Externo'}</span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <button onClick={() => handleEditarMod(m)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem', borderRadius: '6px' }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeletarItem(m.id, 'mods', 'este link')} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'config' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '3rem', maxWidth: '600px' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>Configurações do Site Principal</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '1.05rem' }}>Processo de Alistamento</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, maxWidth: '300px' }}>Ativa ou desativa a exibição do botão e do formulário de recrutamento para novos pilotos na página inicial.</p>
                </div>
                <button 
                  onClick={handleToggleAlistamento} 
                  style={{ 
                    background: alistamentoAberto ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: alistamentoAberto ? '#10b981' : '#ef4444', 
                    border: alistamentoAberto ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', 
                    padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease', minWidth: '130px' 
                  }}
                >
                  {alistamentoAberto ? 'ABERTO' : 'FECHADO'}
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}