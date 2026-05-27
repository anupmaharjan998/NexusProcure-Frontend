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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { InventoryRequestSummary } from '../../types/InventoryRequest';
import {
    getManagerShortagePendingInventoryRequests,
    rejectInventoryShortage,
    sendInventoryShortageToProcurement,
} from '../../services/inventoryRequestService';

type ActionType = 'procurement' | 'reject';

export default function ManagerInventoryShortageDecisionPage() {
    const navigate = useNavigate();

    const [data, setData] = useState<InventoryRequestSummary[]>([]);
    const [selected, setSelected] = useState<InventoryRequestSummary | null>(null);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');

        try {
            setData(await getManagerShortagePendingInventoryRequests());
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load shortage requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openAction = (row: InventoryRequestSummary, type: ActionType) => {
        setSelected(row);
        setActionType(type);
        setRemarks(
            type === 'reject'
                ? 'Rejected due to insufficient inventory quantity.'
                : 'Approved to send insufficient quantity request for procurement.'
        );
    };

    const closeAction = () => {
        if (actionLoading) return;

        setSelected(null);
        setActionType(null);
        setRemarks('');
    };

    const confirmAction = async () => {
        if (!selected || !actionType) return;

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            if (actionType === 'procurement') {
                await sendInventoryShortageToProcurement(selected.id, remarks);
                setSuccess('Request sent to procurement successfully.');
            } else {
                await rejectInventoryShortage(selected.id, remarks);
                setSuccess('Request rejected due to insufficient quantity.');
            }

            closeAction();
            await load();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed.');
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
            id: 'status',
            label: 'Status',
            format: () => (
                <Chip
                    size="small"
                    color="warning"
                    label="Insufficient Quantity"
                    sx={{ fontWeight: 700 }}
                />
            ),
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
                        onClick={() => openAction(row, 'procurement')}
                    >
                        <ShoppingCartCheckoutIcon />
                    </IconButton>

                    <IconButton
                        color="error"
                        onClick={() => openAction(row, 'reject')}
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
                    <Typography variant="h4" fontWeight={900}>
                        Inventory Shortage Decisions
                    </Typography>

                    <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                        Review inventory requests that could not be fully issued and decide whether to send them for procurement or reject them.
                    </Typography>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Table data={data} columns={columns} loading={loading} />
                    </CardContent>
                </Card>

                <Dialog
                    open={Boolean(selected && actionType)}
                    onClose={closeAction}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        {actionType === 'procurement'
                            ? 'Send to Procurement?'
                            : 'Reject Request?'}
                    </DialogTitle>

                    <DialogContent>
                        <Alert
                            severity={actionType === 'procurement' ? 'info' : 'warning'}
                            sx={{ mb: 2 }}
                        >
                            {actionType === 'procurement'
                                ? 'This will forward the shortage request to procurement.'
                                : 'This will reject the request because of insufficient inventory quantity.'}
                        </Alert>

                        <TextField
                            label="Remarks"
                            value={remarks}
                            onChange={(event) => setRemarks(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button variant="outlined" onClick={closeAction}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color={actionType === 'procurement' ? 'primary' : 'error'}
                            onClick={confirmAction}
                            disabled={actionLoading}
                        >
                            {actionLoading
                                ? 'Processing...'
                                : actionType === 'procurement'
                                    ? 'Send to Procurement'
                                    : 'Reject Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}