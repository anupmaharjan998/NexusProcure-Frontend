import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { User } from '../types/User';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();

    const hasRole = (role: string | string[]): boolean => {
        const current = user?.roleName;
        if (!current) return false;
        const currentNorm = current.toLowerCase();
        if (Array.isArray(role)) {
            return role.some(r => (r || '').toLowerCase() === currentNorm);
        }
        return (role || '').toLowerCase() === currentNorm;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                setAuth,
                logout,
                updateUser,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


