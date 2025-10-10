import { useAuthStore } from '../store/authStore.ts';
import { ROLE_TYPES } from '../types/Role.ts';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();

  const hasRole = (role: string) => {
    if (!user) return false;
    // Accept either direct string or one of ROLE_TYPES constants
    return user.role === role;
  };

  return { user, token, isAuthenticated, setAuth, logout, updateUser, hasRole };
};


