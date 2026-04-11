import {
    Box,
    Typography,
    IconButton,
    Alert,
    Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {useEffect, useState} from 'react';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Table, Column} from '../components/UI/Table';
import {Button} from '../components/UI/Button';
import {ConfirmDialog} from '../components/UI/ConfirmDialog';
import {VendorForm} from '../components/Vendor/VendorForm';
import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    getVendorById
} from '../services/vendorService';
import {Vendor, VendorFormData} from '../types/Vendor';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth.ts';

export const Vendors = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | undefined>();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const {hasPermission} = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const vendorsData = await getVendors();
            setVendors(vendorsData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedVendor(undefined);
        setFormOpen(true);
    };

    const handleEdit = async (vendor: Vendor) => {
        try {
            setActionLoading(true);
            const detailedVendor = await getVendorById(vendor.id);
            setSelectedVendor(detailedVendor);
            setFormOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load vendor data');
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
            setSuccess('Vendor deleted successfully');
            setDeleteDialogOpen(false);
            setVendorToDelete(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete vendor');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRowClick = (vendor: Vendor) => {
        navigate(`/vendors/${vendor.id}`);
    };

    const handleFormSubmit = async (data: VendorFormData) => {
        setActionLoading(true);
        setError('');

        try {
            if (selectedVendor) {
                await updateVendor(selectedVendor.id, data);
                setSuccess('Vendor updated successfully');
            } else {
                await createVendor(data);
                setSuccess('Vendor created successfully');
            }

            setFormOpen(false);
            setSelectedVendor(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save vendor');
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

    const columns: Column<Vendor>[] = [
        {
            id: 'vendorName',
            label: 'Vendor',
            minWidth: 220,
            format: (_, row) => (
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            color: '#1E293B',
                            fontSize: 14,
                            lineHeight: 1.3,
                        }}
                    >
                        {row.vendorName || '-'}
                    </Typography>
                    <Typography
                        sx={{
                            color: '#64748B',
                            fontSize: 12,
                            mt: 0.35,
                        }}
                    >
                        Contact vendor profile
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'companyName',
            label: 'Company Name',
            minWidth: 200,
            format: (value) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <BusinessOutlinedIcon sx={{fontSize: 16, color: '#64748B'}} />
                    <Typography sx={{fontSize: 14, color: '#334155', fontWeight: 500}}>
                        {value || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 220,
            format: (value) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <EmailOutlinedIcon sx={{fontSize: 16, color: '#64748B'}} />
                    <Typography sx={{fontSize: 14, color: '#334155'}}>
                        {value || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'phoneNumber',
            label: 'Phone',
            minWidth: 160,
            format: (value) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <PhoneOutlinedIcon sx={{fontSize: 16, color: '#64748B'}} />
                    <Typography sx={{fontSize: 14, color: '#334155'}}>
                        {value || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            format: (value) => (
                <Chip
                    label={value || 'Unknown'}
                    size="small"
                    color={getStatusColor(value) as any}
                    variant={value === 'Inactive' ? 'outlined' : 'filled'}
                    sx={{fontWeight: 600}}
                />
            ),
        },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
            align: 'center',
            format: (_, vendor) => (
                <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                    {hasPermission('EDIT_VENDOR') && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(vendor);
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

                    {hasPermission('DELETE_VENDOR') && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(vendor);
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
                            Vendor Management
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#64748B',
                            }}
                        >
                            Manage vendor profiles, company records, and contact information.
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                        <Chip
                            icon={<StorefrontOutlinedIcon />}
                            label={`${vendors.length} Vendors`}
                            variant="outlined"
                            sx={{fontWeight: 600}}
                        />

                        {hasPermission('ADD_VENDOR') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                sx={{
                                    background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                }}
                            >
                                Add Vendor
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

                <Table
                    data={vendors}
                    columns={columns}
                    loading={loading}
                    onRowClick={handleRowClick}
                />

                <VendorForm
                    open={formOpen}
                    onClose={() => {
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
                    message={`Are you sure you want to delete "${vendorToDelete?.vendorName}"? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setDeleteDialogOpen(false);
                        setVendorToDelete(undefined);
                    }}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};