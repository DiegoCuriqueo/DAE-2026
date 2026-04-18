import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = prevValue.current;
    const end = Number(value) || 0;
    const duration = 800;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * eased;
      el.textContent = `${prefix}${decimals > 0
        ? current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(current).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(animate);
      else prevValue.current = end;
    }
    requestAnimationFrame(animate);
  }, [value, prefix, suffix, decimals]);

  return <span ref={ref}>0</span>;
}

function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="stat-sparkline" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-${color})`}
      />
    </svg>
  );
}

const cards = [
  {
    key: 'total',
    icon: DollarSign,
    label: 'Total Pagos',
    color: 'purple',
    accentColor: '#a78bfa',
    gradientFrom: 'rgba(124, 58, 237, 0.15)',
    gradientTo: 'rgba(124, 58, 237, 0.02)',
    getValue: s => s.total,
    getAmount: s => s.totalAmount,
    getSub: s => `$${s.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} total`,
  },
  {
    key: 'paid',
    icon: CheckCircle,
    label: 'Pagados',
    color: 'green',
    accentColor: '#10b981',
    gradientFrom: 'rgba(16, 185, 129, 0.15)',
    gradientTo: 'rgba(16, 185, 129, 0.02)',
    getValue: s => s.paidCount,
    getAmount: s => s.paidAmount,
    getSub: s => `$${s.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} recaudado`,
  },
  {
    key: 'pending',
    icon: Clock,
    label: 'Pendientes',
    color: 'amber',
    accentColor: '#f59e0b',
    gradientFrom: 'rgba(245, 158, 11, 0.15)',
    gradientTo: 'rgba(245, 158, 11, 0.02)',
    getValue: s => s.pendingCount,
    getAmount: s => s.pendingAmount,
    getSub: s => `$${s.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} por cobrar`,
  },
  {
    key: 'rate',
    icon: TrendingUp,
    label: 'Tasa Cobro',
    color: 'blue',
    accentColor: '#3b82f6',
    gradientFrom: 'rgba(59, 130, 246, 0.15)',
    gradientTo: 'rgba(59, 130, 246, 0.02)',
    getValue: s => s.rate,
    getAmount: () => 0,
    getSub: () => 'Eficiencia de recaudación',
    isPercent: true,
  },
];

export default function StatCards({ stats, loading }) {
  // Generate fake sparkline data based on stats for visual effect
  const [sparkData] = useState(() => {
    return cards.map(() => {
      const base = Math.random() * 50 + 20;
      return Array.from({ length: 8 }, (_, i) => base + Math.random() * 30 * (i / 7));
    });
  });

  return (
    <section className="stats-summary">
      {cards.map((card, i) => {
        const val = loading ? 0 : Number(card.getValue(stats)) || 0;
        const isUp = val > 0;

        return (
          <motion.div
            key={card.key}
            className={`summary-card summary-card--${card.color}`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
            style={{
              '--card-accent': card.accentColor,
              '--card-gradient-from': card.gradientFrom,
              '--card-gradient-to': card.gradientTo,
            }}
          >
            {/* Accent top border */}
            <div className="card-accent-bar" style={{ background: card.accentColor }} />

            {/* Background glow */}
            <div className="card-glow" style={{ background: `radial-gradient(circle at 80% 20%, ${card.gradientFrom}, transparent 70%)` }} />

            <div className="card-top-row">
              <div className={`summary-icon ${card.color}`}>
                <card.icon size={20} strokeWidth={2.2} />
              </div>
              <MiniSparkline data={sparkData[i]} color={card.accentColor} />
            </div>

            <div className="summary-label">{card.label}</div>

            <div className={`summary-value ${loading ? 'skeleton' : ''}`}>
              {loading ? '--' : card.isPercent
                ? <><AnimatedNumber value={val} /><span className="value-suffix">%</span></>
                : <AnimatedNumber value={val} />
              }
            </div>

            <div className="card-bottom-row">
              <div className="summary-sub">
                {loading ? '...' : card.getSub(stats)}
              </div>
              {!loading && !card.isPercent && (
                <div className={`card-trend ${isUp ? 'up' : 'neutral'}`}>
                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
