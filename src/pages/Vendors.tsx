import {
    Box,
    Typography,
    IconButton,
    Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {useEffect, useState} from 'react';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Table, Column} from '../components/UI/Table';
import {Button} from '../components/UI/Button';
import {ConfirmDialog} from '../components/UI/ConfirmDialog';
import {VendorForm} from '../components/Vendor/VendorForm';

import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    getVendorById
} from '../services/vendorService';

import {Vendor, VendorFormData} from '../types/Vendor';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export const Vendors = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | undefined>();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const {user} = useAuth();


    const fetchData = async () => {
        setLoading(true);
        try {
            const vendorsData = await getVendors();
            setVendors(vendorsData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch vendors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedVendor(undefined);
        setFormOpen(true);
    };

    const handleEdit = async (vendor: Vendor) => {
        try {
            setActionLoading(true);
            const detailedVendor = await getVendorById(vendor.id);
            setSelectedVendor(detailedVendor);
            setFormOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load vendor data");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (vendor: Vendor) => {
        setVendorToDelete(vendor);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!vendorToDelete) return;
        setActionLoading(true);

        try {
            await deleteVendor(vendorToDelete.id);
            setSuccess("Vendor deleted successfully");
            setDeleteDialogOpen(false);
            setVendorToDelete(undefined);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete vendor");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRowClick = (vendor: Vendor) => {
        navigate(`/vendors/${vendor.id}`);
    };

    const handleFormSubmit = async (data: VendorFormData) => {
        setActionLoading(true);
        setError("");

        try {
            if (selectedVendor) {
                await updateVendor(selectedVendor.id, data);
                setSuccess("Vendor updated successfully");
            } else {
                await createVendor(data);
                setSuccess("Vendor created successfully");
            }

            setFormOpen(false);
            setSelectedVendor(undefined);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save vendor");
        } finally {
            setActionLoading(false);
        }
    };

    const approveVendor = async (vendor: Vendor) => {
        setActionLoading(true);
        try {
            //await vendorService.approveVendor(vendor.id);
            setSuccess("Vendor approved");
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to approve vendor");
        } finally {
            setActionLoading(false);
        }
    };

    const rejectVendor = async (vendor: Vendor) => {
        setActionLoading(true);
        try {
            //await vendorService.rejectVendor(vendor.id);
            setSuccess("Vendor rejected");
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reject vendor");
        } finally {
            setActionLoading(false);
        }
    };


    const columns: Column<Vendor>[] = [
        {id: "vendorName", label: "Vendor Name", minWidth: 150},
        {id: "email", label: "Email", minWidth: 180},
        {id: "phoneNumber", label: "Phone", minWidth: 140},
        {
            id: "category",
            label: "Category",
            minWidth: 120,
        },
        {
            id: "status",
            label: "Status",
            minWidth: 120,
        },
        {
            id: "actions",
            label: "Actions",
            minWidth: 120,
            align: "center",
            format: (_, vendor) => (
                <Box sx={{display: "flex", gap: 1, justifyContent: "center"}}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(vendor);
                        }}
                        sx={{color: "#0056D2"}}
                    >
                        <EditIcon fontSize="small"/>
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(vendor);
                        }}
                        sx={{color: "#E63946"}}
                    >
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>

            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{display: "flex", justifyContent: "space-between", mb: 3}}>
                    <Box>
                        <Typography variant="h4" sx={{fontWeight: 700}}>Vendor Management</Typography>
                        <Typography variant="body2" sx={{color: "#64748B"}}>
                            Manage registered vendors
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleAdd}
                    >
                        Add Vendor
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

                <Table data={vendors} columns={columns} loading={loading} onRowClick={handleRowClick}/>

                <VendorForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelectedVendor(undefined);
                    }}
                    vendor={selectedVendor}
                    onSubmit={handleFormSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Vendor"
                    message={`Are you sure you want to delete "${vendorToDelete?.vendorName}"?`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteDialogOpen(false)}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};
