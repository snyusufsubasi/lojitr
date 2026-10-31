import { demoRepository } from './demoRepository';
import { useAuthStore } from './store/authStore';

// For production or live supabase connection, we map through repository.
// Currently demoRepository provides 100% offline, persistent, zero-latency reactive storage.
export function useRepository() {
  const mode = useAuthStore((s) => s.mode);
  return demoRepository;
}
