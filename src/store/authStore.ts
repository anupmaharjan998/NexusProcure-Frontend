import { create } from 'zustand';
import { User } from '../types/User.ts';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed: any = JSON.parse(raw);
      if (parsed && !parsed.roleName) {
        parsed.roleName = parsed.roleName || parsed.role || parsed.role?.name || '';
      }
      return parsed as User;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (user: User, token: string) => {
    const normalized: User = { ...user, roleName: (user as any).roleName || (user as any).role || (user as any).role?.name } as User;
    localStorage.setItem('user', JSON.stringify(normalized));
    localStorage.setItem('token', token);
    set({ user: normalized, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (user: User) => {
    const normalized: User = { ...user, roleName: (user as any).roleName || (user as any).role || (user as any).role?.name } as User;
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized });
  },
}));


