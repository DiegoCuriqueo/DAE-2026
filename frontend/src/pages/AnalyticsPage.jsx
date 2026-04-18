import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DonutChart from '../components/Analytics/DonutChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'rgba(14, 18, 27, 0.95)',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      borderRadius: '12px',
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 700 }}>
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function AnalyticsPage({ paymentHook, activities }) {
  const topClients = useMemo(() => {
    const map = {};
    paymentHook.payments.forEach(p => {
      if (!map[p.client]) map[p.client] = 0;
      map[p.client] += p.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }));
  }, [paymentHook.payments]);

  const barColors = [
    '#7c3aed', '#a78bfa', '#22d3ee', '#10b981',
    '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'
  ];

  const { stats } = paymentHook;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Summary Row */}
      <div className="analytics-summary">
        <motion.div className="analytics-big-stat"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="big-stat-label">Ingresos Totales</span>
          <span className="big-stat-value">${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="big-stat-sub">{stats.total} transacciones registradas</span>
        </motion.div>
        <motion.div className="analytics-big-stat green"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="big-stat-label">Recaudado</span>
          <span className="big-stat-value">${stats.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="big-stat-sub">{stats.paidCount} pagos completados</span>
        </motion.div>
        <motion.div className="analytics-big-stat amber"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="big-stat-label">Pendiente</span>
          <span className="big-stat-value">${stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="big-stat-sub">{stats.pendingCount} pagos por cobrar</span>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="payment-chart-section">
        <DonutChart paidCount={stats.paidCount} pendingCount={stats.pendingCount} />

        <motion.div className="mini-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="mini-card-title">👥 Top Clientes por Monto</div>
          <div style={{ height: 200 }}>
            {topClients.length === 0 ? (
              <div className="empty-state"><p>Sin datos de clientes</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {topClients.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity */}
      <div className="analytics-activity-row">
        <ActivityFeed activities={activities} />
      </div>
    </motion.div>
  );
}
