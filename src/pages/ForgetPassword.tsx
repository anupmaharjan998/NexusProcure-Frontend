// src/pages/ForgetPassword.tsx
import {Box, Card, Typography, Alert} from '@mui/material';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useState} from 'react';
import {Input} from '../components/UI/Input';
import {Button} from '../components/UI/Button';
import {sendResetEmail} from '../services/authService';

const schema = yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
});

export const ForgetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<{ email: string }>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: { email: string }) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await sendResetEmail(data.email);
            setMessage('A password reset link has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong.');
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
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 450,
                    width: '100%',
                    p: 4,
                    borderRadius: '16px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                }}
            >
                <Box sx={{textAlign: 'center', mb: 3}}>
                    <Typography
                        variant="h4"
                        sx={{fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#1E293B'}}
                    >
                        Forgot Password
                    </Typography>
                    <Typography sx={{color: '#64748B', fontFamily: 'Poppins'}}>
                        Enter your email and we will send you a reset link.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
                {message && <Alert severity="success" sx={{mb: 3}}>{message}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{mb: 3}}>
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

                    <Button
                        type="submit"
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
                        Send Reset Link
                    </Button>
                </form>
            </Card>
        </Box>
    );
};
