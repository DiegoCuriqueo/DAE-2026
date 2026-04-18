import { useState } from 'react';
import { motion } from 'framer-motion';
import CryptoChart from '../components/MLOps/CryptoChart';
import PredictionPanel from '../components/MLOps/PredictionPanel';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export default function MLOpsPage({ crypto, addActivity }) {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.section
        className="ai-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <span>🤖</span> AI Predicción de Criptomonedas
          </div>
          <span className="ai-panel-subtitle">Motor de predicción basado en Regresión Lineal</span>
        </div>
        <div className="ai-panel-body">
          <CryptoChart
            historical={crypto.historical}
            selectedCoin={selectedCoin}
            onCoinChange={setSelectedCoin}
          />
          <PredictionPanel
            historical={crypto.historical}
            onActivity={addActivity}
          />
        </div>
      </motion.section>

      <div className="mlops-info-grid">
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="info-card-icon">📡</div>
          <h3>Datos en Tiempo Real</h3>
          <p>Los precios se obtienen de la API de CoinGecko con actualización cada 2 minutos para análisis preciso.</p>
        </motion.div>
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="info-card-icon">🧠</div>
          <h3>Regresión Lineal</h3>
          <p>El modelo analiza tendencias de 7 días usando sklearn LinearRegression para calcular slope y growth rate.</p>
        </motion.div>
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="info-card-icon">⚡</div>
          <h3>Procesamiento MLOps</h3>
          <p>El backend FastAPI procesa las predicciones de forma asíncrona con logging completo de auditoría.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
