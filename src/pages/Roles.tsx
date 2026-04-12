import {Box, Typography, IconButton, Alert, Chip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Table, Column} from '../components/UI/Table';
import {Button} from '../components/UI/Button';
import {ConfirmDialog} from '../components/UI/ConfirmDialog';
import {RoleForm} from '../components/Role/RoleForm';
import {Role, RoleFormData} from '../types/Role.ts';
import {useEffect, useState} from 'react';
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from '../services/roleService.ts';
import {Permission} from '../types/Permission.ts';
import {getPermissions} from '../services/permissionService.ts';
import {useAuth} from "../hooks/useAuth.ts";

export const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();
    const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const {hasPermission} = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                getRoles(),
                getPermissions(),
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedRole(undefined);
        setFormOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setFormOpen(true);
    };

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        setActionLoading(true);
        try {
            await deleteRole(roleToDelete.id);
            setSuccess('Role deleted successfully');
            setDeleteDialogOpen(false);
            setRoleToDelete(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (data: RoleFormData) => {
        setActionLoading(true);
        setError('');

        try {
            if (selectedRole) {
                await updateRole(selectedRole.id, data);
                setSuccess('Role updated successfully');
            } else {
                await createRole(data);
                setSuccess('Role created successfully');
            }

            setFormOpen(false);
            setSelectedRole(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save role');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: Column<Role>[] = [
        {
            id: 'name',
            label: 'Role',
            minWidth: 180,
            format: (value) => (
                <Typography sx={{fontWeight: 600, color: '#1E293B', fontSize: 14}}>
                    {value || '-'}
                </Typography>
            ),
        },
        {
            id: 'description',
            label: 'Description',
            minWidth: 260,
            format: (value) => (
                <Typography sx={{fontSize: 14, color: '#475569'}}>
                    {value || '-'}
                </Typography>
            ),
        },
        {
            id: 'permissions',
            label: 'Permissions',
            minWidth: 150,
            format: (_, row) => (
                <Chip
                    label={`${row.permissions?.length || 0} Permissions`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{fontWeight: 600}}
                />
            ),
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
            align: 'center',
            format: (_, role) => (
                <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                    {hasPermission("EDIT_ROLE") && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(role);
                            }}
                            sx={{
                                color: '#0056D2',
                                bgcolor: '#EFF6FF',
                                '&:hover': {bgcolor: '#DBEAFE'},
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission("DELETE_ROLE") && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(role);
                            }}
                            sx={{
                                color: '#E63946',
                                bgcolor: '#FEF2F2',
                                '&:hover': {bgcolor: '#FEE2E2'},
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}

                </Box>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {xs: 'flex-start', md: 'center'},
                        flexDirection: {xs: 'column', md: 'row'},
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 700,
                                color: '#1E293B',
                                mb: 0.5,
                            }}
                        >
                            Roles & Permissions
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#64748B',
                            }}
                        >
                            Define roles and assign permission access for system users.
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                        <Chip
                            label={`${roles.length} Total Roles`}
                            variant="outlined"
                            sx={{fontWeight: 600}}
                        />

                        {hasPermission("CREATE_ROLE") && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                sx={{
                                    background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                }}
                            >
                                Add Role
                            </Button>
                        )}

                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 3}} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{mb: 3}} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Table columns={columns} data={roles} loading={loading} />

                <RoleForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelectedRole(undefined);
                    }}
                    onSubmit={handleFormSubmit}
                    role={selectedRole}
                    permissions={permissions}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Role"
                    message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setDeleteDialogOpen(false);
                        setRoleToDelete(undefined);
                    }}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};