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
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { VendorForm } from '../components/Vendor/VendorForm';

import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    getVendorById,
} from '../services/vendorService';
import { Vendor, VendorFormData } from '../types/Vendor';
import { useAuth } from '../hooks/useAuth.ts';

type SnackbarState = {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
};

export const Vendors = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | undefined>();

    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const navigate = useNavigate();
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
            const vendorsData = await getVendors();
            setVendors(vendorsData);
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to fetch vendors.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredVendors = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return vendors;

        return vendors.filter((vendor) =>
            `${vendor.vendorName || ''} ${vendor.companyName || ''} ${vendor.email || ''} ${vendor.phoneNumber || ''} ${vendor.status || ''}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [vendors, search]);

    const handleAdd = () => {
        setSelectedVendor(undefined);
        setFormOpen(true);
    };

    const handleEdit = async (vendor: Vendor) => {
        setActionLoading(true);

        try {
            const detailedVendor = await getVendorById(vendor.id);
            setSelectedVendor(detailedVendor);
            setFormOpen(true);
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to load vendor details.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (vendor: Vendor) => {
        setVendorToDelete(vendor);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!vendorToDelete) return;

        setActionLoading(true);

        try {
            await deleteVendor(vendorToDelete.id);

            setDeleteDialogOpen(false);
            setVendorToDelete(undefined);

            await fetchData();

            showMessage('Vendor deleted successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to delete vendor.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (data: VendorFormData) => {
        setActionLoading(true);

        try {
            if (selectedVendor) {
                await updateVendor(selectedVendor.id, data);
                showMessage('Vendor updated successfully.', 'success');
            } else {
                await createVendor(data);
                showMessage('Vendor created successfully.', 'success');
            }

            setFormOpen(false);
            setSelectedVendor(undefined);

            await fetchData();
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to save vendor.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Rejected':
                return 'error';
            case 'Inactive':
            default:
                return 'default';
        }
    };

    const columns: GridColDef<Vendor>[] = [
        {
            field: 'vendorName',
            headerName: 'Vendor',
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Box>
                    <Typography fontWeight={800} color="#1E293B">
                        {params.row.vendorName || '-'}
                    </Typography>

                </Box>
            ),
        },
        {
            field: 'companyName',
            headerName: 'Company',
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    <Typography fontWeight={600}>
                        {params.row.companyName || '-'}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 240,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    <Typography>
                        {params.row.email || '-'}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: 'phoneNumber',
            headerName: 'Phone',
            width: 170,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    <Typography>
                        {params.row.phoneNumber || '-'}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.row.status || 'Unknown'}
                    size="small"
                    color={getStatusColor(params.row.status) as any}
                    variant={params.row.status === 'Inactive' ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 800 }}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 170,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.75} justifyContent="center">
                    <Tooltip title="View details">
                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/vendors/${params.row.id}`);
                            }}
                            sx={{
                                color: '#0f172a',
                                bgcolor: '#f1f5f9',
                                '&:hover': { bgcolor: '#e2e8f0' },
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {hasPermission('EDIT_VENDOR') && (
                        <Tooltip title="Edit vendor">
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleEdit(params.row);
                                }}
                                sx={{
                                    color: '#0056D2',
                                    bgcolor: '#EFF6FF',
                                    '&:hover': { bgcolor: '#DBEAFE' },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {hasPermission('DELETE_VENDOR') && (
                        <Tooltip title="Delete vendor">
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteClick(params.row);
                                }}
                                sx={{
                                    color: '#E63946',
                                    bgcolor: '#FEF2F2',
                                    '&:hover': { bgcolor: '#FEE2E2' },
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
                            <StorefrontOutlinedIcon sx={{ fontSize: 42 }} />

                            <Box>
                                <Typography variant="h4" fontWeight={900}>
                                    Vendor Management
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    Manage vendor profiles, companies, contacts, documents and approval status.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                            <Chip
                                icon={<StorefrontOutlinedIcon />}
                                label={`${vendors.length} Vendors`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    color: 'white',
                                    fontWeight: 800,
                                }}
                            />

                            {hasPermission('ADD_VENDOR') && (
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
                                    Add Vendor
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

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
                                    Vendor List
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {filteredVendors.length} records found.
                                </Typography>
                            </Box>

                            <Box
                                component="input"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search vendor, company, email, phone or status"
                                style={{
                                    width: '100%',
                                    maxWidth: 420,
                                    padding: '12px 14px',
                                    borderRadius: 12,
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    fontSize: 14,
                                }}
                            />
                        </Stack>

                        <DataGrid
                            rows={filteredVendors}
                            columns={columns}
                            autoHeight
                            loading={loading || actionLoading}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            onRowClick={(params) => navigate(`/vendors/${params.row.id}`)}
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
                                '& .MuiDataGrid-row': {
                                    cursor: 'pointer',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: '#eef2f7',
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <VendorForm
                    open={formOpen}
                    onClose={() => {
                        if (actionLoading) return;
                        setFormOpen(false);
                        setSelectedVendor(undefined);
                    }}
                    vendor={selectedVendor}
                    onSubmit={handleFormSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Vendor"
                    message={`Are you sure you want to delete "${
                        vendorToDelete?.vendorName || 'this vendor'
                    }"? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        if (actionLoading) return;
                        setDeleteDialogOpen(false);
                        setVendorToDelete(undefined);
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