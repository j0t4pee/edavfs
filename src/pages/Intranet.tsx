import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, CalendarX2, Settings, LogOut, Plus, Trash2, Edit2, Lock 
} from 'lucide-react';

import headerImage from '../images/header.jpg';
import logoImage from '../images/logo.png';

// Dados Mock da Intranet
const initialPilotos = [
  { posicao: '1', nome: 'Cmte. Silva', callsign: 'GHOST' },
  { posicao: '2', nome: 'Cmte. Costa', callsign: 'VIPER' },
  { posicao: '3', nome: 'Cmte. Rocha', callsign: 'EAGLE' },
];

const initialMods = [
  { titulo: 'Aeronave A-29', link: '#aeronave' },
  { titulo: 'Academia da Força Aérea', link: 'https://flightsim.to' }
];

const Intranet: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pilotos');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "EDAV | Intranet Oficial";
    // Aqui você adicionará no futuro a verificação de login do Firebase
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR LATERAL */}
      <aside style={{ width: '260px', backgroundColor: '#0b1121', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '2rem 0' }}>
        <div style={{ padding: '0 2rem', marginBottom: '3rem', textAlign: 'center' }}>
          <img src={logoImage} alt="EDAV Logo" style={{ height: '60px', marginBottom: '1rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }} />
          <h2 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '1rem', color: '#f59e0b', letterSpacing: '0.1em' }}>INTRANET EDAV</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem', flexGrow: 1 }}>
          <button onClick={() => setActiveTab('pilotos')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: activeTab === 'pilotos' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeTab === 'pilotos' ? '#f59e0b' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'pilotos' ? 600 : 400, transition: 'all 0.3s ease' }}>
            <Users size={20} /> Gerenciar Pilotos
          </button>
          <button onClick={() => setActiveTab('agenda')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: activeTab === 'agenda' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeTab === 'agenda' ? '#f59e0b' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'agenda' ? 600 : 400, transition: 'all 0.3s ease' }}>
            <CalendarX2 size={20} /> Agenda & Mapa
          </button>
          <button onClick={() => setActiveTab('mods')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: activeTab === 'mods' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeTab === 'mods' ? '#f59e0b' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'mods' ? 600 : 400, transition: 'all 0.3s ease' }}>
            <Settings size={20} /> Mods e Arquivos
          </button>
        </nav>

        <div style={{ padding: '0 1rem' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', transition: 'all 0.3s ease' }}>
            <LogOut size={20} /> Voltar ao Site
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.03, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* TELA DE PILOTOS */}
          {activeTab === 'pilotos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '2rem', margin: 0 }}>Gestão de Pilotos</h1>
                <button style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Plus size={18} /> Adicionar Piloto
                </button>
              </div>
              
              <div style={{ background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '1rem', backdropFilter: 'blur(10px)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Posição</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Nome</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Callsign</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialPilotos.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>Ala {p.posicao}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{p.nome}</td>
                        <td style={{ padding: '1rem', color: '#f59e0b' }}>{p.callsign}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginRight: '1rem' }}><Edit2 size={16} /></button>
                          <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TELA DE AGENDA */}
          {activeTab === 'agenda' && (
            <div>
              <h1 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '2rem', marginBottom: '2rem' }}>Configurar Agenda e Mapa</h1>
              <div style={{ background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2rem', maxWidth: '600px', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#f59e0b' }}>Nova Demonstração</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Nome da Cidade / Evento" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="Data (ex: 20 Out)" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', flex: 1, outline: 'none' }} />
                    <input type="text" placeholder="Horário (ex: 15:00z)" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', flex: 1, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="Latitude (ex: -15.865)" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', flex: 1, outline: 'none' }} />
                    <input type="text" placeholder="Longitude (ex: -47.929)" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', flex: 1, outline: 'none' }} />
                  </div>
                  <button type="button" style={{ background: '#f59e0b', color: '#000', padding: '1rem', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '1rem' }}>SALVAR NO MAPA</button>
                </form>
              </div>
            </div>
          )}

          {/* TELA DE MODS */}
          {activeTab === 'mods' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: '"Quantico", sans-serif', fontSize: '2rem', margin: 0 }}>Utilitários e Mods</h1>
                <button style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Plus size={18} /> Novo Link
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {initialMods.map((mod, i) => (
                  <div key={i} style={{ padding: '1.5rem', background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem' }}>{mod.titulo}</h3>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>{mod.link}</p>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Intranet;