import { useState, useEffect, useCallback } from 'react';
import { fetchPayments, createPayment, togglePayment, deletePayment } from '../api/api';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (payment) => {
    const created = await createPayment(payment);
    setPayments(prev => [created, ...prev]);
    return created;
  };

  const toggle = async (id) => {
    const updated = await togglePayment(id);
    setPayments(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const remove = async (id) => {
    await deletePayment(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'pagado').length;
  const pendingCount = payments.filter(p => p.status === 'pendiente').length;
  const paidAmount = payments.filter(p => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pendiente').reduce((s, p) => s + p.amount, 0);

  return {
    payments, loading, error, reload: load,
    add, toggle, remove,
    stats: {
      total: payments.length,
      totalAmount: total,
      paidCount, paidAmount,
      pendingCount, pendingAmount,
      rate: payments.length > 0 ? ((paidCount / payments.length) * 100).toFixed(1) : '0.0',
    }
  };
}
