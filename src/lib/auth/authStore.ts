import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, loading: false });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
  setSession: (session) => set({ session })
}));