import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Chip,
    Alert,
    Grid,
    Skeleton,
    Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';

import {DashboardLayout} from '../../components/Layout/DashboardLayout';
import {getRequisitionById} from '../../services/requisitionService';
import {RequisitionDto} from '../../types/requisition';

export default function RequisitionDetailsPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [requisition, setRequisition] = useState<RequisitionDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
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

    const formatDate = (date?: string) =>
        date && date !== '0001-01-01T00:00:00'
            ? new Date(date).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';

    const statusColor = (status: string) =>
        status === 'Approved'
            ? 'success'
            : status === 'Rejected'
                ? 'error'
                : 'warning';

    /* =====================
       Loading State
    ===================== */
    if (loading) {
        return (
            <DashboardLayout>
                <Skeleton variant="rectangular" height={180} sx={{mb: 3}}/>
                <Skeleton variant="rectangular" height={220} sx={{mb: 3}}/>
                <Skeleton variant="rectangular" height={220}/>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <Alert severity="error">{error}</Alert>
            </DashboardLayout>
        );
    }

    if (!requisition) return null;

    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon/>}
                        onClick={() => navigate('/procurement/requisitions')}
                    >
                        Back
                    </Button>

                    <Box ml={2}>
                        <Typography variant="h5" fontWeight={700}>
                            {requisition.requisitionNumber}
                        </Typography>
                        <Typography color="text.secondary">
                            Requisition Details
                        </Typography>
                    </Box>
                </Box>

                {/* Summary */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Requested By</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                    src={requisition.requestedBy?.profileImageUrl || ''}
                                >
                                    <PersonIcon/>
                                </Avatar>
                                <Box>
                                    <Typography>
                                        {requisition.requestedByName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {requisition.requestedBy?.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Requested Date</Typography>
                            <Typography>
                                {formatDate(requisition.requestedDate)}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Status</Typography>
                            <Chip
                                label={requisition.status}
                                color={statusColor(requisition.status as string)}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Category</Typography>
                            <Typography>
                                {requisition.categoryName || '-'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Total Amount</Typography>
                            <Typography fontWeight={700}>
                                Rs. {requisition.totalAmount.toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Items */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography variant="h6" mb={2}>
                        Items
                    </Typography>

                    <Grid container fontWeight={600} mb={1}>
                        <Grid item xs={6}>Item</Grid>
                        <Grid item xs={2}>Qty</Grid>
                        <Grid item xs={2}>Unit Cost</Grid>
                        <Grid item xs={2}>Total</Grid>
                    </Grid>

                    <Divider sx={{mb: 2}}/>

                    {requisition.items.map((item) => (
                        <Grid container key={item.id} mb={1}>
                            <Grid item xs={6}>{item.itemName}</Grid>
                            <Grid item xs={2}>{item.quantity}</Grid>
                            <Grid item xs={2}>
                                Rs. {item.estimatedCost.toLocaleString()}
                            </Grid>
                            <Grid item xs={2}>
                                Rs. {(item.quantity * item.estimatedCost).toLocaleString()}
                            </Grid>
                        </Grid>
                    ))}
                </Paper>

                {/* Approval History */}
                <Paper sx={{p: 3}}>
                    <Typography variant="h6" mb={2}>
                        Approval History
                    </Typography>

                    {requisition.approvals.length === 0 ? (
                        <Typography color="text.secondary">
                            No approvals yet
                        </Typography>
                    ) : (
                        requisition.approvals.map((a) => (
                            <Paper
                                key={a.id}
                                variant="outlined"
                                sx={{p: 2, mb: 2}}
                            >
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography fontWeight={600}>
                                        {a.approvedByName ||
                                            //a.role?.name ||
                                            'System'} ({a.approvedByName})
                                    </Typography>
                                    <Chip
                                        label={a.status}
                                        color={statusColor(a.status)}
                                        size="small"
                                    />
                                </Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Approved Date: {formatDate(a.approvedDate)}
                                </Typography>

                                <Typography mt={1}>
                                    Comment: {a.comments}
                                </Typography>
                            </Paper>
                        ))
                    )}
                </Paper>
            </Box>
        </DashboardLayout>
    );
}
