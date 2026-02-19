import {createContext, useContext, ReactNode} from 'react';
import {useAuthStore} from '../store/authStore';
import {User} from '../types/User';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string, permissions: string[]) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    hasPermission: (permission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const {user, token, isAuthenticated, setAuth, logout, updateUser} = useAuthStore();

    const hasPermission = (required: string | string[]) => {
        const perms = user?.permissions || [];
        if (!perms.length) return false;

        const lowerPerms = perms.map((p: string) => p.toLowerCase());

        if (Array.isArray(required)) {
            return required.some(r => lowerPerms.includes(r.toLowerCase()));
        }

        return lowerPerms.includes(required.toLowerCase());
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
                hasPermission,
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


