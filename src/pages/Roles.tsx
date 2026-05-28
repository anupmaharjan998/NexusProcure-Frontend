import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';

import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { RoleForm } from '../components/Role/RoleForm';

import { Role, RoleFormData } from '../types/Role.ts';
import { Permission } from '../types/Permission.ts';

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from '../services/roleService.ts';

import { getPermissions } from '../services/permissionService.ts';
import { useAuth } from '../hooks/useAuth.ts';

type SnackbarState = {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
};

export const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState<Role | undefined>();
    const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();

    const [search, setSearch] = useState('');

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { hasPermission } = useAuth();

    const showMessage = (
        message: string,
        severity: SnackbarState['severity'] = 'success'
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

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
            showMessage(
                err.response?.data?.message || 'Failed to fetch roles.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRoles = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return roles;

        return roles.filter((role) =>
            `${role.name || ''} ${role.description || ''}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [roles, search]);

    const totalAssignedPermissions = useMemo(() => {
        return roles.reduce((total, role) => total + (role.permissions?.length || 0), 0);
    }, [roles]);

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

            setDeleteDialogOpen(false);
            setRoleToDelete(undefined);

            await fetchData();

            showMessage('Role deleted successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to delete role.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (data: RoleFormData) => {
        setActionLoading(true);

        try {
            if (selectedRole) {
                await updateRole(selectedRole.id, data);
                showMessage('Role updated successfully.', 'success');
            } else {
                await createRole(data);
                showMessage('Role created successfully.', 'success');
            }

            setFormOpen(false);
            setSelectedRole(undefined);

            await fetchData();
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to save role.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const columns: GridColDef<Role>[] = [
        {
            field: 'name',
            headerName: 'Role',
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                        }}
                    >
                        <AdminPanelSettingsIcon fontSize="small" />
                    </Box>

                    <Box>
                        <Typography fontWeight={900} color="#0f172a">
                            {params.row.name || '-'}
                        </Typography>
                    </Box>
                </Stack>
            ),
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 1.5,
            minWidth: 300,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontSize: 14,
                        color: '#475569',
                        whiteSpace: 'normal',
                        lineHeight: 1.4,
                    }}
                >
                    {params.row.description || 'No description provided.'}
                </Typography>
            ),
        },
        {
            field: 'permissionCount',
            headerName: 'Permissions',
            width: 170,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => {
                const count =
                    params.row.permissionCount ??
                    params.row.permissions?.length ??
                    0;

                return (
                    <Chip
                        label={`${count} ${count === 1 ? 'Permission' : 'Permissions'}`}
                        size="small"
                        color={count > 0 ? 'primary' : 'default'}
                        variant={count > 0 ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 800 }}
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.75} justifyContent="center">
                    {hasPermission('EDIT_ROLE') && (
                        <Tooltip title="Edit role">
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleEdit(params.row);
                                }}
                                sx={{
                                    color: '#0056D2',
                                    bgcolor: '#EFF6FF',
                                    '&:hover': {
                                        bgcolor: '#DBEAFE',
                                    },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {hasPermission('DELETE_ROLE') && (
                        <Tooltip title="Delete role">
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteClick(params.row);
                                }}
                                sx={{
                                    color: '#E63946',
                                    bgcolor: '#FEF2F2',
                                    '&:hover': {
                                        bgcolor: '#FEE2E2',
                                    },
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 5,
                        color: 'white',
                        background:
                            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <AdminPanelSettingsIcon sx={{ fontSize: 44 }} />

                            <Box>
                                <Typography variant="h4" fontWeight={900}>
                                    Roles
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    Manage system roles and view assigned permission counts.
                                </Typography>
                            </Box>
                        </Stack>

                        {hasPermission('CREATE_ROLE') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#0f172a',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 900,
                                    '&:hover': {
                                        bgcolor: '#e2e8f0',
                                    },
                                }}
                            >
                                Add Role
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <GridStats
                    totalRoles={roles.length}
                    totalPermissions={permissions.length}
                    assignedPermissions={totalAssignedPermissions}
                />

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', md: 'center' }}
                            spacing={2}
                            sx={{ mb: 2 }}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    Role List
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {filteredRoles.length} role records found.
                                </Typography>
                            </Box>

                            <TextField
                                size="small"
                                placeholder="Search role or description"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                sx={{ width: { xs: '100%', md: 360 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <DataGrid
                            rows={filteredRoles}
                            columns={columns}
                            autoHeight
                            loading={loading || actionLoading}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                        page: 0,
                                    },
                                },
                            }}
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#f8fafc',
                                    fontWeight: 900,
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: '#eef2f7',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: '#f8fafc',
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <RoleForm
                    open={formOpen}
                    onClose={() => {
                        if (actionLoading) return;
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
                    message={`Are you sure you want to delete the role "${
                        roleToDelete?.name || 'this role'
                    }"? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        if (actionLoading) return;
                        setDeleteDialogOpen(false);
                        setRoleToDelete(undefined);
                    }}
                    confirmText={actionLoading ? 'Deleting...' : 'Delete'}
                    confirmColor="error"
                    loading={actionLoading}
                />

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3500}
                    onClose={() =>
                        setSnackbar((prev) => ({
                            ...prev,
                            open: false,
                        }))
                    }
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() =>
                            setSnackbar((prev) => ({
                                ...prev,
                                open: false,
                            }))
                        }
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
};

const GridStats = ({
                       totalRoles,
                       totalPermissions,
                       assignedPermissions,
                   }: {
    totalRoles: number;
    totalPermissions: number;
    assignedPermissions: number;
}) => {
    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
        >
            <StatCard
                title="Total Roles"
                value={totalRoles}
                subtitle="Configured system roles"
                icon={<AdminPanelSettingsIcon />}
            />

            <StatCard
                title="Available Permissions"
                value={totalPermissions}
                subtitle="Permissions in the system"
                icon={<SecurityIcon />}
            />

            <StatCard
                title="Assigned Permissions"
                value={assignedPermissions}
                subtitle="Total permissions linked to roles"
                icon={<SecurityIcon />}
            />
        </Stack>
    );
};

const StatCard = ({
                      title,
                      value,
                      subtitle,
                      icon,
                  }: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
}) => {
    return (
        <Card elevation={0} sx={{ flex: 1, borderRadius: 5 }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                            {title}
                        </Typography>

                        <Typography variant="h4" fontWeight={900}>
                            {value}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};