import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ApprovalIcon from '@mui/icons-material/Approval';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import {
    approveInventoryRequestByManager,
    getManagerPendingInventoryRequests,
    rejectInventoryRequestByManager,
} from '../../services/inventoryRequestService';
import { InventoryRequestSummary } from '../../types/InventoryRequest';

export default function ManagerInventoryApprovalPage() {
    const navigate = useNavigate();

    const [data, setData] = useState<InventoryRequestSummary[]>([]);
    const [rejectTarget, setRejectTarget] = useState<InventoryRequestSummary | null>(null);
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');

        try {
            setData(await getManagerPendingInventoryRequests());
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const approve = async (id: string) => {
        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            await approveInventoryRequestByManager(id);
            setSuccess('Request approved successfully.');
            await load();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Approval failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const reject = async () => {
        if (!rejectTarget) return;

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            await rejectInventoryRequestByManager(rejectTarget.id, { remarks });
            setSuccess('Request rejected successfully.');
            setRejectTarget(null);
            setRemarks('');
            await load();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Rejection failed.');
        } finally {
            setActionLoading(false);
        }
    };

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
                        color="success"
                        onClick={() => approve(row.id)}
                        disabled={actionLoading}
                    >
                        <CheckCircleIcon />
                    </IconButton>

                    <IconButton
                        color="error"
                        onClick={() => setRejectTarget(row)}
                        disabled={actionLoading}
                    >
                        <CancelIcon />
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
                        <ApprovalIcon sx={{ fontSize: 42 }} />

                        <Box>
                            <Typography variant="h4" fontWeight={900}>
                                Inventory Request Approvals
                            </Typography>

                            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                Approve or reject inventory requests from your team.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Table data={data} columns={columns} loading={loading} />
                    </CardContent>
                </Card>

                <Dialog
                    open={Boolean(rejectTarget)}
                    onClose={() => setRejectTarget(null)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Reject Inventory Request</DialogTitle>

                    <DialogContent>
                        <TextField
                            label="Remarks"
                            value={remarks}
                            onChange={(event) => setRemarks(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button variant="outlined" onClick={() => setRejectTarget(null)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={reject}
                            disabled={actionLoading}
                        >
                            Reject
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}