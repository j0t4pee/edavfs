import React, { useState, useEffect } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plane, 
  MapPin, 
  ChevronRight, 
  Video,
  Download,
  Map as MapIcon,
  ShoppingCart,
  CheckCircle2,
  CalendarX2,
  Newspaper,
  ChevronUp
} from 'lucide-react';

import heroImage from './images/3.png';
import logoImage from './images/logo.png';
import parceiroImage from './images/parceiro.png';

const DiscordIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente Técnico Auxiliar para a Aeronave (Mais compacto)
const TechItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem', marginBottom: '0.4rem', alignItems: 'center', gap: '1rem' }}>
    <span style={{ color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: '100px' }}>{label}</span>
    <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1.4, textAlign: 'right' }}>{value}</span>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="section-header" style={{ marginBottom: '3.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2 className="section-title" style={{ fontFamily: '"Quantico", sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: '#f8fafc', fontSize: '2rem', textTransform: 'uppercase', textAlign: 'center' }}>{title}</h2>
    <div className="section-line" style={{ height: '30px', width: '2px', background: 'linear-gradient(to bottom, #f59e0b, transparent)', opacity: 0.6, marginTop: '1rem' }} />
  </div>
);

const initialPilotos = [
  { posicao: '1', nome: 'Cmte. Silva', callsign: 'GHOST' },
  { posicao: '2', nome: 'Cmte. Costa', callsign: 'VIPER' },
  { posicao: '3', nome: 'Cmte. Rocha', callsign: 'EAGLE' },
  { posicao: '4', nome: 'Cmte. Martins', callsign: 'SHADOW' },
  { posicao: '5', nome: 'Cmte. Lima', callsign: 'HUNTER' },
  { posicao: '6', nome: 'Cmte. Pereira', callsign: 'STRIKE' },
  { posicao: '7', nome: 'Cmte. Almeida', callsign: 'MAVERICK' },
];

const initialDemonstracoes: any[] = []; 

const initialMods = [
  {
    titulo: 'Aeronave A-29',
    desc: 'Módulo base do A-29 Super Tucano. Adquira no Marketplace oficial do Microsoft Flight Simulator.',
    icon: <Plane size={24} strokeWidth={1.5} />,
    isMarketplace: true,
    buttonText: 'Loja MSFS',
    buttonIcon: <ShoppingCart size={14} />,
    link: '#'
  },
  {
    titulo: 'Academia da Força Aérea',
    desc: 'Cenário detalhado da Academia da Força Aérea (SBYS), nossa sede oficial para treinamentos e decolagens.',
    icon: <MapIcon size={24} strokeWidth={1.5} />,
    isMarketplace: false,
    buttonText: 'Download',
    buttonIcon: <Download size={14} />,
    link: '#'
  },
  {
    titulo: 'Discord Oficial',
    desc: 'Central de comunicação de voz. O acesso é obrigatório para participar dos briefings operacionais.',
    icon: <DiscordIcon size={24} />,
    isMarketplace: false,
    buttonText: 'Acessar',
    buttonIcon: <DiscordIcon size={14} />,
    link: '#'
  }
];

