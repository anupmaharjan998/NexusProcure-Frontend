import {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Alert,
    TextField,
    MenuItem,
    Chip,
    Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom';

import {DashboardLayout} from '../../components/Layout/DashboardLayout';
import {ConfirmDialog} from '../../components/UI/ConfirmDialog';
import {RequisitionForm} from '../../components/Requisition/RequisitionForm';

import {
    getRequisitions,
    createRequisition,
    updateRequisition,
    deleteRequisition
} from '../../services/requisitionService';

import {RequisitionDto, RequisitionRequest} from '../../types/requisition';

export default function RequisitionPage() {
    const navigate = useNavigate();

    /* ============================
       State
    ============================ */
    const [requisitions, setRequisitions] = useState<RequisitionDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<RequisitionDto | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requisitionToDelete, setRequisitionToDelete] =
        useState<RequisitionDto | null>(null);

    // 🔍 Search & Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    /* ============================
       Fetch Data
    ============================ */
    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getRequisitions();
            setRequisitions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load requisitions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ============================
       Search + Filter Logic
    ============================ */
    const filteredRows = useMemo(() => {
        return requisitions.filter((r) => {
            const matchesSearch =
                r.requisitionNumber?.toLowerCase().includes(search.toLowerCase()) ||
                r.requestedByName?.toLowerCase().includes(search.toLowerCase()) ||
                r.categoryName?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'All' || r.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requisitions, search, statusFilter]);

    /* ============================
       Handlers
    ============================ */
    const handleFormSubmit = async (data: RequisitionRequest) => {
        try {
            if (selected?.id) {
                await updateRequisition(selected.id, data);
            } else {
                await createRequisition(data);
            }
            setFormOpen(false);
            setSelected(null);
            fetchData();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to save requisition');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!requisitionToDelete?.id) return;

        try {
            await deleteRequisition(requisitionToDelete.id);
            setDeleteDialogOpen(false);
            setRequisitionToDelete(null);
            fetchData();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to delete requisition');
        }
    };

    /* ============================
       DataGrid Columns
    ============================ */
    const columns: GridColDef[] = [
        {field: 'requisitionNumber', headerName: 'Req No.', flex: 1},
        {field: 'requestedByName', headerName: 'Requested By', flex: 1},
        {field: 'categoryName', headerName: 'Category', flex: 1},
        {
            field: 'requestedDate',
            headerName: 'Requested Date',
            flex: 1,
            valueFormatter: (params) =>
                params
                    ? new Date(params).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })
                    : '-'
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => {
                const color =
                    params.value === 'Approved'
                        ? 'success'
                        : params.value === 'Rejected'
                            ? 'error'
                            : 'warning';

                return <Chip label={params.value} color={color} size="small"/>;
            }
        },
        {
            field: 'totalAmount',
            headerName: 'Total',
            flex: 1,
            valueFormatter: (params) =>
                `Rs. ${Number(params || 0).toLocaleString()}`
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    {/*<IconButton*/}
                    {/*    size="small"*/}
                    {/*    color="primary"*/}
                    {/*    onClick={(e) => {*/}
                    {/*        e.stopPropagation();*/}
                    {/*        setSelected(params.row);*/}
                    {/*        setFormOpen(true);*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <EditIcon fontSize="small" />*/}
                    {/*</IconButton>*/}

                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRequisitionToDelete(params.row);
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            )
        }
    ];

    /* ============================
       Render
    ============================ */
    return (
        <DashboardLayout>
            <Box>
                {/* Header */}
                <Box mb={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Requisitions
                    </Typography>
                    <Typography color="text.secondary">
                        Create, search and manage procurement requisitions
                    </Typography>
                </Box>

                {/* Controls */}
                <Box
                    display="flex"
                    gap={2}
                    mb={3}
                    flexWrap="wrap"
                    alignItems="center"
                >
                    <TextField
                        size="small"
                        placeholder="Search requisitions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{startAdornment: <SearchIcon sx={{mr: 1}}/>}}
                        sx={{minWidth: 260}}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{width: 160}}
                    >
                        {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box flexGrow={1}/>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => {
                            setSelected(null);
                            setFormOpen(true);
                        }}
                        disabled={loading}
                    >
                        New Requisition
                    </Button>
                </Box>

                {/* Errors */}
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                {/* Loader */}
                {loading ? (
                    <Skeleton variant="rectangular" height={400}/>
                ) : filteredRows.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography variant="h6">
                            No requisitions found
                        </Typography>
                        <Typography color="text.secondary" mb={2}>
                            Try adjusting filters or create a new requisition
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={() => setFormOpen(true)}
                        >
                            Add Requisition
                        </Button>
                    </Box>
                ) : (
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                        onRowClick={(params) =>
                            navigate(`/procurement/requisitions/${params.row.id}`)
                        }
                        sx={{
                            borderRadius: 2,
                            '& .MuiDataGrid-row:hover': {
                                cursor: 'pointer',
                                backgroundColor: 'action.hover'
                            }
                        }}
                    />
                )}

                {/* Form */}
                <RequisitionForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelected(null);
                    }}
                    onSubmit={handleFormSubmit}
                    defaultValues={selected || undefined}
                />

                {/* Delete Dialog */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Requisition"
                    message="Are you sure you want to delete this requisition?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteDialogOpen(false)}
                    confirmText="Delete"
                    confirmColor="error"
                />
            </Box>
        </DashboardLayout>
    );
}
