import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Plus, Search, FileSpreadsheet } from 'lucide-react';

export default function PaymentTable({ payments, loading, searchQuery, onToggle, onDelete, onOpenModal, onClearAll }) {
  const [localSearch, setLocalSearch] = useState('');

  const query = searchQuery || localSearch;

  const filtered = useMemo(() => {
    if (!query.trim()) return payments;
    const q = query.toLowerCase();
    return payments.filter(p =>
      p.client.toLowerCase().includes(q) ||
      (p.service && p.service.toLowerCase().includes(q)) ||
      p.amount.toString().includes(q) ||
      p.id.includes(q) ||
      p.status.includes(q)
    );
  }, [payments, query]);

  const total = filtered.reduce((s, p) => s + p.amount, 0);

  const exportCSV = () => {
    if (filtered.length === 0) return;
    let csv = 'Cliente,Servicio,Monto,Estado,Fecha,ID\n';
    filtered.forEach(p => {
      const date = new Date(p.created_at).toLocaleDateString('es-CL');
      csv += `"${p.client}","${p.service || 'General'}","$${p.amount}","${p.status}","${date}","${p.id}"\n`;
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_hub_pagos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.section
      className="payments-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-bar" />
          Control de Pagos
        </div>
        <div className="section-header-actions">
          <div className="search-wrapper compact">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="table-search"
              placeholder="Filtrar pagos..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={exportCSV} title="Exportar CSV">
            <FileSpreadsheet size={14} />
            CSV
          </button>
          <button className="btn btn-secondary" onClick={onClearAll} title="Limpiar Base de Datos" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <Trash2 size={14} />
            Limpiar BD
          </button>
          <button className="btn btn-primary" onClick={onOpenModal}>
            <Plus size={14} />
            Nuevo Pago
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>ID</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 6 }}>&nbsp;</div></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p>{payments.length === 0 ? 'No hay pagos registrados. ¡Crea el primero!' : 'No hay resultados para tu búsqueda.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filtered.map((p) => {
                  const date = new Date(p.created_at);
                  const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' });
                  const isPaid = p.status === 'pagado';

                  return (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <td className="td-client">{p.client}</td>
                      <td className="td-service" style={{ color: '#94a3b8', fontSize: '13px' }}>{p.service || 'General'}</td>
                      <td className="td-amount">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span
                          className={`status-badge ${isPaid ? 'status-paid' : 'status-pending'}`}
                          onClick={() => onToggle(p.id)}
                          title="Click para cambiar estado"
                        >
                          <span className="status-dot-mini" />
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="td-date">{dateStr}</td>
                      <td className="td-id">{p.id}</td>
                      <td className="td-actions">
                        <button
                          className="btn-icon"
                          onClick={() => onDelete(p.id, p.client)}
                          title="Eliminar pago"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        <span>Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </motion.section>
  );
}
