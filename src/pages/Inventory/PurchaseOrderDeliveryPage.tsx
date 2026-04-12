import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getTodayPurchaseOrderDeliveries,
    //receivePurchaseOrderDelivery,
} from '../../services/purchaseOrderReceiptService';

type MuiSeverity = 'success' | 'error' | 'warning' | 'info';

type DeliveryStatus = 'Pending' | 'PartiallyReceived' | 'Received' | 'Delayed';

type InventoryProcessingStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

type PurchaseOrderDeliveryItem = {
    purchaseOrderItemId: string;
    itemName: string;
    sku?: string | null;
    orderedQty: number;
    receivedQty: number;
    remainingQty: number;
    unitPrice: number;
};

type PurchaseOrderDelivery = {
    id: string;
    purchaseOrderNumber: string;
    vendorName: string;
    expectedDate?: string | null;
    nextDeliveryDate?: string | null;
    deliveryTime?: string | null;
    status: DeliveryStatus;
    location: string;
    totalItems: number;
    inventoryProcessingStatus?: InventoryProcessingStatus;
    items: PurchaseOrderDeliveryItem[];
};

type ReceiveRow = {
    purchaseOrderItemId: string;
    itemName: string;
    receiveQty: number;
    orderedQty: number;
    receivedQty: number;
    remainingQty: number;
    location: string;
    condition: string;
    notes: string;
};

type ReceivePayload = {
    purchaseOrderId: string;
    receivedAt: string;
    nextDeliveryDate?: string | null;
    notes?: string;
    items: Array<{
        purchaseOrderItemId: string;
        quantityReceived: number;
        location: string;
        condition: string;
        notes?: string;
    }>;
};

const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getStatusChip = (status: DeliveryStatus) => {
    switch (status) {
        case 'Pending':
            return <Chip label="Due Today" color="warning" size="small" sx={{ fontWeight: 700 }} />;
        case 'PartiallyReceived':
            return (
                <Chip
                    label="Partially Received"
                    color="info"
                    size="small"
                    sx={{ fontWeight: 700 }}
                />
            );
        case 'Received':
            return <Chip label="Received" color="success" size="small" sx={{ fontWeight: 700 }} />;
        case 'Delayed':
            return <Chip label="Delayed" color="error" size="small" sx={{ fontWeight: 700 }} />;
        default:
            return <Chip label={status} size="small" />;
    }
};

const getProcessingChip = (status?: InventoryProcessingStatus) => {
    if (!status) return null;

    switch (status) {
        case 'Pending':
            return <Chip label="Inventory Pending" size="small" variant="outlined" />;
        case 'Processing':
            return <Chip label="Inventory Processing" size="small" color="warning" variant="outlined" />;
        case 'Completed':
            return <Chip label="Inventory Updated" size="small" color="success" variant="outlined" />;
        case 'Failed':
            return <Chip label="Inventory Failed" size="small" color="error" variant="outlined" />;
        default:
            return null;
    }
};

