import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getPurchaseOrderReport } from '../../services/reportService';
import {
    PagedResult,
    PurchaseOrderReportDto,
    PurchaseOrderReportQuery,
} from '../../types/reports';

const formatCurrency = (value: number) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
};

export default function PurchaseOrderReportPage() {
    const [data, setData] = useState<PagedResult<PurchaseOrderReportDto>>({
        items: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
    });

    const [loading, setLoading] = useState(true);

    const [query, setQuery] = useState<PurchaseOrderReportQuery>({
        page: 1,
        pageSize: 10,
        status: '',
        fromDate: '',
        toDate: '',
    });

    useEffect(() => {
        load(query);
    }, [query.page, query.pageSize]);

    const load = async (currentQuery = query) => {
        try {
            setLoading(true);

            const cleanQuery: PurchaseOrderReportQuery = {
                page: currentQuery.page || 1,
                pageSize: currentQuery.pageSize || 10,
                status: currentQuery.status || undefined,
                fromDate: currentQuery.fromDate || undefined,
                toDate: currentQuery.toDate || undefined,
            };

            const result = await getPurchaseOrderReport(cleanQuery);
            setData(result);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        const newQuery = {
            ...query,
            page: 1,
        };

        setQuery(newQuery);
        await load(newQuery);
    };

    const resetFilters = async () => {
        const newQuery: PurchaseOrderReportQuery = {
            page: 1,
            pageSize: 10,
            status: '',
            fromDate: '',
            toDate: '',
        };

        setQuery(newQuery);
        await load(newQuery);
    };

    const getDeliveryChip = (po: PurchaseOrderReportDto) => {
        if (po.isTodayDelivery) {
            return <Chip size="small" color="info" label="Today Delivery" />;
        }

        if (po.isOverdue) {
            return <Chip size="small" color="error" label="Overdue" />;
        }

        if (po.pendingQuantity <= 0) {
            return <Chip size="small" color="success" label="Completed" />;
        }

        return <Chip size="small" color="warning" label="Pending" />;
    };

    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Purchase Order Report
                </Typography>

                <Typography color="text.secondary" mb={3}>
                    View purchase orders, delivery status, received quantity,
                    pending quantity and total spend.
                </Typography>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="From Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={query.fromDate || ''}
                                    onChange={(e) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            fromDate: e.target.value,
                                        }))
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="To Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={query.toDate || ''}
                                    onChange={(e) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            toDate: e.target.value,
                                        }))
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={query.status || ''}
                                    onChange={(e) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Issued">Issued</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="PartiallyReceived">
                                        Partially Received
                                    </MenuItem>
                                    <MenuItem value="Received">Received</MenuItem>
                                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        onClick={applyFilters}
                                    >
                                        Apply
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={5}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>PO No.</TableCell>
                                            <TableCell>Vendor</TableCell>
                                            <TableCell>Requisition</TableCell>
                                            <TableCell>PO Date</TableCell>
                                            <TableCell>
                                                Expected Delivery
                                            </TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Delivery</TableCell>
                                            <TableCell align="right">
                                                Ordered
                                            </TableCell>
                                            <TableCell align="right">
                                                Received
                                            </TableCell>
                                            <TableCell align="right">
                                                Pending
                                            </TableCell>
                                            <TableCell align="right">
                                                Amount
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {data.items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={11}>
                                                    No purchase orders found.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {data.items.map((po) => (
                                            <TableRow
                                                key={po.id}
                                                sx={{
                                                    backgroundColor:
                                                        po.isTodayDelivery
                                                            ? 'rgba(25, 118, 210, 0.08)'
                                                            : po.isOverdue
                                                                ? 'rgba(211, 47, 47, 0.08)'
                                                                : 'inherit',
                                                }}
                                            >
                                                <TableCell>
                                                    {po.poNumber}
                                                </TableCell>

                                                <TableCell>
                                                    {po.vendorName}
                                                </TableCell>

                                                <TableCell>
                                                    {po.requisitionNumber}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(po.createdAt)}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(
                                                        po.expectedDeliveryDate
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={po.status}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {getDeliveryChip(po)}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {po.orderedQuantity}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {po.receivedQuantity}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {po.pendingQuantity}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {formatCurrency(
                                                        po.totalAmount
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <TablePagination
                                    component="div"
                                    count={data.totalCount}
                                    page={(query.page || 1) - 1}
                                    rowsPerPage={query.pageSize || 10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    onPageChange={(_, newPage) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            page: newPage + 1,
                                        }))
                                    }
                                    onRowsPerPageChange={(event) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            page: 1,
                                            pageSize: Number(event.target.value),
                                        }))
                                    }
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}