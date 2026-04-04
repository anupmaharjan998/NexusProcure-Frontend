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
import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';

// Replace these with real services
// import {
//   getTodayPurchaseOrderDeliveries,
//   receivePurchaseOrderDelivery,
// } from '../../services/purchaseOrderService';

type DeliveryStatus = 'Due Today' | 'Partially Received' | 'Received' | 'Delayed';

type PurchaseOrderDeliveryItem = {
    id: string;
    itemName: string;
    sku?: string;
    orderedQty: number;
    receivedQty: number;
    remainingQty: number;
    unitPrice: number;
};

type PurchaseOrderDelivery = {
    id: string;
    purchaseOrderNumber: string;
    vendorName: string;
    expectedDate: string;
    deliveryTime?: string;
    status: DeliveryStatus;
    location: string;
    totalItems: number;
    items: PurchaseOrderDeliveryItem[];
};

type ReceiveRow = {
    deliveryItemId: string;
    itemName: string;
    receiveQty: number;
    orderedQty: number;
    remainingQty: number;
    inventoryCategoryId?: string;
    location: string;
    condition: string;
    notes: string;
};

const mockDeliveries: PurchaseOrderDelivery[] = [
    {
        id: '1',
        purchaseOrderNumber: 'PO-2026-0142',
        vendorName: 'Nexus Tech Supplies',
        expectedDate: '2026-04-03',
        deliveryTime: '10:30 AM',
        status: 'Due Today',
        location: 'Main Receiving Bay',
        totalItems: 3,
        items: [
            {
                id: '1-1',
                itemName: 'Dell Latitude 5440',
                sku: 'DELL-LAP-5440',
                orderedQty: 8,
                receivedQty: 0,
                remainingQty: 8,
                unitPrice: 1250,
            },
            {
                id: '1-2',
                itemName: 'Dell Docking Station',
                sku: 'DELL-DOCK-001',
                orderedQty: 8,
                receivedQty: 0,
                remainingQty: 8,
                unitPrice: 140,
            },
            {
                id: '1-3',
                itemName: 'Laptop Backpack',
                sku: 'BAG-LTP-101',
                orderedQty: 8,
                receivedQty: 0,
                remainingQty: 8,
                unitPrice: 35,
            },
        ],
    },
    {
        id: '2',
        purchaseOrderNumber: 'PO-2026-0146',
        vendorName: 'Office Build Nepal',
        expectedDate: '2026-04-03',
        deliveryTime: '02:00 PM',
        status: 'Partially Received',
        location: 'Store Room A',
        totalItems: 2,
        items: [
            {
                id: '2-1',
                itemName: 'Ergonomic Office Chair',
                sku: 'CHR-ERG-220',
                orderedQty: 20,
                receivedQty: 10,
                remainingQty: 10,
                unitPrice: 190,
            },
            {
                id: '2-2',
                itemName: 'Height Adjustable Desk',
                sku: 'DSK-ADJ-310',
                orderedQty: 10,
                receivedQty: 4,
                remainingQty: 6,
                unitPrice: 320,
            },
        ],
    },
];

const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getStatusChip = (status: DeliveryStatus) => {
    switch (status) {
        case 'Due Today':
            return <Chip label={status} color="warning" size="small" sx={{ fontWeight: 700 }} />;
        case 'Partially Received':
            return <Chip label={status} color="info" size="small" sx={{ fontWeight: 700 }} />;
        case 'Received':
            return <Chip label={status} color="success" size="small" sx={{ fontWeight: 700 }} />;
        case 'Delayed':
            return <Chip label={status} color="error" size="small" sx={{ fontWeight: 700 }} />;
        default:
            return <Chip label={status} size="small" />;
    }
};

