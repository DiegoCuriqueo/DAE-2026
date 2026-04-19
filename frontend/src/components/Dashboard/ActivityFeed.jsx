import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, Trash2, RefreshCw, Inbox, Clock } from 'lucide-react';

function formatTimeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 5) return 'ahora';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const iconMap = {
  created: CreditCard,
  paid: CheckCircle,
  deleted: Trash2,
  toggled: RefreshCw,
};

const colorMap = {
  created: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.15)' },
  paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.15)' },
  deleted: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.15)' },
  toggled: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.15)' },
};

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="mini-card">
        <div className="mini-card-title">
          <Clock size={14} style={{ opacity: 0.5, marginRight: 6 }} />
          Actividad Reciente
        </div>
        <div className="empty-state">
          <Inbox size={36} strokeWidth={1.2} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
          <p>Sin actividad reciente</p>
          <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.25rem' }}>Las acciones aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-card">
      <div className="mini-card-title">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          🕐 Actividad Reciente
          <span className="activity-count-badge">{activities.length}</span>
        </span>
      </div>
      <div className="activity-feed">
        <AnimatePresence mode="popLayout">
          {activities.map((a, i) => {
            const Icon = iconMap[a.type] || RefreshCw;
            const colors = colorMap[a.type] || colorMap.toggled;

            return (
              <motion.div
                key={`${a.time}-${i}`}
                className="activity-item"
                initial={{ opacity: 0, x: -16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                layout
                style={{ borderLeftColor: colors.border, borderLeftWidth: '2px', borderLeftStyle: 'solid' }}
              >
                <div
                  className="activity-icon"
                  style={{ background: colors.bg, color: colors.color }}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </div>
                <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.message }} />
                <span className="activity-time">{formatTimeAgo(a.time)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
