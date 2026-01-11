import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

import ApprovalLevelForm from '../components/Approval/ApprovalLevelForm';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import {
    getApprovalLevels,
    createApprovalLevel,
    updateApprovalLevel,
    deleteApprovalLevel
} from '../services/approvalLevelService';
import { getRoles } from '../services/roleService';

import { Role } from '../types/Role';
import { ApprovalLevel } from '../types/approvalLevel';
import { DashboardLayout } from '../components/Layout/DashboardLayout';

export default function ApprovalFlowPage() {
    const [levels, setLevels] = useState<ApprovalLevel[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<ApprovalLevel | null>(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    // 🔴 Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [approvalLevelToDelete, setApprovalLevelToDelete] = useState<ApprovalLevel | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [levelsRes, rolesRes] = await Promise.all([
                getApprovalLevels(),
                getRoles()
            ]);

            // Sort by minAmount ASC
            const sorted = [...levelsRes].sort(
                (a, b) => a.minAmount - b.minAmount
            );

            setLevels(sorted);
            setRoles(rolesRes);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load approval levels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (data: any) => {
        setActionLoading(true);
        try {
            if (selected) {
                await updateApprovalLevel(selected.id, data);
            } else {
                await createApprovalLevel(data);
            }
            setOpen(false);
            setSelected(null);
            loadData();
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (level: ApprovalLevel) => {
        setApprovalLevelToDelete(level);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!approvalLevelToDelete) return;

        setActionLoading(true);
        try {
            await deleteApprovalLevel(approvalLevelToDelete.id);
            setDeleteDialogOpen(false);
            setApprovalLevelToDelete(null);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete approval level');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'levelName', headerName: 'Approval Level', flex: 1 },
        { field: 'minAmount', headerName: 'Min Amount', flex: 1 },
        { field: 'maxAmount', headerName: 'Max Amount', flex: 1 },
        { field: 'roleName', headerName: 'Approver Role', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton
                        onClick={() => {
                            setSelected(params.row as ApprovalLevel);
                            setOpen(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton
                        onClick={() => handleDeleteClick(params.row as ApprovalLevel)}
                        sx={{ color: '#E63946' }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Card>
                    <CardContent>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Typography variant="h6">
                                Approval Flow Management
                            </Typography>

                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={() => setOpen(true)}
                                disabled={loading}
                            >
                                Add Approval Level
                            </Button>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <DataGrid
                            rows={levels}
                            columns={columns}
                            getRowId={(row) => row.id}
                            autoHeight
                            disableRowSelectionOnClick
                            loading={loading}
                        />
                    </CardContent>
                </Card>

                <ApprovalLevelForm
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        setSelected(null);
                    }}
                    onSubmit={handleSubmit}
                    roles={roles}
                    defaultValues={selected}
                />

                {/* 🔴 Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Approval Level"
                    message={`Are you sure you want to delete "${approvalLevelToDelete?.levelName}"?`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteDialogOpen(false)}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
}
