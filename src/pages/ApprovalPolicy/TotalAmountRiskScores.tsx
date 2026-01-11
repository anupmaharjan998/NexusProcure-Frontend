import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { ConfirmDialog } from '../../components/UI/ConfirmDialog';

import { TotalAmountRiskScoreForm } from '../../components/Approval/TotalAmountRiskScoreForm';
import {
    getTotalAmountRiskScores,
    createTotalAmountRiskScore,
    updateTotalAmountRiskScore,
    deleteTotalAmountRiskScore
} from '../../services/totalAmountRiskScoreService';

import {
    TotalAmountRiskScore,
    TotalAmountRiskScoreRequest
} from '../../types/TotalAmountRiskScore';

export const TotalAmountRiskScores = () => {
    const [data, setData] = useState<TotalAmountRiskScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<TotalAmountRiskScore | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<TotalAmountRiskScore | undefined>();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            setData(await getTotalAmountRiskScores());
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load risk scores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (req: TotalAmountRiskScoreRequest) => {
        setActionLoading(true);
        try {
            selected
                ? await updateTotalAmountRiskScore(selected.id, req)
                : await createTotalAmountRiskScore(req);

            setSuccess('Saved successfully');
            setFormOpen(false);
            setSelected(undefined);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        try {
            await deleteTotalAmountRiskScore(deleteTarget.id);
            setSuccess('Deleted successfully');
            setDeleteOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: Column<TotalAmountRiskScore>[] = [
        { id: 'minAmount', label: 'Min Amount' },
        { id: 'maxAmount', label: 'Max Amount' },
        { id: 'riskPoints', label: 'Risk Points' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            format: (_, row) => (
                <Box display="flex" gap={1} justifyContent="center">
                    <IconButton size="small" onClick={() => { setSelected(row); setFormOpen(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeleteTarget(row); setDeleteOpen(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>Total Amount Risk Scores</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure risk points based on requisition amount
                        </Typography>
                    </Box>
                    <Button startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
                        Add Rule
                    </Button>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <Table data={data} columns={columns} loading={loading} />

                <TotalAmountRiskScoreForm
                    open={formOpen}
                    onClose={() => { setFormOpen(false); setSelected(undefined); }}
                    riskScore={selected}
                    onSubmit={handleSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteOpen}
                    title="Delete Rule"
                    message="Are you sure you want to delete this risk rule?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteOpen(false)}
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};
