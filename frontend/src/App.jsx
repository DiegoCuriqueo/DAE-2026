import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import MLOpsPage from './pages/MLOpsPage';
import AnalyticsPage from './pages/AnalyticsPage';

import { usePayments } from './hooks/usePayments';
import { useCrypto } from './hooks/useCrypto';
import { useHealth } from './hooks/useHealth';
import { useActivity } from './hooks/useActivity';
import { useSimulator } from './hooks/useSimulator';

export default function App() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const paymentHook = usePayments();
  const crypto = useCrypto();
  const health = useHealth();
  const { activities, addActivity } = useActivity();
  
  const { isSimulating, toggleSimulation } = useSimulator(paymentHook, addActivity);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Layout 
      health={health} 
      searchQuery={searchQuery} 
      onSearch={setSearchQuery}
      isSimulating={isSimulating}
      toggleSimulation={toggleSimulation}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <DashboardPage
              paymentHook={paymentHook}
              crypto={crypto}
              activities={activities}
            />
          } />
          <Route path="/payments" element={
            <PaymentsPage
              paymentHook={paymentHook}
              searchQuery={searchQuery}
              addActivity={addActivity}
            />
          } />
          <Route path="/mlops" element={
            <MLOpsPage
              crypto={crypto}
              addActivity={addActivity}
            />
          } />
          <Route path="/analytics" element={
            <AnalyticsPage
              paymentHook={paymentHook}
              activities={activities}
            />
          } />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

