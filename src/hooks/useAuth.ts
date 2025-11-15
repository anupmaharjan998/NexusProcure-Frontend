import { useAuthStore } from '../store/authStore.ts';
import { ROLE_TYPES } from '../types/Role.ts';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();

  const hasRole = (role: string | string[]) => {
    const current = (user as any)?.roleName || (user as any)?.role || (user as any)?.role?.name;
    if (!current) return false;
    const currentNorm = String(current).toLowerCase();
    if (Array.isArray(role)) {
      return role.some(r => (r || '').toLowerCase() === currentNorm);
    }
    return (role || '').toLowerCase() === currentNorm;
  };

  return { user, token, isAuthenticated, setAuth, logout, updateUser, hasRole };
};


