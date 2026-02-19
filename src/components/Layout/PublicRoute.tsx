import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';

export const PublicRoute = () => {
    const {isAuthenticated} = useAuth();
    console.log("ProtectedRoute → isAuthenticated:", isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace/>;
    }

    return <Outlet/>;
};
