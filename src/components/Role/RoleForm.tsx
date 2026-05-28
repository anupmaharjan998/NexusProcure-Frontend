import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import { Role, RoleFormData } from '../../types/Role.ts';
import { Permission } from '../../types/Permission.ts';
import { checkRoleNameExists } from '../../services/roleService.ts';

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Role name is required')
        .matches(/.*\S.*/, 'Please enter a role name')
        .max(50, 'Role name cannot exceed 50 characters'),
    description: yup
        .string()
        .max(250, 'Description cannot exceed 250 characters'),
});

interface RoleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormData) => Promise<void>;
    role?: Role;
    permissions: Permission[];
    loading?: boolean;
}

export const RoleForm = ({
                             open,
                             onClose,
                             onSubmit,
                             role,
                             permissions,
                             loading = false,
                         }: RoleFormProps) => {
    const isEdit = Boolean(role);

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [formError, setFormError] = useState('');
    const [checkingRoleName, setCheckingRoleName] = useState(false);
    const [roleNameAvailable, setRoleNameAvailable] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        clearErrors,
        formState: { errors, isValid },
    } = useForm<RoleFormData>({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const roleName = watch('name');
    const description = watch('description');

    useEffect(() => {
        if (!open) return;

        if (role) {
            reset({
                name: role.name || '',
                description: role.description || '',
            });

            setSelectedPermissions(role.permissions?.map((permission) => permission.id) || []);
        } else {
            reset({
                name: '',
                description: '',
            });

            setSelectedPermissions([]);
        }

        setFormError('');
        setRoleNameAvailable(null);
    }, [open, role, reset]);

    useEffect(() => {
        const name = roleName?.trim();

        if (!open) return;

        if (!name || name.length < 2) {
            setRoleNameAvailable(null);
            return;
        }

        if (isEdit && name.toLowerCase() === role?.name?.trim().toLowerCase()) {
            clearErrors('name');
            setRoleNameAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setCheckingRoleName(true);

                const exists = await checkRoleNameExists(name, role?.id);

                if (exists) {
                    setRoleNameAvailable(false);
                    setError('name', {
                        type: 'manual',
                        message: 'Role name already exists',
                    });
                } else {
                    setRoleNameAvailable(true);
                    clearErrors('name');
                }
            } catch {
                setRoleNameAvailable(null);
                setError('name', {
                    type: 'manual',
                    message: 'Could not verify role name availability',
                });
            } finally {
                setCheckingRoleName(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [roleName, open, isEdit, role?.id, role?.name, setError, clearErrors]);

    const handleFormSubmit = async (data: RoleFormData) => {
        setFormError('');

        if (roleNameAvailable === false) {
            setError('name', {
                type: 'manual',
                message: 'Role name already exists',
            });
            return;
        }

        try {
            await onSubmit({
                ...data,
                name: data.name.trim(),
                description: data.description?.trim() || '',
            });

            reset();
            setSelectedPermissions([]);
            setRoleNameAvailable(null);
        } catch (err: any) {
            setFormError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Failed to save role.'
            );
        }
    };

    const handleClose = () => {
        if (loading) return;

        reset();
        setSelectedPermissions([]);
        setFormError('');
        setRoleNameAvailable(null);
        onClose();
    };

    const totalAvailablePermissions = permissions.length;
    const selectedPermissionCount = selectedPermissions.length;

    const roleNameHelperText =
        errors.name?.message ||
        (checkingRoleName
            ? 'Checking role name availability...'
            : roleNameAvailable === true
                ? 'Role name is available'
                : 'Role name must be unique');

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? 'Edit Role' : 'Create New Role'}
            maxWidth="sm"
            actions={
                <>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 800,
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit(handleFormSubmit)}
                        loading={loading}
                        disabled={
                            !isValid ||
                            loading ||
                            checkingRoleName ||
                            roleNameAvailable === false
                        }
                        sx={{
                            minWidth: 145,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 900,
                            background:
                                'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                        }}
                    >
                        {isEdit ? 'Save Changes' : 'Create Role'}
                    </Button>
                </>
            }
        >
            <form>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: '#f8fafc',
                            borderColor: '#e2e8f0',
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2.5,
                                    bgcolor: '#eff6ff',
                                    color: '#2563eb',
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <AdminPanelSettingsIcon />
                            </Box>

                            <Box>
                                <Typography fontWeight={900} color="#0f172a">
                                    {isEdit ? 'Update role information' : 'Create a system role'}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Permission details are hidden from this form. Only permission count is shown.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {formError && (
                        <Alert severity="error" onClose={() => setFormError('')}>
                            {formError}
                        </Alert>
                    )}

                    <Box>
                        <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
                            Role Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Input
                                    label="Role Name"
                                    placeholder="Example: Procurement Manager"
                                    {...register('name')}
                                    error={!!errors.name}
                                    helperText={roleNameHelperText}
                                    disabled={loading}
                                    FormHelperTextProps={{
                                        sx: {
                                            color:
                                                errors.name
                                                    ? '#D32F2F'
                                                    : roleNameAvailable === true
                                                        ? '#2E7D32'
                                                        : undefined,
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BadgeIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Input
                                    label="Description"
                                    placeholder="Describe what this role is used for"
                                    multiline
                                    rows={4}
                                    {...register('description')}
                                    error={!!errors.description}
                                    helperText={
                                        errors.description?.message ||
                                        `${description?.length || 0}/250 characters`
                                    }
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DescriptionIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: '#ffffff',
                            borderColor: '#e2e8f0',
                        }}
                    >
                        <Stack spacing={2}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 900,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <SecurityIcon fontSize="small" />
                                        Permission Summary
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        This role currently has the following permission count.
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={<CheckCircleOutlineIcon />}
                                    label={`${selectedPermissionCount} assigned`}
                                    color={selectedPermissionCount > 0 ? 'primary' : 'default'}
                                    variant={selectedPermissionCount > 0 ? 'filled' : 'outlined'}
                                    sx={{
                                        fontWeight: 900,
                                        px: 0.5,
                                    }}
                                />
                            </Stack>

                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: '#f8fafc',
                                    border: '1px dashed #cbd5e1',
                                }}
                            >
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1}
                                    useFlexGap
                                    flexWrap="wrap"
                                >
                                    <Chip
                                        label={`${selectedPermissionCount} role permissions`}
                                        color={selectedPermissionCount > 0 ? 'primary' : 'default'}
                                        variant="outlined"
                                        sx={{ fontWeight: 800 }}
                                    />

                                    <Chip
                                        label={`${totalAvailablePermissions} available permissions`}
                                        variant="outlined"
                                        sx={{ fontWeight: 800 }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>

                    {!!roleName?.trim() && (
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
                                sx={{ fontWeight: 900, color: '#334155', mb: 1 }}
                            >
                                Preview
                            </Typography>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip label={roleName.trim()} color="primary" />

                                <Chip
                                    label={`${selectedPermissionCount} ${
                                        selectedPermissionCount === 1
                                            ? 'permission'
                                            : 'permissions'
                                    }`}
                                    variant="outlined"
                                />
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </form>
        </Modal>
    );
};