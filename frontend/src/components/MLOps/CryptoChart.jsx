import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'rgba(14, 18, 27, 0.95)',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function CryptoChart({ historical, selectedCoin, onCoinChange }) {
  const chartData = useMemo(() => {
    const prices = historical[selectedCoin] || [];
    return prices.map((price, i) => ({
      name: `Día ${i + 1}`,
      price: Math.round(price * 100) / 100,
    }));
  }, [historical, selectedCoin]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="chart-selector-row">
        <span className="chart-selector-label">Análisis de Tendencia</span>
        <select
          className="chart-select"
          value={selectedCoin}
          onChange={(e) => onCoinChange(e.target.value)}
        >
          <option value="bitcoin">Bitcoin</option>
          <option value="ethereum">Ethereum</option>
          <option value="solana">Solana</option>
        </select>
      </div>

      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '3rem' }}>
            <p>Cargando datos del mercado...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" hide />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#a78bfa"
                strokeWidth={2.5}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 6, fill: '#a78bfa', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
