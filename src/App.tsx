import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { PublicRoute } from './components/Layout/PublicRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Roles } from './pages/Roles';
import { Departments } from './pages/Departments';
import { Profile } from './pages/Profile';
import { Permissions } from './pages/Permissions';
import { ForgetPassword } from './pages/ForgetPassword';
import { ResetPassword } from './pages/ResetPassword';

// Create Material-UI theme with NexusProcure design system
const theme = createTheme({
    palette: {
        primary: {
            main: '#0056D2',
            dark: '#0041A8',
        },
        secondary: {
            main: '#00A8E8',
        },
        error: {
            main: '#E63946',
        },
        success: {
            main: '#2ECC71',
        },
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E293B',
            secondary: '#475569',
        },
    },
    typography: {
        fontFamily: 'Poppins, sans-serif',
        h1: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h3: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h4: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h5: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h6: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route element={<PublicRoute />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/forget-password" element={<ForgetPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />

                        </Route>

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <Users />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/roles"
                            element={
                                <ProtectedRoute>
                                    <Roles />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/permissions"
                            element={
                                <ProtectedRoute>
                                    <Permissions />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/departments"
                            element={
                                <ProtectedRoute>
                                    <Departments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;


