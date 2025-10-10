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
        if (!user?.role) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
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


