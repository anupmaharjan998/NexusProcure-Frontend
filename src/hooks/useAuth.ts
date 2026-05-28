import {useAuthStore} from '../store/authStore.ts';

export const useAuth = () => {
    const {user, token, permissions, isAuthenticated, setAuth, logout, updateUser} = useAuthStore();

    const hasPermission = (required: string | string[]) => {
        if (!permissions.length) return false;

        const norm = permissions.map(p => p.toLowerCase());

        if (Array.isArray(required)) {
            return required.some(r => norm.includes(r.toLowerCase()));
        }
        return norm.includes(required.toLowerCase());
    };

    return {user, token, isAuthenticated, setAuth, logout, updateUser, hasPermission};
};


