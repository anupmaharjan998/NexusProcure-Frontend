import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Switch
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
import {Role} from "../types/Role.ts";

export default function ApprovalPolicyPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);

        try {
            const [policiesData] = await Promise.all([
                getApprovalPolicies(),

            ]);
            setRows(policiesData);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const columns: GridColDef[] = [
        { field: 'categoryName', headerName: 'Category', flex: 1 },
        { field: 'riskLevel', headerName: 'Risk', flex: 1 },
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
                <Box display="flex" justifyContent="space-between" mb={3}>
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

                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    getRowId={(r) => r.id}
                />

                <ApprovalPolicyForm
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    defaultValues={selected}
                    onSaved={() => {
                        setOpenForm(false);
                        loadData();
                    }}
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
