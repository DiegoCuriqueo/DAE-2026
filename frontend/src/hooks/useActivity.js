import { useState, useCallback } from 'react';

export function useActivity() {
  const [activities, setActivities] = useState([]);

  const addActivity = useCallback((type, message) => {
    setActivities(prev => {
      const next = [{ type, message, time: new Date() }, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  return { activities, addActivity };
}
