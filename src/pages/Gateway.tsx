import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowRightCircle, Pause, Play } from 'lucide-react';
import '../App.css'; 

// Importe as imagens fixas
import edavImage from '../images/edav.png'; 
import edafsImage from '../images/tucano.jpg';

export default function Gateway() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(18);
  const [isPaused, setIsPaused] = useState(location.state?.startPaused || false);

  // Controlador do Cronómetro de redirecionamento
  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/home');
      return;
    }
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, navigate]);

  const handleVisitOfficial = () => {
    window.location.href = 'https://edav.com.br';
  };

  const handleStay = () => {
    navigate('/home');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="gateway-container">
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #030712;
        }

        @font-face {
          font-family: 'Regular';
          src: local('Regular'), url('/fonts/regular.otf') format('opentype'), url('../fonts/regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap; 
        }

        @font-face {
          font-family: 'Comum';
          src: local('Comum'), url('/fonts/comum.otf') format('opentype'), url('../fonts/comum.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        .gateway-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          position: relative;
          font-family: 'Regular', system-ui, sans-serif;
        }

        .split-side {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: flex 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          overflow: hidden;
          text-align: center;
          padding: 2rem;
        }

        .split-side:hover {
          flex: 1.15;
        }

        .bg-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: brightness(0.25) grayscale(0.5);
          transition: all 0.8s ease;
          z-index: 1;
        }

        .split-side:hover .bg-image {
          filter: brightness(0.6) grayscale(0);
          transform: scale(1.03);
        }

        .content-layer {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 520px;
        }

        .gateway-title {
          font-family: 'Comum', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: #ffffff;
          margin: 0 0 1rem 0;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gateway-desc {
          font-family: 'Regular', sans-serif;
          color: #cbd5e1;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2.5rem 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
          font-weight: 300;
        }

        .gateway-btn {
          font-family: 'Regular', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 999px;
          font-size: 1rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          
          /* Design Unificado para ambos os botões */
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .gateway-btn:hover {
          background: #ffffff;
          color: #030712;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255,255,255,0.2);
        }

        .timer-badge {
          position: absolute;
          top: 2rem;
          right: 2rem;
          z-index: 10;
          background: rgba(3, 7, 18, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.4rem 1rem;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        
        .timer-text {
          color: #f8fafc;
          font-family: 'Comum', sans-serif;
          font-size: 0.75rem;
          font-weight: normal;
          min-width: 3ch;
          text-align: center;
          letter-spacing: 0.05em;
        }
        
        .pause-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0.2rem;
        }
        
        .pause-btn:hover {
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .gateway-container { flex-direction: column; }
          .split-side { padding: 1.5rem; }
          .gateway-title { font-size: 2.2rem; }
          .timer-badge {
            top: 1rem;
            right: 1rem;
          }
        }
      `}</style>

      <div className="split-side">
        <div 
          className="bg-image" 
          style={{ backgroundImage: `url(${edavImage})` }} 
        />
        <div className="content-layer">
          <h1 className="gateway-title">EDAV</h1>
          <p className="gateway-desc">
            O mais antigo time de demonstração aérea virtual do mundo (1998). Representante do Brasil no VFAT, recria com precisão as operações oficiais da verdadeira Esquadrilha da Fumaça.
          </p>
          <button onClick={handleVisitOfficial} className="gateway-btn">
            Ir para o EDAV <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 5, position: 'relative' }}></div>

      <div className="split-side">
        <div 
          className="bg-image" 
          style={{ backgroundImage: `url(${edafsImage})` }} 
        />
        <div className="content-layer">
          <h1 className="gateway-title">EDAFS</h1>
          <p className="gateway-desc">
            Esquadrão focado no Microsoft Flight Simulator. Nascidos da paixão pela aviação, buscamos replicar com extrema fidelidade e profissionalismo a doutrina da Esquadrilha da Fumaça.
          </p>
          <button onClick={handleStay} className="gateway-btn">
            Permanecer no EDAFS <ArrowRightCircle size={18} />
          </button>
        </div>
      </div>

      <div className="timer-badge">
        <span className="timer-text" style={{ color: isPaused ? '#8e98a6' : '#ffc800' }}>
          {isPaused ? 'Dê play para iniciar o contador de redirecionamento.' : `${timeLeft}s`}
        </span>
        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
        <button onClick={togglePause} className="pause-btn" title={isPaused ? "Retomar Cronómetro" : "Pausar Cronómetro"}>
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>
      </div>
      
    </div>
  );
}