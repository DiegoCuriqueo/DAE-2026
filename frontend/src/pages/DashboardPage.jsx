import { motion } from 'framer-motion';
import StatCards from '../components/Dashboard/StatCards';
import CryptoCards from '../components/Dashboard/CryptoCards';
import DonutChart from '../components/Analytics/DonutChart';
import ServiceChart from '../components/Analytics/ServiceChart';
import ActivityFeed from '../components/Dashboard/ActivityFeed';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export default function DashboardPage({ paymentHook, crypto, activities }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <StatCards stats={paymentHook.stats} loading={paymentHook.loading} />
      <CryptoCards prices={crypto.prices} historical={crypto.historical} loading={crypto.loading} />
      <div className="payment-chart-section">
        <DonutChart
          paidCount={paymentHook.stats.paidCount}
          pendingCount={paymentHook.stats.pendingCount}
        />
        <ServiceChart payments={paymentHook.payments} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <ActivityFeed activities={activities} />
      </div>
    </motion.div>
  );
}
