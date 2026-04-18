import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Header({ searchQuery, onSearch }) {
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
        <div className="header-clock">{clock}</div>
        <div className="avatar" title="Administrador">A</div>
      </div>
    </header>
  );
}
