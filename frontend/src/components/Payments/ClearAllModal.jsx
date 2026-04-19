import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function ClearAllModal({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay active">
          <motion.div
            className="modal-content"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', margin: '0 auto 1rem auto', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={24} />
            </div>
            <h3 className="modal-title" style={{ textAlign: 'center' }}>¿Limpiar la Base de Datos?</h3>
            <p className="confirm-text" style={{ textAlign: 'center' }}>
              Se eliminarán permanentemente <strong>TODOS</strong> los pagos de la base de datos.
            </p>
            <p className="confirm-sub" style={{ textAlign: 'center', marginTop: '0.5rem', color: '#ef4444' }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
              <button className="btn btn-danger" onClick={onConfirm} style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                <Trash2 size={14} />
                Sí, limpiar todo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
