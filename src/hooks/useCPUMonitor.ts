import { useEffect } from 'react';
import { CPUMonitor } from '../lib/cpu/monitor';
import { useUser } from './useUser';
import { useSharing } from './useSharing';

export function useCPUMonitor() {
  const { user } = useUser();
  const { isSharing } = useSharing();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const monitor = new CPUMonitor(user.id);
    
    if (isSharing) {
      monitor.start();
    }
    
    return () => {
      monitor.stop();
    };
  }, [user?.id, isSharing]);
}