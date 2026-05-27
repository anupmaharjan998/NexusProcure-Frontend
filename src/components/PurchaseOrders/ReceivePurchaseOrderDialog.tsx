import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";

import { receivePurchaseOrder } from "../../services/purchaseOrderService";
import { PurchaseOrderDeliveryListDto } from "../../types/purchaseOrder";

type AssetDetailForm = {
    serialNumber: string;
    barcode: string;
    description: string;
    location: string;
    condition: string;
};

type ReceiveItemForm = {
    purchaseOrderItemId: string;
    quantityReceived: number | "";
    location: string;
    condition: string;
    notes: string;
    assetDetails: AssetDetailForm[];
};

type Props = {
    open: boolean;
    delivery: PurchaseOrderDeliveryListDto | null;
    onClose: () => void;
    onReceived: () => Promise<void>;
};

const conditionOptions = ["Good", "Damaged", "Faulty", "Used"];

const emptyAssetDetail = (): AssetDetailForm => ({
    serialNumber: "",
    barcode: "",
    description: "",
    location: "",
    condition: "Good"
});

const toUtcIso = (date: string) => {
    if (!date) return null;
    return new Date(`${date}T00:00:00Z`).toISOString();
};

export default function ReceivePurchaseOrderDialog({
                                                       open,
                                                       delivery,
                                                       onClose,
                                                       onReceived
                                                   }: Props) {
    const [items, setItems] = useState<ReceiveItemForm[]>([]);
    const [receivedDate, setReceivedDate] = useState("");
    const [notes, setNotes] = useState("");
    const [nextExpectedDeliveryDate, setNextExpectedDeliveryDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!delivery) return;

        setItems(
            delivery.items.map((item) => ({
                purchaseOrderItemId: item.purchaseOrderItemId,
                quantityReceived: "",
                location: "Inventory",
                condition: "Good",
                notes: "",
                assetDetails: []
            }))
        );

        setReceivedDate(new Date().toISOString().slice(0, 10));
        setNotes("");
        setNextExpectedDeliveryDate("");
        setError(null);
    }, [delivery]);

    const remainingTotal = useMemo(() => {
        return (
            delivery?.items.reduce(
                (sum, item) => sum + Number(item.remainingQty ?? 0),
                0
            ) ?? 0
        );
    }, [delivery]);

    const receivingTotal = useMemo(() => {
        return items.reduce(
            (sum, item) => sum + Number(item.quantityReceived || 0),
            0
        );
    }, [items]);

    const isPartialReceive = receivingTotal > 0 && receivingTotal < remainingTotal;

    const updateItemQuantity = (purchaseOrderItemId: string, value: string) => {
        const deliveryItem = delivery?.items.find(
            (x) => x.purchaseOrderItemId === purchaseOrderItemId
        );

        const maxQty = Number(deliveryItem?.remainingQty ?? 0);

        let qty: number | "" = value === "" ? "" : Number(value);

        if (qty !== "") {
            qty = Math.max(0, Math.min(qty, maxQty));
        }

        setItems((prev) =>
            prev.map((item) => {
                if (item.purchaseOrderItemId !== purchaseOrderItemId) {
                    return item;
                }

                const isAssetTracked = Boolean(deliveryItem?.isAssetTracked);
                const quantityNumber = Number(qty || 0);

                return {
                    ...item,
                    quantityReceived: qty,
                    assetDetails: isAssetTracked
                        ? Array.from({ length: quantityNumber }, (_, index) => {
                            return item.assetDetails[index] ?? emptyAssetDetail();
                        })
                        : []
                };
            })
        );
    };

    const updateItemField = (
        purchaseOrderItemId: string,
        field: keyof Omit<
            ReceiveItemForm,
            "purchaseOrderItemId" | "quantityReceived" | "assetDetails"
        >,
        value: string
    ) => {
        setItems((prev) =>
            prev.map((item) =>
                item.purchaseOrderItemId === purchaseOrderItemId
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const updateAssetField = (
        purchaseOrderItemId: string,
        assetIndex: number,
        field: keyof AssetDetailForm,
        value: string
    ) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.purchaseOrderItemId !== purchaseOrderItemId) {
                    return item;
                }

                const assetDetails = [...item.assetDetails];

                assetDetails[assetIndex] = {
                    ...assetDetails[assetIndex],
                    [field]: value
                };

                return {
                    ...item,
                    assetDetails
                };
            })
        );
    };

    const validate = () => {
        if (!delivery) return "Purchase order detail not found.";

        const selectedItems = items.filter(
            (x) => Number(x.quantityReceived || 0) > 0
        );

        if (selectedItems.length === 0) {
            return "Please enter at least one received quantity.";
        }

        for (const item of selectedItems) {
            const deliveryItem = delivery.items.find(
                (x) => x.purchaseOrderItemId === item.purchaseOrderItemId
            );

            if (!deliveryItem) {
                return "Invalid purchase order item selected.";
            }

            const qty = Number(item.quantityReceived || 0);

            if (qty > Number(deliveryItem.remainingQty ?? 0)) {
                return `Cannot receive more than remaining quantity for ${deliveryItem.itemName}.`;
            }

            if (deliveryItem.isAssetTracked) {
                if (item.assetDetails.length !== qty) {
                    return `Please enter ${qty} asset detail(s) for ${deliveryItem.itemName}.`;
                }

                for (let i = 0; i < item.assetDetails.length; i++) {
                    const asset = item.assetDetails[i];

                    if (!asset.serialNumber.trim()) {
                        return `Serial number is required for ${deliveryItem.itemName} item ${i + 1}.`;
                    }
                }
            }
        }

        if (isPartialReceive && !nextExpectedDeliveryDate) {
            return "Next expected delivery date is required for partial receiving.";
        }

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        if (!delivery) return;

        setSubmitting(true);
        setError(null);

        try {
            await receivePurchaseOrder(delivery.id, {
                purchaseOrderId: delivery.id,
                receivedDate: toUtcIso(receivedDate),
                notes: notes || null,
                nextExpectedDeliveryDate: isPartialReceive
                    ? toUtcIso(nextExpectedDeliveryDate)
                    : null,
                items: items
                    .filter((x) => Number(x.quantityReceived || 0) > 0)
                    .map((item) => {
                        const deliveryItem = delivery.items.find(
                            (x) =>
                                x.purchaseOrderItemId ===
                                item.purchaseOrderItemId
                        );

                        return {
                            purchaseOrderItemId: item.purchaseOrderItemId,
                            quantityReceived: Number(item.quantityReceived || 0),
                            location: item.location || "Inventory",
                            condition: item.condition || "Good",
                            notes: item.notes || null,
                            assetDetails: deliveryItem?.isAssetTracked
                                ? item.assetDetails.map((asset) => ({
                                    serialNumber:
                                        asset.serialNumber.trim() || null,
                                    barcode: asset.barcode.trim() || null,
                                    description:
                                        asset.description.trim() || null,
                                    location:
                                        asset.location.trim() ||
                                        item.location ||
                                        "Inventory",
                                    condition:
                                        asset.condition ||
                                        item.condition ||
                                        "Good"
                                }))
                                : []
                        };
                    })
            });

            await onReceived();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to receive purchase order."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!delivery) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Receive Purchase Order
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {delivery.purchaseOrderNumber} • {delivery.vendorName}
                        </Typography>
                    </Box>

                    <IconButton onClick={onClose} disabled={submitting}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Received Date"
                                    value={receivedDate}
                                    onChange={(e) =>
                                        setReceivedDate(e.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {isPartialReceive && (
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        required
                                        type="date"
                                        label="Next Expected Delivery Date"
                                        value={nextExpectedDeliveryDate}
                                        onChange={(e) =>
                                            setNextExpectedDeliveryDate(
                                                e.target.value
                                            )
                                        }
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} md={isPartialReceive ? 4 : 8}>
                                <TextField
                                    fullWidth
                                    label="Receipt Notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                            label={`Remaining: ${remainingTotal}`}
                            color="default"
                        />
                        <Chip
                            label={`Receiving: ${receivingTotal}`}
                            color={receivingTotal > 0 ? "success" : "default"}
                        />
                        {isPartialReceive && (
                            <Chip label="Partial Receive" color="warning" />
                        )}
                    </Stack>

                    <Alert severity="info">
                        Enter received quantity. Asset detail fields will appear
                        only for asset-tracked items.
                    </Alert>

                    {delivery.items.map((deliveryItem) => {
                        const formItem = items.find(
                            (x) =>
                                x.purchaseOrderItemId ===
                                deliveryItem.purchaseOrderItemId
                        );

                        if (!formItem) return null;

                        const qty = Number(formItem.quantityReceived || 0);

                        return (
                            <Paper
                                key={deliveryItem.purchaseOrderItemId}
                                variant="outlined"
                                sx={{ p: 2 }}
                            >
                                <Stack spacing={2}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        flexWrap="wrap"
                                        gap={1}
                                    >
                                        <Box>
                                            <Typography fontWeight={700}>
                                                {deliveryItem.itemName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Ordered:{" "}
                                                {deliveryItem.orderedQty ??
                                                    deliveryItem.quantity}{" "}
                                                • Received:{" "}
                                                {deliveryItem.receivedQty} •
                                                Remaining:{" "}
                                                {deliveryItem.remainingQty}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Category:{" "}
                                                {deliveryItem.inventoryCategoryName ??
                                                    "N/A"}
                                            </Typography>
                                        </Box>

                                        {deliveryItem.isAssetTracked ? (
                                            <Chip
                                                icon={<DevicesOtherIcon />}
                                                label="Asset Tracked"
                                                color="primary"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<Inventory2Icon />}
                                                label="Stock Only"
                                                size="small"
                                            />
                                        )}
                                    </Stack>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Qty to Receive"
                                                value={formItem.quantityReceived}
                                                inputProps={{
                                                    min: 0,
                                                    max: deliveryItem.remainingQty
                                                }}
                                                onChange={(e) =>
                                                    updateItemQuantity(
                                                        deliveryItem.purchaseOrderItemId,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={formItem.location}
                                                onChange={(e) =>
                                                    updateItemField(
                                                        deliveryItem.purchaseOrderItemId,
                                                        "location",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Condition"
                                                value={formItem.condition}
                                                onChange={(e) =>
                                                    updateItemField(
                                                        deliveryItem.purchaseOrderItemId,
                                                        "condition",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {conditionOptions.map((option) => (
                                                    <MenuItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Item Notes"
                                                value={formItem.notes}
                                                onChange={(e) =>
                                                    updateItemField(
                                                        deliveryItem.purchaseOrderItemId,
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                    </Grid>

                                    {deliveryItem.isAssetTracked && qty > 0 && (
                                        <>
                                            <Divider />

                                            <Accordion defaultExpanded>
                                                <AccordionSummary
                                                    expandIcon={
                                                        <ExpandMoreIcon />
                                                    }
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <Typography fontWeight={700}>
                                                            Asset Details
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={`${qty} item(s)`}
                                                            color="primary"
                                                        />
                                                    </Stack>
                                                </AccordionSummary>

                                                <AccordionDetails>
                                                    <Stack spacing={2}>
                                                        {formItem.assetDetails.map(
                                                            (asset, index) => (
                                                                <Paper
                                                                    key={index}
                                                                    variant="outlined"
                                                                    sx={{ p: 2 }}
                                                                >
                                                                    <Typography
                                                                        fontWeight={
                                                                            600
                                                                        }
                                                                        mb={2}
                                                                    >
                                                                        Asset #
                                                                        {index +
                                                                            1}
                                                                    </Typography>

                                                                    <Grid
                                                                        container
                                                                        spacing={
                                                                            2
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                12
                                                                            }
                                                                            md={
                                                                                4
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                fullWidth
                                                                                required
                                                                                label="Serial Number"
                                                                                value={
                                                                                    asset.serialNumber
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateAssetField(
                                                                                        deliveryItem.purchaseOrderItemId,
                                                                                        index,
                                                                                        "serialNumber",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Grid>

                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                12
                                                                            }
                                                                            md={
                                                                                4
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Barcode"
                                                                                placeholder="Leave empty to auto-generate"
                                                                                value={
                                                                                    asset.barcode
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateAssetField(
                                                                                        deliveryItem.purchaseOrderItemId,
                                                                                        index,
                                                                                        "barcode",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Grid>

                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                12
                                                                            }
                                                                            md={
                                                                                4
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                select
                                                                                fullWidth
                                                                                label="Condition"
                                                                                value={
                                                                                    asset.condition
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateAssetField(
                                                                                        deliveryItem.purchaseOrderItemId,
                                                                                        index,
                                                                                        "condition",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            >
                                                                                {conditionOptions.map(
                                                                                    (
                                                                                        option
                                                                                    ) => (
                                                                                        <MenuItem
                                                                                            key={
                                                                                                option
                                                                                            }
                                                                                            value={
                                                                                                option
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                option
                                                                                            }
                                                                                        </MenuItem>
                                                                                    )
                                                                                )}
                                                                            </TextField>
                                                                        </Grid>

                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                12
                                                                            }
                                                                            md={
                                                                                4
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Location"
                                                                                placeholder={
                                                                                    formItem.location
                                                                                }
                                                                                value={
                                                                                    asset.location
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateAssetField(
                                                                                        deliveryItem.purchaseOrderItemId,
                                                                                        index,
                                                                                        "location",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Grid>

                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                12
                                                                            }
                                                                            md={
                                                                                8
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Description"
                                                                                value={
                                                                                    asset.description
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateAssetField(
                                                                                        deliveryItem.purchaseOrderItemId,
                                                                                        index,
                                                                                        "description",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Paper>
                                                            )
                                                        )}
                                                    </Stack>
                                                </AccordionDetails>
                                            </Accordion>
                                        </>
                                    )}
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={submitting || receivingTotal <= 0}
                >
                    {submitting
                        ? "Receiving..."
                        : isPartialReceive
                            ? "Receive Partial Delivery"
                            : "Receive Purchase Order"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}