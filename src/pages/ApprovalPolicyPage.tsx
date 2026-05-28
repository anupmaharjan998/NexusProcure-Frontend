import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PolicyIcon from '@mui/icons-material/Policy';

import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ApprovalPolicyForm } from '../components/Approval/ApprovalPolicyForm';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';

import {
    getApprovalPolicies,
    deleteApprovalPolicy,
} from '../services/approvalPolicyService';
import { useAuth } from '../hooks/useAuth.ts';

type SnackbarState = {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
};

export default function ApprovalPolicyPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const { hasPermission } = useAuth();

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showMessage = (
        message: string,
        severity: SnackbarState['severity'] = 'success'
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const loadData = async () => {
        setLoading(true);

        try {
            const data = await getApprovalPolicies();
            setRows(data);
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to load approval policies.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setOpenForm(true);
    };

    const handleFormClose = () => {
        setOpenForm(false);
    };

    const handleFormSaved = async () => {
        await loadData();

        setOpenForm(false);

        showMessage('Approval policy added successfully.', 'success');
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await deleteApprovalPolicy(deleteTarget.id);

            setDeleteTarget(null);
            await loadData();

            showMessage('Approval policy deleted successfully.', 'success');
        } catch (err: any) {
            showMessage(
                err.response?.data?.message || 'Failed to delete approval policy.',
                'error'
            );
        } finally {
            setDeleting(false);
        }
    };

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return rows;

        return rows.filter((row) =>
            `${row.categoryName || ''} ${row.roleName || ''} ${row.riskLevel || ''}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [search, rows]);

    const columns: GridColDef[] = [
        {
            field: 'categoryName',
            headerName: 'Category',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Typography fontWeight={700}>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'riskLevel',
            headerName: 'Risk',
            width: 130,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value || '-'}
                    color={
                        params.value === 'Critical' || params.value === 'High'
                            ? 'error'
                            : params.value === 'Medium'
                                ? 'warning'
                                : 'success'
                    }
                    sx={{ fontWeight: 700 }}
                />
            ),
        },
        {
            field: 'roleName',
            headerName: 'Approval Role',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Typography fontWeight={600}>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'sequenceOrder',
            headerName: 'Order',
            width: 100,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'escalationHours',
            headerName: 'Escalation',
            width: 150,
            renderCell: (params) => `${params.value ?? 0} hrs`,
        },
        {
            field: 'isActive',
            headerName: 'Active',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Switch checked={Boolean(params.value)} disabled />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    {hasPermission('DELETE_POLICIES') && (
                        <Tooltip title="Delete policy">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(params.row)}
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
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <PolicyIcon sx={{ fontSize: 42 }} />

                            <Box>
                                <Typography variant="h4" fontWeight={900}>
                                    Approval Policies
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    Manage approval rules by category, risk level, approval role and escalation time.
                                </Typography>
                            </Box>
                        </Stack>

                        {hasPermission('ADD_POLICIES') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#0f172a',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 900,
                                    '&:hover': {
                                        bgcolor: '#e2e8f0',
                                    },
                                }}
                            >
                                Add Policy
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <Card elevation={0} sx={{ borderRadius: 5 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', md: 'center' }}
                            spacing={2}
                            sx={{ mb: 2 }}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    Policy List
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {filteredRows.length} approval policy records found.
                                </Typography>
                            </Box>

                            <TextField
                                size="small"
                                placeholder="Search by category, role or risk"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{ width: { xs: '100%', md: 360 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            autoHeight
                            loading={loading}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                        page: 0,
                                    },
                                },
                            }}
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#f8fafc',
                                    fontWeight: 900,
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: '#eef2f7',
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <ApprovalPolicyForm
                    open={openForm}
                    onClose={handleFormClose}
                    onSaved={handleFormSaved}
                />

                <ConfirmDialog
                    open={!!deleteTarget}
                    title="Delete Policy"
                    message={`Are you sure you want to delete this policy${
                        deleteTarget?.categoryName
                            ? ` for ${deleteTarget.categoryName}`
                            : ''
                    }?`}
                    confirmText={deleting ? 'Deleting...' : 'Delete'}
                    confirmColor="error"
                    onCancel={() => {
                        if (!deleting) {
                            setDeleteTarget(null);
                        }
                    }}
                    onConfirm={handleDelete}
                />

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3500}
                    onClose={() =>
                        setSnackbar((prev) => ({
                            ...prev,
                            open: false,
                        }))
                    }
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() =>
                            setSnackbar((prev) => ({
                                ...prev,
                                open: false,
                            }))
                        }
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
}