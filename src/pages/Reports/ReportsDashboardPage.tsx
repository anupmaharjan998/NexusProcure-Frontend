import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getReportsDashboard } from '../../services/reportService';
import { ReportsDashboardDto } from '../../types/reports';

const formatCurrency = (value: number) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
};

function SummaryCard({
                         title,
                         value,
                         subtitle,
                     }: {
    title: string;
    value: string | number;
    subtitle?: string;
}) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>

                <Typography variant="h5" fontWeight={700} mt={1}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

export default function ReportsDashboardPage() {
    const [data, setData] = useState<ReportsDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);

            const result = await getReportsDashboard();

            setData(result);
        } catch (error) {
            console.error('Failed to load reports dashboard:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" mt={8}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Reports & Analytics
                    </Typography>

                    <Typography color="text.secondary" mt={1}>
                        No report data found.
                    </Typography>
                </Box>
            </DashboardLayout>
        );
    }

    const summary = data.summary;

    const monthlySpend = data.monthlySpend ?? [];
    const requisitionStatus = data.requisitionStatus ?? [];
    const todayDeliveries = data.todayDeliveries ?? [];
    const overdueDeliveries = data.overdueDeliveries ?? [];
    const lowStockItems = data.lowStockItems ?? [];

    return (
        <DashboardLayout>
            <Box>
                <Stack direction="row" justifyContent="space-between" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Reports & Analytics
                        </Typography>

                        <Typography color="text.secondary">
                            Procurement, inventory, vendor and spending overview
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Total Requisitions"
                            value={summary?.totalRequisitions ?? 0}
                            subtitle="All purchase requests"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Pending Approvals"
                            value={summary?.pendingApprovals ?? 0}
                            subtitle="Waiting for approval"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Purchase Orders"
                            value={summary?.totalPurchaseOrders ?? 0}
                            subtitle="Total POs created"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Total PO Value"
                            value={formatCurrency(summary?.totalPoValue ?? 0)}
                            subtitle="Total procurement amount"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Pending Deliveries"
                            value={summary?.pendingDeliveries ?? 0}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Completed Deliveries"
                            value={summary?.completedDeliveries ?? 0}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="Low Stock Items"
                            value={summary?.lowStockItems ?? 0}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="RFQs Created"
                            value={summary?.totalRfqs ?? 0}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} mb={2}>
                                    Monthly Spend
                                </Typography>

                                <Box height={320}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlySpend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="monthName" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) =>
                                                    formatCurrency(Number(value))
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="totalAmount"
                                                name="Spend"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} mb={2}>
                                    Requisition Status
                                </Typography>

                                <Box height={320}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={requisitionStatus}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" name="Requests" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} mb={2}>
                                    Today Deliveries
                                </Typography>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>PO No.</TableCell>
                                            <TableCell>Vendor</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell align="right">
                                                Pending Qty
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {todayDeliveries.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    No deliveries expected today.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {todayDeliveries.map((po) => (
                                            <TableRow key={po.id}>
                                                <TableCell>{po.poNumber}</TableCell>
                                                <TableCell>{po.vendorName}</TableCell>
                                                <TableCell>
                                                    {formatCurrency(po.totalAmount)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {po.pendingQuantity}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} mb={2}>
                                    Overdue Deliveries
                                </Typography>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>PO No.</TableCell>
                                            <TableCell>Vendor</TableCell>
                                            <TableCell>Expected</TableCell>
                                            <TableCell align="right">
                                                Pending Qty
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {overdueDeliveries.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    No overdue deliveries.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {overdueDeliveries.map((po) => (
                                            <TableRow key={po.id}>
                                                <TableCell>{po.poNumber}</TableCell>
                                                <TableCell>{po.vendorName}</TableCell>
                                                <TableCell>
                                                    {formatDate(po.expectedDeliveryDate)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {po.pendingQuantity}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} mb={2}>
                                    Low Stock Items
                                </Typography>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Available</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {lowStockItems.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    No low stock items.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {lowStockItems.slice(0, 5).map((item) => (
                                            <TableRow key={item.stockId}>
                                                <TableCell>{item.itemName}</TableCell>
                                                <TableCell>{item.categoryName}</TableCell>
                                                <TableCell>
                                                    {item.availableQuantity} {item.unit}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        color={
                                                            item.stockStatus ===
                                                            'Out of Stock'
                                                                ? 'error'
                                                                : 'warning'
                                                        }
                                                        label={item.stockStatus}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}