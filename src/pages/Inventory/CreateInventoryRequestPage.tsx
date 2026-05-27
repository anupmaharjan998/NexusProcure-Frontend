import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import Inventory2Icon from '@mui/icons-material/Inventory2';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Button } from '../../components/UI/Button';
import { createInventoryRequest } from '../../services/inventoryRequestService';
import { getInventoryStocks } from '../../services/inventoryService';

interface StockOption {
    id: string;
    name: string;
    categoryName?: string;
    quantityAvailable: number;
    isAssetTracked?: boolean;
}

interface FormItem {
    stockId: string;
    quantity: number;
}

export default function CreateInventoryRequestPage() {
    const [purpose, setPurpose] = useState('');
    const [priority, setPriority] = useState<number>(2);

    const [items, setItems] = useState<FormItem[]>([
        {
            stockId: '',
            quantity: 1,
        },
    ]);

    const [stocks, setStocks] = useState<StockOption[]>([]);
    const [loadingStocks, setLoadingStocks] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadStocks = async () => {
        setLoadingStocks(true);
        setError('');

        try {
            const res = await getInventoryStocks({
                pageNumber: 1,
                pageSize: 500,
            });

            setStocks(res.items || res.stocks || res.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load inventory stock.');
        } finally {
            setLoadingStocks(false);
        }
    };

    useEffect(() => {
        loadStocks();
    }, []);

    const selectedStockIds = useMemo(
        () => items.map((item) => item.stockId).filter(Boolean),
        [items]
    );

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                stockId: '',
                quantity: 1,
            },
        ]);
    };

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, patch: Partial<FormItem>) => {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
        );
    };

    const resetForm = () => {
        setPurpose('');
        setPriority(2);
        setItems([
            {
                stockId: '',
                quantity: 1,
            },
        ]);
    };

    const submit = async () => {
        setError('');
        setSuccess('');

        if (!purpose.trim()) {
            setError('Purpose is required.');
            return;
        }

        if (!items.length || items.some((item) => !item.stockId)) {
            setError('Please select all requested stock items.');
            return;
        }

        if (items.some((item) => Number(item.quantity) <= 0)) {
            setError('Quantity must be greater than zero.');
            return;
        }

        const duplicateStock =
            selectedStockIds.length !== new Set(selectedStockIds).size;

        if (duplicateStock) {
            setError('Duplicate stock items are not allowed. Increase quantity instead.');
            return;
        }

        setSubmitting(true);

        try {
            await createInventoryRequest({
                purpose: purpose.trim(),
                priority: priority as 1 | 2 | 3 | 4,
                items: items.map((item) => ({
                    stockId: item.stockId,
                    quantity: Number(item.quantity),
                })),
            });

            setSuccess('Inventory request submitted successfully.');
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f8fafc',
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 4 },
                }}
            >
                <Box sx={{ maxWidth: 1050, mx: 'auto' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            mb: 3,
                            borderRadius: 5,
                            color: 'white',
                            background:
                                'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.14)',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <Inventory2Icon sx={{ fontSize: 34 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" fontWeight={900}>
                                    New Inventory Request
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    Request consumable stock or asset-tracked inventory items.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack spacing={3}>
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    spacing={2}
                                >
                                    <TextField
                                        label="Priority"
                                        select
                                        value={priority}
                                        onChange={(event) =>
                                            setPriority(Number(event.target.value))
                                        }
                                        fullWidth
                                    >
                                        <MenuItem value={1}>Low</MenuItem>
                                        <MenuItem value={2}>Medium</MenuItem>
                                        <MenuItem value={3}>High</MenuItem>
                                        <MenuItem value={4}>Urgent</MenuItem>
                                    </TextField>

                                    <TextField
                                        label="Purpose"
                                        value={purpose}
                                        onChange={(event) => setPurpose(event.target.value)}
                                        fullWidth
                                        placeholder="Example: Need routers for network lab setup"
                                    />
                                </Stack>

                                <Divider />

                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={2}
                                    >
                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Requested Items
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Select stock item and required quantity.
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={addItem}
                                            disabled={loadingStocks}
                                        >
                                            Add Item
                                        </Button>
                                    </Stack>

                                    <Stack spacing={2}>
                                        {items.map((item, index) => {
                                            const selectedStock = stocks.find(
                                                (stock) => stock.id === item.stockId
                                            );

                                            return (
                                                <Paper
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: '#f8fafc',
                                                    }}
                                                >
                                                    <Stack
                                                        direction={{ xs: 'column', md: 'row' }}
                                                        spacing={2}
                                                        alignItems={{ xs: 'stretch', md: 'center' }}
                                                    >
                                                        <TextField
                                                            label="Stock Item"
                                                            select
                                                            value={item.stockId}
                                                            onChange={(event) =>
                                                                updateItem(index, {
                                                                    stockId: event.target.value,
                                                                })
                                                            }
                                                            fullWidth
                                                        >
                                                            {stocks.map((stock) => (
                                                                <MenuItem
                                                                    key={stock.id}
                                                                    value={stock.id}
                                                                    disabled={
                                                                        selectedStockIds.includes(
                                                                            stock.id
                                                                        ) && stock.id !== item.stockId
                                                                    }
                                                                >
                                                                    {stock.name} — Available:{' '}
                                                                    {stock.quantityAvailable}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>

                                                        <TextField
                                                            label="Quantity"
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(event) =>
                                                                updateItem(index, {
                                                                    quantity: Number(event.target.value),
                                                                })
                                                            }
                                                            sx={{ width: { xs: '100%', md: 180 } }}
                                                            inputProps={{ min: 1 }}
                                                        />

                                                        <IconButton
                                                            color="error"
                                                            onClick={() => removeItem(index)}
                                                            disabled={items.length === 1}
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Stack>

                                                    {selectedStock && (
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            mt={1.5}
                                                            flexWrap="wrap"
                                                            useFlexGap
                                                        >
                                                            <Chip
                                                                size="small"
                                                                label={`Available: ${selectedStock.quantityAvailable}`}
                                                                variant="outlined"
                                                            />

                                                            <Chip
                                                                size="small"
                                                                label={
                                                                    selectedStock.isAssetTracked
                                                                        ? 'Asset Tracked'
                                                                        : 'Consumable'
                                                                }
                                                                color={
                                                                    selectedStock.isAssetTracked
                                                                        ? 'primary'
                                                                        : 'default'
                                                                }
                                                            />

                                                            {selectedStock.categoryName && (
                                                                <Chip
                                                                    size="small"
                                                                    label={selectedStock.categoryName}
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Stack>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                </Box>

                                <Box textAlign="right">
                                    <Button
                                        variant="contained"
                                        startIcon={<SendIcon />}
                                        onClick={submit}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </DashboardLayout>
    );
}