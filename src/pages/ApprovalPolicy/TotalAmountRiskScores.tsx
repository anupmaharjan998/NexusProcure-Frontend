import {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Typography,
    IconButton,
    Alert,
    TextField,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import debounce from 'lodash.debounce';

import {DashboardLayout} from '../../components/Layout/DashboardLayout';
import {Table, Column} from '../../components/UI/Table';
import {Button} from '../../components/UI/Button';
import {ConfirmDialog} from '../../components/UI/ConfirmDialog';

import {TotalAmountRiskScoreForm} from '../../components/Approval/TotalAmountRiskScoreForm';
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
import {useAuth} from "../../hooks/useAuth.ts";

export const TotalAmountRiskScores = () => {
    const [data, setData] = useState<TotalAmountRiskScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const {hasPermission} = useAuth();

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<TotalAmountRiskScore>();
    const [deleteTarget, setDeleteTarget] = useState<TotalAmountRiskScore>();

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

    useEffect(() => {
        fetchData();
    }, []);

    // Debounced search input
    const handleSearchChange = debounce((value: string) => {
        setSearch(value);
    }, 300);

    const filteredData = useMemo(() => {
        if (!search) return data;
        return data.filter(d =>
            `${d.minAmount} ${d.maxAmount} ${d.riskPoints}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, data]);

    const handleSubmit = async (req: TotalAmountRiskScoreRequest) => {
        setActionLoading(true);
        setError('');
        setSuccess('');

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
            setDeleteTarget(undefined);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: Column<TotalAmountRiskScore>[] = [
        {
            id: 'minAmount',
            label: 'Min Amount',
            format: (value) => value !== null && value !== undefined ? value : '-'
        },
        {
            id: 'maxAmount',
            label: 'Max Amount',
            format: (value) => value !== null && value !== undefined ? value : '-'
        },
        {
            id: 'riskPoints',
            label: 'Risk Points',
            format: (value) => value !== null && value !== undefined ? value : '-'
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            format: (_, row) => (
                <Box display="flex" gap={1} justifyContent="center">
                    {hasPermission("UPDATE_TOTAL_AMOUNT_RISK_SCORE") && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelected(row);
                                setFormOpen(true);
                            }}
                        >
                            <EditIcon fontSize="small"/>
                        </IconButton>
                    )}

                    {hasPermission("DELETE_TOTAL_AMOUNT_RISK_SCORE") && (
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(row)}
                        >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    )}

                </Box>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h4" fontWeight={700}>
                        Total Amount Risk Scores
                    </Typography>
                    {hasPermission("ADD_TOTAL_AMOUNT_RISK_SCORE") && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={() => {
                                setFormOpen(true);
                            }}
                        >
                            Add Rule
                        </Button>
                    )}


                </Box>

                <TextField
                    size="small"
                    placeholder="Search by min/max amount or risk points"
                    fullWidth
                    sx={{mb: 2}}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Table
                        data={filteredData}
                        columns={columns}
                        loading={loading}
                    />
                )}

                <TotalAmountRiskScoreForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelected(undefined);
                    }}
                    riskScore={selected}
                    onSubmit={handleSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={!!deleteTarget}
                    title="Delete Rule"
                    message="Are you sure you want to delete this risk rule?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(undefined)}
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};
