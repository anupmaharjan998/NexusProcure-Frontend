import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth.ts';
import {ReactNode} from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    permissions?: string[];
}

export const ProtectedRoute = ({
                                   children,
                                   permissions = [],
                               }: ProtectedRouteProps) => {
    const {isAuthenticated, hasPermission} = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace />;
    }

    const hasAccess =
        permissions.length === 0 ||
        permissions.includes('PUBLIC') ||
        hasPermission(permissions);

    if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};