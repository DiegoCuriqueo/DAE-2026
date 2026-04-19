import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div style={{
      background: 'rgba(14, 18, 27, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px',
      padding: '12px 18px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {item.name}
      </p>
      <p style={{ color: '#f1f5f9', fontSize: '1.15rem', fontWeight: 800 }}>
        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2 }}>
        {item.count} contratos
      </p>
    </div>
  );
};

export default function ServiceChart({ payments }) {
  const data = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    
    const groups = {};
    payments.forEach(p => {
      const srv = p.service || 'General';
      if (!groups[srv]) groups[srv] = { name: srv, amount: 0, count: 0 };
      groups[srv].amount += p.amount;
      groups[srv].count += 1;
    });

    // Sort by amount descending, get top 5
    return Object.values(groups)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [payments]);

  return (
    <motion.div
      className="mini-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
      style={{ flex: 1.5 }}
    >
      <div className="mini-card-title">🚀 Ingresos por Servicio (Top 5)</div>
      <div className="donut-container" style={{ padding: '10px 10px 10px 0' }}>
        {data.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>Sin datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="rgba(56, 189, 248, 0.85)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
