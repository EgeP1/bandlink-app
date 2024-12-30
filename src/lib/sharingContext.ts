import { createContext, useContext } from 'react';

type SharingContextType = {
  isSharing: boolean;
  setIsSharing: (value: boolean) => void;
};

export const SharingContext = createContext<SharingContextType>({
  isSharing: false,
  setIsSharing: () => {},
});