export const PurchaseOrderDeliveryPage = () => {
    const [deliveries, setDeliveries] = useState<PurchaseOrderDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedDelivery, setSelectedDelivery] = useState<PurchaseOrderDelivery | null>(null);
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [receiveRows, setReceiveRows] = useState<ReceiveRow[]>([]);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadDeliveries();
    }, []);

    const loadDeliveries = async () => {
        setLoading(true);
        setError('');
        try {
            // const data = await getTodayPurchaseOrderDeliveries();
            // setDeliveries(data);
            setDeliveries(mockDeliveries);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load today\'s deliveries');
        } finally {
            setLoading(false);
        }
    };

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter((delivery) => {
            const matchesSearch =
                delivery.purchaseOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
                delivery.vendorName.toLowerCase().includes(search.toLowerCase()) ||
                delivery.location.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = !statusFilter || delivery.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [deliveries, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: deliveries.length,
            dueToday: deliveries.filter((d) => d.status === 'Due Today').length,
            partial: deliveries.filter((d) => d.status === 'Partially Received').length,
            itemsExpected: deliveries.reduce((sum, d) => sum + d.items.reduce((a, b) => a + b.remainingQty, 0), 0),
        };
    }, [deliveries]);

    const openReceiveDialog = (delivery: PurchaseOrderDelivery) => {
        setSelectedDelivery(delivery);
        setReceiveRows(
            delivery.items.map((item) => ({
                deliveryItemId: item.id,
                itemName: item.itemName,
                receiveQty: item.remainingQty,
                orderedQty: item.orderedQty,
                remainingQty: item.remainingQty,
                inventoryCategoryId: undefined,
                location: delivery.location,
                condition: 'Good',
                notes: '',
            }))
        );
        setReceiveOpen(true);
    };

    const updateReceiveRow = (index: number, field: keyof ReceiveRow, value: string | number) => {
        setReceiveRows((prev) =>
            prev.map((row, i) =>
                i === index
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row
            )
        );
    };

    const handleReceiveSubmit = async () => {
        if (!selectedDelivery) return;
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                purchaseOrderDeliveryId: selectedDelivery.id,
                receivedAt: new Date().toISOString(),
                items: receiveRows
                    .filter((row) => Number(row.receiveQty) > 0)
                    .map((row) => ({
                        deliveryItemId: row.deliveryItemId,
                        receiveQty: Number(row.receiveQty),
                        location: row.location,
                        condition: row.condition,
                        notes: row.notes,
                    })),
            };

            // Backend should:
            // 1. record goods receipt / delivery check
            // 2. update PO delivery status
            // 3. create or increment inventory stock/items
            // await receivePurchaseOrderDelivery(payload);

            setSuccessMessage(
                `Delivery for ${selectedDelivery.purchaseOrderNumber} received and added to inventory successfully.`
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
                                Review today&apos;s incoming purchase order deliveries and receive items into inventory.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" startIcon={<TodayOutlinedIcon />} onClick={loadDeliveries}>
                                Refresh Today&apos;s Deliveries
                            </Button>
                        </Stack>
                    </Stack>

                    {(error || successMessage) && (
                        <Stack spacing={1}>
                            {error && <Alert severity="error">{error}</Alert>}
                            {successMessage && <Alert severity="success">{successMessage}</Alert>}
                        </Stack>
                    )}

                    <Grid container spacing={2}>
                        {[
                            { label: 'Today\'s Deliveries', value: stats.total, icon: <LocalShippingOutlinedIcon /> },
                            { label: 'Due Today', value: stats.dueToday, icon: <TodayOutlinedIcon /> },
                            { label: 'Partially Received', value: stats.partial, icon: <CheckCircleOutlineOutlinedIcon /> },
                            { label: 'Items Expected', value: stats.itemsExpected, icon: <Inventory2OutlinedIcon /> },
                        ].map((card) => (
                            <Grid item xs={12} sm={6} lg={3} key={card.label}>
                                <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
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

                    <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
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
                                        <MenuItem value="Due Today">Due Today</MenuItem>
                                        <MenuItem value="Partially Received">Partially Received</MenuItem>
                                        <MenuItem value="Received">Received</MenuItem>
                                        <MenuItem value="Delayed">Delayed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {filteredDeliveries.length} delivery{filteredDeliveries.length !== 1 ? 'ies' : 'y'} shown
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
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
                                    No deliveries scheduled for today
                                </Typography>
                                <Typography color="text.secondary" mt={0.5}>
                                    There are no matching purchase order deliveries for today based on the current filters.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Delivery Location</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDeliveries.map((delivery) => (
                                            <TableRow key={delivery.id} hover>
                                                <TableCell>
                                                    <Stack spacing={0.25}>
                                                        <Typography fontWeight={700}>{delivery.purchaseOrderNumber}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Expected: {delivery.expectedDate}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{delivery.vendorName}</TableCell>
                                                <TableCell>{delivery.deliveryTime || '-'}</TableCell>
                                                <TableCell>{delivery.totalItems}</TableCell>
                                                <TableCell>{delivery.location}</TableCell>
                                                <TableCell>{getStatusChip(delivery.status)}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Button size="small" variant="text" startIcon={<VisibilityOutlinedIcon />} onClick={() => setSelectedDelivery(delivery)}>
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

            <Dialog open={!!selectedDelivery && !receiveOpen} onClose={() => setSelectedDelivery(null)} fullWidth maxWidth="md">
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogContent dividers>
                    {selectedDelivery && (
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">PO Number</Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.purchaseOrderNumber}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Vendor</Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.vendorName}</Typography>
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
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Stack spacing={0.25}>
                                                    <Typography fontWeight={600}>{item.itemName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{item.sku || '-'}</Typography>
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
                    <Button onClick={() => setSelectedDelivery(null)}>Close</Button>
                    {selectedDelivery && (
                        <Button variant="contained" onClick={() => openReceiveDialog(selectedDelivery)}>
                            Receive Items
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={receiveOpen} onClose={() => !submitting && setReceiveOpen(false)} fullWidth maxWidth="lg">
                <DialogTitle>Receive Delivery Into Inventory</DialogTitle>
                <DialogContent dividers>
                    {selectedDelivery && (
                        <Stack spacing={2}>
                            <Alert severity="info">
                                On submit, the received quantity should be recorded against the purchase order delivery and added into the inventory system.
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">PO Number</Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.purchaseOrderNumber}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Vendor</Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.vendorName}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Delivery Location</Typography>
                                    <Typography fontWeight={700}>{selectedDelivery.location}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Stack spacing={2}>
                                {receiveRows.map((row, index) => (
                                    <Card key={row.deliveryItemId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={3}>
                                                <Typography fontWeight={700}>{row.itemName}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Remaining: {row.remainingQty}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Receive Qty"
                                                    value={row.receiveQty}
                                                    onChange={(e) => updateReceiveRow(index, 'receiveQty', Number(e.target.value))}
                                                    inputProps={{ min: 0, max: row.remainingQty }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    label="Location"
                                                    value={row.location}
                                                    onChange={(e) => updateReceiveRow(index, 'location', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={2}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Condition"
                                                    value={row.condition}
                                                    onChange={(e) => updateReceiveRow(index, 'condition', e.target.value)}
                                                >
                                                    <MenuItem value="Good">Good</MenuItem>
                                                    <MenuItem value="Damaged">Damaged</MenuItem>
                                                    <MenuItem value="Needs Inspection">Needs Inspection</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Notes"
                                                    value={row.notes}
                                                    onChange={(e) => updateReceiveRow(index, 'notes', e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>
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
        </DashboardLayout>
    );
};

export default PurchaseOrderDeliveryPage;
