// src/pages/RequisitionApprovalPage.tsx
import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getPendingRequisitions
} from '../../services/approvalService';
import { RequisitionPendingApproval } from '../../types/approval';

export default function RequisitionApprovalPage() {
    const [pending, setPending] = useState<RequisitionPendingApproval[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const navigate = useNavigate();

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await getPendingRequisitions();
            setPending(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const filteredRows = useMemo(() => {
        return pending.filter(r => {
            const matchSearch =
                r.requisitionNumber.toLowerCase().includes(search.toLowerCase()) ||
                r.requestedByName.toLowerCase().includes(search.toLowerCase());

            //const matchStatus = status ? r.status === status : true;

            return matchSearch;
        });
    }, [pending, search, status]);

    const columns: GridColDef[] = [
        { field: 'requisitionNumber', headerName: 'Req No', flex: 1 },
        { field: 'requestedByName', headerName: 'Requested By', flex: 1 },
        { field: 'requestedDate', headerName: 'Date', flex: 1 },
        { field: 'totalAmount', headerName: 'Amount', flex: 1 },
        { field: 'status', headerName: 'Status', flex: 1 },
        {
            field: 'actions',
            headerName: 'Action',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/procurement/requisitions/${params.row.id}/approval`);
                    }}
                >
                    <CheckIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h6" mb={2}>
                    Requisitions Pending Approval
                </Typography>

                {/* 🔍 Filters */}
                <Box display="flex" gap={2} mb={2}>
                    <TextField
                        label="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />

                    {/*<TextField*/}
                    {/*    select*/}
                    {/*    label="Status"*/}
                    {/*    value={status}*/}
                    {/*    onChange={e => setStatus(e.target.value)}*/}
                    {/*    sx={{ width: 200 }}*/}
                    {/*>*/}
                    {/*    <MenuItem value="">All</MenuItem>*/}
                    {/*    <MenuItem value="Pending">Pending</MenuItem>*/}
                    {/*    <MenuItem value="Approved">Approved</MenuItem>*/}
                    {/*    <MenuItem value="Rejected">Rejected</MenuItem>*/}
                    {/*</TextField>*/}
                </Box>

                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    autoHeight
                    loading={loading}
                    disableRowSelectionOnClick
                    onRowClick={(params) =>
                        navigate(`/procurement/requisitions/${params.row.id}/approval`)
                    }
                />
            </Box>
        </DashboardLayout>
    );
}
