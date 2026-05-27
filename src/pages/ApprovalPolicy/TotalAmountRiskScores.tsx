import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RuleIcon from '@mui/icons-material/Rule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ShieldIcon from '@mui/icons-material/Shield';
import debounce from 'lodash.debounce';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { Table, Column } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { ConfirmDialog } from '../../components/UI/ConfirmDialog';

import { TotalAmountRiskScoreForm } from '../../components/Approval/TotalAmountRiskScoreForm';
import {
    getTotalAmountRiskScores,
    createTotalAmountRiskScore,
    updateTotalAmountRiskScore,
    deleteTotalAmountRiskScore,
} from '../../services/totalAmountRiskScoreService';

import {
    TotalAmountRiskScore,
    TotalAmountRiskScoreRequest,
} from '../../types/TotalAmountRiskScore';
import { useAuth } from '../../hooks/useAuth.ts';

const formatAmount = (value?: number | null) => {
    if (value === null || value === undefined) {
        return 'Max / Unlimited';
    }

    return new Intl.NumberFormat('en-NP', {
        maximumFractionDigits: 2,
    }).format(value);
};

const getRiskColor = (riskPoints: number) => {
    if (riskPoints >= 15) return 'error';
    if (riskPoints >= 10) return 'warning';
    return 'success';
};

