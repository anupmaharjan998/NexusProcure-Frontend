import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DevicesIcon from '@mui/icons-material/Devices';
import InventoryIcon from '@mui/icons-material/Inventory2';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import {
    getMyInventoryRequests,
    getMyAssignedInventoryItems,
} from '../../services/inventoryRequestService';
import {
    InventoryRequestSummary,
    MyAssignedInventoryItem,
} from '../../types/InventoryRequest';

const statusColor = (status: string) => {
    if (status === 'Completed') return 'success';
    if (status === 'ManagerRejected') return 'error';
    if (status === 'RejectedByManager') return 'error';
    if (status === 'RejectedInsufficientQuantity') return 'error';
    if (status === 'SentForProcurement') return 'warning';
    if (status === 'PendingManagerApproval') return 'info';
    if (status === 'PendingManagerProcurementDecision') return 'warning';
    if (status === 'ManagerApproved') return 'primary';

    return 'default';
};

const priorityColor = (priority: string) => {
    if (priority === 'Critical' || priority === '4') return 'error';
    if (priority === 'High' || priority === '3') return 'warning';
    if (priority === 'Medium' || priority === '2') return 'info';

    return 'default';
};

const conditionColor = (condition?: string | null) => {
    if (condition === 'Good' || condition === 'New') return 'success';
    if (condition === 'Damaged' || condition === 'Faulty') return 'error';
    if (condition === 'Maintenance') return 'warning';

    return 'default';
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString();
};

