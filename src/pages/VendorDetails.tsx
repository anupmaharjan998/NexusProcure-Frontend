import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { Vendor, VendorDocument } from '../types/Vendor';
import { VendorForm } from '../components/Vendor/VendorForm';
import {
    getVendorById,
    updateVendor,
    uploadVendorDocument,
    updateVendorStatus,
    getAllCategories,
    getAllPaymentTerms,
    downloadDocument,
} from '../services/vendorService';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { TaxType } from '../types/TaxType';
import { Category } from '../types/Category';
import { PaymentTerms } from '@/types/PaymentTerms.ts';
import { useAuth } from '../hooks/useAuth.ts';

type SnackbarState = {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
};

export const VendorDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentTermsList, setPaymentTermsList] = useState<PaymentTerms[]>([]);

    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const { hasPermission } = useAuth();

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

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

    const loadData = async () => {
        if (!id) return;

        setLoading(true);

        try {
            const [vendorRes, categoryRes, paymentTermsRes] = await Promise.all([
                getVendorById(id),
                getAllCategories(),
                getAllPaymentTerms(),
            ]);

            setVendor(vendorRes);
            setCategories(categoryRes);
            setPaymentTermsList(paymentTermsRes);
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to load vendor details.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const getPaymentTermsName = () => {
        if (vendor?.paymentTerms === null || vendor?.paymentTerms === undefined) {
            return '-';
        }

        const term = paymentTermsList.find((t) => t.value === vendor.paymentTerms);
        return term?.displayName || '-';
    };

    const getCategoryNames = () => {
        if (!vendor?.categoryIds?.length) return '-';

        const names = categories
            .filter((category) => vendor.categoryIds.includes(category.id))
            .map((category) => category.name);

        return names.length ? names.join(', ') : '-';
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleVendorUpdate = async (data: any) => {
        if (!id) return;

        setActionLoading(true);

        try {
            await updateVendor(id, data);
            await loadData();

            setEditOpen(false);
            showMessage('Vendor updated successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to update vendor.',
                'error'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file || !id) return;

        setUploading(true);

        try {
            await uploadVendorDocument(id, file);
            await loadData();

            showMessage('Document uploaded successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'File upload failed.',
                'error'
            );
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleDownload = async (doc: VendorDocument) => {
        try {
            const blob = await downloadDocument(doc.id);
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = doc.fileName || 'document';
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);

            showMessage('Document downloaded successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Download failed.',
                'error'
            );
        }
    };

    const openDialog = (type: 'approve' | 'reject') => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleAction = async () => {
        if (!id || !dialogType) return;

        setActionLoading(true);

        try {
            await updateVendorStatus(
                id,
                dialogType === 'approve' ? 'Active' : 'Rejected'
            );

            await loadData();

            showMessage(
                `Vendor ${dialogType === 'approve' ? 'approved' : 'rejected'} successfully.`,
                'success'
            );
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Vendor status update failed.',
                'error'
            );
        } finally {
            setActionLoading(false);
            setDialogOpen(false);
            setDialogType(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 4, minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress />
                        <Typography color="text.secondary">
                            Loading vendor details...
                        </Typography>
                    </Stack>
                </Box>
            </DashboardLayout>
        );
    }

    if (!vendor) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 4 }}>
                    <Alert severity="warning">
                        Vendor not found.
                    </Alert>

                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/vendors')}
                        sx={{ mt: 2, textTransform: 'none', fontWeight: 800 }}
                    >
                        Back to Vendors
                    </Button>
                </Box>
            </DashboardLayout>
        );
    }

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
                                    {vendor.vendorName}
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    {vendor.companyName || 'Vendor details and documents'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                                variant="contained"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/vendors')}
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
                                Back
                            </Button>

                            {hasPermission('EDIT_VENDOR') && (
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={() => setEditOpen(true)}
                                    sx={{
                                        bgcolor: '#2563eb',
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 900,
                                        '&:hover': {
                                            bgcolor: '#1d4ed8',
                                        },
                                    }}
                                >
                                    Edit
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                {vendor.status === 'Pending' && hasPermission('APPROVE_VENDOR') && (
                    <Card elevation={0} sx={{ borderRadius: 5, mb: 3 }}>
                        <CardContent>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                spacing={2}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Vendor Approval Required
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Review this vendor and approve or reject the registration.
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <Button
                                        color="success"
                                        variant="contained"
                                        onClick={() => openDialog('approve')}
                                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 900 }}
                                    >
                                        Approve
                                    </Button>

                                    <Button
                                        color="error"
                                        variant="outlined"
                                        onClick={() => openDialog('reject')}
                                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 900 }}
                                    >
                                        Reject
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Card elevation={0} sx={{ borderRadius: 5, mb: 3 }}>
                            <CardContent>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={2}
                                    sx={{ mb: 2 }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <BusinessOutlinedIcon color="primary" />

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Basic Information
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Vendor identity and contact details.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Chip
                                        label={vendor.status || 'Unknown'}
                                        color={getStatusColor(vendor.status) as any}
                                        sx={{ fontWeight: 900 }}
                                    />
                                </Stack>

                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={2}>
                                    <Info label="Vendor Name" value={vendor.vendorName} />
                                    <Info label="Company Name" value={vendor.companyName} />
                                    <Info label="Email" value={vendor.email} />
                                    <Info label="Phone" value={vendor.phoneNumber} />
                                    <Info label="Address" value={vendor.address} />
                                    <Info label="Categories" value={getCategoryNames()} />
                                    <Info label="Status" value={vendor.status} />
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ borderRadius: 5 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={900}>
                                    Company & Payment Information
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Tax, banking and payment configuration.
                                </Typography>

                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={2}>
                                    <Info
                                        label="Tax Type"
                                        value={vendor.taxType === TaxType.VAT ? 'VAT' : 'PAN'}
                                    />
                                    <Info label="Tax ID" value={vendor.taxId} />
                                    <Info label="Bank Name" value={vendor.bankName} />
                                    <Info label="Bank Branch" value={vendor.bankBranch} />
                                    <Info label="Bank Account" value={vendor.bankAccount} />
                                    <Info label="Payment Terms" value={getPaymentTermsName()} />
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Card elevation={0} sx={{ borderRadius: 5 }}>
                            <CardContent>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={2}
                                    sx={{ mb: 2 }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <DescriptionOutlinedIcon color="primary" />

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Documents
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Uploaded vendor files.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <label>
                                        <input hidden type="file" onChange={handleFileUpload} />

                                        <Button
                                            variant="contained"
                                            component="span"
                                            startIcon={<UploadFileIcon />}
                                            disabled={uploading}
                                            sx={{
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                fontWeight: 900,
                                            }}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </label>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                {vendor.documents?.length ? (
                                    <List disablePadding>
                                        {vendor.documents.map((doc) => (
                                            <ListItem
                                                key={doc.id}
                                                sx={{
                                                    mb: 1,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 3,
                                                    bgcolor: '#f8fafc',
                                                }}
                                                secondaryAction={
                                                    <IconButton onClick={() => handleDownload(doc)}>
                                                        <DownloadIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography fontWeight={800}>
                                                            {doc.fileName}
                                                        </Typography>
                                                    }
                                                    secondary={`Uploaded: ${
                                                        doc.createdAt
                                                            ? new Date(doc.createdAt).toLocaleDateString()
                                                            : '-'
                                                    }`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Stack
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            py: 5,
                                            border: '1px dashed #cbd5e1',
                                            borderRadius: 4,
                                            bgcolor: '#f8fafc',
                                        }}
                                    >
                                        <DescriptionOutlinedIcon sx={{ color: '#94a3b8', fontSize: 42 }} />

                                        <Typography fontWeight={900}>
                                            No documents uploaded
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Upload vendor documents such as PAN/VAT, registration, or bank details.
                                        </Typography>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <VendorForm
                    open={editOpen}
                    onClose={() => {
                        if (actionLoading) return;
                        setEditOpen(false);
                    }}
                    vendor={vendor}
                    onSubmit={handleVendorUpdate}
                    loading={actionLoading}
                />

                <Dialog
                    open={dialogOpen}
                    onClose={() => {
                        if (!actionLoading) {
                            setDialogOpen(false);
                            setDialogType(null);
                        }
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                        },
                    }}
                >
                    <DialogTitle fontWeight={900}>
                        {dialogType === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to {dialogType} this vendor?
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => {
                                setDialogOpen(false);
                                setDialogType(null);
                            }}
                            disabled={actionLoading}
                            sx={{ textTransform: 'none', fontWeight: 800 }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color={dialogType === 'approve' ? 'success' : 'error'}
                            onClick={handleAction}
                            disabled={actionLoading}
                            sx={{ textTransform: 'none', fontWeight: 900, borderRadius: 3 }}
                        >
                            {actionLoading ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogActions>
                </Dialog>

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

const Info = ({ label, value }: { label: string; value?: any }) => (
    <Grid item xs={12} sm={6}>
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                height: '100%',
            }}
        >
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {label}
            </Typography>

            <Typography sx={{ mt: 0.5 }} fontWeight={800}>
                {value || '-'}
            </Typography>
        </Box>
    </Grid>
);