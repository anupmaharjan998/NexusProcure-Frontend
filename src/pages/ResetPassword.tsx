// src/pages/ResetPassword.tsx
import {Box, Card, Typography, Alert} from '@mui/material';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useParams, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {Input} from '../components/UI/Input';
import {Button} from '../components/UI/Button';
import {resetPassword} from '../services/authService';

const schema = yup.object({
    password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required('Confirm your password'),
});

export const ResetPassword = () => {
    const {token} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<{ password: string; confirmPassword: string }>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: { password: string; confirmPassword: string }) => {
        setLoading(true);
        setError('');

        try {
            await resetPassword({
                token: token!,
                newPassword: data.password,
            });

            setSuccess('Your password has been reset successfully.');
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
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
                <Typography
                    variant="h4"
                    sx={{textAlign: 'center', mb: 1, fontFamily: 'Inter', fontWeight: 700}}
                >
                    Reset Password
                </Typography>

                <Typography sx={{textAlign: 'center', color: '#64748B', mb: 3, fontFamily: 'Poppins'}}>
                    Enter your new password below.
                </Typography>

                {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 3}}>{success}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{mb: 3}}>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                    </Box>

                    <Box sx={{mb: 3}}>
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm password"
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                        />
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
                        Reset Password
                    </Button>
                </form>
            </Card>
        </Box>
    );
};