export default function MyInventoryRequestsPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);

    const [devices, setDevices] = useState<MyAssignedInventoryItem[]>([]);
    const [requests, setRequests] = useState<InventoryRequestSummary[]>([]);

    const [devicesLoading, setDevicesLoading] = useState(false);
    const [requestsLoading, setRequestsLoading] = useState(false);

    const [error, setError] = useState('');

    const loadDevices = async () => {
        setDevicesLoading(true);
        setError('');

        try {
            const result = await getMyAssignedInventoryItems();
            setDevices(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load assigned devices.');
        } finally {
            setDevicesLoading(false);
        }
    };

    const loadRequests = async () => {
        setRequestsLoading(true);
        setError('');

        try {
            const result = await getMyInventoryRequests();
            setRequests(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load inventory requests.');
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        loadDevices();
        loadRequests();
    }, []);

    const deviceColumns: Column<MyAssignedInventoryItem>[] = useMemo(
        () => [
            {
                id: 'itemName',
                label: 'Device',
                format: (value, row) => (
                    <Box>
                        <Typography fontWeight={800}>
                            {String(value || '-')}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {row.categoryName || 'No category'}
                        </Typography>
                    </Box>
                ),
            },
            {
                id: 'serialNumber',
                label: 'Serial No.',
                format: (value) => value ? String(value) : '-',
            },
            {
                id: 'department',
                label: 'Department',
                format: (value) => value ? String(value) : '-',
            },
            {
                id: 'location',
                label: 'Location',
                format: (value) => value ? String(value) : '-',
            },
            {
                id: 'condition',
                label: 'Condition',
                format: (value) => (
                    <Chip
                        size="small"
                        label={String(value || 'Unknown')}
                        color={conditionColor(String(value || '')) as any}
                        sx={{ fontWeight: 700 }}
                    />
                ),
            },
            {
                id: 'assignedAt',
                label: 'Assigned Date',
                format: (value) => formatDate(value as string),
            },
            {
                id: 'actions',
                label: 'Actions',
                align: 'center',
                format: (_, row) => (
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/inventory-items/${row.id}`)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 800,
                        }}
                    >
                        Details
                    </Button>
                ),
            },
        ],
        [navigate]
    );

    const requestColumns: Column<InventoryRequestSummary>[] = useMemo(
        () => [
            {
                id: 'createdAt',
                label: 'Date',
                format: (value) => formatDate(value as string),
            },
            {
                id: 'itemNames',
                label: 'Item Name',
                format: (value) => (
                    <Typography fontWeight={700}>
                        {String(value || '-')}
                    </Typography>
                ),
            },
            {
                id: 'purpose',
                label: 'Purpose',
                format: (value) => (
                    <Typography fontWeight={700}>
                        {String(value || '-')}
                    </Typography>
                ),
            },
            {
                id: 'priority',
                label: 'Priority',
                format: (value) => (
                    <Chip
                        size="small"
                        label={String(value)}
                        color={priorityColor(String(value)) as any}
                        sx={{ fontWeight: 700 }}
                    />
                ),
            },
            {
                id: 'status',
                label: 'Status',
                format: (value) => (
                    <Chip
                        size="small"
                        label={String(value)}
                        color={statusColor(String(value)) as any}
                        sx={{ fontWeight: 700 }}
                    />
                ),
            },
            {
                id: 'totalItems',
                label: 'Items',
                align: 'center',
            },
            {
                id: 'actions',
                label: 'Actions',
                align: 'center',
                format: (_, row) => (
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/inventory-requests/${row.id}`)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 800,
                        }}
                    >
                        Details
                    </Button>
                ),
            },
        ],
        [navigate]
    );

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
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <AssignmentIcon sx={{ fontSize: 42 }} />

                        <Box>
                            <Typography variant="h4" fontWeight={900}>
                                My Inventory
                            </Typography>

                            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                View devices assigned to you and track all inventory requests you made.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Tabs
                            value={activeTab}
                            onChange={(_, value) => setActiveTab(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                mb: 3,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    minHeight: 54,
                                },
                            }}
                        >
                            <Tab
                                icon={<DevicesIcon />}
                                iconPosition="start"
                                label={`My Devices (${devices.length})`}
                            />

                            <Tab
                                icon={<InventoryIcon />}
                                iconPosition="start"
                                label={`My Requests (${requests.length})`}
                            />
                        </Tabs>

                        {activeTab === 0 && (
                            <>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={1}
                                    sx={{ mb: 2 }}
                                >
                                    <Box>
                                        <Typography variant="h6" fontWeight={900}>
                                            Devices Assigned To Me
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            List of physical inventory items currently assigned to your account.
                                        </Typography>
                                    </Box>

                                    <Chip
                                        icon={<DevicesIcon />}
                                        label={`${devices.length} Assigned`}
                                        color="primary"
                                        sx={{ fontWeight: 800 }}
                                    />
                                </Stack>

                                {devicesLoading ? (
                                    <Stack alignItems="center" py={6}>
                                        <CircularProgress />
                                    </Stack>
                                ) : devices.length === 0 ? (
                                    <Stack alignItems="center" py={7} spacing={1}>
                                        <DevicesIcon sx={{ fontSize: 52, color: 'text.secondary' }} />

                                        <Typography fontWeight={900}>
                                            No devices assigned
                                        </Typography>

                                        <Typography color="text.secondary" textAlign="center">
                                            You currently do not have any assigned inventory devices.
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Table
                                        data={devices}
                                        columns={deviceColumns}
                                        loading={devicesLoading}
                                    />
                                )}
                            </>
                        )}

                        {activeTab === 1 && (
                            <>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={1}
                                    sx={{ mb: 2 }}
                                >
                                    <Box>
                                        <Typography variant="h6" fontWeight={900}>
                                            Requests Made By Me
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            List of all inventory requests submitted by you.
                                        </Typography>
                                    </Box>

                                    <Chip
                                        icon={<InventoryIcon />}
                                        label={`${requests.length} Requests`}
                                        color="secondary"
                                        sx={{ fontWeight: 800 }}
                                    />
                                </Stack>

                                {requestsLoading ? (
                                    <Stack alignItems="center" py={6}>
                                        <CircularProgress />
                                    </Stack>
                                ) : requests.length === 0 ? (
                                    <Stack alignItems="center" py={7} spacing={1}>
                                        <InventoryIcon sx={{ fontSize: 52, color: 'text.secondary' }} />

                                        <Typography fontWeight={900}>
                                            No inventory requests found
                                        </Typography>

                                        <Typography color="text.secondary" textAlign="center">
                                            You have not submitted any inventory requests yet.
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Table
                                        data={requests}
                                        columns={requestColumns}
                                        loading={requestsLoading}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}