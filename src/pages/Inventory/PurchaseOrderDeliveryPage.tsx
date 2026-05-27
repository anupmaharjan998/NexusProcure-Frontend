import { useEffect, useMemo, useState } from 'react';
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
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AssignmentTurnedIn,
    CalendarMonth,
    Close,
    Inventory2,
    LocalShipping,
    Notes,
    Numbers,
    Place,
    ReceiptLong,
    Search,
    Storefront,
    WarningAmber,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout.tsx';

type DeliveryItem = {
    purchaseOrderItemId: string;
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    remainingQty: number;
};

type Delivery = {
    id: string;
    purchaseOrderNumber: string;
    vendorName: string;
    expectedDate: string;
    status: string;
    totalItems: number;
    items: DeliveryItem[];
};

type DeliveryItemRow = {
    purchaseOrderItemId: string;
    itemName: string;
    remainingQty: number;
    quantityReceived: number;
    location: string;
    condition: string;
    notes: string;
};

const dummyDeliveries: Delivery[] = [
    {
        id: 'po-001',
        purchaseOrderNumber: 'PO-2026-0001',
        vendorName: 'Tech Supplies Nepal',
        expectedDate: '2026-05-25T00:00:00Z',
        status: 'Pending',
        totalItems: 3,
        items: [
            {
                purchaseOrderItemId: 'poi-001',
                itemName: 'Dell Latitude 5440 Laptop',
                orderedQty: 10,
                receivedQty: 0,
                remainingQty: 10,
            },
            {
                purchaseOrderItemId: 'poi-002',
                itemName: 'Logitech Wireless Mouse',
                orderedQty: 25,
                receivedQty: 5,
                remainingQty: 20,
            },
            {
                purchaseOrderItemId: 'poi-003',
                itemName: 'Laptop Bag',
                orderedQty: 10,
                receivedQty: 0,
                remainingQty: 10,
            },
        ],
    },
    {
        id: 'po-002',
        purchaseOrderNumber: 'PO-2026-0002',
        vendorName: 'Office World Suppliers',
        expectedDate: '2026-05-28T00:00:00Z',
        status: 'Partial',
        totalItems: 2,
        items: [
            {
                purchaseOrderItemId: 'poi-004',
                itemName: 'A4 Paper Ream',
                orderedQty: 100,
                receivedQty: 40,
                remainingQty: 60,
            },
            {
                purchaseOrderItemId: 'poi-005',
                itemName: 'Blue Ball Pen Box',
                orderedQty: 50,
                receivedQty: 25,
                remainingQty: 25,
            },
        ],
    },
    {
        id: 'po-003',
        purchaseOrderNumber: 'PO-2026-0003',
        vendorName: 'Network Solutions Pvt. Ltd.',
        expectedDate: '2026-06-02T00:00:00Z',
        status: 'Pending',
        totalItems: 4,
        items: [
            {
                purchaseOrderItemId: 'poi-006',
                itemName: 'Cisco 24-Port Switch',
                orderedQty: 5,
                receivedQty: 0,
                remainingQty: 5,
            },
            {
                purchaseOrderItemId: 'poi-007',
                itemName: 'CAT6 Ethernet Cable 10m',
                orderedQty: 40,
                receivedQty: 0,
                remainingQty: 40,
            },
            {
                purchaseOrderItemId: 'poi-008',
                itemName: 'TP-Link WiFi Router',
                orderedQty: 8,
                receivedQty: 2,
                remainingQty: 6,
            },
            {
                purchaseOrderItemId: 'poi-009',
                itemName: 'RJ45 Connector Pack',
                orderedQty: 20,
                receivedQty: 0,
                remainingQty: 20,
            },
        ],
    },
    {
        id: 'po-004',
        purchaseOrderNumber: 'PO-2026-0004',
        vendorName: 'Furniture Hub',
        expectedDate: '2026-06-05T00:00:00Z',
        status: 'Received',
        totalItems: 2,
        items: [
            {
                purchaseOrderItemId: 'poi-010',
                itemName: 'Office Chair',
                orderedQty: 12,
                receivedQty: 12,
                remainingQty: 0,
            },
            {
                purchaseOrderItemId: 'poi-011',
                itemName: 'Office Desk',
                orderedQty: 6,
                receivedQty: 6,
                remainingQty: 0,
            },
        ],
    },
];

const conditionOptions = ['Good', 'Damaged', 'NeedsRepair'];

const initialRowDefaults = {
    location: 'Inventory',
    condition: 'Good',
    notes: '',
};

export default function PurchaseOrderDeliveryPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [selected, setSelected] = useState<Delivery | null>(null);
    const [rows, setRows] = useState<DeliveryItemRow[]>([]);
    const [notes, setNotes] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const load = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            await new Promise((resolve) => setTimeout(resolve, 350));
            setDeliveries(dummyDeliveries);
        } catch {
            setErrorMessage('Failed to load purchase order deliveries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredDeliveries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return deliveries.filter((delivery) => {
            const matchesSearch =
                !query ||
                delivery.purchaseOrderNumber.toLowerCase().includes(query) ||
                delivery.vendorName.toLowerCase().includes(query) ||
                delivery.status.toLowerCase().includes(query);

            const matchesStatus =
                !statusFilter ||
                delivery.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [deliveries, search, statusFilter]);

    const stats = useMemo(() => {
        const total = deliveries.length;
        const pending = deliveries.filter((d) =>
            d.status.toLowerCase().includes('pending')
        ).length;
        const partial = deliveries.filter((d) =>
            d.status.toLowerCase().includes('partial')
        ).length;
        const totalItems = deliveries.reduce(
            (sum, d) => sum + Number(d.totalItems || d.items?.length || 0),
            0
        );

        return {
            total,
            pending,
            partial,
            totalItems,
        };
    }, [deliveries]);

    const totalReceiving = useMemo(() => {
        return rows.reduce((sum, row) => sum + Number(row.quantityReceived || 0), 0);
    }, [rows]);

    const invalidRows = useMemo(() => {
        return rows.filter((row) => {
            const qty = Number(row.quantityReceived || 0);
            return qty < 0 || qty > Number(row.remainingQty || 0);
        });
    }, [rows]);

    const hasReceivableItems = useMemo(() => {
        return rows.some((row) => Number(row.quantityReceived || 0) > 0);
    }, [rows]);

    const isSubmitDisabled =
        saving || !selected || invalidRows.length > 0 || !hasReceivableItems;

    const openReceive = (delivery: Delivery) => {
        setSelected(delivery);
        setNotes('');
        setErrorMessage('');

        setRows(
            delivery.items
                .filter((item) => Number(item.remainingQty || 0) > 0)
                .map((item) => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    itemName: item.itemName,
                    remainingQty: Number(item.remainingQty || 0),
                    quantityReceived: Number(item.remainingQty || 0),
                    location: initialRowDefaults.location,
                    condition: initialRowDefaults.condition,
                    notes: initialRowDefaults.notes,
                }))
        );
    };

    const closeReceiveDialog = () => {
        if (saving) return;

        setSelected(null);
        setRows([]);
        setNotes('');
    };

    const updateRow = (index: number, key: keyof DeliveryItemRow, value: any) => {
        setRows((currentRows) =>
            currentRows.map((row, rowIndex) => {
                if (rowIndex !== index) return row;

                if (key === 'quantityReceived') {
                    return {
                        ...row,
                        quantityReceived: Number(value),
                    };
                }

                return {
                    ...row,
                    [key]: value,
                };
            })
        );
    };

    const fillAllRemaining = () => {
        setRows((currentRows) =>
            currentRows.map((row) => ({
                ...row,
                quantityReceived: Number(row.remainingQty || 0),
            }))
        );
    };

    const clearAllQuantities = () => {
        setRows((currentRows) =>
            currentRows.map((row) => ({
                ...row,
                quantityReceived: 0,
            }))
        );
    };

    const submitReceive = async () => {
        if (!selected || isSubmitDisabled) return;

        setSaving(true);
        setErrorMessage('');

        try {
            const payload = {
                purchaseOrderId: selected.id,
                receivedDate: new Date().toISOString(),
                notes: notes.trim(),
                items: rows
                    .filter((row) => Number(row.quantityReceived) > 0)
                    .map((row) => ({
                        purchaseOrderItemId: row.purchaseOrderItemId,
                        quantityReceived: Number(row.quantityReceived),
                        location: row.location.trim() || 'Inventory',
                        condition: row.condition,
                        notes: row.notes.trim(),
                    })),
            };

            console.log('Dummy receipt payload:', payload);

            await new Promise((resolve) => setTimeout(resolve, 600));

            setDeliveries((currentDeliveries) =>
                currentDeliveries.map((delivery) => {
                    if (delivery.id !== selected.id) return delivery;

                    const updatedItems = delivery.items.map((item) => {
                        const receivedRow = rows.find(
                            (row) => row.purchaseOrderItemId === item.purchaseOrderItemId
                        );

                        if (!receivedRow) return item;

                        const receivedNow = Number(receivedRow.quantityReceived || 0);
                        const newReceivedQty = Number(item.receivedQty || 0) + receivedNow;
                        const newRemainingQty = Math.max(
                            0,
                            Number(item.remainingQty || 0) - receivedNow
                        );

                        return {
                            ...item,
                            receivedQty: newReceivedQty,
                            remainingQty: newRemainingQty,
                        };
                    });

                    const allReceived = updatedItems.every(
                        (item) => Number(item.remainingQty || 0) === 0
                    );

                    const anyReceived = updatedItems.some(
                        (item) => Number(item.receivedQty || 0) > 0
                    );

                    return {
                        ...delivery,
                        items: updatedItems,
                        status: allReceived ? 'Received' : anyReceived ? 'Partial' : 'Pending',
                    };
                })
            );

            closeReceiveDialog();
        } catch {
            setErrorMessage('Failed to submit purchase order receipt.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: unknown) => {
        const value = String(status || '').toLowerCase();

        if (value.includes('complete') || value.includes('received')) return 'success';
        if (value.includes('partial')) return 'warning';
        if (value.includes('cancel')) return 'error';
        if (value.includes('pending') || value.includes('open')) return 'primary';

        return 'default';
    };

    const formatDate = (value: string | null | undefined) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString();
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
                <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            mb: 3,
                            borderRadius: 5,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            background:
                                'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                width: 260,
                                height: 260,
                                borderRadius: '50%',
                                right: -90,
                                top: -100,
                                bgcolor: 'rgba(255,255,255,0.08)',
                            }}
                        />

                        <Box
                            sx={{
                                position: 'absolute',
                                width: 170,
                                height: 170,
                                borderRadius: '50%',
                                right: 140,
                                bottom: -110,
                                bgcolor: 'rgba(255,255,255,0.06)',
                            }}
                        />

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={3}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 68,
                                        height: 68,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <LocalShipping sx={{ fontSize: 36 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Purchase Order Deliveries
                                    </Typography>

                                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
                                        Receive ordered items, verify quantities, and move delivered stock into inventory.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={<ReceiptLong />}
                                onClick={load}
                                disabled={loading}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#0f172a',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.1,
                                    textTransform: 'none',
                                    fontWeight: 900,
                                    '&:hover': {
                                        bgcolor: '#f1f5f9',
                                    },
                                }}
                            >
                                Refresh Dummy Data
                            </Button>
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<ReceiptLong />}
                                title="Total Deliveries"
                                value={stats.total}
                                helper="Receiving records"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<WarningAmber />}
                                title="Pending"
                                value={stats.pending}
                                helper="Awaiting receipt"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<AssignmentTurnedIn />}
                                title="Partial"
                                value={stats.partial}
                                helper="Partially received"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<Inventory2 />}
                                title="Total Items"
                                value={stats.totalItems}
                                helper="Items to receive"
                            />
                        </Grid>
                    </Grid>

                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                        }}
                    >
                        {loading && <LinearProgress />}

                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Deliveries Ready for Receiving
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Search purchase orders and receive pending item quantities.
                                    </Typography>
                                </Box>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1.5}
                                    sx={{ width: { xs: '100%', md: 'auto' } }}
                                >
                                    <TextField
                                        placeholder="Search PO, vendor, status..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: { xs: '100%', md: 320 },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        select
                                        label="Status"
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: { xs: '100%', sm: 180 },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                            },
                                        }}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Partial">Partial</MenuItem>
                                        <MenuItem value="Received">Received</MenuItem>
                                    </TextField>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={6}>
                            <CircularProgress />
                        </Box>
                    ) : filteredDeliveries.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <Grid container spacing={2.5}>
                            {filteredDeliveries.map((delivery) => (
                                <Grid item xs={12} md={6} lg={4} key={delivery.id}>
                                    <DeliveryCard
                                        delivery={delivery}
                                        getStatusColor={getStatusColor}
                                        formatDate={formatDate}
                                        onReceive={() => openReceive(delivery)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                <Dialog
                    open={Boolean(selected)}
                    onClose={closeReceiveDialog}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 5,
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={2}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 3,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                >
                                    <ReceiptLong />
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Receive Purchase Order
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selected?.purchaseOrderNumber || 'Purchase order'} from{' '}
                                        {selected?.vendorName || 'vendor'}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Tooltip title="Close">
                                <IconButton onClick={closeReceiveDialog} disabled={saving}>
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                                        Enter the quantity received for each item. Quantities cannot exceed the remaining quantity.
                                    </Alert>

                                    {invalidRows.length > 0 && (
                                        <Alert severity="error" sx={{ borderRadius: 3 }}>
                                            One or more rows have invalid received quantities.
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Receipt Notes"
                                        placeholder="Example: Items received and checked by warehouse team"
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Notes />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1.5}
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'stretch', sm: 'center' }}
                                    >
                                        <Typography variant="h6" fontWeight={900}>
                                            Items to Receive
                                        </Typography>

                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="outlined"
                                                onClick={fillAllRemaining}
                                                disabled={saving}
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                }}
                                            >
                                                Fill Remaining
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                onClick={clearAllQuantities}
                                                disabled={saving}
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                }}
                                            >
                                                Clear Qty
                                            </Button>
                                        </Stack>
                                    </Stack>

                                    <Stack spacing={2}>
                                        {rows.map((row, index) => {
                                            const quantity = Number(row.quantityReceived || 0);
                                            const remaining = Number(row.remainingQty || 0);
                                            const hasError = quantity < 0 || quantity > remaining;

                                            return (
                                                <Card
                                                    key={row.purchaseOrderItemId}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 4,
                                                        borderColor: hasError ? 'error.main' : 'divider',
                                                        bgcolor: hasError ? '#fef2f2' : 'white',
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Stack spacing={2}>
                                                            <Stack
                                                                direction={{ xs: 'column', sm: 'row' }}
                                                                justifyContent="space-between"
                                                                spacing={1}
                                                            >
                                                                <Box>
                                                                    <Typography fontWeight={900}>
                                                                        {row.itemName}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Remaining quantity: {remaining}
                                                                    </Typography>
                                                                </Box>

                                                                <Chip
                                                                    size="small"
                                                                    label={
                                                                        quantity > 0
                                                                            ? `Receiving ${quantity}`
                                                                            : 'Skipping'
                                                                    }
                                                                    color={quantity > 0 ? 'primary' : 'default'}
                                                                    sx={{ width: 'fit-content', fontWeight: 800 }}
                                                                />
                                                            </Stack>

                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} md={3}>
                                                                    <TextField
                                                                        label="Quantity Received"
                                                                        type="number"
                                                                        value={row.quantityReceived}
                                                                        onChange={(event) =>
                                                                            updateRow(
                                                                                index,
                                                                                'quantityReceived',
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        fullWidth
                                                                        error={hasError}
                                                                        helperText={
                                                                            hasError
                                                                                ? `Must be between 0 and ${remaining}`
                                                                                : ' '
                                                                        }
                                                                        InputProps={{
                                                                            inputProps: {
                                                                                min: 0,
                                                                                max: remaining,
                                                                            },
                                                                            startAdornment: (
                                                                                <InputAdornment position="start">
                                                                                    <Numbers />
                                                                                </InputAdornment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                </Grid>

                                                                <Grid item xs={12} md={3}>
                                                                    <TextField
                                                                        label="Location"
                                                                        value={row.location}
                                                                        onChange={(event) =>
                                                                            updateRow(index, 'location', event.target.value)
                                                                        }
                                                                        fullWidth
                                                                        helperText=" "
                                                                        InputProps={{
                                                                            startAdornment: (
                                                                                <InputAdornment position="start">
                                                                                    <Place />
                                                                                </InputAdornment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                </Grid>

                                                                <Grid item xs={12} md={3}>
                                                                    <TextField
                                                                        select
                                                                        label="Condition"
                                                                        value={row.condition}
                                                                        onChange={(event) =>
                                                                            updateRow(
                                                                                index,
                                                                                'condition',
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        fullWidth
                                                                        helperText=" "
                                                                    >
                                                                        {conditionOptions.map((condition) => (
                                                                            <MenuItem key={condition} value={condition}>
                                                                                {condition === 'NeedsRepair'
                                                                                    ? 'Needs Repair'
                                                                                    : condition}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                </Grid>

                                                                <Grid item xs={12} md={3}>
                                                                    <TextField
                                                                        label="Item Notes"
                                                                        value={row.notes}
                                                                        onChange={(event) =>
                                                                            updateRow(index, 'notes', event.target.value)
                                                                        }
                                                                        fullWidth
                                                                        helperText=" "
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Stack>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 4,
                                        bgcolor: '#f8fafc',
                                        position: { md: 'sticky' },
                                        top: { md: 16 },
                                    }}
                                >
                                    <Stack spacing={2.5}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 4,
                                                bgcolor: '#eff6ff',
                                                color: 'primary.main',
                                                display: 'grid',
                                                placeItems: 'center',
                                            }}
                                        >
                                            <AssignmentTurnedIn sx={{ fontSize: 30 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Receipt Summary
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Review before submitting this receipt.
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <SummaryRow
                                            label="Purchase Order"
                                            value={selected?.purchaseOrderNumber || '-'}
                                        />

                                        <SummaryRow
                                            label="Vendor"
                                            value={selected?.vendorName || '-'}
                                        />

                                        <SummaryRow
                                            label="Expected Date"
                                            value={formatDate(selected?.expectedDate)}
                                        />

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                label={`${rows.length} item rows`}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontWeight: 800 }}
                                            />

                                            <Chip
                                                label={`${totalReceiving} total qty`}
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontWeight: 800 }}
                                            />
                                        </Stack>

                                        {!hasReceivableItems && (
                                            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                                Enter at least one received quantity before submitting.
                                            </Alert>
                                        )}

                                        {invalidRows.length > 0 && (
                                            <Alert severity="error" sx={{ borderRadius: 3 }}>
                                                Fix invalid quantities before submitting.
                                            </Alert>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={closeReceiveDialog}
                            disabled={saving}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<AssignmentTurnedIn />}
                            onClick={submitReceive}
                            disabled={isSubmitDisabled}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 900,
                                px: 3,
                            }}
                        >
                            {saving ? 'Submitting...' : 'Submit Receipt'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}

function StatCard({
                      icon,
                      title,
                      value,
                      helper,
                  }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    helper: string;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            bgcolor: '#eff6ff',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>

                        <Typography variant="h5" fontWeight={900}>
                            {value}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {helper}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function DeliveryCard({
                          delivery,
                          getStatusColor,
                          formatDate,
                          onReceive,
                      }: {
    delivery: Delivery;
    getStatusColor: (status: unknown) => any;
    formatDate: (value: string | null | undefined) => string;
    onReceive: () => void;
}) {
    const receivableItems =
        delivery.items?.filter((item) => Number(item.remainingQty || 0) > 0) || [];

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                transition: '0.2s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 35px rgba(15,23,42,0.10)',
                },
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 3,
                                    bgcolor: '#eff6ff',
                                    color: 'primary.main',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <ReceiptLong />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {delivery.purchaseOrderNumber}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    {delivery.vendorName || 'Unknown vendor'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            size="small"
                            label={delivery.status || 'Pending'}
                            color={getStatusColor(delivery.status)}
                            sx={{ fontWeight: 800 }}
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <InfoLine
                            icon={<Storefront />}
                            label="Vendor"
                            value={delivery.vendorName || '-'}
                        />

                        <InfoLine
                            icon={<CalendarMonth />}
                            label="Expected"
                            value={formatDate(delivery.expectedDate)}
                        />

                        <InfoLine
                            icon={<Inventory2 />}
                            label="Total Items"
                            value={String(delivery.totalItems ?? delivery.items?.length ?? 0)}
                        />

                        <InfoLine
                            icon={<AssignmentTurnedIn />}
                            label="Receivable"
                            value={String(receivableItems.length)}
                        />
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AssignmentTurnedIn />}
                        onClick={onReceive}
                        disabled={receivableItems.length === 0}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 900,
                        }}
                    >
                        Receive Items
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

function InfoLine({
                      icon,
                      label,
                      value,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
                sx={{
                    color: 'text.secondary',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                {icon}
            </Box>

            <Typography variant="body2" color="text.secondary">
                {label}:
            </Typography>

            <Typography variant="body2" fontWeight={800}>
                {value}
            </Typography>
        </Stack>
    );
}

function SummaryRow({
                        label,
                        value,
                    }: {
    label: string;
    value: string;
}) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography fontWeight={900}>{value}</Typography>
        </Box>
    );
}

function EmptyState() {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: 7,
                px: 2,
                borderRadius: 5,
                textAlign: 'center',
                bgcolor: 'white',
            }}
        >
            <Box
                sx={{
                    width: 74,
                    height: 74,
                    borderRadius: 5,
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <LocalShipping sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h6" fontWeight={900}>
                No deliveries found
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                There are no purchase order deliveries matching your filters.
            </Typography>
        </Paper>
    );
}