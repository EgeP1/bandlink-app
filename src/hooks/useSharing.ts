import { useContext } from 'react';
import { SharingContext } from '../lib/sharingContext';

export function useSharing() {
  const context = useContext(SharingContext);
  if (!context) {
    throw new Error('useSharing must be used within a SharingProvider');
  }
  return context;
}