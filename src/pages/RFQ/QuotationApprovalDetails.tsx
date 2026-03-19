import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getQuotationById } from "../../services/rfqService";
import { approveQuotation } from "../../services/approvalService";
import { DashboardLayout } from "../../components/Layout/DashboardLayout";

export default function QuotationApprovalDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [decision, setDecision] = useState<"Approved" | "Rejected" | null>(null);
    const [comments, setComments] = useState("");

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const VAT_RATE = 0.1;

    useEffect(() => {
        if (!id) return;
        getQuotationById(id).then(setData);
    }, [id]);

    const openConfirm = (type: "Approved" | "Rejected") => {
        setDecision(type);
        setComments("");
        setConfirmOpen(true);
    };

    const handleAction = async () => {
        if (!id || !decision) return;

        if (decision === "Rejected" && !comments.trim()) {
            return;
        }

        setProcessing(true);

        const payload = {
            decision: decision,
            comments: comments
        };

        try {
            await approveQuotation(id, payload);

            setSnackbarMessage(
                decision === "Approved"
                    ? "Quotation approved successfully."
                    : "Quotation rejected successfully."
            );

            setSnackbarOpen(true);

            setTimeout(() => {
                navigate("/procurement/quotation-approvals", {
                    replace: true,
                    state: { message: snackbarMessage }
                });
            }, 2000);

        } finally {
            setProcessing(false);
            setConfirmOpen(false);
        }
    };

    if (!data) return <Box p={5}>Loading...</Box>;

    const calculatedItems = data.items.map((item: any) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        const baseTotal = quantity * unitPrice;
        const vatAmount = Number((baseTotal * VAT_RATE).toFixed(2));
        const totalWithVat = Number((baseTotal + vatAmount).toFixed(2));

        return {
            ...item,
            quantity,
            unitPrice,
            baseTotal: Number(baseTotal.toFixed(2)),
            vatAmount,
            totalWithVat
        };
    });

    const subtotal = calculatedItems.reduce(
        (sum: number, item: any) => sum + item.baseTotal,
        0
    );

    const totalVat = calculatedItems.reduce(
        (sum: number, item: any) => sum + item.vatAmount,
        0
    );

    const grandTotal = calculatedItems.reduce(
        (sum: number, item: any) => sum + item.totalWithVat,
        0
    );

    return (
        <DashboardLayout>
            <Box p={4} bgcolor="#f6f8fb" minHeight="100vh">

                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Button onClick={() => navigate(-1)} sx={{ mb: 1 }}>
                            Back to Approval List
                        </Button>

                        <Typography variant="h4" fontWeight={700}>
                            Quotation Review & Approval
                        </Typography>

                        <Typography color="text.secondary">
                            Quotation #{data.referenceNumber}
                        </Typography>
                    </Box>

                    <Chip label="Pending Approval" color="warning" />
                </Box>

                {/* Vendor Info */}
                <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography fontWeight={600} mb={3}>
                            Vendor Information
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Company Name
                                </Typography>
                                <Typography fontWeight={500}>
                                    {data.vendorName}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Phone Number
                                </Typography>
                                <Typography>{data.vendorPhone}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Contact Person
                                </Typography>
                                <Typography>{data.contactPerson}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Address
                                </Typography>
                                <Typography>{data.vendorAddress}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography>{data.vendorEmail}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Line Items */}
                <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography fontWeight={600} mb={2}>
                            Line Items
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Item Description</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Base Total</TableCell>
                                    <TableCell align="right">VAT (10%)</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {calculatedItems.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">
                                            Rs. {item.unitPrice.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right">
                                            Rs. {item.baseTotal.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right">
                                            Rs. {item.vatAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            Rs. {item.totalWithVat.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography fontWeight={600} mb={2}>
                            Financial Summary
                        </Typography>

                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography>Subtotal</Typography>
                            <Typography>Rs. {subtotal.toFixed(2)}</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography>Total VAT (10%)</Typography>
                            <Typography>Rs. {totalVat.toFixed(2)}</Typography>
                        </Box>

                        <Divider />

                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Typography fontWeight={700}>Grand Total</Typography>
                            <Typography fontWeight={700} color="primary" fontSize={18}>
                                Rs. {grandTotal.toFixed(2)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Approval Section */}
                <Card sx={{ borderRadius: 3, backgroundColor: "#eef4ff" }}>
                    <CardContent>
                        <Typography fontWeight={600} mb={3}>
                            Approval Decision
                        </Typography>

                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => openConfirm("Rejected")}
                            >
                                Reject Quotation
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => openConfirm("Approved")}
                            >
                                Approve Quotation
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Confirmation Popup */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        {decision === "Approved" ? "Approve Quotation" : "Reject Quotation"}
                    </DialogTitle>

                    <DialogContent>

                        <Typography mb={2}>
                            {decision === "Approved"
                                ? "You are about to approve this quotation."
                                : "You are about to reject this quotation."}
                        </Typography>

                        <Card sx={{ backgroundColor: "#f1f5f9", mb: 2 }}>
                            <CardContent>
                                <Typography variant="body2">Total Amount</Typography>
                                <Typography fontSize={22} fontWeight={700}>
                                    Rs. {grandTotal.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Typography fontWeight={500} mb={1}>
                            Notes {decision === "Rejected" ? "(Required)" : "(Optional)"}
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter approval notes..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            required={decision === "Rejected"}
                            error={decision === "Rejected" && !comments.trim()}
                            helperText={
                                decision === "Rejected" && !comments.trim()
                                    ? "Comments are required for rejection"
                                    : ""
                            }
                        />

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color={decision === "Approved" ? "success" : "error"}
                            onClick={handleAction}
                            disabled={processing}
                        >
                            Confirm {decision}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert severity="success" variant="filled">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

            </Box>
        </DashboardLayout>
    );
}