import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

const COINS = [
  { id: 'bitcoin', key: 'bitcoin', short: 'BTC', label: 'Bitcoin / USD', emoji: '₿', color: '#f7931a' },
  { id: 'ethereum', key: 'ethereum', short: 'ETH', label: 'Ethereum / USD', emoji: 'Ξ', color: '#627eea' },
  { id: 'solana', key: 'solana', short: 'SOL', label: 'Solana / USD', emoji: '◎', color: '#00d18c', featured: true },
];

function MiniPriceChart({ data, color, isUp }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = isUp ? '#10b981' : '#ef4444';

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="crypto-mini-chart">
      <defs>
        <linearGradient id={`crypto-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#crypto-grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function CryptoCards({ prices, historical, loading }) {
  return (
    <section className="crypto-grid">
      {COINS.map((coin, i) => {
        const data = prices[coin.key];
        const price = data?.usd;
        const change = data?.usd_24h_change || 0;
        const isUp = change >= 0;
        const chartData = historical?.[coin.id];

        return (
          <motion.div
            key={coin.id}
            className={`crypto-card ${coin.featured ? 'featured' : ''}`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
          >
            {coin.featured && (
              <span className="crypto-badge">
                <Sparkles size={10} style={{ marginRight: 4 }} />
                AI Pick
              </span>
            )}

            {/* Color accent line */}
            <div className="crypto-accent-line" style={{ background: `linear-gradient(90deg, ${coin.color}, transparent)` }} />

            {/* Background watermark */}
            <span className="crypto-watermark">{coin.short}</span>

            {/* Coin icon */}
            <div className="crypto-header-row">
              <div className="crypto-coin-icon" style={{ background: `${coin.color}20`, color: coin.color }}>
                {coin.emoji}
              </div>
              <div>
                <div className="crypto-label">{coin.label}</div>
                <div className={`crypto-trend-inline ${isUp ? 'up' : 'down'}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isUp ? '+' : ''}{change.toFixed(2)}%</span>
                  <span className="crypto-trend-label">24h</span>
                </div>
              </div>
            </div>

            <div className={`crypto-price ${loading ? 'skeleton' : ''}`}>
              {price ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$ --,---'}
            </div>

            {/* Mini sparkline chart */}
            <div className="crypto-chart-area">
              <MiniPriceChart data={chartData} color={coin.color} isUp={isUp} />
            </div>

            {/* Volume indicator bar */}
            <div className="crypto-volume-bar">
              <div className="crypto-volume-fill" style={{
                width: `${Math.min(Math.abs(change) * 10, 100)}%`,
                background: isUp
                  ? 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.1))'
                  : 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(239,68,68,0.1))',
              }} />
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
