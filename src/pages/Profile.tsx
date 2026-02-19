import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Divider,
    Alert, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Button} from '../components/UI/Button';
import {Input} from '../components/UI/Input';
import {useAuth} from '../hooks/useAuth.ts';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {getUserById, updateProfile, uploadProfilePicture} from '../services/userService.ts';
import {changePassword} from '../services/authService.ts';
import {getInitials} from '../utils/helpers.ts';

const profileSchema = yup.object({
    name: yup.string().required('Name is required'),
    username: yup.string(),
    phoneNumber: yup.string(),
    address: yup.string(),
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

function UploadIcon() {
    return null;
}

export const Profile = () => {
    const {user: authUser, updateUser: updateAuthUser} = useAuth();
    const [user, setUser] = useState<any>(authUser);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);


    debugger;
    console.log(user.profileImageUrl);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        reset: resetProfile,
        formState: {errors: profileErrors},
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: '',
            username: '',
            phoneNumber: '',
            address: '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: {errors: passwordErrors},
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    // Load user from API
    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const storedUser = localStorage.getItem('user');
            const userId = storedUser ? JSON.parse(storedUser).id : null;
            if (!userId) throw new Error('User not found');

            const response = await getUserById(userId);
            setUser(response);

            // Populate form
            resetProfile({
                name: response.fullName,
                username: response.username || '',
                phoneNumber: response.phoneNumber || '',
                address: response.address || '',

            });
        } catch (err: any) {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const onProfileSubmit = async (data: any) => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const updatedUser = await updateProfile({...user, ...data});
            setUser(updatedUser);
            updateAuthUser(updatedUser); // Update global auth state
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
            debugger;
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });
            setSuccess('Password changed successfully');
            resetPassword();
        } catch (err: any) {
            debugger;
            // Prevent global logout for password errors
            // Show local error only
            if (err.response?.status === 401) {
                setError('Failed to change password.');
            } else {
                setError(err.response?.data?.message || 'Failed to change password');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleProfilePicUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const imageUrl = await uploadProfilePicture(file);

            const updatedUser = {...user, profileImageUrl: imageUrl};

            // Update states
            setUser(updatedUser);
            updateAuthUser(updatedUser);

            // Fix persistence
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setSuccess("Profile picture updated");
        } catch (err) {
            setError("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h4"
                            sx={{fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#1E293B', mb: 1}}>
                    My Profile
                </Typography>
                <Typography variant="body2" sx={{fontFamily: 'Poppins, sans-serif', color: '#64748B', mb: 4}}>
                    View and manage your account information
                </Typography>

                {error && <Alert severity="error" sx={{mb: 3}} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 3}} onClose={() => setSuccess('')}>{success}</Alert>}

                <Grid container spacing={3}>
                    {/* Profile Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'}}>
                            <CardContent sx={{textAlign: 'center', py: 4}}>
                                <Avatar
                                    src={user?.profileImageUrl || ""}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        margin: "0 auto",
                                        bgcolor: "#0056D2",
                                        fontSize: 32,
                                        fontWeight: 700,
                                        mb: 2,
                                    }}
                                >
                                    {!user?.profileImageUrl && getInitials(user?.fullName)}
                                </Avatar>

                                <input
                                    type="file"
                                    id="profilePicInput"
                                    accept="image/*"
                                    style={{display: 'none'}}
                                    onChange={handleProfilePicUpload}
                                />

                                <Button
                                    component="label"
                                    variant="contained"
                                    disabled={isUploading}
                                    startIcon={
                                        isUploading ? <CircularProgress size={18}/> : <UploadIcon/>
                                    }
                                >
                                    {isUploading ? "Uploading..." : "Upload Picture"}
                                    <input type="file" hidden onChange={handleProfilePicUpload}/>
                                </Button>


                                <Typography variant="h5" sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    mb: 0.5
                                }}>
                                    {user?.fullName}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#0056D2',
                                    fontWeight: 600,
                                    mb: 3
                                }}>
                                    {user?.roleName}
                                </Typography>
                                <Divider sx={{mb: 3}}/>

                                <Box sx={{textAlign: 'left'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 1.5}}>
                                        <EmailIcon sx={{color: '#64748B', fontSize: 20}}/>
                                        <Typography variant="body2" sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#475569'
                                        }}>{user?.email}</Typography>
                                    </Box>
                                    {user?.username && (
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 1.5}}>
                                            <PersonIcon sx={{color: '#64748B', fontSize: 20}}/>
                                            <Typography variant="body2" sx={{
                                                fontFamily: 'Poppins, sans-serif',
                                                color: '#475569'
                                            }}>{user.username}</Typography>
                                        </Box>
                                    )}
                                    {user?.phoneNumber && (
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 1.5}}>
                                            <PhoneIcon sx={{color: '#64748B', fontSize: 20}}/>
                                            <Typography variant="body2" sx={{
                                                fontFamily: 'Poppins, sans-serif',
                                                color: '#475569'
                                            }}>{user.phoneNumber}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 1.5}}>
                                        <BusinessIcon sx={{color: '#64748B', fontSize: 20}}/>
                                        <Typography variant="body2" sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#475569'
                                        }}>{user?.departmentName}</Typography>
                                    </Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                        <SecurityIcon sx={{color: '#64748B', fontSize: 20}}/>
                                        <Typography variant="body2" sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#475569'
                                        }}>{user?.roleName}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Edit Profile Form */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', mb: 3}}>
                            <CardContent>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 700,
                                        color: '#1E293B'
                                    }}>Profile Information</Typography>
                                    {!editMode && <Button variant="outlined" startIcon={<EditIcon/>}
                                                          onClick={() => setEditMode(true)}>Edit</Button>}
                                </Box>

                                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                                    {/*<Grid container spacing={2}>*/}
                                    {/*    <Grid item xs={12} sm={6}>*/}
                                    {/*        <Input*/}
                                    {/*            label="Full Name"*/}
                                    {/*            defaultValue={user?.fullName}*/}
                                    {/*            {...registerProfile("name")}*/}
                                    {/*            error={!!profileErrors.name}*/}
                                    {/*            helperText={profileErrors.name?.message}*/}
                                    {/*        />*/}
                                    {/*    </Grid>*/}

                                    {/*    <Grid item xs={12} sm={6}>*/}
                                    {/*        <Input label="Email" value={user?.email} disabled helperText="Email cannot be changed" />*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item xs={12} sm={6}>*/}
                                    {/*        <Input*/}
                                    {/*            label="Username"*/}
                                    {/*            defaultValue={user?.username}*/}
                                    {/*            {...registerProfile("username")}*/}
                                    {/*            error={!!profileErrors.username}*/}
                                    {/*            helperText={profileErrors.username?.message}*/}
                                    {/*        />*/}
                                    {/*    </Grid>*/}

                                    {/*    <Grid item xs={12} sm={6}>*/}
                                    {/*        <Input label="Department" value={user?.departmentName} disabled helperText="Department cannot be changed"/>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item xs={12} sm={6}>*/}
                                    {/*        <Input*/}
                                    {/*            label="Phone Number"*/}
                                    {/*            defaultValue={user?.phoneNumber}*/}
                                    {/*            {...registerProfile("phoneNumber")}*/}
                                    {/*            error={!!profileErrors.phoneNumber}*/}
                                    {/*            helperText={profileErrors.phoneNumber?.message}*/}
                                    {/*        />*/}
                                    {/*    </Grid>*/}


                                    {/*    <Grid item xs={12}>*/}
                                    {/*        <Input*/}
                                    {/*            label="Address"*/}
                                    {/*            defaultValue={user?.address}*/}
                                    {/*            {...registerProfile("address")}*/}
                                    {/*            error={!!profileErrors.address}*/}
                                    {/*            helperText={profileErrors.address?.message}*/}
                                    {/*        />*/}
                                    {/*    </Grid>*/}


                                    {/*</Grid>*/}

                                    <Grid container spacing={2}>
                                        {/* Full Name - not editable */}
                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Full Name"
                                                value={user?.fullName || ""}
                                                disabled
                                                helperText="Name cannot be changed"
                                            />
                                        </Grid>

                                        {/* Email - not editable */}
                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Email"
                                                value={user?.email || ""}
                                                disabled
                                                helperText="Email cannot be changed"
                                            />
                                        </Grid>

                                        {/* Username - not editable */}
                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Username"
                                                value={user?.username || ""}
                                                disabled
                                                helperText="Username cannot be changed"
                                            />
                                        </Grid>

                                        {/* Department - not editable */}
                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Department"
                                                value={user?.departmentName || ""}
                                                disabled
                                                helperText="Department cannot be changed"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Phone Number"
                                                {...registerProfile("phoneNumber")}
                                                defaultValue={user?.phoneNumber || ""} // <-- use defaultValue instead of value
                                                error={!!profileErrors.phoneNumber}
                                                helperText={profileErrors.phoneNumber?.message}
                                                disabled={!editMode || loading}
                                            />
                                        </Grid>

                                        {/* Address - editable only in edit mode */}
                                        <Grid item xs={12} sm={6}>
                                            <Input
                                                label="Address"
                                                {...registerProfile("address")}
                                                defaultValue={user?.address || ""} // <-- use defaultValue instead of value
                                                error={!!profileErrors.address}
                                                helperText={profileErrors.address?.message}
                                                disabled={!editMode || loading}
                                            />
                                        </Grid>
                                    </Grid>


                                    {editMode && (
                                        <Box sx={{display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end'}}>
                                            <Button variant="outlined" onClick={() => setEditMode(false)}
                                                    disabled={loading}>Cancel</Button>
                                            <Button type="submit" variant="contained" loading={loading}>Save
                                                Changes</Button>
                                        </Box>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        {/* Change Password */}
                        <Card sx={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'}}>
                            <CardContent>
                                <Typography variant="h6" sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    mb: 3
                                }}>Change Password</Typography>

                                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Input label="Current Password"
                                                   type="password" {...registerPassword('currentPassword')}
                                                   error={!!passwordErrors.currentPassword}
                                                   helperText={passwordErrors.currentPassword?.message}
                                                   disabled={loading}/>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Input label="New Password"
                                                   type="password" {...registerPassword('newPassword')}
                                                   error={!!passwordErrors.newPassword}
                                                   helperText={passwordErrors.newPassword?.message} disabled={loading}/>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Input label="Confirm New Password"
                                                   type="password" {...registerPassword('confirmPassword')}
                                                   error={!!passwordErrors.confirmPassword}
                                                   helperText={passwordErrors.confirmPassword?.message}
                                                   disabled={loading}/>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                                        <Button type="submit" variant="contained" loading={loading}>Change
                                            Password</Button>
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
