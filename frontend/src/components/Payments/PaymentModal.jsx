import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, DollarSign } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSave }) {
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!client.trim()) errs.client = true;
    if (!amount || parseFloat(amount) <= 0) errs.amount = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        client: client.trim(),
        amount: parseFloat(amount),
        status,
      });
      setClient('');
      setAmount('');
      setStatus('pendiente');
      setErrors({});
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3 className="modal-title">💳 Registrar Transacción</h3>
              <button className="btn-icon modal-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="client-name">
                <User size={13} style={{ marginRight: 6, opacity: 0.5 }} />
                Nombre del Cliente
              </label>
              <input
                className={`form-input ${errors.client ? 'error' : ''}`}
                id="client-name"
                type="text"
                placeholder="Ej: Empresa Alpha S.A"
                value={client}
                onChange={(e) => { setClient(e.target.value); setErrors(p => ({ ...p, client: false })); }}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {errors.client && <div className="form-error visible">El nombre es obligatorio</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="payment-amount">
                <DollarSign size={13} style={{ marginRight: 6, opacity: 0.5 }} />
                Monto ($)
              </label>
              <input
                className={`form-input ${errors.amount ? 'error' : ''}`}
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej: 2500.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: false })); }}
                onKeyDown={handleKeyDown}
              />
              {errors.amount && <div className="form-error visible">Ingresa un monto válido mayor a 0</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="payment-status">Estado Inicial</label>
              <select
                className="form-select"
                id="payment-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pendiente">⏳ Pendiente</option>
                <option value="pagado">✅ Pagado</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="btn-loading">Guardando...</span>
                ) : (
                  <>
                    <Check size={14} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
