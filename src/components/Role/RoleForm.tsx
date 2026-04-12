import {
    Box,
    Grid,
    Typography,
    FormControlLabel,
    Checkbox,
    Divider,
    Paper,
    Chip,
    Stack,
    FormHelperText,
    InputAdornment,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {Input} from '../UI/Input.tsx';
import {Button} from '../UI/Button.tsx';
import {Modal} from '../UI/Modal.tsx';
import {Role, RoleFormData} from '../../types/Role.ts';
import {Permission} from '../../types/Permission.ts';
import {useEffect, useMemo, useState} from 'react';

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
    const isEdit = !!role;
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: {errors, isValid},
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
        if (role) {
            reset({
                name: role.name,
                description: role.description || '',
            });
            setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
        } else {
            reset({
                name: '',
                description: '',
            });
            setSelectedPermissions([]);
        }
    }, [role, reset]);

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        permissions.forEach((permission) => {
            const groupName =
                (permission as any).module ||
                (permission as any).group ||
                'General';

            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(permission);
        });

        return groups;
    }, [permissions]);

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleGroup = (groupPermissions: Permission[]) => {
        const groupIds = groupPermissions.map((p) => p.id);
        const allSelected = groupIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !groupIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupIds])));
        }
    };

    const handleFormSubmit = async (data: RoleFormData) => {
        await onSubmit({
            ...data,
            permissionIds: selectedPermissions,
        });
        reset();
        setSelectedPermissions([]);
    };

    const handleClose = () => {
        reset();
        setSelectedPermissions([]);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? 'Edit Role' : 'Create New Role'}
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
                        disabled={!isValid || loading}
                        sx={{
                            minWidth: 140,
                            background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                        }}
                    >
                        {isEdit ? 'Save Changes' : 'Create Role'}
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
                            Configure the role details and assign the permissions this role should have.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Input
                                    label="Role Name"
                                    placeholder="Enter role name"
                                    {...register('name')}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={loading}
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

                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: {xs: 'flex-start', sm: 'center'},
                                flexDirection: {xs: 'column', sm: 'row'},
                                gap: 1.5,
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#1E293B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <SecurityIcon fontSize="small" />
                                    Permissions
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#64748B',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Select the actions users with this role are allowed to perform.
                                </Typography>
                            </Box>

                            <Chip
                                icon={<CheckCircleOutlineIcon />}
                                label={`${selectedPermissions.length} selected`}
                                color={selectedPermissions.length > 0 ? 'primary' : 'default'}
                                variant={selectedPermissions.length > 0 ? 'filled' : 'outlined'}
                                sx={{fontWeight: 600}}
                            />
                        </Box>

                        {permissions.length === 0 ? (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    textAlign: 'center',
                                    bgcolor: '#F8FAFC',
                                }}
                            >
                                <Typography sx={{fontWeight: 600, color: '#334155', mb: 0.5}}>
                                    No permissions available
                                </Typography>
                                <Typography variant="body2" sx={{color: '#64748B'}}>
                                    Add permissions first before assigning them to a role.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => {
                                    const groupIds = groupPermissions.map((p) => p.id);
                                    const selectedInGroup = groupIds.filter((id) =>
                                        selectedPermissions.includes(id)
                                    ).length;
                                    const allSelected =
                                        groupPermissions.length > 0 &&
                                        selectedInGroup === groupPermissions.length;

                                    return (
                                        <Paper
                                            key={groupName}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                borderColor: '#E2E8F0',
                                                transition: '0.2s ease',
                                                '&:hover': {
                                                    borderColor: '#CBD5E1',
                                                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: {xs: 'flex-start', sm: 'center'},
                                                    flexDirection: {xs: 'column', sm: 'row'},
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={allSelected}
                                                            indeterminate={
                                                                selectedInGroup > 0 && !allSelected
                                                            }
                                                            onChange={() => toggleGroup(groupPermissions)}
                                                            disabled={loading}
                                                        />
                                                    }
                                                    label={
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: '#1E293B',
                                                            }}
                                                        >
                                                            {groupName}
                                                        </Typography>
                                                    }
                                                />

                                                <Chip
                                                    size="small"
                                                    label={`${selectedInGroup}/${groupPermissions.length}`}
                                                    variant="outlined"
                                                />
                                            </Box>

                                            <Grid container spacing={1}>
                                                {groupPermissions.map((permission) => (
                                                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                px: 1.5,
                                                                py: 1,
                                                                borderRadius: 2,
                                                                borderColor: selectedPermissions.includes(permission.id)
                                                                    ? '#93C5FD'
                                                                    : '#E2E8F0',
                                                                bgcolor: selectedPermissions.includes(permission.id)
                                                                    ? '#EFF6FF'
                                                                    : '#FFFFFF',
                                                            }}
                                                        >
                                                            <FormControlLabel
                                                                sx={{m: 0, width: '100%'}}
                                                                control={
                                                                    <Checkbox
                                                                        checked={selectedPermissions.includes(
                                                                            permission.id
                                                                        )}
                                                                        onChange={() =>
                                                                            togglePermission(permission.id)
                                                                        }
                                                                        disabled={loading}
                                                                    />
                                                                }
                                                                label={
                                                                    <Box>
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: 14,
                                                                                fontWeight: 600,
                                                                                color: '#1E293B',
                                                                            }}
                                                                        >
                                                                            {permission.name}
                                                                        </Typography>
                                                                        {(permission as any).description && (
                                                                            <Typography
                                                                                sx={{
                                                                                    fontSize: 12,
                                                                                    color: '#64748B',
                                                                                }}
                                                                            >
                                                                                {(permission as any).description}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                }
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}

                        <FormHelperText sx={{mt: 1}}>
                            Choose only the permissions required for this role.
                        </FormHelperText>
                    </Box>

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
                                sx={{fontWeight: 700, color: '#334155', mb: 1}}
                            >
                                Preview
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                                <Chip label={roleName.trim()} color="primary" />
                                <Chip
                                    label={`${selectedPermissions.length} permissions`}
                                    variant="outlined"
                                />
                            </Box>
                        </Paper>
                    )}
                </Stack>
            </form>
        </Modal>
    );
};