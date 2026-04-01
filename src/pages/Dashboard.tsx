import {
    Box, Grid, Card, CardContent, Typography,
    Chip, Button, Stack, Divider
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getDashboardStats} from '../services/dashboardService';
import {DashboardLayout} from '../components/Layout/DashboardLayout';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        getDashboardStats().then(setData);
    }, []);

    const stats = data?.stats;
    const pos = data?.recentPOs || [];
    const deliveries = data?.deliveries || [];

    const chartData = [
        {name: 'Requisitions', value: stats?.totalRequisitions || 0},
        {name: 'Quotations', value: stats?.totalQuotations || 0},
        {name: 'Orders', value: stats?.activePurchaseOrders || 0},
    ];

    const barColors = ['#3b82f6', '#10b981', '#f59e0b'];

    const kpis = [
        {label: 'Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: '#2563eb'},
        {label: 'Departments', value: stats?.totalDepartments || 0, icon: <BusinessIcon />, color: '#06b6d4'},
        {label: 'Vendors', value: stats?.totalVendors || 0, icon: <StoreIcon />, color: '#10b981'},
        {label: 'Active Orders', value: stats?.activeOrders || 0, icon: <ShoppingCartIcon />, color: '#f59e0b'}
    ];

    return (
        <DashboardLayout>
            <Box>

                {/* HEADER */}
                <Typography variant="h4" fontWeight={700}>
                    Dashboard
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    Real-time procurement & inventory overview
                </Typography>

                {/* KPI */}
                <Grid container spacing={3}>
                    {kpis.map((kpi, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card sx={{
                                borderRadius: 3,
                                transition: '0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }
                            }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Box>
                                            <Typography color="text.secondary">
                                                {kpi.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={700}>
                                                {kpi.value}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            background: kpi.color + '20',
                                            p: 1.5,
                                            borderRadius: 2,
                                            color: kpi.color
                                        }}>
                                            {kpi.icon}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* APPROVALS */}
                <Grid container spacing={3} mt={1}>
                    <Grid item xs={12} md={6}>
                        <Card onClick={() => navigate('/procurement/requisitions-approvals')}
                              sx={{p: 3, cursor: 'pointer', borderLeft: '5px solid #f59e0b'}}>
                            <Typography color="text.secondary">Pending Requisition Approvals</Typography>
                            <Typography variant="h3" fontWeight={700} color="warning.main">
                                {stats?.pendingRequisitionApprovals || 0}
                            </Typography>
                            <Chip label="Review Now" color="warning" sx={{mt: 1}}/>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card onClick={() => navigate('/procurement/quotations-approvals')}
                              sx={{p: 3, cursor: 'pointer', borderLeft: '5px solid #ef4444'}}>
                            <Typography color="text.secondary">Pending Quotation Approvals</Typography>
                            <Typography variant="h3" fontWeight={700} color="error.main">
                                {stats?.pendingQuotationApprovals || 0}
                            </Typography>
                            <Chip label="Take Action" color="error" sx={{mt: 1}}/>
                        </Card>
                    </Grid>
                </Grid>

                {/* CHART */}
                <Card sx={{p: 3, mt: 3}}>
                    <Typography fontWeight={600} mb={2}>System Overview</Typography>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}}/>
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {chartData.map((_, index) => (
                                    <Cell key={index} fill={barColors[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* MAIN */}
                <Grid container spacing={3} mt={2}>

                    {/* RECENT PO */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{p: 3}}>

                            {/* HEADER WITH VIEW ALL */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight={600}>
                                    Recent Purchase Orders
                                </Typography>

                                <Button
                                    size="small"
                                    onClick={() => navigate('/procurement/purchase-orders')}
                                >
                                    View All
                                </Button>
                            </Stack>

                            {pos.length === 0 ? (
                                <Typography mt={2} color="text.secondary">
                                    No recent purchase orders
                                </Typography>
                            ) : (
                                pos.map((po: any) => (
                                    <Box
                                        key={po.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            mt: 2,
                                            cursor: 'pointer',
                                            '&:hover': {background: '#f8fafc'}
                                        }}
                                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
                                    >
                                        <Stack direction="row" justifyContent="space-between">
                                            <Box>
                                                <Typography fontWeight={600}>
                                                    {po.poNumber}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {po.vendorName}
                                                </Typography>
                                            </Box>

                                            <Box textAlign="right">
                                                <Typography fontWeight={600}>
                                                    Rs. {po.totalAmount}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {po.totalItems} items
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Chip
                                            label={po.status === 2 ? 'Completed' : 'Active'}
                                            size="small"
                                            color={po.status === 2 ? 'success' : 'warning'}
                                            sx={{mt: 1}}
                                        />

                                        <Divider sx={{mt: 2}}/>
                                    </Box>
                                ))
                            )}
                        </Card>
                    </Grid>

                    {/* DELIVERIES */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{p: 3}}>
                            <Typography fontWeight={600} mb={2}>
                                Deliveries Today
                            </Typography>

                            {deliveries.length === 0 ? (
                                <Typography color="text.secondary">
                                    No deliveries scheduled
                                </Typography>
                            ) : (
                                deliveries.map((d: any) => (
                                    <Box key={d.id} mb={2}>
                                        <Typography fontWeight={600}>
                                            {d.poNumber}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {d.vendorName}
                                        </Typography>
                                        <Typography variant="body2">
                                            {d.totalItems} items
                                        </Typography>

                                        <Chip
                                            icon={<AssignmentTurnedInIcon />}
                                            label="Scheduled"
                                            color="info"
                                            size="small"
                                            sx={{mt: 1}}
                                        />
                                    </Box>
                                ))
                            )}
                        </Card>
                    </Grid>
                </Grid>

                {/* QUICK ACTIONS */}
                <Card sx={{mt: 3, p: 3}}>
                    <Typography fontWeight={600}>
                        Quick Actions
                    </Typography>

                    <Stack direction="row" spacing={2} mt={2}>
                        <Button variant="contained" onClick={() => navigate('/requisitions')}>
                            Requisitions
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/quotations')}>
                            Quotations
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/purchase-orders')}>
                            Purchase Orders
                        </Button>
                    </Stack>
                </Card>

            </Box>
        </DashboardLayout>
    );
};