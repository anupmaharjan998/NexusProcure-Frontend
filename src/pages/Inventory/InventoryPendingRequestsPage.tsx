import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import { getInventoryManagerPendingRequests } from '../../services/inventoryRequestService';
import { InventoryRequestSummary } from '../../types/InventoryRequest';

export default function InventoryPendingRequestsPage() {
    const navigate = useNavigate();

    const [data, setData] = useState<InventoryRequestSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');

        try {
            setData(await getInventoryManagerPendingRequests());
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const columns: Column<InventoryRequestSummary>[] = [
        {
            id: 'createdAt',
            label: 'Date',
            format: (value) => new Date(value as string).toLocaleDateString(),
        },
        {
            id: 'requestedBy',
            label: 'Requested By',
        },
        {
            id: 'department',
            label: 'Department',
        },
        {
            id: 'purpose',
            label: 'Purpose',
        },
        {
            id: 'priority',
            label: 'Priority',
            format: (value) => <Chip size="small" label={String(value)} />,
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
                <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton onClick={() => navigate(`/inventory-requests/${row.id}`)}>
                        <VisibilityIcon />
                    </IconButton>

                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/inventory-requests/${row.id}/process`)}
                    >
                        <PlayArrowIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <InventoryIcon sx={{ fontSize: 42 }} />

                        <Box>
                            <Typography variant="h4" fontWeight={900}>
                                Inventory Processing Queue
                            </Typography>

                            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                Process manager-approved inventory requests.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Table data={data} columns={columns} loading={loading} />
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}