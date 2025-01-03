import React, { useEffect } from 'react';
import { useAuthStore } from '../lib/auth/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}