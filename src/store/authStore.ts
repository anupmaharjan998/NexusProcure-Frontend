import { create } from 'zustand';
import { User } from '../types/User.ts';

interface AuthState {
    user: User | null;
    token: string | null;
    permissions: string[];

    // computed
    isAuthenticated: boolean;

    setAuth: (user: User, token: string, permissions: string[]) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: (() => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return null;

            const parsed: any = JSON.parse(raw);
            parsed.roleName = parsed.roleName || parsed.role?.name || '';
            return parsed as User;
        } catch {
            return null;
        }
    })(),

    token: localStorage.getItem('token'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),

    // Remove the getter here and instead compute dynamically in useAuth
    get isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    setAuth: (user: User, token: string, permissions: string[]) => {
        const normalized: User = {
            ...user,
            roleName: (user as any).roleName || (user as any).role?.name || ''
        };

        localStorage.setItem('user', JSON.stringify(normalized));
        localStorage.setItem('token', token);
        localStorage.setItem('permissions', JSON.stringify(permissions));

        set({
            user: normalized,
            token,
            permissions,
        });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');

        set({
            user: null,
            token: null,
            permissions: [],
        });
    },

    updateUser: (user: User) => {
        const normalized: User = {
            ...user,
            roleName: (user as any).roleName || (user as any).role?.name || ''
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        set({ user: normalized });
    }
}));
