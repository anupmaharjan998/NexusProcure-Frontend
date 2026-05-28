import {
    Box,
    Grid,
    MenuItem,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Divider,
    Paper,
    Stack,
    Chip,
    InputAdornment,
    FormHelperText,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {Input} from '../UI/Input.tsx';
import {Button} from '../UI/Button.tsx';
import {Modal} from '../UI/Modal.tsx';
import {User, UserFormData} from '../../types/User.ts';
import {Role} from '../../types/Role.ts';
import {Department} from '../../types/Department.ts';
import {useEffect, useState} from 'react';
import {checkUsernameExists} from '../../services/userService.ts';

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Name is required')
        .matches(/.*\S.*/, 'Please enter a name')
        .max(100, 'Name cannot exceed 100 characters'),

    email: yup
        .string()
        .email('Invalid email')
        .required('Email is required'),

    username: yup
        .string()
        .trim()
        .required('Username is required')
        .matches(/.*\S.*/, 'Please enter a username')
        .matches(
            /^[a-zA-Z0-9._-]+$/,
            'Username can only contain letters, numbers, dots, underscores, and hyphens'
        )
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters'),

    roleId: yup.string().required('Role is required'),
    departmentId: yup.string().required('Department is required'),
    isActive: yup.boolean().required('Status is required'),
});

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    user?: User;
    roles: Role[];
    departments: Department[];
    loading?: boolean;
}

