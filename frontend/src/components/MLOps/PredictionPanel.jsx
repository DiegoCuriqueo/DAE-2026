import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, TrendingUp } from 'lucide-react';
import { fetchPrediction } from '../../api/api';

export default function PredictionPanel({ historical, onActivity }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const payload = ['bitcoin', 'ethereum', 'solana'].map(id => ({
        id,
        prices: historical[id] || [],
      }));
      const result = await fetchPrediction(payload);
      setPrediction(result);
      onActivity?.('created', `🤖 IA predice: <strong>${result.best_asset.toUpperCase()}</strong> (${(result.growth_rate * 100).toFixed(2)}%)`);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <AnimatePresence>
        {prediction && (
          <motion.div
            className="prediction-result visible"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="prediction-result-label">
              <Brain size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
              IA Sugiere Invertir en:
            </div>
            <div className="prediction-result-asset">
              {prediction.best_asset.toUpperCase()}
            </div>
            <div className="prediction-result-details">
              <div className="pred-detail">
                <TrendingUp size={14} />
                <span>Crecimiento: {(prediction.growth_rate * 100).toFixed(4)}%</span>
              </div>
              <div className="pred-detail">
                <Zap size={14} />
                <span>Slope: {prediction.confidence_slope.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="btn-predict"
        onClick={handlePredict}
        disabled={loading}
      >
        {loading ? (
          <span className="predict-loading">
            <span className="spinner" />
            Analizando con MLOps...
          </span>
        ) : (
          <>
            <Zap size={16} />
            Ejecutar MLOps Predictor
          </>
        )}
      </button>
    </motion.div>
  );
}
