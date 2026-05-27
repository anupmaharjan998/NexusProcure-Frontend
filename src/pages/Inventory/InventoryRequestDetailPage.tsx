import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useParams } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getInventoryRequestById } from '../../services/inventoryRequestService';
import { InventoryRequest } from '../../types/InventoryRequest';

const statusColor = (status: string) => {
    if (status === 'Completed') return 'success';
    if (status === 'RejectedByManager') return 'error';
    if (status === 'SentForProcurement') return 'warning';
    return 'primary';
};

export default function InventoryRequestDetailPage() {
    const { requestId } = useParams();

    const [request, setRequest] = useState<InventoryRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        if (!requestId) return;

        setLoading(true);
        setError('');

        try {
            setRequest(await getInventoryRequestById(requestId));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load request.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [requestId]);

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!request) {
        return (
            <DashboardLayout>
                <Box p={4}>
                    <Alert severity="error">Inventory request not found.</Alert>
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <AssignmentIcon sx={{ fontSize: 42 }} />

                        <Box>
                            <Typography variant="h4" fontWeight={900}>
                                Inventory Request Details
                            </Typography>

                            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                View requested items, approval status, and issued inventory.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Card elevation={0} sx={{ borderRadius: 5, mb: 3 }}>
                    <CardContent>
                        <Stack spacing={1.5}>
                            <Typography variant="h5" fontWeight={900}>
                                {request.purpose}
                            </Typography>

                            <Typography color="text.secondary">
                                Requested by <strong>{request.requestedBy}</strong> from{' '}
                                <strong>{request.department}</strong>
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={request.priority} />
                                <Chip
                                    label={request.status}
                                    color={statusColor(request.status) as any}
                                />
                                <Chip
                                    label={new Date(request.createdAt).toLocaleDateString()}
                                    variant="outlined"
                                />
                            </Stack>

                            {request.remarks && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    {request.remarks}
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={900} mb={2}>
                            Requested Items
                        </Typography>

                        <Stack spacing={2}>
                            {request.items.map((item) => (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{ p: 2.5, borderRadius: 4 }}
                                >
                                    <Stack spacing={1.5}>
                                        <Stack
                                            direction={{ xs: 'column', md: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', md: 'center' }}
                                            spacing={1}
                                        >
                                            <Box>
                                                <Typography fontWeight={900}>
                                                    {item.stockName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Category: {item.categoryName}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                <Chip
                                                    label={
                                                        item.isAssetTracked
                                                            ? 'Asset Tracked'
                                                            : 'Consumable'
                                                    }
                                                    color={item.isAssetTracked ? 'primary' : 'default'}
                                                />
                                                <Chip
                                                    label={`Requested: ${item.quantityRequested}`}
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    label={`Issued: ${item.quantityIssued}`}
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Stack>

                                        {item.issuedItems?.length > 0 && (
                                            <>
                                                <Divider />

                                                <Box>
                                                    <Typography fontWeight={800} mb={1}>
                                                        Issued Assets
                                                    </Typography>

                                                    <Stack spacing={1}>
                                                        {item.issuedItems.map((issued) => (
                                                            <Paper
                                                                key={issued.inventoryItemId}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5,
                                                                    borderRadius: 3,
                                                                    bgcolor: '#f8fafc',
                                                                }}
                                                            >
                                                                <Typography variant="body2">
                                                                    SKU: <strong>{issued.sku}</strong> | Barcode:{' '}
                                                                    <strong>{issued.barcode || 'N/A'}</strong> | Serial:{' '}
                                                                    <strong>{issued.serialNumber || 'N/A'}</strong>
                                                                </Typography>
                                                            </Paper>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            </>
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}