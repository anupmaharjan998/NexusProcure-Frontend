import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Link,
    Paper,
    Skeleton,
    Stack,
    Typography,
    Breadcrumbs,
    Snackbar
} from '@mui/material';
import Barcode from 'react-barcode';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getInventoryItemById,
    assignItem,
    unassignItem
} from '../../services/inventoryService';

interface AssignmentHistory {
    userName: string;
    assignedDate: string;
    returnedDate?: string | null;
}

interface InventoryItemDetail {
    id: string;
    name: string;
    sku: string;
    status: 'Available' | 'Assigned' | 'Maintenance' | string;
    category?: string;
    location?: string;
    assignedTo?: string | null;
    serialNumber?: string | null;
    condition?: string | null;
    barcode?: string | null;
    description?: string | null;
    assignmentHistory?: AssignmentHistory[];
}



export const InventoryItemDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [item, setItem] = useState<InventoryItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const res = await getInventoryItemById(id);
            setItem(res);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load inventory item');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (
        status: string
    ): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Available':
                return 'success';
            case 'Assigned':
                return 'warning';
            case 'Maintenance':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleAssign = async () => {
        if (!item) return;
        setActionLoading(true);
        setError('');

        try {
            await assignItem(item.id, 'USER_ID');
            await loadItem();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to assign item');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassign = async () => {
        if (!item) return;
        setActionLoading(true);
        setError('');

        try {
            await unassignItem(item.id);
            await loadItem();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to unassign item');
        } finally {
            setActionLoading(false);
        }
    };

    const DetailRow = ({
                           icon,
                           label,
                           value,
                       }: {
        icon: React.ReactNode;
        label: string;
        value: React.ReactNode;
    }) => (
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box sx={{ color: 'text.secondary', mt: '2px' }}>{icon}</Box>
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const location = useLocation();

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'warning' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (location.state?.message) {
            setSnackbar({
                open: true,
                message: location.state.message,
                severity: location.state.severity || 'success',
            });

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);



    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box>
                            <Breadcrumbs sx={{ mb: 1 }}>
                                <Link
                                    underline="hover"
                                    color="inherit"
                                    sx={{
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                    onClick={() => navigate('/inventory')}
                                >
                                    <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
                                    Inventory
                                </Link>
                                <Typography color="text.primary">Item Details</Typography>
                            </Breadcrumbs>

                            <Typography variant="h4" fontWeight={800}>
                                Inventory Item Details
                            </Typography>
                            <Typography color="text.secondary">
                                View item information, barcode, current assignment, and assignment history
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <IconButton onClick={loadItem} disabled={loading || actionLoading}>
                                <RefreshRoundedIcon />
                            </IconButton>
                        </Stack>
                    </Stack>

                    {error && <Alert severity="error">{error}</Alert>}

                    {loading ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rounded" height={110} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={8}>
                                    <Skeleton variant="rounded" height={260} />
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                    <Skeleton variant="rounded" height={260} />
                                </Grid>
                            </Grid>
                            <Skeleton variant="rounded" height={140} />
                            <Skeleton variant="rounded" height={220} />
                        </Stack>
                    ) : !item ? (
                        <Alert severity="warning">Item not found.</Alert>
                    ) : (
                        <>
                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                                }}
                            >
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                display: 'grid',
                                                placeItems: 'center',
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                borderRadius: 3,
                                            }}
                                        >
                                            <Inventory2OutlinedIcon />
                                        </Box>

                                        <Box>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                flexWrap="wrap"
                                            >
                                                <Typography variant="h5" fontWeight={800}>
                                                    {item.name}
                                                </Typography>

                                                <Chip
                                                    label={item.status}
                                                    color={getStatusColor(item.status)}
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            </Stack>

                                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                                SKU: {item.sku}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1.5}
                                        alignItems={{ xs: 'stretch', sm: 'center' }}
                                    >
                                        <Button
                                            variant="contained"
                                            disabled={item.status !== 'Available' || actionLoading}
                                            onClick={handleAssign}
                                            startIcon={
                                                actionLoading && item.status === 'Available' ? (
                                                    <CircularProgress size={16} color="inherit" />
                                                ) : (
                                                    <AssignmentIndOutlinedIcon />
                                                )
                                            }
                                        >
                                            Assign
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            disabled={item.status !== 'Assigned' || actionLoading}
                                            onClick={handleUnassign}
                                        >
                                            Unassign
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            startIcon={<EditOutlinedIcon />}
                                            onClick={() => navigate(`/inventory/item-edit/${id}`)}
                                            disabled={actionLoading}
                                        >
                                            Edit Item
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Card>

                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={8}>
                                    <Card
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            height: '100%',
                                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight={700} mb={2}>
                                            Item Overview
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <Stack spacing={2.5}>
                                                    <DetailRow
                                                        icon={<CategoryOutlinedIcon fontSize="small" />}
                                                        label="Category"
                                                        value={item.category || '-'}
                                                    />
                                                    <DetailRow
                                                        icon={<LocationOnOutlinedIcon fontSize="small" />}
                                                        label="Location"
                                                        value={item.location || '-'}
                                                    />
                                                    <DetailRow
                                                        icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                                                        label="Assigned To"
                                                        value={item.assignedTo || 'Not Assigned'}
                                                    />
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Stack spacing={2.5}>
                                                    <DetailRow
                                                        icon={<NumbersOutlinedIcon fontSize="small" />}
                                                        label="Serial Number"
                                                        value={item.serialNumber || '-'}
                                                    />
                                                    <DetailRow
                                                        icon={<BuildCircleOutlinedIcon fontSize="small" />}
                                                        label="Condition"
                                                        value={item.condition || '-'}
                                                    />
                                                    <DetailRow
                                                        icon={<Inventory2OutlinedIcon fontSize="small" />}
                                                        label="SKU"
                                                        value={item.sku}
                                                    />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} lg={4}>
                                    <Card
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            height: '100%',
                                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight={700} mb={2}>
                                            Barcode
                                        </Typography>

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 2.5,
                                                bgcolor: '#fcfcfd',
                                            }}
                                        >
                                            {item.barcode ? (
                                                <Stack spacing={1.5} alignItems="center">
                                                    <Barcode
                                                        value={item.barcode}
                                                        height={60}
                                                        displayValue={false}
                                                        margin={0}
                                                        width={1.6}
                                                    />
                                                    <Typography fontWeight={700}>
                                                        {item.barcode}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Scan to identify this item
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography color="text.secondary">
                                                    No barcode available
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                                    <DescriptionOutlinedIcon fontSize="small" color="action" />
                                    <Typography variant="h6" fontWeight={700}>
                                        Description
                                    </Typography>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                <Typography color={item.description ? 'text.primary' : 'text.secondary'}>
                                    {item.description || 'No description available for this item.'}
                                </Typography>
                            </Card>

                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <HistoryOutlinedIcon fontSize="small" color="action" />
                                    <Typography variant="h6" fontWeight={700}>
                                        Assignment History
                                    </Typography>
                                </Stack>

                                {!item.assignmentHistory || item.assignmentHistory.length === 0 ? (
                                    <Box
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: '#f9fafb',
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            No assignment history available for this item.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2}>
                                        {item.assignmentHistory.map((history, index) => (
                                            <Paper
                                                key={index}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: '#fff',
                                                }}
                                            >
                                                <Stack
                                                    direction={{ xs: 'column', sm: 'row' }}
                                                    justifyContent="space-between"
                                                    spacing={1}
                                                >
                                                    <Typography fontWeight={700}>
                                                        {history.userName}
                                                    </Typography>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            history.returnedDate
                                                                ? 'Returned'
                                                                : 'Currently Assigned'
                                                        }
                                                        color={
                                                            history.returnedDate
                                                                ? 'default'
                                                                : 'warning'
                                                        }
                                                    />
                                                </Stack>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={1}
                                                >
                                                    Assigned on {formatDate(history.assignedDate)}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {history.returnedDate
                                                        ? `Returned on ${formatDate(history.returnedDate)}`
                                                        : 'Still assigned'}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Card>
                        </>
                    )}
                </Stack>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
};