export const PurchaseOrderDeliveryPage = () => {
    const [deliveries, setDeliveries] = useState<PurchaseOrderDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedDelivery, setSelectedDelivery] = useState<PurchaseOrderDelivery | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [receiveRows, setReceiveRows] = useState<ReceiveRow[]>([]);
    const [nextDeliveryDate, setNextDeliveryDate] = useState('');
    const [receiptNotes, setReceiptNotes] = useState('');
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: MuiSeverity;
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        loadDeliveries();
    }, []);

    const showMessage = (message: string, severity: MuiSeverity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const loadDeliveries = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTodayPurchaseOrderDeliveries();
            setDeliveries(data || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load today's deliveries");
        } finally {
            setLoading(false);
        }
    };

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter((delivery) => {
            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q ||
                delivery.purchaseOrderNumber.toLowerCase().includes(q) ||
                delivery.vendorName.toLowerCase().includes(q) ||
                delivery.location.toLowerCase().includes(q);

            const matchesStatus = !statusFilter || delivery.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [deliveries, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: deliveries.length,
            dueToday: deliveries.filter((d) => d.status === 'Pending').length,
            partial: deliveries.filter((d) => d.status === 'PartiallyReceived').length,
            itemsExpected: deliveries.reduce(
                (sum, d) => sum + d.items.reduce((a, b) => a + b.remainingQty, 0),
                0
            ),
        };
    }, [deliveries]);

    const openDetailsDialog = (delivery: PurchaseOrderDelivery) => {
        setSelectedDelivery(delivery);
        setDetailsOpen(true);
    };

    const openReceiveDialog = (delivery: PurchaseOrderDelivery) => {
        setSelectedDelivery(delivery);
        setReceiveRows(
            delivery.items.map((item) => ({
                purchaseOrderItemId: item.purchaseOrderItemId,
                itemName: item.itemName,
                receiveQty: item.remainingQty,
                orderedQty: item.orderedQty,
                receivedQty: item.receivedQty,
                remainingQty: item.remainingQty,
                location: delivery.location || 'Inventory',
                condition: 'Good',
                notes: '',
            }))
        );
        setNextDeliveryDate(delivery.nextDeliveryDate ? delivery.nextDeliveryDate.slice(0, 10) : '');
        setReceiptNotes('');
        setReceiveOpen(true);
    };

    const updateReceiveRow = (
        index: number,
        field: keyof ReceiveRow,
        value: string | number
    ) => {
        setReceiveRows((prev) =>
            prev.map((row, i) => {
                if (i !== index) return row;

                if (field === 'receiveQty') {
                    const numeric = Number(value);
                    const safeValue = Number.isNaN(numeric)
                        ? 0
                        : Math.max(0, Math.min(numeric, row.remainingQty));

                    return {
                        ...row,
                        receiveQty: safeValue,
                    };
                }

                return {
                    ...row,
                    [field]: value,
                };
            })
        );
    };

    const totalReceivingQty = useMemo(
        () => receiveRows.reduce((sum, row) => sum + (Number(row.receiveQty) || 0), 0),
        [receiveRows]
    );

    const totalRemainingAfterReceipt = useMemo(
        () =>
            receiveRows.reduce(
                (sum, row) => sum + Math.max(0, row.remainingQty - (Number(row.receiveQty) || 0)),
                0
            ),
        [receiveRows]
    );

    const totalReceiptValue = useMemo(() => {
        if (!selectedDelivery) return 0;

        const priceLookup = new Map(
            selectedDelivery.items.map((item) => [item.purchaseOrderItemId, item.unitPrice])
        );

        return receiveRows.reduce((sum, row) => {
            const price = priceLookup.get(row.purchaseOrderItemId) || 0;
            return sum + (Number(row.receiveQty) || 0) * price;
        }, 0);
    }, [receiveRows, selectedDelivery]);

    const requiresNextDeliveryDate = totalRemainingAfterReceipt > 0;

    const handleReceiveSubmit = async () => {
        if (!selectedDelivery) return;

        setSubmitting(true);
        setError('');

        try {
            const items = receiveRows
                .filter((row) => Number(row.receiveQty) > 0)
                .map((row) => ({
                    purchaseOrderItemId: row.purchaseOrderItemId,
                    quantityReceived: Number(row.receiveQty),
                    location: row.location,
                    condition: row.condition,
                    notes: row.notes || undefined,
                }));

            if (items.length === 0) {
                showMessage('Please enter received quantity for at least one item.', 'warning');
                setSubmitting(false);
                return;
            }

            if (requiresNextDeliveryDate && !nextDeliveryDate) {
                showMessage(
                    'Please provide the next delivery date because some items are still remaining.',
                    'warning'
                );
                setSubmitting(false);
                return;
            }

            const payload: ReceivePayload = {
                purchaseOrderId: selectedDelivery.id,
                receivedAt: new Date().toISOString(),
                nextDeliveryDate: requiresNextDeliveryDate ? nextDeliveryDate : null,
                notes: receiptNotes || undefined,
                items,
            };

            //await receivePurchaseOrderDelivery(payload);

            showMessage(
                requiresNextDeliveryDate
                    ? `Partial receipt saved for ${selectedDelivery.purchaseOrderNumber}. Next delivery date updated.`
                    : `Delivery for ${selectedDelivery.purchaseOrderNumber} received and queued for inventory update.`,
                'success'
            );

            setReceiveOpen(false);
            setSelectedDelivery(null);
            await loadDeliveries();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to receive delivery');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={800}>
                                Purchase Order Deliveries
                            </Typography>
                            <Typography color="text.secondary">
                                Review today&apos;s incoming deliveries, record receipts, and push received
                                items into inventory.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                            <Button
                                variant="outlined"
                                startIcon={<TodayOutlinedIcon />}
                                onClick={loadDeliveries}
                            >
                                Refresh Today&apos;s Deliveries
                            </Button>
                        </Stack>
                    </Stack>

                    {(error || snackbar.open) && error && <Alert severity="error">{error}</Alert>}

                    <Grid container spacing={2}>
                        {[
                            {
                                label: "Today's Deliveries",
                                value: stats.total,
                                icon: <LocalShippingOutlinedIcon />,
                            },
                            {
                                label: 'Due Today',
                                value: stats.dueToday,
                                icon: <TodayOutlinedIcon />,
                            },
                            {
                                label: 'Partially Received',
                                value: stats.partial,
                                icon: <CheckCircleOutlineOutlinedIcon />,
                            },
                            {
                                label: 'Items Remaining',
                                value: stats.itemsExpected,
                                icon: <Inventory2OutlinedIcon />,
                            },
                        ].map((card) => (
                            <Grid item xs={12} sm={6} lg={3} key={card.label}>
                                <Card
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography color="text.secondary" variant="body2">
                                                {card.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={800} mt={0.5}>
                                                {card.value}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ color: 'primary.main' }}>{card.icon}</Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Card
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by PO number, vendor, or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <Select
                                        displayEmpty
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Pending">Due Today</MenuItem>
                                        <MenuItem value="PartiallyReceived">Partially Received</MenuItem>
                                        <MenuItem value="Received">Received</MenuItem>
                                        <MenuItem value="Delayed">Delayed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        {filteredDeliveries.length} delivery
                                        {filteredDeliveries.length !== 1 ? 'ies' : 'y'} shown
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                        }}
                    >
                        {loading ? (
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Skeleton variant="rounded" height={52} />
                                    <Skeleton variant="rounded" height={52} />
                                    <Skeleton variant="rounded" height={52} />
                                </Stack>
                            </Box>
                        ) : filteredDeliveries.length === 0 ? (
                            <Box sx={{ p: 5, textAlign: 'center' }}>
                                <WarehouseOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="h6" fontWeight={700}>
                                    No deliveries scheduled
                                </Typography>
                                <Typography color="text.secondary" mt={0.5}>
                                    There are no matching purchase order deliveries for the selected view.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Expected</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Next Delivery</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDeliveries.map((delivery) => (
                                            <TableRow key={delivery.id} hover>
                                                <TableCell>
                                                    <Stack spacing={0.35}>
                                                        <Typography fontWeight={700}>
                                                            {delivery.purchaseOrderNumber}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {delivery.deliveryTime || '-'}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>{delivery.vendorName}</TableCell>
                                                <TableCell>{formatDate(delivery.expectedDate)}</TableCell>
                                                <TableCell>
                                                    {delivery.status === 'PartiallyReceived' ? (
                                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                                            <EventRepeatOutlinedIcon
                                                                fontSize="small"
                                                                color="action"
                                                            />
                                                            <Typography variant="body2">
                                                                {formatDate(delivery.nextDeliveryDate)}
                                                            </Typography>
                                                        </Stack>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>{delivery.totalItems}</TableCell>
                                                <TableCell>{delivery.location || '-'}</TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.75}>
                                                        {getStatusChip(delivery.status)}
                                                        {getProcessingChip(delivery.inventoryProcessingStatus)}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            startIcon={<VisibilityOutlinedIcon />}
                                                            onClick={() => openDetailsDialog(delivery)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<AddTaskOutlinedIcon />}
                                                            onClick={() => openReceiveDialog(delivery)}
                                                            disabled={delivery.status === 'Received'}
                                                        >
                                                            Receive
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>
                </Stack>
            </Box>

            <Dialog
                open={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false);
                    setSelectedDelivery(null);
                }}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogContent dividers>
                    {selectedDelivery && (
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        PO Number
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {selectedDelivery.purchaseOrderNumber}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vendor
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {selectedDelivery.vendorName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Delivery Status
                                    </Typography>
                                    <Box mt={0.5}>{getStatusChip(selectedDelivery.status)}</Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Expected Date
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {formatDate(selectedDelivery.expectedDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Next Delivery Date
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {selectedDelivery.nextDeliveryDate
                                            ? formatDate(selectedDelivery.nextDeliveryDate)
                                            : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Delivery Location
                                    </Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.location}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Ordered</TableCell>
                                        <TableCell>Received</TableCell>
                                        <TableCell>Remaining</TableCell>
                                        <TableCell>Unit Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedDelivery.items.map((item) => (
                                        <TableRow key={item.purchaseOrderItemId}>
                                            <TableCell>
                                                <Stack spacing={0.25}>
                                                    <Typography fontWeight={600}>
                                                        {item.itemName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.sku || '-'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{item.orderedQty}</TableCell>
                                            <TableCell>{item.receivedQty}</TableCell>
                                            <TableCell>{item.remainingQty}</TableCell>
                                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDetailsOpen(false);
                            setSelectedDelivery(null);
                        }}
                    >
                        Close
                    </Button>
                    {selectedDelivery && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDetailsOpen(false);
                                openReceiveDialog(selectedDelivery);
                            }}
                        >
                            Receive Items
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={receiveOpen}
                onClose={() => !submitting && setReceiveOpen(false)}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>Receive Delivery Into Inventory</DialogTitle>
                <DialogContent dividers>
                    {selectedDelivery && (
                        <Stack spacing={2}>
                            <Alert severity="info">
                                Record the delivered quantities. If some items are still pending, set the
                                next delivery date so the order remains partially received.
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        PO Number
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {selectedDelivery.purchaseOrderNumber}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vendor
                                    </Typography>
                                    <Typography fontWeight={700}>
                                        {selectedDelivery.vendorName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Delivery Location
                                    </Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.location}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Stack spacing={2}>
                                {receiveRows.map((row, index) => (
                                    <Card
                                        key={row.purchaseOrderItemId}
                                        variant="outlined"
                                        sx={{ p: 2, borderRadius: 2 }}
                                    >
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={3}>
                                                <Typography fontWeight={700}>{row.itemName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Ordered: {row.orderedQty} | Received: {row.receivedQty} |
                                                    Remaining: {row.remainingQty}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Receive Qty"
                                                    value={row.receiveQty}
                                                    onChange={(e) =>
                                                        updateReceiveRow(
                                                            index,
                                                            'receiveQty',
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    inputProps={{ min: 0, max: row.remainingQty }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    label="Location"
                                                    value={row.location}
                                                    onChange={(e) =>
                                                        updateReceiveRow(index, 'location', e.target.value)
                                                    }
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Condition"
                                                    value={row.condition}
                                                    onChange={(e) =>
                                                        updateReceiveRow(index, 'condition', e.target.value)
                                                    }
                                                >
                                                    <MenuItem value="Good">Good</MenuItem>
                                                    <MenuItem value="Damaged">Damaged</MenuItem>
                                                    <MenuItem value="Needs Inspection">
                                                        Needs Inspection
                                                    </MenuItem>
                                                </TextField>
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Notes"
                                                    value={row.notes}
                                                    onChange={(e) =>
                                                        updateReceiveRow(index, 'notes', e.target.value)
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Receiving Now
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800}>
                                            {totalReceivingQty}
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Remaining After This Receipt
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800}>
                                            {totalRemainingAfterReceipt}
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Receipt Value
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800}>
                                            {formatCurrency(totalReceiptValue)}
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {requiresNextDeliveryDate && (
                                <Card
                                    variant="outlined"
                                    sx={{ p: 2, borderRadius: 2, bgcolor: '#fcfcfd' }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                        <AutorenewOutlinedIcon color="action" fontSize="small" />
                                        <Typography fontWeight={700}>
                                            Remaining Items Need Another Delivery
                                        </Typography>
                                    </Stack>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                label="Next Delivery Date"
                                                value={nextDeliveryDate}
                                                onChange={(e) => setNextDeliveryDate(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                helperText="Required because not all items are being received now"
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Receipt Notes"
                                                value={receiptNotes}
                                                onChange={(e) => setReceiptNotes(e.target.value)}
                                                placeholder="Optional note for the remaining delivery"
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>
                            )}

                            {!requiresNextDeliveryDate && (
                                <TextField
                                    fullWidth
                                    label="Receipt Notes"
                                    value={receiptNotes}
                                    onChange={(e) => setReceiptNotes(e.target.value)}
                                    placeholder="Optional notes for this receipt"
                                />
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReceiveOpen(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleReceiveSubmit} disabled={submitting}>
                        {submitting ? 'Receiving...' : 'Receive and Add to Inventory'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </DashboardLayout>
    );
};

export default PurchaseOrderDeliveryPage;