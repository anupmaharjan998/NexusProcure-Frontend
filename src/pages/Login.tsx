import {
    Box,
    Card,
    Typography,
    Alert,
    Link,
    InputAdornment,
    IconButton,
    Stack,
    Divider,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {Input} from '../components/UI/Input';
import {Button} from '../components/UI/Button';
import {useAuth} from '../hooks/useAuth.ts';
import {login} from '../services/authService.ts';
import {LoginCredentials} from '../types/User.ts';

const schema = yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
    const {setAuth} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginCredentials>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: LoginCredentials) => {
        setLoading(true);
        setError('');

        try {
            const response = await login(data);

            const userWithRoleAndPermissions = {
                ...response.user,
                roleName: response.roleName || response.user.roleName,
            };

            setAuth(userWithRoleAndPermissions, response.token, response.permissions);

            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, {replace: true});
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: {xs: '1fr', md: '1.15fr 0.85fr'},
                background: `
                    radial-gradient(circle at 15% 20%, rgba(0,168,232,0.18) 0%, transparent 24%),
                    radial-gradient(circle at 80% 75%, rgba(0,86,210,0.20) 0%, transparent 26%),
                    linear-gradient(135deg, #020817 0%, #0F172A 38%, #0B3B75 100%)
                `,
            }}
        >
            {/* Decorative glow orbs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -140,
                    left: -100,
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    background: 'rgba(0,168,232,0.16)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -120,
                    right: -80,
                    width: 360,
                    height: 360,
                    borderRadius: '50%',
                    background: 'rgba(0,86,210,0.18)',
                    filter: 'blur(70px)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: '38%',
                    left: '42%',
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    filter: 'blur(45px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Left panel */}
            <Box
                sx={{
                    position: 'relative',
                    display: {xs: 'none', md: 'flex'},
                    flexDirection: 'column',
                    justifyContent: 'center',
                    px: {md: 7, lg: 10},
                    py: 8,
                    zIndex: 1,
                }}
            >
                {/* subtle watermark logo */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.07,
                        pointerEvents: 'none',
                    }}
                >
                    <Box
                        component="img"
                        src="/Logo.png"
                        alt="Background logo"
                        sx={{
                            width: '62%',
                            maxWidth: 520,
                            objectFit: 'contain',
                            transform: 'rotate(-12deg)',
                            filter: 'grayscale(100%) blur(1px)',
                        }}
                    />
                </Box>

                <Box sx={{position: 'relative', zIndex: 2, maxWidth: 560}}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 4}}>
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.16)',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
                            }}
                        >
                            <Box
                                component="img"
                                src="/Logo.png"
                                alt="NexusProcure Logo"
                                sx={{
                                    width: 38,
                                    height: 38,
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 800,
                                    fontSize: 30,
                                    color: '#FFFFFF',
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                NexusProcure
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.72)',
                                    mt: 0.6,
                                }}
                            >
                                Internal Procurement & Inventory System
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 800,
                            fontSize: {md: 38, lg: 50},
                            lineHeight: 1.06,
                            color: '#FFFFFF',
                            letterSpacing: '-0.04em',
                            mb: 2,
                        }}
                    >
                        Elegant control
                        <br />
                        for internal operations
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 16,
                            lineHeight: 1.9,
                            color: 'rgba(255,255,255,0.75)',
                            maxWidth: 520,
                            mb: 4,
                        }}
                    >
                        Manage procurement, approvals, departments, and inventory workflows through a
                        secure, centralized internal portal designed for organizational use.
                    </Typography>

                    <Stack spacing={2.2}>
                        {[
                            {
                                icon: <SecurityOutlinedIcon fontSize="small" />,
                                title: 'Secure internal access',
                                desc: 'Restricted to authorized users with role-based permissions.',
                            },
                            {
                                icon: <ApartmentOutlinedIcon fontSize="small" />,
                                title: 'Department-centered workflow',
                                desc: 'Support approvals, requests, and visibility across teams.',
                            },
                            {
                                icon: <Inventory2OutlinedIcon fontSize="small" />,
                                title: 'Operational inventory oversight',
                                desc: 'Track procurement activities and inventory movement clearly.',
                            },
                        ].map((item) => (
                            <Box
                                key={item.title}
                                sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'flex-start',
                                    p: 2,
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    backdropFilter: 'blur(12px)',
                                    maxWidth: 470,
                                    boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                        color: '#FFFFFF',
                                        mt: 0.2,
                                        flexShrink: 0,
                                        boxShadow: '0 10px 24px rgba(0, 86, 210, 0.24)',
                                    }}
                                >
                                    {item.icon}
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 700,
                                            fontSize: 14.5,
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: 13,
                                            color: 'rgba(255,255,255,0.72)',
                                            mt: 0.4,
                                            lineHeight: 1.75,
                                        }}
                                    >
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* Right panel */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: {xs: 4, md: 6},
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 470,
                        p: {xs: 3, sm: 4.5},
                        borderRadius: '30px',
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        backdropFilter: 'blur(22px)',
                        boxShadow: '0 28px 80px rgba(0,0,0,0.30)',
                    }}
                >
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <Box
                            sx={{
                                width: 78,
                                height: 78,
                                mx: 'auto',
                                mb: 2.2,
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 16px 36px rgba(0, 86, 210, 0.30)',
                            }}
                        >
                            <Box
                                component="img"
                                src="/Logo.png"
                                alt="NexusProcure Logo"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    objectFit: 'contain',
                                    filter: 'brightness(0) invert(1)',
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 800,
                                color: '#FFFFFF',
                                mb: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            Sign in
                        </Typography>

                        <Typography
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 14,
                                color: 'rgba(255,255,255,0.72)',
                                lineHeight: 1.8,
                                maxWidth: 320,
                                mx: 'auto',
                            }}
                        >
                            Access your internal workspace using your organization credentials.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2.5,
                                fontFamily: 'Poppins, sans-serif',
                                backgroundColor: 'rgba(255,255,255,0.92)',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ mb: 2.25 }}>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your work email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                disabled={loading}
                                InputLabelProps={{
                                    sx: {
                                        color: '#FFFFFF !important',
                                        '&.Mui-focused': {
                                            color: '#FFFFFF !important',
                                        },
                                        '&.MuiFormLabel-filled': {
                                            color: '#FFFFFF !important',
                                        },
                                    },
                                }}
                                InputProps={{
                                    sx: {
                                        color: '#FFFFFF',
                                    },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MailOutlineIcon sx={{ color: 'rgba(255,255,255,0.72)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& label': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& label.Mui-focused': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& label.MuiFormLabel-filled': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#FFFFFF',
                                    },
                                    '& input': {
                                        color: '#FFFFFF',
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255,255,255,0.50)',
                                        opacity: 1,
                                    },
                                    '& input:-webkit-autofill': {
                                        WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.08) inset',
                                        WebkitTextFillColor: '#FFFFFF',
                                        caretColor: '#FFFFFF',
                                        borderRadius: 'inherit',
                                        transition: 'background-color 5000s ease-in-out 0s',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: 2.5,
                                        '& fieldset': {
                                            borderColor: 'rgba(255,255,255,0.20)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255,255,255,0.35)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#00A8E8',
                                        },
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: errors.email ? '#FCA5A5' : 'rgba(255,255,255,0.60)',
                                        ml: 0.5,
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                disabled={loading}
                                InputLabelProps={{
                                    sx: {
                                        color: '#FFFFFF !important',
                                        '&.Mui-focused': {
                                            color: '#FFFFFF !important',
                                        },
                                        '&.MuiFormLabel-filled': {
                                            color: '#FFFFFF !important',
                                        },
                                    },
                                }}
                                InputProps={{
                                    sx: {
                                        color: '#FFFFFF',
                                    },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.72)' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                                tabIndex={-1}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.72)',
                                                }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOffOutlinedIcon />
                                                ) : (
                                                    <VisibilityOutlinedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& label': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& label.Mui-focused': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& label.MuiFormLabel-filled': {
                                        color: '#FFFFFF !important',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#FFFFFF',
                                    },
                                    '& input': {
                                        color: '#FFFFFF',
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255,255,255,0.50)',
                                        opacity: 1,
                                    },
                                    '& input:-webkit-autofill': {
                                        WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.08) inset',
                                        WebkitTextFillColor: '#FFFFFF',
                                        caretColor: '#FFFFFF',
                                        borderRadius: 'inherit',
                                        transition: 'background-color 5000s ease-in-out 0s',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: 2.5,
                                        '& fieldset': {
                                            borderColor: 'rgba(255,255,255,0.20)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255,255,255,0.35)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#00A8E8',
                                        },
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: errors.password ? '#FCA5A5' : 'rgba(255,255,255,0.60)',
                                        ml: 0.5,
                                    },
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                mt: 0.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 12.5,
                                    color: 'rgba(255,255,255,0.58)',
                                }}
                            >
                                Authorized personnel only
                            </Typography>

                            <Link
                                component="button"
                                type="button"
                                onClick={() => navigate('/forget-password')}
                                sx={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 14,
                                    color: '#7DD3FC',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            loading={loading}
                            sx={{
                                py: 1.6,
                                fontSize: 15.5,
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                boxShadow: '0 14px 28px rgba(0, 86, 210, 0.28)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #0049B2 0%, #0092CC 100%)',
                                },
                            }}
                        >
                            Sign In
                        </Button>
                    </form>

                    <Divider
                        sx={{
                            my: 3,
                            borderColor: 'rgba(255,255,255,0.10)',
                        }}
                    />

                    <Box sx={{textAlign: 'center'}}>
                        <Typography
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                color: 'rgba(255,255,255,0.56)',
                                fontSize: 12.5,
                                lineHeight: 1.7,
                            }}
                        >
                            Internal organization system
                            <br />
                            © 2026 NexusProcure. All rights reserved.
                        </Typography>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
};