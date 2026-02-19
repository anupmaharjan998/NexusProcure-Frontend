import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth.ts';
import {ReactNode} from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
}

export const ProtectedRoute = ({children, requiredRoles}: ProtectedRouteProps) => {
    const {isAuthenticated, hasPermission} = useAuth();
    const location = useLocation();

    // FOR TESTING: Comment this out to bypass authentication
    // PRODUCTION: Uncomment this for real authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => hasPermission(role));
        if (!hasRequiredRole) {
            return <Navigate to="/dashboard" replace/>;
        }
    }

    return <>{children}</>;
};

