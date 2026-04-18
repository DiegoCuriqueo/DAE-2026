import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  { fill: 'rgba(16, 185, 129, 0.85)', stroke: 'rgba(16, 185, 129, 0.3)' },
  { fill: 'rgba(245, 158, 11, 0.85)', stroke: 'rgba(245, 158, 11, 0.3)' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const total = item.payload.total || 1;
  const pct = ((item.value / total) * 100).toFixed(1);

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
        {item.value} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({pct}%)</span>
      </p>
    </div>
  );
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: entry.color,
            boxShadow: `0 0 8px ${entry.color}40`,
          }} />
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DonutChart({ paidCount, pendingCount }) {
  const total = paidCount + pendingCount;

  const data = useMemo(() => [
    { name: 'Pagados', value: paidCount, total },
    { name: 'Pendientes', value: pendingCount, total },
  ], [paidCount, pendingCount, total]);

  const pct = total > 0 ? ((paidCount / total) * 100).toFixed(0) : 0;

  return (
    <motion.div
      className="mini-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <div className="mini-card-title">📊 Distribución de Pagos</div>
      <div className="donut-container">
        {total === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>Sin datos disponibles</p>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Center label */}
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Cobrado</div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="42%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={8}
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i].fill}
                      stroke={COLORS[i].stroke}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
