import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, health, searchQuery, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="app-layout">
      <div className="mesh-overlay" />

      {/* Mobile hamburger */}
      <button
        className={`hamburger ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar open={sidebarOpen} health={health} />

      <main className="main-content">
        <Header searchQuery={searchQuery} onSearch={onSearch} />
        {children}
        <footer className="footer">
          <div className="footer-left">
            <strong>Quantum Hub</strong> v4.0 © 2026 — Powered by React + FastAPI
          </div>
          <div className="footer-right">
            <a href="/docs" className="footer-link" target="_blank" rel="noreferrer">API Docs</a>
            <a href="https://github.com" className="footer-link" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