export const TotalAmountRiskScores = () => {
    const [data, setData] = useState<TotalAmountRiskScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const { hasPermission } = useAuth();

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<TotalAmountRiskScore>();
    const [deleteTarget, setDeleteTarget] = useState<TotalAmountRiskScore>();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getTotalAmountRiskScores();
            setData(result || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load risk scores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearchChange = useMemo(
        () =>
            debounce((value: string) => {
                setSearch(value);
            }, 300),
        []
    );

    const filteredData = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return data;

        return data.filter((d) =>
            `${d.minAmount} ${d.maxAmount ?? 'max unlimited'} ${d.riskPoints}`
                .toLowerCase()
                .includes(query)
        );
    }, [search, data]);

    const stats = useMemo(() => {
        const totalRules = data.length;
        const unlimitedRules = data.filter((item) => item.maxAmount === null).length;
        const highestRisk = data.length
            ? Math.max(...data.map((item) => item.riskPoints || 0))
            : 0;
        const activeRules = data.filter((item) => item.isActive !== false).length;

        return {
            totalRules,
            unlimitedRules,
            highestRisk,
            activeRules,
        };
    }, [data]);

    const handleOpenCreate = () => {
        setSelected(undefined);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        if (actionLoading) return;

        setFormOpen(false);
        setSelected(undefined);
    };

    const handleSubmit = async (req: TotalAmountRiskScoreRequest) => {
        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            if (selected) {
                await updateTotalAmountRiskScore(selected.id, req);
                setSuccess('Risk score rule updated successfully');
            } else {
                await createTotalAmountRiskScore(req);
                setSuccess('Risk score rule created successfully');
            }

            setFormOpen(false);
            setSelected(undefined);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            await deleteTotalAmountRiskScore(deleteTarget.id);
            setSuccess('Risk score rule deleted successfully');
            setDeleteTarget(undefined);
            await fetchData();
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
            format: (value) => (
                <Typography fontWeight={700}>
                    {formatAmount(value as number)}
                </Typography>
            ),
        },
        {
            id: 'maxAmount',
            label: 'Max Amount',
            format: (value) =>
                value !== null && value !== undefined ? (
                    <Typography fontWeight={700}>
                        {formatAmount(value as number)}
                    </Typography>
                ) : (
                    <Chip
                        size="small"
                        icon={<AllInclusiveIcon />}
                        label="Max / Unlimited"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                    />
                ),
        },
        {
            id: 'riskPoints',
            label: 'Risk Points',
            align: 'center',
            format: (value) => {
                const riskPoints = Number(value || 0);

                return (
                    <Chip
                        size="small"
                        label={`${riskPoints} Points`}
                        color={getRiskColor(riskPoints) as any}
                        sx={{ fontWeight: 800, minWidth: 90 }}
                    />
                );
            },
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            format: (_, row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {hasPermission('UPDATE_TOTAL_AMOUNT_RISK_SCORE') && (
                        <Tooltip title="Edit rule">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSelected(row);
                                    setFormOpen(true);
                                }}
                                sx={{
                                    bgcolor: '#eff6ff',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: '#dbeafe',
                                    },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {hasPermission('DELETE_TOTAL_AMOUNT_RISK_SCORE') && (
                        <Tooltip title="Delete rule">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(row)}
                                sx={{
                                    bgcolor: '#fef2f2',
                                    '&:hover': {
                                        bgcolor: '#fee2e2',
                                    },
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f8fafc',
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 4 },
                }}
            >
                <Box sx={{ maxWidth: 1250, mx: 'auto' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            mb: 3,
                            borderRadius: 5,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            background:
                                'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                width: 260,
                                height: 260,
                                borderRadius: '50%',
                                right: -90,
                                top: -100,
                                bgcolor: 'rgba(255,255,255,0.08)',
                            }}
                        />

                        <Box
                            sx={{
                                position: 'absolute',
                                width: 170,
                                height: 170,
                                borderRadius: '50%',
                                right: 130,
                                bottom: -95,
                                bgcolor: 'rgba(255,255,255,0.06)',
                            }}
                        />

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            spacing={3}
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <RuleIcon sx={{ fontSize: 34 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Total Amount Risk Scores
                                    </Typography>

                                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
                                        Define risk points based on requisition total amount ranges.
                                        Leave max amount empty to create an unlimited upper range.
                                    </Typography>
                                </Box>
                            </Stack>

                            {hasPermission('ADD_TOTAL_AMOUNT_RISK_SCORE') && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenCreate}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#0f172a',
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.1,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                                        '&:hover': {
                                            bgcolor: '#f1f5f9',
                                        },
                                    }}
                                >
                                    Add Rule
                                </Button>
                            )}
                        </Stack>
                    </Paper>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(4, 1fr)',
                            },
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <SummaryCard
                            icon={<RuleIcon />}
                            title="Total Rules"
                            value={stats.totalRules}
                            helper="Configured amount policies"
                        />

                        <SummaryCard
                            icon={<AllInclusiveIcon />}
                            title="Unlimited Rules"
                            value={stats.unlimitedRules}
                            helper="Rules with no max amount"
                        />

                        <SummaryCard
                            icon={<TrendingUpIcon />}
                            title="Highest Risk"
                            value={stats.highestRisk}
                            helper="Maximum risk points"
                        />

                        <SummaryCard
                            icon={<ShieldIcon />}
                            title="Active Rules"
                            value={stats.activeRules}
                            helper="Currently usable policies"
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                mb={2.5}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Risk Score Rules
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        The system uses: Min Amount ≤ Total Amount &lt; Max Amount.
                                        If max amount is unlimited, all higher amounts match that rule.
                                    </Typography>
                                </Box>

                                <TextField
                                    size="small"
                                    placeholder="Search min, max, unlimited, or risk points..."
                                    onChange={(event) => handleSearchChange(event.target.value)}
                                    sx={{
                                        minWidth: { xs: '100%', md: 380 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            {loading ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={8}
                                >
                                    <CircularProgress />
                                    <Typography mt={2} color="text.secondary">
                                        Loading risk score rules...
                                    </Typography>
                                </Box>
                            ) : filteredData.length === 0 ? (
                                <EmptyState
                                    hasSearch={Boolean(search.trim())}
                                    canCreate={hasPermission('ADD_TOTAL_AMOUNT_RISK_SCORE')}
                                    onCreate={handleOpenCreate}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        '& table': {
                                            borderCollapse: 'separate',
                                            borderSpacing: '0 8px',
                                        },
                                        '& thead th': {
                                            bgcolor: '#f8fafc',
                                            fontWeight: 900,
                                            color: '#334155',
                                            borderBottom: 'none',
                                        },
                                        '& tbody tr': {
                                            bgcolor: 'white',
                                            boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
                                        },
                                        '& tbody td': {
                                            borderBottom: '1px solid #f1f5f9',
                                        },
                                    }}
                                >
                                    <Table
                                        data={filteredData}
                                        columns={columns}
                                        loading={loading}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <TotalAmountRiskScoreForm
                    open={formOpen}
                    onClose={handleCloseForm}
                    riskScore={selected}
                    onSubmit={handleSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={!!deleteTarget}
                    title="Delete Rule"
                    message={
                        deleteTarget
                            ? `Are you sure you want to delete the rule ${formatAmount(
                                deleteTarget.minAmount
                            )} - ${formatAmount(deleteTarget.maxAmount)}?`
                            : 'Are you sure you want to delete this risk rule?'
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(undefined)}
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};

function SummaryCard({
                         icon,
                         title,
                         value,
                         helper,
                     }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    helper: string;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            bgcolor: '#eff6ff',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>

                        <Typography variant="h5" fontWeight={900}>
                            {value}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {helper}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function EmptyState({
                        hasSearch,
                        canCreate,
                        onCreate,
                    }: {
    hasSearch: boolean;
    canCreate: boolean;
    onCreate: () => void;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: 7,
                px: 2,
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: '#f8fafc',
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 5,
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <RuleIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h6" fontWeight={900}>
                {hasSearch ? 'No matching rules found' : 'No risk score rules created yet'}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                {hasSearch
                    ? 'Try searching with another amount, risk point, or unlimited keyword.'
                    : 'Create your first amount-based risk rule to start calculating requisition risk.'}
            </Typography>

            {!hasSearch && canCreate && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 800,
                    }}
                >
                    Add Rule
                </Button>
            )}
        </Paper>
    );
}