import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Header({ searchQuery, onSearch, isSimulating, toggleSimulation }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const date = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
      setClock(`${date} · ${time}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1>Centro de Operaciones</h1>
        <p>Monitoreo de predicciones y gestión financiera en tiempo real</p>
      </div>
      <div className="header-right">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Buscar cliente o monto... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            id="global-search"
          />
        </div>
        <button 
          onClick={toggleSimulation}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: isSimulating ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            background: isSimulating ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
            color: isSimulating ? '#10b981' : '#94a3b8',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            animation: isSimulating ? 'pulse 2s infinite' : 'none'
          }}
          title={isSimulating ? "Detener Simulador" : "Iniciar Simulador Automático"}
        >
          {isSimulating ? <><span style={{fontSize:'14px'}}>⚡</span> Simulando...</> : <><span style={{fontSize:'14px'}}>🚀</span> Simulador</>}
        </button>
        <div className="header-clock">{clock}</div>
        <div className="avatar" title="Administrador">A</div>
      </div>
    </header>
  );
}
