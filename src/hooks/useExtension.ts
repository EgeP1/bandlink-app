import { useState, useEffect } from 'react';
import { checkExtensionInstalled } from '../lib/extension/detector';
import type { ExtensionStatus } from '../lib/extension/types';

export function useExtension() {
  const [status, setStatus] = useState<ExtensionStatus>({
    installed: false,
    version: null
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkExtension = async () => {
      try {
        const result = await checkExtensionInstalled();
        setStatus(result);
      } catch (error) {
        console.error('Error checking extension:', error);
      } finally {
        setChecking(false);
      }
    };

    checkExtension();
    
    // Recheck periodically
    const interval = setInterval(checkExtension, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status, checking };
}