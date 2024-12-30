import { useState, useEffect } from 'react';

const CONSENT_KEY = 'bandlink_cpu_consent';

export function useCPUConsent() {
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'true';
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!hasConsent) {
      setShowModal(true);
    }
  }, [hasConsent]);

  const acceptConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setHasConsent(true);
    setShowModal(false);
  };

  const declineConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'false');
    setHasConsent(false);
    setShowModal(false);
  };

  return {
    hasConsent,
    showModal,
    acceptConsent,
    declineConsent
  };
}