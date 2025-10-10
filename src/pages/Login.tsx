import { Box, Card, Typography, Alert, Link } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth.ts';
import { login } from '../services/authService.ts';
import { LoginCredentials } from '../types/User.ts';

const schema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    setError('');

    try {
      // FOR TESTING: Mock user data (remove when backend is ready)
      // const mockUser = {
      //   id: '1',
      //   name: 'Admin User',
      //   email: data.email,
      //   roleName: 'Admin', // Change to 'Employee', 'Department Head', or 'Procurement Officer' to test different roles
      //   roleId: '1',
      //   departmentId: '1',
      //   departmentName: 'IT Department',
      //   status: 'Active' as const,
      // };
      // const mockToken = 'mock-jwt-token-for-testing';
      // setAuth(mockUser, mockToken);

      // PRODUCTION: Uncomment this when backend is ready
        console.log('Login data');
      const response = await login(data);
      console.log('Login response:', response);
      setAuth(response.user, response.token);
      
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          p: 4,
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color: '#1E293B',
              mb: 1,
            }}
          >
            NexusProcure
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#64748B',
            }}
          >
            Procurement & Inventory Management System
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, fontFamily: 'Poppins, sans-serif' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <Link
              href="#"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: '#0056D2',
                textDecoration: 'none',
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
              py: 1.5,
              fontSize: '16px',
              background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0041A8 0%, #0086C0 100%)',
              },
            }}
          >
            Sign In
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#64748B',
            }}
          >
            © 2024 NexusProcure. All rights reserved.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

