import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PaymentTable from '../components/Payments/PaymentTable';
import PaymentModal from '../components/Payments/PaymentModal';
import ConfirmModal from '../components/Payments/ConfirmModal';
import ClearAllModal from '../components/Payments/ClearAllModal';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export default function PaymentsPage({ paymentHook, searchQuery, addActivity }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, client: '' });

  const handleSave = async (payment) => {
    try {
      const created = await paymentHook.add(payment);
      toast.success(`Pago de $${created.amount.toLocaleString()} registrado`);
      addActivity('created', `Nuevo pago: <strong>${created.client}</strong> — $${created.amount.toLocaleString()}`);
    } catch (err) {
      toast.error(err.message || 'Error al guardar el pago');
      throw err;
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await paymentHook.toggle(id);
      const statusText = updated.status === 'pagado' ? 'Pagado' : 'Pendiente';
      toast.success(`${updated.client} → ${statusText}`);
      addActivity(updated.status === 'pagado' ? 'paid' : 'toggled',
        `<strong>${updated.client}</strong> marcado como ${statusText}`);
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDeleteRequest = (id, client) => {
    setDeleteTarget({ id, client });
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await paymentHook.remove(deleteTarget.id);
      toast.success(`Pago de ${deleteTarget.client} eliminado`);
      addActivity('deleted', `Eliminado: <strong>${deleteTarget.client}</strong>`);
    } catch {
      toast.error('Error al eliminar el pago');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget({ id: null, client: '' });
    }
  };

  const handleClearAllConfirm = async () => {
    try {
      await paymentHook.removeAll();
      toast.success('Base de datos limpiada correctamente', { icon: '🧹' });
      addActivity('deleted', `<strong>Base de datos reseteada</strong> (Todos los pagos eliminados)`);
    } catch {
      toast.error('Error al limpiar la base de datos');
    } finally {
      setClearAllOpen(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PaymentTable
        payments={paymentHook.payments}
        loading={paymentHook.loading}
        searchQuery={searchQuery}
        onToggle={handleToggle}
        onDelete={handleDeleteRequest}
        onOpenModal={() => setModalOpen(true)}
        onClearAll={() => setClearAllOpen(true)}
      />

      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        client={deleteTarget.client}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <ClearAllModal
        isOpen={clearAllOpen}
        onConfirm={handleClearAllConfirm}
        onCancel={() => setClearAllOpen(false)}
      />
    </motion.div>
  );
}
