import { useAuthStore } from '../lib/auth/authStore';

export function useUser() {
  const { session, loading } = useAuthStore();
  return { user: session?.user ?? null, loading };
}