import { useState, useEffect } from 'react';
import { getDailyRewards } from '../lib/rewards';

export function useRewards() {
  const [rewards, setRewards] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<Date>();

  useEffect(() => {
    const loadRewards = async () => {
      const data = await getDailyRewards();
      setRewards(data);
      setLastUpdate(new Date());
    };

    // Load rewards immediately
    loadRewards();

    // Check for reset at GMT 0
    const checkReset = () => {
      const now = new Date();
      const gmtNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      
      if (!lastUpdate || lastUpdate.getUTCDate() !== gmtNow.getUTCDate()) {
        loadRewards();
      }
    };

    // Check every minute for reset
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return rewards;
}