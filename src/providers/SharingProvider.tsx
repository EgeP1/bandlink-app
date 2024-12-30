import React, { useState, useEffect } from 'react';
import { SharingContext } from '../lib/sharingContext';

export function SharingProvider({ children }: { children: React.ReactNode }) {
  const [isSharing, setIsSharing] = useState(() => {
    // Restore sharing state from localStorage
    const stored = localStorage.getItem('isSharing');
    return stored === 'true';
  });

  // Persist sharing state
  useEffect(() => {
    localStorage.setItem('isSharing', isSharing.toString());
  }, [isSharing]);

  return (
    <SharingContext.Provider value={{ isSharing, setIsSharing }}>
      {children}
    </SharingContext.Provider>
  );
}