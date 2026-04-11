import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

import {Vendor, VendorDocument} from "../types/Vendor";
import {VendorForm} from "../components/Vendor/VendorForm";
import {
    getVendorById,
    updateVendor,
    uploadVendorDocument,
    updateVendorStatus,
    getAllCategories,
    getAllPaymentTerms, downloadDocument
} from "../services/vendorService";
import {DashboardLayout} from "../components/Layout/DashboardLayout";
import {TaxType} from "../types/TaxType";
import {Category} from "../types/Category";
import {PaymentTerms} from "@/types/PaymentTerms.ts";
import {useAuth} from "../hooks/useAuth.ts";
/* ---------------------------------- */

export const VendorDetails = () => {
    const {id} = useParams<{ id: string }>();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [paymentTermsList, setPaymentTermsList] = useState<PaymentTerms[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] =
        useState<"approve" | "reject" | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const {hasPermission} = useAuth();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error"
    });

    /* ---------------- LOAD DATA ---------------- */

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;

                const [vendorRes, categoryRes, paymentTermsRes] = await Promise.all([
                    getVendorById(id),
                    getAllCategories(),
                    getAllPaymentTerms()
                ]);

                setVendor(vendorRes);
                setCategories(categoryRes);
                setPaymentTermsList(paymentTermsRes);
            } catch {
                setSnackbar({
                    open: true,
                    message: "Failed to load vendor",
                    severity: "error"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    /* ---------------- HELPERS ---------------- */

    // const getCategoryName = () => {
    //     if (!vendor?.categoryIds) return "-";
    //     const category = categories.find(c => c.id === vendor.categoryIds);
    //     return category?.name || "-";
    // };
    const getPaymentTermsName = () => {
        if (vendor?.paymentTerms === null || vendor?.paymentTerms === undefined)
            return "-";

        const term = paymentTermsList.find(t => t.value === vendor.paymentTerms);
        return term?.displayName || "-";
    }

    /* ---------------- UPDATE ---------------- */

    const handleVendorUpdate = async (data: any) => {
        if (!id) return;

        try {
            await updateVendor(id, data);
            const updated = await getVendorById(id);
            setVendor(updated);
            setEditOpen(false);

            setSnackbar({
                open: true,
                message: "Vendor updated successfully",
                severity: "success"
            });
        } catch {
            setSnackbar({
                open: true,
                message: "Failed to update vendor",
                severity: "error"
            });
        }
    };

    /* ---------------- FILE UPLOAD ---------------- */

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setUploading(true);
        try {
            await uploadVendorDocument(id, file);
            const updated = await getVendorById(id);
            setVendor(updated);

            setSnackbar({
                open: true,
                message: "Document uploaded successfully",
                severity: "success"
            });
        } catch {
            setSnackbar({
                open: true,
                message: "File upload failed",
                severity: "error"
            });
        } finally {
            setUploading(false);
        }
    };

    /* ---------------- DOWNLOAD (API RETURNS FILE) ---------------- */

    const handleDownload = async (doc: VendorDocument) => {
        try {
            const blob = await downloadDocument(doc.id);
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = doc.fileName || "document";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            setSnackbar({
                open: true,
                message: "Download failed",
                severity: "error",
            });
        }
    };


    /* ---------------- APPROVAL ---------------- */

    const openDialog = (type: "approve" | "reject") => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleAction = async () => {
        if (!id || !dialogType) return;

        setActionLoading(true);
        try {
            await updateVendorStatus(
                id,
                dialogType === "approve" ? "Active" : "Rejected"
            );

            const updated = await getVendorById(id);
            setVendor(updated);

            setSnackbar({
                open: true,
                message: `Vendor ${
                    dialogType === "approve" ? "approved" : "rejected"
                } successfully`,
                severity: "success"
            });
        } catch {
            setSnackbar({
                open: true,
                message: "Action failed",
                severity: "error"
            });
        } finally {
            setActionLoading(false);
            setDialogOpen(false);
        }
    };

    /* ---------------- RENDER ---------------- */

    if (loading) return <CircularProgress/>;
    if (!vendor) return <Typography>Vendor not found</Typography>;

    return (
        <DashboardLayout>
            <Box p={3} maxWidth="1100px" mx="auto">
                {/* Header */}
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" fontWeight={600}>
                        Vendor Details
                    </Typography>

                    {hasPermission("EDIT_VENDOR") && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon/>}
                            onClick={() => setEditOpen(true)}
                        >
                            Edit
                        </Button>
                    )}


                </Box>

                {/* Approval */}
                {/*{vendor.status === "Pending" && hasPermission("APPROVE_VENDOR") &&(*/}
                {vendor.status === "Pending" && hasPermission("APPROVE_VENDOR")  && (
                    <Box display="flex" gap={2} mb={3}>
                        <Button
                            color="success"
                            variant="contained"
                            onClick={() => openDialog("approve")}
                        >
                            Approve
                        </Button>
                        <Button
                            color="error"
                            variant="outlined"
                            onClick={() => openDialog("reject")}
                        >
                            Reject
                        </Button>
                    </Box>
                )}

                {/* Basic Info */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Section title="Basic Information">
                        <Info label="Vendor Name" value={vendor.vendorName}/>
                        <Info label="Company Name" value={vendor.companyName}/>
                        <Info label="Email" value={vendor.email}/>
                        <Info label="Phone" value={vendor.phoneNumber}/>
                        <Info label="Address" value={vendor.address}/>
                        <Info label="Category" value={vendor.vendorName}/>
                        <Info label="Status" value={vendor.status}/>
                    </Section>
                </Paper>

                {/* Company & Payment */}
                <Paper sx={{p: 3, mb: 3}}>
                    <Section title="Company & Payment Information">
                        <Info
                            label="Tax Type"
                            value={
                                vendor.taxType === TaxType.VAT
                                    ? "VAT"
                                    : "PAN"
                            }
                        />
                        <Info label="Tax ID" value={vendor.taxId}/>
                        <Info label="Bank Name" value={vendor.bankName}/>
                        <Info label="Bank Branch" value={vendor.bankBranch}/>
                        <Info label="Bank Account" value={vendor.bankAccount}/>
                        <Info
                            label="Payment Terms"
                            value={getPaymentTermsName()}
                        />
                    </Section>
                </Paper>

                {/* Documents */}
                <Paper sx={{p: 3}}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="h6">Documents</Typography>

                        <label>
                            <input hidden type="file" onChange={handleFileUpload}/>
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<UploadFileIcon/>}
                                disabled={uploading}
                            >
                                Upload
                            </Button>
                        </label>
                    </Box>

                    <Divider sx={{mb: 2}}/>

                    {vendor.documents?.length ? (
                        <List>
                            {vendor.documents.map(doc => (
                                <ListItem
                                    key={doc.id}
                                    secondaryAction={
                                        <IconButton
                                            onClick={() => handleDownload(doc)}
                                        >
                                            <DownloadIcon/>
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={doc.fileName}
                                        secondary={`Uploaded: ${doc.createdAt}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>No documents uploaded</Typography>
                    )}
                </Paper>

                {/* Edit */}
                <VendorForm
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    vendor={vendor}
                    onSubmit={handleVendorUpdate}
                />

                {/* Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>
                        {dialogType === "approve"
                            ? "Approve Vendor"
                            : "Reject Vendor"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to proceed?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color={
                                dialogType === "approve" ? "success" : "error"
                            }
                            onClick={handleAction}
                            disabled={actionLoading}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() =>
                        setSnackbar({...snackbar, open: false})
                    }
                >
                    <Alert severity={snackbar.severity} variant="filled">
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
};

/* ---------------- HELPERS ---------------- */

const Section = ({title, children}: any) => (
    <>
        <Typography variant="h6" fontWeight={600} mb={2}>
            {title}
        </Typography>
        <Divider sx={{mb: 2}}/>
        <Grid container spacing={2}>
            {children}
        </Grid>
    </>
);

const Info = ({label, value}: { label: string; value?: any }) => (
    <Grid item xs={12} sm={6}>
        <Typography fontWeight={600}>{label}</Typography>
        <Typography color="text.secondary">{value || "-"}</Typography>
    </Grid>
);
