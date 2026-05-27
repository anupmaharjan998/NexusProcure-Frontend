import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Stack,
    TextField,
    Alert
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import { DashboardLayout } from "../../components/Layout/DashboardLayout";
import {
    getPurchaseOrder,
    getPurchaseOrderReceiptDetail,
    updatePurchaseOrderDeliveryDate
} from "../../services/purchaseOrderService";
import {
    PurchaseOrderDeliveryListDto,
    PurchaseOrderDto
} from "../../types/purchaseOrder";
import ReceivePurchaseOrderDialog from "../../components/PurchaseOrders/ReceivePurchaseOrderDialog";

export default function PurchaseOrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<PurchaseOrderDto | null>(null);
    const [delivery, setDelivery] = useState<PurchaseOrderDeliveryListDto | null>(null);

    const [deliveryDate, setDeliveryDate] = useState("");
    const [savingDate, setSavingDate] = useState(false);
    const [dateError, setDateError] = useState("");

    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
    const [loadingReceiveDetail, setLoadingReceiveDetail] = useState(false);

    const loadOrder = async () => {
        if (!id) return;

        const data = await getPurchaseOrder(id);
        setOrder(data);

        if (data.deliveryDate) {
            setDeliveryDate(data.deliveryDate.substring(0, 10));
        } else {
            setDeliveryDate("");
        }
    };

    const loadDelivery = async () => {
        if (!id) return;

        const data = await getPurchaseOrderReceiptDetail(id);
        setDelivery(data);
    };

    const loadAll = async () => {
        await Promise.all([
            loadOrder(),
            loadDelivery()
        ]);
    };

    useEffect(() => {
        loadAll();
    }, [id]);

    const formatDate = (value?: string | null) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString();
    };

    const money = (value?: number) => {
        return `$ ${Number(value ?? 0).toLocaleString()}`;
    };

    const handleUpdateDeliveryDate = async () => {
        if (!id || !deliveryDate) return;

        setDateError("");
        setSavingDate(true);

        try {
            await updatePurchaseOrderDeliveryDate(
                id,
                new Date(deliveryDate).toISOString()
            );

            await loadAll();
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to update delivery date.";

            setDateError(String(message));
        } finally {
            setSavingDate(false);
        }
    };

    const openReceiveDialog = async () => {
        if (!id) return;

        setLoadingReceiveDetail(true);

        try {
            const data = await getPurchaseOrderReceiptDetail(id);
            setDelivery(data);
            setReceiveDialogOpen(true);
        } finally {
            setLoadingReceiveDetail(false);
        }
    };

    if (!order) return null;

    const canReceive =
        order.deliveryStatus !== "Received" &&
        order.status !== "Completed" &&
        (delivery?.items?.length ?? 0) > 0;

    return (
        <DashboardLayout>
            <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/procurement/purchase-orders")}
                    sx={{ mb: 2 }}
                >
                    Back to Purchase Orders
                </Button>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h5" fontWeight={700}>
                                    Purchase Order
                                </Typography>

                                <Typography color="text.secondary">
                                    PO Number: {order.poNumber}
                                </Typography>

                                <Box mt={1} display="flex" gap={1}>
                                    <Chip label={order.status} color="primary" />

                                    <Chip
                                        label={
                                            order.deliveryStatus === "PartiallyReceived"
                                                ? "Partially Received"
                                                : order.deliveryStatus
                                        }
                                        color={
                                            order.deliveryStatus === "Received"
                                                ? "success"
                                                : order.deliveryStatus === "PartiallyReceived"
                                                    ? "warning"
                                                    : "default"
                                        }
                                    />
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<LocalShippingIcon />}
                                disabled={!canReceive || loadingReceiveDetail}
                                onClick={openReceiveDialog}
                            >
                                Receive PO
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Requisition
                                </Typography>
                                <Typography fontWeight={600}>
                                    {order.reqNumber ?? "-"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    PO Date
                                </Typography>
                                <Typography fontWeight={600}>
                                    {formatDate(order.poDate)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    Expected Delivery
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={deliveryDate}
                                        disabled={order.deliveryStatus === "Received"}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        fullWidth
                                    />

                                    <Button
                                        variant="outlined"
                                        startIcon={<SaveIcon />}
                                        disabled={
                                            savingDate ||
                                            order.deliveryStatus === "Received" ||
                                            !deliveryDate
                                        }
                                        onClick={handleUpdateDeliveryDate}
                                    >
                                        Save
                                    </Button>
                                </Stack>

                                {dateError && (
                                    <Alert severity="error" sx={{ mt: 1 }}>
                                        {dateError}
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Vendor Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography fontWeight={600}>
                                    {order.vendorName}
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.vendorEmail ?? "-"}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography color="text.secondary">
                                    Phone: {order.vendorPhoneNumber ?? "-"}
                                </Typography>

                                <Typography color="text.secondary">
                                    Address: {order.vendorAddress ?? "-"}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {delivery && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                                spacing={1}
                                mb={2}
                            >
                                <Box>
                                    <Typography variant="h6">
                                        Receiving Information
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Shows remaining items to be received.
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`Remaining Items: ${delivery.totalItems}`}
                                    color={
                                        order.deliveryStatus === "Received"
                                            ? "success"
                                            : order.deliveryStatus === "PartiallyReceived"
                                                ? "warning"
                                                : "default"
                                    }
                                />
                            </Stack>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Item</TableCell>
                                        <TableCell align="right">Ordered</TableCell>
                                        <TableCell align="right">Received</TableCell>
                                        <TableCell align="right">Remaining</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {delivery.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Typography color="text.secondary">
                                                    All items have been received.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        delivery.items.map((item, index) => (
                                            <TableRow key={item.purchaseOrderItemId}>
                                                <TableCell>{index + 1}</TableCell>

                                                <TableCell>
                                                    <Typography fontWeight={600}>
                                                        {item.itemName}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    {item.orderedQty}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {item.receivedQty}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {item.remainingQty}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {money(item.unitPrice)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Order Items & Financials
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Item</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Tax %</TableCell>
                                    <TableCell align="right">Tax Amount</TableCell>
                                    <TableCell align="right">Line Total</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {order.items?.map((item, i) => {
                                    const base = item.quantity * item.unitPrice;
                                    const taxPercent = item.taxPercentage ?? 0;
                                    const taxAmount = base * taxPercent / 100;

                                    return (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>

                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    {item.itemName}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                {item.quantity}
                                            </TableCell>

                                            <TableCell align="right">
                                                {money(item.unitPrice)}
                                            </TableCell>

                                            <TableCell align="right">
                                                {taxPercent}%
                                            </TableCell>

                                            <TableCell align="right">
                                                {money(taxAmount)}
                                            </TableCell>

                                            <TableCell align="right">
                                                {money(item.lineTotal)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography>Sub Total</Typography>
                            </Grid>

                            <Grid item xs={6} textAlign="right">
                                <Typography>{money(order.subTotal)}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography>VAT</Typography>
                            </Grid>

                            <Grid item xs={6} textAlign="right">
                                <Typography>{money(order.vat)}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography fontWeight={700}>
                                    Grand Total
                                </Typography>
                            </Grid>

                            <Grid item xs={6} textAlign="right">
                                <Typography fontWeight={700} color="primary">
                                    {money(order.totalAmount)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography fontWeight={600}>
                                    Payment Terms
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.paymentTerms ?? "-"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography fontWeight={600}>
                                    Delivery Status
                                </Typography>

                                <Typography color="text.secondary">
                                    {order.deliveryStatus === "PartiallyReceived"
                                        ? "Partially Received"
                                        : order.deliveryStatus}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <ReceivePurchaseOrderDialog
                    open={receiveDialogOpen}
                    delivery={delivery}
                    onClose={() => setReceiveDialogOpen(false)}
                    onReceived={async () => {
                        await loadAll();
                    }}
                />
            </Box>
        </DashboardLayout>
    );
}