import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    Grid,
    Avatar,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getRequisitionById } from '../../services/requisitionService';
import { approveRequisition } from '../../services/approvalService';
import { RequisitionDto } from '../../types/requisition';

type DecisionType = 'Approved' | 'Rejected';

const formatDate = (date?: string) => {
    if (!date || date.startsWith('0001')) return '—';
    return new Date(date).toLocaleString();
};

const statusColor = (status: string) => {
    switch (status) {
        case 'Approved': return 'success';
        case 'Rejected': return 'error';
        case 'Pending': return 'warning';
        default: return 'default';
    }
};

export default function RequisitionDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [requisition, setRequisition] = useState<RequisitionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Action states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [decision, setDecision] = useState<DecisionType | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getRequisitionById(id);
                setRequisition(data);
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load requisition');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const openDecisionDialog = (action: DecisionType) => {
        setDecision(action);
        setComment('');
        setError('');
        setDialogOpen(true);
    };

    const handleConfirmDecision = async () => {
        if (!decision || !id) return;

        if (decision === 'Rejected' && !comment.trim()) {
            setError('Comment is required when rejecting a requisition.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await approveRequisition(id, {
                decision,
                comments: comment || null
            });

            setDialogOpen(false);
            navigate(-1);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" mt={6}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!requisition) {
        return (
            <DashboardLayout>
                <Alert severity="error">Requisition not found</Alert>
            </DashboardLayout>
        );
    }

    const totalAmount =
        requisition.totalAmount ??
        requisition.items.reduce(
            (sum, i) => sum + i.quantity * i.estimatedCost,
            0
        );

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={3}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                        Back
                    </Button>

                    <Typography variant="h4" fontWeight={700} ml={2}>
                        {requisition.requisitionNumber}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* ================= Summary ================= */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Requested By</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={requisition.requestedBy?.profileImageUrl}>
                                    {requisition.requestedByName?.[0]}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>
                                        {requisition.requestedByName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {requisition.requestedBy?.email}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Requested Date</Typography>
                            <Typography>{formatDate(requisition.requestedDate)}</Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Status</Typography>
                            <Chip
                                label={requisition.status}
                                color={statusColor(requisition.status)}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Total Amount</Typography>
                            <Typography fontWeight={700}>
                                Rs. {totalAmount.toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ================= Items ================= */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" mb={2}>Items</Typography>

                    {requisition.items.map(item => (
                        <Box key={item.id} mb={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>{item.itemName}</Grid>
                                <Grid item xs={3}>Qty: {item.quantity}</Grid>
                                <Grid item xs={3}>
                                    Rs. {(item.quantity * item.estimatedCost).toLocaleString()}
                                </Grid>
                            </Grid>
                            <Divider sx={{ mt: 1 }} />
                        </Box>
                    ))}
                </Paper>

                {/* ================= Actions ================= */}
                {requisition.status === 'Pending' && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Your Decision</Typography>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => openDecisionDialog('Approved')}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => openDecisionDialog('Rejected')}
                            >
                                Reject
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* ================= Confirmation Dialog ================= */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        Confirm {decision}
                    </DialogTitle>

                    <DialogContent>
                        <Typography mb={2}>
                            Are you sure you want to <strong>{decision?.toLowerCase()}</strong> this requisition?
                        </Typography>

                        <TextField
                            label="Comment"
                            fullWidth
                            multiline
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required={decision === 'Rejected'}
                            error={decision === 'Rejected' && !comment.trim()}
                            helperText={
                                decision === 'Rejected'
                                    ? 'Comment is required when rejecting'
                                    : 'Optional'
                            }
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color={decision === 'Approved' ? 'success' : 'error'}
                            onClick={handleConfirmDecision}
                            disabled={submitting}
                        >
                            Confirm {decision}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
