import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    TextField,
    MenuItem,
    Chip,
    Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { RfqDto } from '../../types/RfqDto';
import { getRfqs } from '../../services/rfqService';
import {formatDateTime} from "../../utils/helpers.ts";

/* ============================
   Status Helpers
============================ */
const RFQ_STATUS_MAP: Record<number, string> = {
    0: 'Open',
    1: 'Closed',
    2: 'Awarded',
    3: 'Cancelled'
};

const resolveStatus = (status: number | string) =>
    typeof status === 'string' ? status : RFQ_STATUS_MAP[status] ?? 'Unknown';

export default function RFQListPage() {
    const navigate = useNavigate();

    const [rfqs, setRfqs] = useState<RfqDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    /* ============================
       Fetch RFQs
    ============================ */
    const fetchRfqs = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getRfqs();
            setRfqs(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load RFQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRfqs();
    }, []);

    /* ============================
       Search & Filter
    ============================ */
    const filteredRows = useMemo(() => {
        return rfqs.filter((r) => {
            const matchesSearch =
                r.rfqNumber.toLowerCase().includes(search.toLowerCase());

            const statusLabel = resolveStatus(r.status);
            const matchesStatus =
                statusFilter === 'All' || statusLabel === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [rfqs, search, statusFilter]);

    /* ============================
       Columns
    ============================ */
    const columns: GridColDef[] = [
        { field: 'rfqNumber', headerName: 'RFQ No.', flex: 1 },

        {
            field: 'createdAt',
            headerName: 'Created',
            flex: 1,
            valueFormatter: (params) =>
                new Date(params).toISOString().split('T')[0]
        },
        {
            field: 'submissionDeadline',
            headerName: 'Deadline',
            flex: 1,
            valueFormatter: (params) =>
                new Date(params).toISOString().split('T')[0]
        },
        {
            field: 'totalQuotationsRecieved',
            headerName: 'Quotations',
            flex: 1,
            align: 'center'
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => {
                const label = resolveStatus(params.value);
                const color =
                    label === 'Awarded'
                        ? 'success'
                        : label === 'Cancelled'
                            ? 'error'
                            : label === 'Closed'
                                ? 'warning'
                                : 'info';

                return <Chip label={label} color={color} size="small" />;
            }
        }
    ];

    /* ============================
       Render
    ============================ */
    return (
        <DashboardLayout>
            <Box>
                <Box mb={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Requests for Quotation
                    </Typography>
                    <Typography color="text.secondary">
                        View and manage RFQs and submitted quotations
                    </Typography>
                </Box>

                <Box display="flex" gap={2} mb={3} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search RFQs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />
                        }}
                        sx={{ minWidth: 260 }}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ width: 160 }}
                    >
                        {['All', 'Open', 'Closed', 'Awarded', 'Cancelled'].map(
                            (s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            )
                        )}
                    </TextField>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                {loading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                        onRowClick={(params) =>
                            navigate(`/rfqs/${params.row.id}`)
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
            </Box>
        </DashboardLayout>
    );
}
