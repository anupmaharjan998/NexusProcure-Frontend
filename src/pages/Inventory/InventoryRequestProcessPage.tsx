import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useNavigate, useParams } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Button } from '../../components/UI/Button';
import {
    getAvailableAssetsByStock,
    getInventoryRequestById,
    processInventoryRequest,
} from '../../services/inventoryRequestService';
import {
    AvailableInventoryItem,
    InventoryRequest,
    ProcessInventoryRequestItemRequest,
} from '../../types/InventoryRequest';

export default function InventoryRequestProcessPage() {
    const { requestId } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState<InventoryRequest | null>(null);
    const [assetsByStock, setAssetsByStock] = useState<Record<string, AvailableInventoryItem[]>>({});
    const [selectedAssets, setSelectedAssets] = useState<Record<string, string[]>>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = async () => {
        if (!requestId) return;

        setLoading(true);
        setError('');

        try {
            const req = await getInventoryRequestById(requestId);
            setRequest(req);

            const assetItems = req.items.filter((item) => item.isAssetTracked);
            const assetResult: Record<string, AvailableInventoryItem[]> = {};

            for (const item of assetItems) {
                assetResult[item.stockId] = await getAvailableAssetsByStock(item.stockId);
            }

            setAssetsByStock(assetResult);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load request.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [requestId]);

    const toggleAsset = (
        requestItemId: string,
        assetId: string,
        checked: boolean,
        max: number
    ) => {
        setSelectedAssets((prev) => {
            const current = prev[requestItemId] || [];

            if (checked) {
                if (current.length >= max) return prev;

                return {
                    ...prev,
                    [requestItemId]: [...current, assetId],
                };
            }

            return {
                ...prev,
                [requestItemId]: current.filter((id) => id !== assetId),
            };
        });
    };

    const submit = async () => {
        if (!request || !requestId) return;

        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const items: ProcessInventoryRequestItemRequest[] = request.items
                .filter((item) => item.isAssetTracked)
                .map((item) => ({
                    inventoryRequestItemId: item.id,
                    inventoryItemIds: selectedAssets[item.id] || [],
                }));

            await processInventoryRequest(requestId, { items });

            setSuccess('Inventory request processed successfully.');

            setTimeout(() => {
                navigate('/inventory-requests/inventory-pending');
            }, 800);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to process request.');
        } finally {
            setSubmitting(false);
        }
    };

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
                    <Alert severity="error">Request not found.</Alert>
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
                    <Typography variant="h4" fontWeight={900}>
                        Process Inventory Request
                    </Typography>

                    <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                        Issue consumable stock or select physical assets for asset-tracked items.
                    </Typography>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Stack spacing={1} mb={3}>
                            <Typography variant="h6" fontWeight={900}>
                                {request.purpose}
                            </Typography>

                            <Typography color="text.secondary">
                                Requested by {request.requestedBy} — {request.department}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Chip label={request.priority} />
                                <Chip label={request.status} color="primary" />
                            </Stack>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2}>
                            {request.items.map((item) => {
                                const availableAssets = assetsByStock[item.stockId] || [];
                                const selected = selectedAssets[item.id] || [];

                                return (
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
                                                        label={`Available: ${item.quantityAvailable}`}
                                                        variant="outlined"
                                                    />
                                                </Stack>
                                            </Stack>

                                            {item.isAssetTracked ? (
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={900}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        Select available items to assign ({selected.length}/
                                                        {item.quantityRequested})
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 1.5 }}
                                                    >
                                                        Choose the exact physical inventory items that will be assigned to{' '}
                                                        <strong>{request.requestedBy}</strong>.
                                                    </Typography>

                                                    {availableAssets.length === 0 ? (
                                                        <Alert severity="warning">
                                                            No available items found for this stock. This request item cannot be fully issued.
                                                        </Alert>
                                                    ) : (
                                                        <Stack spacing={1}>
                                                            {availableAssets.map((asset) => {
                                                                const isSelected = selected.includes(asset.id);
                                                                const maxReached =
                                                                    selected.length >= item.quantityRequested && !isSelected;

                                                                return (
                                                                    <Paper
                                                                        key={asset.id}
                                                                        variant="outlined"
                                                                        sx={{
                                                                            px: 1.5,
                                                                            py: 1,
                                                                            borderRadius: 3,
                                                                            bgcolor: isSelected ? '#eff6ff' : 'white',
                                                                            borderColor: isSelected ? 'primary.light' : 'divider',
                                                                        }}
                                                                    >
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={isSelected}
                                                                                    disabled={maxReached}
                                                                                    onChange={(event) =>
                                                                                        toggleAsset(
                                                                                            item.id,
                                                                                            asset.id,
                                                                                            event.target.checked,
                                                                                            item.quantityRequested
                                                                                        )
                                                                                    }
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Box>
                                                                                    <Typography fontWeight={800}>
                                                                                        {asset.name}
                                                                                    </Typography>

                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        SKU: {asset.sku || 'N/A'} | Barcode:{' '}
                                                                                        {asset.barcode || 'N/A'} | Serial:{' '}
                                                                                        {asset.serialNumber || 'N/A'}
                                                                                    </Typography>

                                                                                    <Typography variant="caption" color="success.main">
                                                                                        Status: {asset.status}
                                                                                    </Typography>
                                                                                </Box>
                                                                            }
                                                                        />
                                                                    </Paper>
                                                                );
                                                            })}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Alert severity="info">
                                                    Consumable item will be issued automatically based on available quantity.
                                                </Alert>
                                            )}
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>

                        <Box textAlign="right" mt={3}>
                            <Button
                                variant="contained"
                                startIcon={<AssignmentTurnedInIcon />}
                                onClick={submit}
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : 'Process Request'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}