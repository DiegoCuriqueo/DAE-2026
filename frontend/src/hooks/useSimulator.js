import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const COMPANIES = [
  'TechCorp', 'Innova Solutions', 'Global Dynamics', 'Cyberdyne Systems', 
  'Wayne Enterprises', 'Stark Industries', 'Acme Corp', 'Umbrella Corp',
  'Oscorp', 'Massive Dynamic'
];

export function useSimulator(paymentHook, addActivity) {
  const [isSimulating, setIsSimulating] = useState(false);
  // Ref to access current payments without triggering interval resets constantly if not wanted
  const paymentsRef = useRef(paymentHook.payments);

  useEffect(() => {
    paymentsRef.current = paymentHook.payments;
  }, [paymentHook.payments]);

  useEffect(() => {
    if (!isSimulating) return;

    const intervalId = setInterval(async () => {
      // 60% chance to create a new payment, 40% chance to pay a pending one
      const action = Math.random() < 0.6 ? 'create' : 'toggle';

      if (action === 'create') {
        const client = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
        const amount = Number((Math.random() * 4000 + 100).toFixed(2));
        const status = Math.random() < 0.5 ? 'pendiente' : 'pagado';
        
        try {
          const created = await paymentHook.add({ client, amount, status });
          toast.success(`Pago simulado: $${created.amount.toLocaleString()}`, { icon: '🤖' });
          addActivity('created', `Nuevo pago (Simulador): <strong>${created.client}</strong> — $${created.amount.toLocaleString()}`);
        } catch (e) {
          console.error("Simulador: Error al crear", e);
        }
      } else {
        // Toggle a pending payment
        const pendingPayments = paymentsRef.current.filter(p => p.status === 'pendiente');
        if (pendingPayments.length > 0) {
          const target = pendingPayments[Math.floor(Math.random() * pendingPayments.length)];
          try {
            const updated = await paymentHook.toggle(target.id);
            toast.success(`${updated.client} marcado como pagado`, { icon: '🤖' });
            addActivity('paid', `<strong>${updated.client}</strong> pagado (Simulador)`);
          } catch (e) {
            console.error("Simulador: Error al actualizar", e);
          }
        } else {
          // No pending payments, just create one
          const client = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
          const amount = Number((Math.random() * 4000 + 100).toFixed(2));
          try {
            const created = await paymentHook.add({ client, amount, status: 'pendiente' });
            toast.success(`Pago simulado: $${created.amount.toLocaleString()}`, { icon: '🤖' });
            addActivity('created', `Nuevo pago (Simulador): <strong>${created.client}</strong> — $${created.amount.toLocaleString()}`);
          } catch (e) {
             console.error("Simulador: Error al crear", e);
          }
        }
      }
    }, 4500); // 4.5 seconds interval

    return () => clearInterval(intervalId);
  }, [isSimulating]); // We omit paymentHook to avoid recreating the interval on every render

  const toggleSimulation = () => {
    setIsSimulating(prev => {
      const next = !prev;
      if (next) toast.success('Simulador Automático Activado', { icon: '🚀' });
      else toast('Simulador Detenido', { icon: '🛑' });
      return next;
    });
  };

  return { isSimulating, toggleSimulation };
}