export const UserForm = ({
                             open,
                             onClose,
                             onSubmit,
                             user,
                             roles,
                             departments,
                             loading = false,
                         }: UserFormProps) => {
    const isEdit = !!user;

    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        clearErrors,
        formState: {errors, isValid},
    } = useForm<UserFormData>({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            username: '',
            roleId: '',
            departmentId: '',
            isActive: true,
        },
    });

    const watchedName = watch('name');
    const watchedUsername = watch('username');
    const watchedRoleId = watch('roleId');
    const watchedDepartmentId = watch('departmentId');
    const watchedIsActive = watch('isActive');

    useEffect(() => {
        if (user) {
            reset({
                name: user.fullName,
                email: user.email,
                username: user.username || '',
                roleId: user.roleId,
                departmentId: user.departmentId,
                isActive: user.isActive,
            });
            setUsernameAvailable(null);
        } else {
            reset({
                name: '',
                email: '',
                username: '',
                roleId: '',
                departmentId: '',
                isActive: true,
            });
            setUsernameAvailable(null);
        }
    }, [user, reset]);

    useEffect(() => {
        const username = watchedUsername?.trim();

        if (!open) return;

        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        if (isEdit && username === user?.username) {
            clearErrors('username');
            setUsernameAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setCheckingUsername(true);

                const exists = await checkUsernameExists(username, user?.id);

                if (exists) {
                    setUsernameAvailable(false);
                    setError('username', {
                        type: 'manual',
                        message: 'Username already exists',
                    });
                } else {
                    setUsernameAvailable(true);
                    clearErrors('username');
                }
            } catch {
                setUsernameAvailable(null);
                setError('username', {
                    type: 'manual',
                    message: 'Could not verify username availability',
                });
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [watchedUsername, open, isEdit, user?.id, user?.username, setError, clearErrors]);

    const handleFormSubmit = async (data: UserFormData) => {
        if (usernameAvailable === false) {
            setError('username', {
                type: 'manual',
                message: 'Username already exists',
            });
            return;
        }

        await onSubmit(data);
        reset();
        setUsernameAvailable(null);
    };

    const handleClose = () => {
        reset();
        setUsernameAvailable(null);
        onClose();
    };

    const selectedRole = roles.find((r) => r.id === watchedRoleId);
    const selectedDepartment = departments.find((d) => d.id === watchedDepartmentId);

    const usernameHelperText =
        errors.username?.message ||
        (checkingUsername
            ? 'Checking username availability...'
            : usernameAvailable === true
                ? 'Username is available'
                : 'Username must be unique');

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? 'Edit User' : 'Add New User'}
            maxWidth="md"
            actions={
                <>
                    <Button variant="outlined" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit(handleFormSubmit)}
                        loading={loading}
                        disabled={!isValid || loading || checkingUsername || usernameAvailable === false}
                        sx={{
                            minWidth: 140,
                            background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                        }}
                    >
                        {isEdit ? 'Save Changes' : 'Create User'}
                    </Button>
                </>
            }
        >
            <form>
                <Stack spacing={3} sx={{mt: 1}}>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#64748B',
                                fontFamily: 'Poppins, sans-serif',
                                mb: 2,
                            }}
                        >
                            {isEdit
                                ? 'Update the user details, assignment, and account status.'
                                : 'Create a new user account and assign their role and department.'}
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                borderColor: '#E2E8F0',
                                bgcolor: '#FFFFFF',
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    mb: 2,
                                }}
                            >
                                Basic Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter full name"
                                        {...register('name')}
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonOutlineIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="Enter email address"
                                        {...register('email')}
                                        error={!!errors.email}
                                        helperText={
                                            errors.email?.message ||
                                            (isEdit
                                                ? 'Email cannot be changed after user creation'
                                                : 'Used for login and communication')
                                        }
                                        disabled={loading || isEdit}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AlternateEmailIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Input
                                        label="Username"
                                        placeholder="Enter username"
                                        {...register('username')}
                                        error={!!errors.username}
                                        helperText={usernameHelperText}
                                        disabled={loading}
                                        FormHelperTextProps={{
                                            sx: {
                                                color:
                                                    errors.username
                                                        ? '#D32F2F'
                                                        : usernameAvailable === true
                                                            ? '#2E7D32'
                                                            : undefined,
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeOutlinedIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    <Divider />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: '#1E293B',
                                mb: 2,
                            }}
                        >
                            Access & Assignment
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="roleId"
                                    control={control}
                                    render={({field}) => (
                                        <Input
                                            {...field}
                                            select
                                            label="Role"
                                            error={!!errors.roleId}
                                            helperText={
                                                errors.roleId?.message ||
                                                'Select the access level for this user'
                                            }
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <InfoOutlinedIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {roles.map((role) => (
                                                <MenuItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </MenuItem>
                                            ))}
                                        </Input>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="departmentId"
                                    control={control}
                                    render={({field}) => (
                                        <Input
                                            {...field}
                                            select
                                            label="Department"
                                            error={!!errors.departmentId}
                                            helperText={
                                                errors.departmentId?.message ||
                                                'Choose the department this user belongs to'
                                            }
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ApartmentOutlinedIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {departments.map((dept) => (
                                                <MenuItem key={dept.id} value={dept.id}>
                                                    {dept.departmentName}
                                                </MenuItem>
                                            ))}
                                        </Input>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({field}) => (
                                        <FormControl
                                            component="fieldset"
                                            disabled={loading}
                                            error={!!errors.isActive}
                                            sx={{
                                                width: '100%',
                                                p: 2,
                                                border: '1px solid #E2E8F0',
                                                borderRadius: 3,
                                                bgcolor: '#F8FAFC',
                                            }}
                                        >
                                            <FormLabel
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    fontWeight: 600,
                                                    color: '#334155',
                                                    mb: 1,
                                                }}
                                            >
                                                <ToggleOnOutlinedIcon fontSize="small" />
                                                Account Status
                                            </FormLabel>

                                            <RadioGroup
                                                row
                                                value={field.value ? 'true' : 'false'}
                                                onChange={(e) => field.onChange(e.target.value === 'true')}
                                                sx={{gap: 2}}
                                            >
                                                <FormControlLabel
                                                    value="true"
                                                    control={<Radio />}
                                                    label="Active"
                                                />
                                                <FormControlLabel
                                                    value="false"
                                                    control={<Radio />}
                                                    label="Inactive"
                                                />
                                            </RadioGroup>

                                            <FormHelperText sx={{mt: 0.5}}>
                                                {errors.isActive?.message ||
                                                    'Inactive users will not be able to use the system'}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {!!watchedName?.trim() && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: '#F8FAFC',
                                borderColor: '#E2E8F0',
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{fontWeight: 700, color: '#334155', mb: 1.25}}
                            >
                                Preview
                            </Typography>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip label={watchedName.trim()} color="primary" />

                                {selectedRole && (
                                    <Chip label={selectedRole.name} variant="outlined" />
                                )}

                                {selectedDepartment && (
                                    <Chip
                                        label={selectedDepartment.departmentName}
                                        variant="outlined"
                                    />
                                )}

                                <Chip
                                    label={watchedIsActive ? 'Active' : 'Inactive'}
                                    color={watchedIsActive ? 'success' : 'default'}
                                    variant={watchedIsActive ? 'filled' : 'outlined'}
                                />
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </form>
        </Modal>
    );
};