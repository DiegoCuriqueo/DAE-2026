import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const COMPANIES = [
  'TechCorp', 'Innova Solutions', 'Global Dynamics', 'Cyberdyne Systems', 
  'Wayne Enterprises', 'Stark Industries', 'Acme Corp', 'Umbrella Corp',
  'Oscorp', 'Massive Dynamic'
];

const SERVICES = [
  'Auditoría Ciberseguridad', 'Consultoría MLOps', 'Desarrollo Backend',
  'Optimización Cloud', 'Implementación IA', 'Análisis de Datos',
  'Soporte Técnico 24/7', 'Diseño UI/UX Premium'
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
      // 50% chance to create a new pending payment (service contract), 50% chance to pay an existing one
      const action = Math.random() < 0.5 ? 'create' : 'toggle';

      if (action === 'create') {
        const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
        const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
        const client = company;
        const amount = Number((Math.random() * 4000 + 100).toFixed(2));
        const status = 'pendiente'; // All new services start as pending
        
        try {
          const created = await paymentHook.add({ client, service, amount, status });
          toast.success(`Nuevo servicio (${created.service}): $${created.amount.toLocaleString()}`, { icon: '📝' });
          addActivity('created', `Servicio adquirido: <strong>${created.client}</strong> - ${created.service} por $${created.amount.toLocaleString()}`);
        } catch (e) {
          console.error("Simulador: Error al crear", e);
        }
      } else {
        // Toggle a pending payment (company pays for the service)
        const pendingPayments = paymentsRef.current.filter(p => p.status === 'pendiente');
        if (pendingPayments.length > 0) {
          const target = pendingPayments[Math.floor(Math.random() * pendingPayments.length)];
          try {
            const updated = await paymentHook.toggle(target.id);
            toast.success(`${updated.client} ha pagado`, { icon: '💰' });
            addActivity('paid', `<strong>${updated.client}</strong> ha pagado su servicio de ${updated.service} (Simulador)`);
          } catch (e) {
            console.error("Simulador: Error al actualizar", e);
          }
        } else {
          // No pending payments, create a new service instead
          const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
          const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
          const client = company;
          const amount = Number((Math.random() * 4000 + 100).toFixed(2));
          try {
            const created = await paymentHook.add({ client, service, amount, status: 'pendiente' });
            toast.success(`Nuevo servicio (${created.service}): $${created.amount.toLocaleString()}`, { icon: '📝' });
            addActivity('created', `Servicio adquirido: <strong>${created.client}</strong> - ${created.service} por $${created.amount.toLocaleString()}`);
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
