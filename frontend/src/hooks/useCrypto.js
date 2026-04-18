import { useState, useEffect, useCallback } from 'react';
import { fetchLivePrices, fetchHistoricalPrices } from '../api/api';

export function useCrypto() {
  const [prices, setPrices] = useState({});
  const [historical, setHistorical] = useState({});
  const [loading, setLoading] = useState(true);

  const loadPrices = useCallback(async () => {
    try {
      const data = await fetchLivePrices();
      setPrices(data);
    } catch (err) {
      console.error('Error fetching prices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistorical = useCallback(async (coinId) => {
    try {
      const data = await fetchHistoricalPrices(coinId);
      setHistorical(prev => ({ ...prev, [coinId]: data }));
      return data;
    } catch (err) {
      console.error(`Error fetching historical for ${coinId}:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadPrices();
    loadHistorical('bitcoin');
    loadHistorical('ethereum');
    loadHistorical('solana');

    const interval = setInterval(loadPrices, 120000);
    return () => clearInterval(interval);
  }, [loadPrices, loadHistorical]);

  return { prices, historical, loading, loadHistorical, refreshPrices: loadPrices };
}
