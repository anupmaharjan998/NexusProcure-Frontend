import {Box, Typography, Chip, IconButton, Alert} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Table, Column} from '../components/UI/Table';
import {Button} from '../components/UI/Button';
import {ConfirmDialog} from '../components/UI/ConfirmDialog';
import {UserForm} from '../components/User/UserForm';
import {User, UserFormData} from '../types/User.ts';
import {useEffect, useState} from 'react';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById
} from '../services/userService.ts';
import {getRoles} from '../services/roleService.ts';
import {getDepartments} from '../services/departmentService.ts';
import {Role} from '../types/Role.ts';
import {Department} from '../types/Department.ts';
import {useAuth} from "../hooks/useAuth.ts";

export const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [userToDelete, setUserToDelete] = useState<User | undefined>();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const {hasPermission} = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, departmentsData] = await Promise.all([
                getUsers(),
                getRoles(),
                getDepartments(),
            ]);

            setUsers(usersData);
            setRoles(rolesData);
            setDepartments(departmentsData);
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
        setSelectedUser(undefined);
        setFormOpen(true);
    };

    const handleEdit = async (user: User) => {
        try {
            setActionLoading(true);
            const userDetails = await getUserById(user.id);
            setSelectedUser(userDetails);
            setFormOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load user data');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setActionLoading(true);
        try {
            await deleteUser(userToDelete.id!);
            setSuccess('User deleted successfully');
            setDeleteDialogOpen(false);
            setUserToDelete(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (data: UserFormData) => {
        setActionLoading(true);
        setError('');

        try {
            if (selectedUser) {
                await updateUser(selectedUser.id!, data);
                setSuccess('User updated successfully');
            } else {
                await createUser(data);
                setSuccess('User created successfully');
            }

            setFormOpen(false);
            setSelectedUser(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save user');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: Column<User>[] = [
        {
            id: 'fullName',
            label: 'User',
            minWidth: 220,
            format: (_, row) => (
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: '#1E293B',
                            fontSize: 14,
                        }}
                    >
                        {row.fullName || (row as any).name || '-'}
                    </Typography>
                    <Typography
                        sx={{
                            color: '#64748B',
                            fontSize: 12,
                        }}
                    >
                        @{row.username || 'no-username'}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 220,
            format: (value) => (
                <Typography sx={{fontSize: 14, color: '#334155'}}>
                    {value || '-'}
                </Typography>
            ),
        },
        {
            id: 'roleName',
            label: 'Role',
            minWidth: 140,
            format: (value) => (
                <Chip
                    label={value || 'Unassigned'}
                    size="small"
                    variant="outlined"
                    sx={{fontWeight: 500}}
                />
            ),
        },
        {
            id: 'departmentName',
            label: 'Department',
            minWidth: 160,
            format: (value) => (
                <Typography sx={{fontSize: 14, color: '#334155'}}>
                    {value || '-'}
                </Typography>
            ),
        },
        {
            id: 'isActive',
            label: 'Status',
            minWidth: 120,
            format: (value) => (
                <Chip
                    label={value ? 'Active' : 'Inactive'}
                    color={value === true ? 'success' : 'default'}
                    size="small"
                    sx={{fontFamily: 'Poppins, sans-serif', fontWeight: 600}}
                />
            ),
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
            align: 'center',
            format: (_, user) => (
                <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                    {hasPermission("EDIT_USER") && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(user);
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


                    {hasPermission("DELETE_USER") && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(user);
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
                            Users Management
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#64748B',
                            }}
                        >
                            Manage user accounts, assign roles, and control account access.
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                        <Chip
                            label={`${users.length} Total Users`}
                            variant="outlined"
                            sx={{fontWeight: 600}}
                        />
                        {hasPermission("CREATE_USER") && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                sx={{
                                    background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                }}
                            >
                                Add User
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

                <Table columns={columns} data={users} loading={loading} />

                <UserForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelectedUser(undefined);
                    }}
                    onSubmit={handleFormSubmit}
                    user={selectedUser}
                    roles={roles}
                    departments={departments}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete User"
                    message={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setDeleteDialogOpen(false);
                        setUserToDelete(undefined);
                    }}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};