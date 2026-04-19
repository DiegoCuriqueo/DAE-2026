import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, client, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay confirm-modal active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <h3 className="modal-title">¿Eliminar este pago?</h3>
            <p className="confirm-text">
              Se eliminará permanentemente el pago de <strong>{client}</strong>.
            </p>
            <p className="confirm-sub">Esta acción no se puede deshacer.</p>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
              <button className="btn btn-danger" onClick={onConfirm}>
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
