import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Switch,
    TextField
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ApprovalPolicyForm } from '../components/Approval/ApprovalPolicyForm';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';

import {
    getApprovalPolicies,
    deleteApprovalPolicy
} from '../services/approvalPolicyService';

export default function ApprovalPolicyPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            setRows(await getApprovalPolicies());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRows = useMemo(() => {
        if (!search) return rows;
        return rows.filter(r =>
            `${r.categoryName} ${r.roleName} ${r.riskLevel}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, rows]);

    const columns: GridColDef[] = [
        { field: 'categoryName', headerName: 'Category', flex: 1 },
        { field: 'riskLevel', headerName: 'Risk', width: 120 },
        { field: 'roleName', headerName: 'Approval Role', flex: 1 },
        { field: 'sequenceOrder', headerName: 'Order', width: 100 },
        { field: 'escalationHours', headerName: 'Escalation (hrs)', width: 150 },
        {
            field: 'isActive',
            headerName: 'Active',
            width: 100,
            renderCell: (p) => <Switch checked={p.value} disabled />
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (p) => (
                <>
                    <IconButton onClick={() => {
                        setSelected(p.row);
                        setOpenForm(true);
                    }}>
                        <EditIcon />
                    </IconButton>

                    <IconButton color="error" onClick={() => setDeleteTarget(p.row)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h4" fontWeight={700}>
                        Approval Policies
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelected(null);
                            setOpenForm(true);
                        }}
                    >
                        Add Policy
                    </Button>
                </Box>

                <TextField
                    size="small"
                    placeholder="Search by category, role or risk"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    autoHeight
                    loading={loading}
                    getRowId={(r) => r.id}
                    disableRowSelectionOnClick
                />

                <ApprovalPolicyForm
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    defaultValues={selected}
                    onSaved={loadData}
                />

                <ConfirmDialog
                    open={!!deleteTarget}
                    title="Delete Policy"
                    message="Are you sure you want to delete this policy?"
                    confirmText="Delete"
                    confirmColor="error"
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={async () => {
                        await deleteApprovalPolicy(deleteTarget.id);
                        setDeleteTarget(null);
                        loadData();
                    }}
                />
            </Box>
        </DashboardLayout>
    );
}
