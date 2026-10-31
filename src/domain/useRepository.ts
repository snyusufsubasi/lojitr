import { demoRepository } from './demoRepository';
import { useAuthStore } from './store/authStore';

export function useRepository() {
  const mode = useAuthStore((s) => s.mode);
  return demoRepository;
}
