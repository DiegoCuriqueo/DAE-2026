import { useState, useEffect, useCallback } from 'react';
import { fetchHealth } from '../api/api';

export function useHealth() {
  const [health, setHealth] = useState({ status: 'checking', version: '', database: '' });

  const check = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setHealth({ status: 'online', version: data.version, database: data.database });
    } catch {
      setHealth({ status: 'offline', version: '', database: '' });
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return health;
}