const initialNoticias = [
  {
    data: '15 Set, 2026',
    titulo: 'EDAV confirma presença no Domingo Aéreo Virtual',
    resumo: 'O esquadrão anunciou oficialmente sua participação no maior evento virtual de aviação da América Latina. A demonstração contará com a formação completa de 7 aeronaves.',
    imagem: heroImage
  },
  {
    data: '02 Set, 2026',
    titulo: 'Abertura de seletiva para novos alas',
    resumo: 'A central de alistamento foi atualizada com novos horários. Estamos buscando pilotos virtuais dedicados para posições de ala externa e ferrolho.',
    imagem: heroImage
  },
  {
    data: '28 Ago, 2026',
    titulo: 'Atualização das Texturas Oficiais (v2.1)',
    resumo: 'Disponibilizamos na aba de utilitários o novo pacote de texturas em resolução 4K com melhorias nos reflexos dinâmicos do simulador.',
    imagem: heroImage
  }
];

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [dbPilotos, setDbPilotos] = useState<typeof initialPilotos>([]);
  const [dbDemonstracoes, setDbDemonstracoes] = useState<typeof initialDemonstracoes>([]);
  const [dbMods, setDbMods] = useState<typeof initialMods>([]);
  const [dbNoticias, setDbNoticias] = useState<typeof initialNoticias>([]);
  
  const [simulador, setSimulador] = useState('MSFS 2020'); // Valor default para o Segmented Control
  const [modalAlistamento, setModalAlistamento] = useState(false);
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [discord, setDiscord] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [idade, setIdade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.title = "EDAV | Esquadrão de Demonstração Aérea Virtual";
    
    const setMetaTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(name.includes('og:') ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('description', 'EDAV - Esquadrão de Demonstração Aérea Virtual. Simulação de alta fidelidade do A-29 Super Tucano no Microsoft Flight Simulator.');
    
    const fetchFirebaseData = async () => {
      setDbPilotos(initialPilotos);
      setDbDemonstracoes(initialDemonstracoes);
      setDbMods(initialMods);
      setDbNoticias(initialNoticias);
    };
    fetchFirebaseData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowTopBtn(window.scrollY > 400); 
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIdadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    setIdade(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setWhatsapp(val);
  };

  const submitAlistamento = (e: React.FormEvent) => {
    e.preventDefault();
    setModalAlistamento(true);
    setNome(''); setNickname(''); setDiscord(''); setExperiencia(''); setIdade(''); setWhatsapp('');
  };

  const mapCenter: [number, number] = [-15.8658, -47.9292];

  return (
    <div>
      <style>{`
        body, html {
          background-color: #030712 !important; 
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }

        .glass-panel, .card-piloto, .btn-primary, .btn-outline, .btn-market, 
        .form-control, .map-box, .modal-content, .nav-btn-highlight, .demo-status, .news-card {
          border-radius: 6px !important;
        }

        .section-container {
          padding: 6rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .card-piloto::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0;
          mix-blend-mode: overlay;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .card-piloto:hover::after {
          opacity: 0.2; 
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrolled ? 'rgba(11, 17, 33, 0.95)' : 'rgba(11, 17, 33, 0.2)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.3s ease', padding: scrolled ? '0.75rem 0' : '1.25rem 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <a href="#" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', gap: '2px' }}>
            <span style={{ fontFamily: '"Quantico", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', letterSpacing: '0.05em', lineHeight: 1.2 }}>
              ESQUADRÃO DE DEMONSTRAÇÃO AÉREA VIRTUAL
            </span>
            <span style={{ fontFamily: '"Quantico", sans-serif', fontWeight: 400, fontSize: '0.7rem', color: '#f59e0b', letterSpacing: '0.15em', lineHeight: 1.2 }}>
              MICROSOFT FLIGHT SIMULATOR
            </span>
          </a>
          
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#pilotos" style={{ fontWeight: 300, color: '#94a3b8', fontSize: '0.85rem' }}>Pilotos</a>
            <a href="#agenda" style={{ fontWeight: 300, color: '#94a3b8', fontSize: '0.85rem' }}>Agenda</a>
            <a href="#aeronave" style={{ fontWeight: 300, color: '#94a3b8', fontSize: '0.85rem' }}>Aeronave</a>
            <a href="#noticias" style={{ fontWeight: 300, color: '#94a3b8', fontSize: '0.85rem' }}>Notícias</a>
            <a href="#sobre" style={{ fontWeight: 300, color: '#94a3b8', fontSize: '0.85rem' }}>Sobre</a>
            <a href="#alistamento" className="nav-btn-highlight" style={{ backgroundColor: '#f59e0b', color: '#000', padding: '0.5rem 1.5rem', fontWeight: 700, fontSize: '0.85rem' }}>Alistamento</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11, 17, 33, 0.1) 0%, rgba(11, 17, 33, 0.6) 60%, #0b1121 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <img src={logoImage} alt="EDAV Logo Principal" style={{ height: '250px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
        </div>
      </section>

      {/* 1. PILOTOS (TIME) */}
      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="pilotos" className="section-container">
          <SectionHeader title="Nossos Pilotos" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {dbPilotos.map((piloto, index) => {
              const role = index === 0 ? "LÍDER" : index === 6 ? "ISOLADO" : `ALA ${index + 1}`;

              return (
                <div key={index} className="card-piloto" style={{
                  background: 'rgba(3, 7, 18, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(245, 158, 11, 0.4)';
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.background = 'rgba(3, 7, 18, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.background = 'rgba(3, 7, 18, 0.4)';
                }}>
                  
                  <div className="bg-num" style={{ 
                    position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', 
                    fontSize: '7rem', fontFamily: 'PosicaoFont, sans-serif', 
                    color: 'rgba(245, 158, 11, 0.35)', zIndex: 0, lineHeight: 1,
                    transition: 'all 0.4s ease'
                  }}>
                    {piloto.posicao}
                  </div>
                  
                  <div style={{ position: 'relative', zIndex: 2, paddingLeft: '5.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', color: '#f59e0b', marginBottom: '0.5rem' }}>{role}</div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 400, color: '#f8fafc', marginBottom: '0.25rem', fontFamily: '"NormalFont", sans-serif' }}>{piloto.nome}</h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>"{piloto.callsign}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 2. AGENDA */}
      <div style={{ backgroundColor: '#030712' }}>
        <section id="agenda" className="section-container">
          <SectionHeader title="Agenda de Demonstrações" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <div>
              <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '2.5rem' }}>
                Nossas demonstrações seguem rigorosos critérios técnicos, com meteorologia e horário baseados em dados atualizados em tempo real. Para locais com status em <strong style={{ fontWeight: 500, color: '#f8fafc' }}>Planejamento</strong>, é realizada uma Missão Precursora (M-PREC) ao local para avaliar meticulosamente todos os aspectos de viabilidade e segurança da operação.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {dbDemonstracoes.length > 0 ? (
                  dbDemonstracoes.map((dem, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h4 style={{ fontSize: '1.15rem', color: '#f8fafc', fontFamily: 'NormalFont, sans-serif' }}>{dem.cidade}</h4>
                        <span className={`demo-status ${dem.cssClass}`} style={{ letterSpacing: '0.15em', padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 700 }}>{dem.status}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        <MapPin size={14} color="#f59e0b" />
                        {dem.coordsText}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state glass-panel" style={{ padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(11, 17, 33, 0.4)', textAlign: 'center' }}>
                    <CalendarX2 size={36} color="#f59e0b" style={{ margin: '0 auto 1.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 300, letterSpacing: '0.05em', lineHeight: '1.8', color: '#94a3b8' }}>O calendário de demonstrações será atualizado em breve.<br/>Acompanhe nossas redes para novidades.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="map-box glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', height: '550px', overflow: 'hidden' }}>
              <MapContainer center={mapCenter} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1, background: 'transparent' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {dbDemonstracoes.map((dem, idx) => (
                  <Marker key={idx} position={[dem.lat, dem.lng]} icon={customIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', padding: '0.5rem' }}>
                        <h4 style={{ fontWeight: 600, margin: '0 0 0.75rem 0', fontSize: '1.25rem', color: '#0f172a' }}>{dem.cidade}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#475569' }}><strong>Local:</strong> {dem.coordsText}</p>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#475569' }}><strong>Data/Hora:</strong> {dem.dataHora}</p>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#475569' }}><strong>Tipo:</strong> {dem.tipo}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </section>
      </div>

      {/* 3. AERONAVE & MODS (COMPACTA SEM FUNDO) */}
      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="aeronave" className="section-container" style={{ padding: '6rem 2rem' }}>
          <SectionHeader title="A-29 Super Tucano" />

          {/* Cards Técnicos em Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ background: 'rgba(3, 7, 18, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontFamily: 'NormalFont', color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plane size={18} color="#f59e0b" /> Geral</h4>
              <TechItem label="Fabricante" value="Embraer" />
              <TechItem label="Tripulação" value="2 Pilotos (A-29B)" />
              <TechItem label="Motorização" value="1x PT6A-68C" />
              <TechItem label="Potência" value="1.600 shp" />
            </div>

            <div className="glass-panel" style={{ background: 'rgba(3, 7, 18, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontFamily: 'NormalFont', color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plane size={18} color="#f59e0b" /> Dimensões</h4>
              <TechItem label="Comprimento" value="11,38 m" />
              <TechItem label="Envergadura" value="11,14 m" />
              <TechItem label="Altura" value="3,97 m" />
              <TechItem label="Peso Máx." value="5.200 kg" />
            </div>

            <div className="glass-panel" style={{ background: 'rgba(3, 7, 18, 0.4)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontFamily: 'NormalFont', color: '#f8fafc', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plane size={18} color="#f59e0b" /> Desempenho</h4>
              <TechItem label="Vel. Máxima" value="593 km/h" />
              <TechItem label="Razão Subida" value="1.440 m/min" />
              <TechItem label="Teto Serviço" value="10.670 m" />
              <TechItem label="Alcance" value="1.445 km" />
            </div>
          </div>

          <div id="mods" style={{ paddingTop: '3rem', marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontFamily: '"Quantico", sans-serif', fontWeight: 700, letterSpacing: '0.1em', fontSize: '1.5rem', marginBottom: '2.5rem', textAlign: 'center', color: '#f8fafc', textTransform: 'uppercase' }}>Utilitários & Downloads</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
              {dbMods.map((mod, index) => (
                <div key={index} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', background: 'rgba(3, 7, 18, 0.4)', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0, borderRadius: '6px' }}>
                    {mod.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '0.25rem', fontFamily: '"NormalFont", sans-serif' }}>{mod.titulo}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.75rem', fontWeight: 300 }}>{mod.desc}</p>
                    <a href={mod.link} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: mod.isMarketplace ? 'rgba(255,255,255,0.05)' : 'transparent', border: mod.isMarketplace ? 'none' : '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: mod.isMarketplace ? '#94a3b8' : '#f8fafc', textTransform: 'uppercase', textDecoration: 'none', alignSelf: 'flex-start' }}>
                      {mod.buttonIcon} {mod.buttonText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 4. NOTÍCIAS */}
      <div style={{ backgroundColor: '#030712' }}>
        <section id="noticias" className="section-container">
          <SectionHeader title="Central de Notícias" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {dbNoticias.length > 0 ? (
              dbNoticias.map((noticia, idx) => (
                <div key={idx} className="news-card glass-panel" style={{ background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                  <div style={{ height: '180px', backgroundImage: `url(${noticia.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{noticia.data}</span>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', fontFamily: 'NormalFont, sans-serif', marginBottom: '1rem', lineHeight: 1.4 }}>{noticia.titulo}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 300, flexGrow: 1, marginBottom: '1.5rem' }}>{noticia.resumo}</p>
                    <a href="#" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ler Matéria Completa <ChevronRight size={14} color="#f59e0b" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(11, 17, 33, 0.4)' }}>
                <Newspaper size={36} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: '#94a3b8', fontWeight: 300 }}>Nenhuma notícia publicada ainda.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 5. SOBRE */}
      <div style={{ backgroundColor: '#0b1121' }}>
        <section id="sobre" className="section-container" style={{ padding: '6rem 2rem' }}>
          <SectionHeader title="Sobre o Esquadrão" />
          <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '3rem', background: 'rgba(3, 7, 18, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontWeight: 300, fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: '1.8', color: '#cbd5e1', margin: 0 }}>
                O <strong style={{ color: '#f59e0b', fontWeight: 500 }}>EDAV</strong> (Esquadrão de Demonstração Aérea Virtual) nasce da paixão pela aviação e pelo voo em formação. 
                Utilizando o Microsoft Flight Simulator, buscamos representar com excelência, precisão e profissionalismo 
                as manobras e a doutrina da Esquadrilha da Fumaça real. Nossa equipe é formada por entusiastas e pilotos 
                virtuais dedicados ao treinamento contínuo, elevando a simulação a um novo patamar de imersão e realismo.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 6. ALISTAMENTO E PARCEIROS */}
      <div style={{ backgroundColor: '#030712' }}>
        <section id="alistamento" className="section-container" style={{ paddingBottom: '3rem' }}>
          <SectionHeader title="Alistamento" />

          <div className="glass-panel alistamento-box" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', background: 'rgba(11, 17, 33, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#f8fafc', fontFamily: '"NormalFont", sans-serif' }}>
                Requisitos Oficiais
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div>
                  <span style={{ fontWeight: 300, lineHeight: '1.6' }}>Possuir cópia original do Microsoft Flight Simulator.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div>
                  <span style={{ fontWeight: 300, lineHeight: '1.6' }}>Uso obrigatório de periféricos adequados (Joystick ou HOTAS).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div>
                  <span style={{ fontWeight: 300, lineHeight: '1.6' }}>Disponibilidade para treinamentos nas Terças e Quintas (20h - 22h).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <div style={{ opacity: 0.8, color: '#f59e0b' }}><ChevronRight size={14} /></div>
                  <span style={{ fontWeight: 300, lineHeight: '1.6' }}>Microfone de boa qualidade e conta ativa no Discord.</span>
                </li>
              </ul>
            </div>
            
            <form onSubmit={submitAlistamento} style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Nome Completo</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="Seu nome real" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Nickname</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="Como gosta de ser chamado" value={nickname} onChange={e => setNickname(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Idade</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="Sua idade" value={idade} onChange={handleIdadeChange} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>WhatsApp</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="(00) 00000-0000" value={whatsapp} onChange={handlePhoneChange} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>ID no Discord</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="usuario#1234 ou @usuario" value={discord} onChange={e => setDiscord(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Experiência de Voo / Aeronave</label>
                  <input required type="text" className="form-control" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0', color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }} placeholder="Ex: 50h no Cessna 152, 10h no A-29" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
                </div>
                
                {/* Segmented Control de Simulador */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Qual seu simulador?</label>
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.25rem' }}>
                    <div 
                      onClick={() => setSimulador('MSFS 2020')}
                      style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '4px', background: simulador === 'MSFS 2020' ? '#f59e0b' : 'transparent', color: simulador === 'MSFS 2020' ? '#000' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s ease' }}
                    >
                      MSFS 2020
                    </div>
                    <div 
                      onClick={() => setSimulador('MSFS 2024')}
                      style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '4px', background: simulador === 'MSFS 2024' ? '#f59e0b' : 'transparent', color: simulador === 'MSFS 2024' ? '#000' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s ease' }}
                    >
                      MSFS 2024
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary font-title" style={{ width: '100%', marginTop: '1.5rem', letterSpacing: '0.2em', padding: '1rem', background: '#f59e0b', color: '#000', fontWeight: 700, borderRadius: '6px' }}>
                ENVIAR APLICAÇÃO
              </button>
            </form>
          </div>
        </section>

        <section id="parceiros" className="section-container" style={{ padding: '3rem 2rem' }}>
          <div className="section-header" style={{ margin: 0 }}>
            <h2 className="section-title" style={{ fontSize: '1.25rem', fontFamily: '"Quantico", sans-serif', fontWeight: 700, opacity: 0.7 }}>Apoio Institucional</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'transparent', border: 'none', padding: 0 }}>
              <img src={parceiroImage} alt="RP Simulation Logo" style={{ opacity: 0.6, height: '35px', objectFit: 'contain' }} />
              <span style={{ fontFamily: '"NormalFont", sans-serif', color: '#f8fafc', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>RP Simulation</span>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER SIMPLIFICADO EM UMA LINHA */}
      <footer className="footer" style={{ padding: '2rem', backgroundColor: '#0b1121', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 300, margin: 0 }}>
            &copy; {new Date().getFullYear()} EDAV - Virtual Flight Simulator Team. Todos os direitos reservados.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', opacity: 0.8 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'} aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'} aria-label="YouTube"><Video size={20} strokeWidth={1.5} /></a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'} aria-label="Discord"><DiscordIcon size={20} /></a>
          </div>
        </div>
      </footer>

      {/* BOTÃO SCROLL TO TOP */}
      <button 
        onClick={scrollToTop}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          background: '#f59e0b', color: '#000', border: 'none', borderRadius: '50%',
          width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', transition: 'all 0.3s ease',
          opacity: showTopBtn ? 1 : 0, pointerEvents: showTopBtn ? 'auto' : 'none',
          transform: showTopBtn ? 'translateY(0)' : 'translateY(20px)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <ChevronUp size={24} strokeWidth={2.5} />
      </button>

      {/* MODAL SUCESSO */}
      <div className={`modal-overlay ${modalAlistamento ? 'active' : ''}`}>
        <div className="modal-content glass-panel" style={{ padding: '4rem 3rem', background: '#0b1121', border: '1px solid #f59e0b' }}>
          <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 className="font-title" style={{ color: '#f8fafc', fontSize: '1.75rem', margin: '1.5rem 0 1rem', fontWeight: 400 }}>Aplicação Enviada!</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: '1.8', fontWeight: 300, fontSize: '0.95rem' }}>
            Recebemos seus dados com sucesso. Nossa equipe entrará em contato com você via Discord ou WhatsApp em breve para os próximos passos.
          </p>
          <button type="button" className="btn-primary font-title" style={{ letterSpacing: '0.2em', padding: '1.25rem 2.5rem', width: '100%', borderRadius: '6px' }} onClick={() => setModalAlistamento(false)}>
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;