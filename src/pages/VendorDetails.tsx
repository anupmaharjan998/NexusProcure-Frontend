import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
import { Vendor, VendorDocument } from "../../src/types/Vendor";
import { VendorForm } from "../../src/components/Vendor/VendorForm";
import {
    getVendorById,
    updateVendor,
    uploadVendorDocument
} from '../services/vendorService';
import {DashboardLayout} from "../components/Layout/DashboardLayout.tsx";

export const VendorDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                if (id != null) {
                    const response = await getVendorById(id);
                    setVendor(response);
                }

            } catch (error) {
                console.error("Error fetching vendor:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id]);

    // Update vendor after editing
    const handleVendorUpdate = async (data: any) => {
        try {
            if (id != null) {
                await updateVendor(id, data);
                const updatedVendor = await getVendorById(id);
                setVendor(updatedVendor);
                setEditOpen(false);
            }
        } catch (error) {
            console.error("Error updating vendor:", error);
        }
    };

    // Handle document upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadVendorDocument(id!, file);
            const updatedVendor = await getVendorById(id!);
            setVendor(updatedVendor);

        } catch (error) {
            console.error("Error uploading document:", error);
        } finally {
            setUploading(false);
        }
    };


    const handleDownload = async (doc: VendorDocument) => {
        try {
            const response = await axios.get(doc.fileUrl, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", doc.fileName || "document");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    if (loading) return <CircularProgress />;
    if (!vendor) return <Typography variant="h6">Vendor not found</Typography>;

    return (
        <DashboardLayout>
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Vendor Details</Typography>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditOpen(true)}
                >
                    Edit Vendor
                </Button>
            </Box>

            {/* Basic Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Vendor Name:</strong> {vendor.vendorName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Company Name:</strong> {vendor.companyName || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Email:</strong> {vendor.email || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Phone:</strong> {vendor.phoneNumber || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography><strong>Address:</strong> {vendor.address || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Category:</strong> {vendor.category || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Status:</strong> {vendor.status}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Company / Payment Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Company & Payment Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Tax ID:</strong> {vendor.taxId || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Bank Account:</strong> {vendor.bankAccount || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Payment Terms:</strong> {vendor.paymentTerms || "-"}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Documents */}
            <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Documents</Typography>
                    <label>
                        <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <Button
                            variant="contained"
                            startIcon={<UploadFileIcon />}
                            component="span"
                            disabled={uploading}
                        >
                            Upload Document
                        </Button>
                    </label>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {vendor.documents && vendor.documents.length > 0 ? (
                    <List>
                        {vendor.documents.map((doc) => (
                            <ListItem
                                key={doc.id}
                                secondaryAction={
                                    <Tooltip title="Download">
                                        <IconButton edge="end" onClick={() => handleDownload(doc)}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                            >
                                <ListItemText
                                    primary={doc.fileName || "Document"}
                                    secondary={`Type: ${doc.fileType || "N/A"} | Expiry: ${
                                        doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "N/A"
                                    }`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography>No documents uploaded.</Typography>
                )}
            </Paper>

            {/* Vendor Edit Modal */}
            {vendor && (
                <VendorForm
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    vendor={vendor}
                    onSubmit={handleVendorUpdate}
                />
            )}
        </Box>
        </DashboardLayout>
    );
};
