import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuth } from '../hooks/useAuth.ts';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { updateProfile } from '../services/userService.ts';
import { getInitials } from '../utils/helpers.ts';

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  username: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const Profile = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.fullName || '',
        username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const updatedUser = await updateProfile(data);
      updateAuthUser(updatedUser);
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      // Password change API call would go here
      setSuccess('Password changed successfully');
      resetPassword();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            color: '#1E293B',
            mb: 1,
          }}
        >
          My Profile
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            color: '#64748B',
            mb: 4,
          }}
        >
          View and manage your account information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto',
                    bgcolor: '#0056D2',
                    fontSize: '32px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </Avatar>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    color: '#1E293B',
                    mb: 0.5,
                  }}
                >
                  {user?.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#0056D2',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  {user?.role}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                    <EmailIcon sx={{ color: '#64748B', fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'Poppins, sans-serif', color: '#475569' }}
                    >
                      {user?.email}
                    </Typography>
                  </Box>
                  {user?.username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                      <PhoneIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'Poppins, sans-serif', color: '#475569' }}
                      >
                        {user.username}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                    <BusinessIcon sx={{ color: '#64748B', fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'Poppins, sans-serif', color: '#475569' }}
                    >
                      {user?.departmentName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SecurityIcon sx={{ color: '#64748B', fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'Poppins, sans-serif', color: '#475569' }}
                    >
                      {user?.role}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Edit Profile Form */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                mb: 3,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      color: '#1E293B',
                    }}
                  >
                    Profile Information
                  </Typography>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Input
                        label="Full Name"
                        {...registerProfile('name')}
                        error={!!profileErrors.name}
                        helperText={profileErrors.name?.message}
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Input
                        label="Email"
                        value={user?.email}
                        disabled
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Input
                        label="username"
                        {...registerProfile('username')}
                        error={!!profileErrors.username}
                        helperText={profileErrors.username?.message}
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Input label="Department" value={user?.departmentName} disabled />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" loading={loading}>
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card
              sx={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    color: '#1E293B',
                    mb: 3,
                  }}
                >
                  Change Password
                </Typography>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Input
                        label="Current Password"
                        type="password"
                        {...registerPassword('currentPassword')}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword?.message}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Input
                        label="New Password"
                        type="password"
                        {...registerPassword('newPassword')}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Input
                        label="Confirm New Password"
                        type="password"
                        {...registerPassword('confirmPassword')}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword?.message}
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button type="submit" variant="contained" loading={loading}>
                      Change Password
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};


