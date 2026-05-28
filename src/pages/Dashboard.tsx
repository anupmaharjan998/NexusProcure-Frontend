import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    Typography
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaidIcon from '@mui/icons-material/Paid';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { KpiCard } from '../components/Dashboard/KpiCard';
import { getDashboardStats } from '../services/dashboardService';
import { DashboardResponseDto } from '../types/dashboard';

type KpiItem = {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    show: boolean;
};

const formatMoney = (value?: number | null) => {
    return `Rs. ${(value ?? 0).toLocaleString()}`;
};

const getPoStatusLabel = (status: number) => {
    switch (status) {
        case 0:
            return 'Draft';
        case 1:
            return 'Issued';
        case 2:
            return 'Completed';
        case 3:
            return 'Cancelled';
        case 4:
            return 'Partially Received';
        default:
            return 'Active';
    }
};

const getPoStatusColor = (status: number): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
        case 2:
            return 'success';
        case 3:
            return 'error';
        case 4:
            return 'info';
        default:
            return 'warning';
    }
};

export const Dashboard = () => {
    const navigate = useNavigate();

    const [data, setData] = useState<DashboardResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        getDashboardStats()
            .then((response) => {
                if (!mounted) return;

                setData(response);
                setError(null);
            })
            .catch(() => {
                if (!mounted) return;

                setError('Failed to load dashboard.');
            })
            .finally(() => {
                if (!mounted) return;

                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const permissions = data?.permissions;

    const system = data?.systemStats;
    const employee = data?.employeeStats;
    const manager = data?.managerStats;
    const procurement = data?.procurementStats;
    const inventory = data?.inventoryStats;
    const finance = data?.financeStats;
    const executive = data?.executiveStats;

    const recentPOs = data?.recentPOs ?? [];
    const deliveries = data?.deliveries ?? [];
    const quickActions = data?.quickActions ?? [];
    const alerts = data?.alerts ?? [];

    const chartData = useMemo(() => {
        if (data?.chartData?.length) {
            return data.chartData;
        }

        return [
            {
                name: 'Requisitions',
                value: procurement?.totalRequisitions ?? executive?.totalRequisitions ?? 0
            },
            {
                name: 'Quotations',
                value: procurement?.totalQuotations ?? 0
            },
            {
                name: 'Orders',
                value: procurement?.activePurchaseOrders ?? executive?.activePurchaseOrders ?? 0
            },
            {
                name: 'Low Stock',
                value: inventory?.lowStockItems ?? executive?.lowStockItems ?? 0
            }
        ];
    }, [data, procurement, executive, inventory]);

    const kpis: KpiItem[] = [
        // Admin/System
        {
            label: 'Users',
            value: system?.totalUsers ?? 0,
            icon: <PeopleIcon />,
            color: '#2563eb',
            show: !!permissions?.canViewSystemStats
        },
        {
            label: 'Departments',
            value: system?.totalDepartments ?? executive?.totalDepartments ?? 0,
            icon: <BusinessIcon />,
            color: '#06b6d4',
            show: !!permissions?.canViewSystemStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Vendors',
            value: system?.totalVendors ?? executive?.totalVendors ?? 0,
            icon: <StoreIcon />,
            color: '#10b981',
            show: !!permissions?.canViewSystemStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Roles',
            value: system?.totalRoles ?? 0,
            icon: <AdminPanelSettingsIcon />,
            color: '#7c3aed',
            show: !!permissions?.canViewSystemStats
        },

        // Employee
        {
            label: 'My Requisitions',
            value: employee?.myTotalRequisitions ?? 0,
            icon: <AssignmentIcon />,
            color: '#2563eb',
            show: !!permissions?.canViewMyRequisitionStats
        },
        {
            label: 'My Pending Requests',
            value: employee?.myPendingRequisitions ?? 0,
            icon: <FactCheckIcon />,
            color: '#f59e0b',
            show: !!permissions?.canViewMyRequisitionStats
        },
        {
            label: 'My Approved Requests',
            value: employee?.myApprovedRequisitions ?? 0,
            icon: <AssignmentTurnedInIcon />,
            color: '#10b981',
            show: !!permissions?.canViewMyRequisitionStats
        },
        {
            label: 'My Assigned Items',
            value: employee?.myAssignedItems ?? 0,
            icon: <InventoryIcon />,
            color: '#0ea5e9',
            show: !!permissions?.canViewMyAssignedItems
        },

        // Manager
        {
            label: 'Department Requests',
            value: manager?.departmentTotalRequisitions ?? 0,
            icon: <AssignmentIcon />,
            color: '#2563eb',
            show: !!permissions?.canViewDepartmentRequisitionStats
        },
        {
            label: 'Department Pending',
            value: manager?.departmentPendingRequisitions ?? 0,
            icon: <FactCheckIcon />,
            color: '#f59e0b',
            show: !!permissions?.canViewDepartmentRequisitionStats
        },
        {
            label: 'Pending Approvals',
            value: manager?.pendingRequisitionApprovals ?? executive?.pendingApprovals ?? 0,
            icon: <FactCheckIcon />,
            color: '#ef4444',
            show: !!permissions?.canViewPendingApprovalStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Department Assigned Items',
            value: manager?.departmentAssignedItems ?? 0,
            icon: <InventoryIcon />,
            color: '#10b981',
            show: !!permissions?.canViewDepartmentInventoryStats
        },

        // Procurement
        {
            label: 'Approved For Procurement',
            value: procurement?.approvedWaitingForProcurement ?? 0,
            icon: <AssignmentTurnedInIcon />,
            color: '#10b981',
            show: !!permissions?.canViewProcurementQueueStats
        },
        {
            label: 'RFQs',
            value: procurement?.totalRfqs ?? 0,
            icon: <RequestQuoteIcon />,
            color: '#7c3aed',
            show: !!permissions?.canViewRfqStats
        },
        {
            label: 'Quotations',
            value: procurement?.totalQuotations ?? 0,
            icon: <RequestQuoteIcon />,
            color: '#0ea5e9',
            show: !!permissions?.canViewQuotationStats
        },
        {
            label: 'Active Purchase Orders',
            value: procurement?.activePurchaseOrders ?? executive?.activePurchaseOrders ?? 0,
            icon: <ShoppingCartIcon />,
            color: '#f59e0b',
            show: !!permissions?.canViewPurchaseOrderStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Completed Purchase Orders',
            value: procurement?.completedPurchaseOrders ?? executive?.completedPurchaseOrders ?? 0,
            icon: <ShoppingCartIcon />,
            color: '#10b981',
            show: !!permissions?.canViewPurchaseOrderStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Today Deliveries',
            value: procurement?.todayDeliveries ?? deliveries.length,
            icon: <AssignmentTurnedInIcon />,
            color: '#0ea5e9',
            show: !!permissions?.canViewTodayDeliveries
        },

        // Inventory
        {
            label: 'Inventory Items',
            value: inventory?.totalInventoryItems ?? 0,
            icon: <InventoryIcon />,
            color: '#2563eb',
            show: !!permissions?.canViewStockStats
        },
        {
            label: 'Total Stock',
            value: inventory?.totalStockQuantity ?? 0,
            icon: <InventoryIcon />,
            color: '#10b981',
            show: !!permissions?.canViewStockStats
        },
        {
            label: 'Low Stock',
            value: inventory?.lowStockItems ?? executive?.lowStockItems ?? 0,
            icon: <WarningAmberIcon />,
            color: '#ef4444',
            show: !!permissions?.canViewLowStockAlerts || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Items To Receive',
            value: inventory?.itemsToReceive ?? 0,
            icon: <AssignmentTurnedInIcon />,
            color: '#0ea5e9',
            show: !!permissions?.canViewReceivingStats
        },
        {
            label: 'Assigned Items',
            value: inventory?.assignedItems ?? 0,
            icon: <InventoryIcon />,
            color: '#7c3aed',
            show: !!permissions?.canViewInventoryAssignmentStats
        },

        // Finance / CEO
        {
            label: 'Total Purchase Value',
            value: formatMoney(finance?.totalPurchaseValue ?? executive?.totalPurchaseValue),
            icon: <PaidIcon />,
            color: '#10b981',
            show: !!permissions?.canViewPurchaseCostStats || !!permissions?.canViewExecutiveDashboard
        },
        {
            label: 'Active Purchase Value',
            value: formatMoney(finance?.activePurchaseValue),
            icon: <PaidIcon />,
            color: '#f59e0b',
            show: !!permissions?.canViewPurchaseCostStats
        },
        {
            label: 'Completed Purchase Value',
            value: formatMoney(finance?.completedPurchaseValue),
            icon: <PaidIcon />,
            color: '#2563eb',
            show: !!permissions?.canViewPurchaseCostStats
        },
        {
            label: 'Pending Approval Value',
            value: formatMoney(finance?.pendingApprovalValue),
            icon: <PaidIcon />,
            color: '#ef4444',
            show: !!permissions?.canViewPurchaseCostStats
        }
    ];

    const visibleKpis = kpis.filter((x) => x.show);

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <Alert severity="error">
                    {error}
                </Alert>
            </DashboardLayout>
        );
    }

    if (!permissions?.canViewDashboard) {
        return (
            <DashboardLayout>
                <Alert severity="warning">
                    You do not have permission to view the dashboard.
                </Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Dashboard
                </Typography>

                <Typography color="text.secondary" mb={3}>
                    Permission-based procurement, inventory and system overview
                </Typography>

                {alerts.length > 0 && permissions.canViewDashboardAlerts && (
                    <Stack spacing={1.5} mb={3}>
                        {alerts.map((alert, index) => (
                            <Alert
                                key={`${alert.title}-${index}`}
                                severity={alert.severity as any}
                                action={
                                    alert.path ? (
                                        <Button color="inherit" size="small" onClick={() => navigate(alert.path!)}>
                                            View
                                        </Button>
                                    ) : undefined
                                }
                            >
                                <strong>{alert.title}</strong> — {alert.message}
                            </Alert>
                        ))}
                    </Stack>
                )}

                {visibleKpis.length === 0 ? (
                    <Alert severity="info">
                        No dashboard widgets are available for your current permissions.
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {visibleKpis.map((kpi, index) => (
                            <Grid item xs={12} sm={6} md={3} key={`${kpi.label}-${index}`}>
                                <KpiCard
                                    label={kpi.label}
                                    value={kpi.value}
                                    icon={kpi.icon}
                                    color={kpi.color}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {(permissions.canViewPendingApprovalStats || permissions.canViewManagerDashboard) && (
                    <Grid container spacing={3} mt={1}>
                        <Grid item xs={12} md={6}>
                            <Card
                                onClick={() => navigate('/procurement/requisitions-approvals')}
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    borderLeft: '5px solid #f59e0b',
                                    borderRadius: 3
                                }}
                            >
                                <Typography color="text.secondary">
                                    Pending Requisition Approvals
                                </Typography>

                                <Typography variant="h3" fontWeight={700} color="warning.main">
                                    {manager?.pendingRequisitionApprovals ?? 0}
                                </Typography>

                                <Chip label="Review Now" color="warning" sx={{ mt: 1 }} />
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card
                                onClick={() => navigate('/procurement/quotations-approvals')}
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    borderLeft: '5px solid #ef4444',
                                    borderRadius: 3
                                }}
                            >
                                <Typography color="text.secondary">
                                    Pending Quotation Approvals
                                </Typography>

                                <Typography variant="h3" fontWeight={700} color="error.main">
                                    {manager?.pendingQuotationApprovals ?? procurement?.pendingQuotationApprovals ?? 0}
                                </Typography>

                                <Chip label="Take Action" color="error" sx={{ mt: 1 }} />
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {permissions.canViewDashboardCharts && (
                    <Card sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <BarChartIcon color="primary" />

                            <Typography fontWeight={600}>
                                System Overview
                            </Typography>
                        </Stack>

                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                <Grid container spacing={3} mt={2}>
                    {permissions.canViewRecentPurchaseOrders && (
                        <Grid item xs={12} md={permissions.canViewTodayDeliveries ? 8 : 12}>
                            <Card sx={{ p: 3, borderRadius: 3 }}>
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

                                {recentPOs.length === 0 ? (
                                    <Typography mt={2} color="text.secondary">
                                        No recent purchase orders
                                    </Typography>
                                ) : (
                                    recentPOs.map((po) => (
                                        <Box
                                            key={po.id}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                mt: 2,
                                                cursor: 'pointer',
                                                '&:hover': { background: '#f8fafc' }
                                            }}
                                            onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}
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
                                                        {formatMoney(po.totalAmount)}
                                                    </Typography>

                                                    <Typography variant="body2">
                                                        {po.totalItems} items
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Chip
                                                label={getPoStatusLabel(po.status)}
                                                size="small"
                                                color={getPoStatusColor(po.status)}
                                                sx={{ mt: 1 }}
                                            />

                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    ))
                                )}
                            </Card>
                        </Grid>
                    )}

                    {permissions.canViewTodayDeliveries && (
                        <Grid item xs={12} md={permissions.canViewRecentPurchaseOrders ? 4 : 12}>
                            <Card sx={{ p: 3, borderRadius: 3 }}>
                                <Typography fontWeight={600} mb={2}>
                                    Deliveries Today
                                </Typography>

                                {deliveries.length === 0 ? (
                                    <Typography color="text.secondary">
                                        No deliveries scheduled
                                    </Typography>
                                ) : (
                                    deliveries.map((delivery) => (
                                        <Box
                                            key={delivery.id}
                                            mb={2}
                                            sx={{
                                                cursor: 'pointer',
                                                p: 1,
                                                borderRadius: 2,
                                                '&:hover': { background: '#f8fafc' }
                                            }}
                                            onClick={() => navigate(`/procurement/purchase-orders/${delivery.id}`)}
                                        >
                                            <Typography fontWeight={600}>
                                                {delivery.poNumber}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {delivery.vendorName}
                                            </Typography>

                                            <Typography variant="body2">
                                                {delivery.totalItems} items
                                            </Typography>

                                            <Chip
                                                icon={<AssignmentTurnedInIcon />}
                                                label="Scheduled"
                                                color="info"
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />

                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    ))
                                )}
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {permissions.canViewDashboardQuickActions && quickActions.length > 0 && (
                    <Card sx={{ mt: 3, p: 3, borderRadius: 3 }}>
                        <Typography fontWeight={600}>
                            Quick Actions
                        </Typography>

                        <Stack direction="row" spacing={2} mt={2} flexWrap="wrap" useFlexGap>
                            {quickActions.map((action) => (
                                <Button
                                    key={`${action.label}-${action.path}`}
                                    variant="contained"
                                    onClick={() => navigate(action.path)}
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </Stack>
                    </Card>
                )}
            </Box>
        </DashboardLayout>
    );
};