import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Link,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CancelIcon from "@mui/icons-material/Cancel";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router-dom";

import { DashboardLayout } from "../../components/Layout/DashboardLayout";
import {
    procurementRequestService,
    ProcurementRequestDetailDto,
    ProcurementRequestItemDto
} from "../../services/procurementRequestService";

type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
};

export default function ProcurementRequestDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [request, setRequest] = useState<ProcurementRequestDetailDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success"
    });

    const showMessage = (
        message: string,
        severity: SnackbarState["severity"] = "success"
    ) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const getErrorMessage = (error: any) => {
        return (
            error?.response?.data?.message ||
            error?.response?.data?.title ||
            error?.message ||
            "Something went wrong."
        );
    };

    const fetchDetail = async () => {
        if (!id) return;

        setLoading(true);

        try {
            const data = await procurementRequestService.getById(id);
            setRequest(data);
        } catch (error) {
            showMessage(getErrorMessage(error), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const canTakeDecision = request?.status === "Pending";

    const totalRequested = useMemo(() => {
        return request?.items.reduce((sum, item) => sum + item.requestedQuantity, 0) ?? 0;
    }, [request]);

    const totalAvailable = useMemo(() => {
        return request?.items.reduce((sum, item) => sum + item.availableQuantity, 0) ?? 0;
    }, [request]);

    const totalToProcure = useMemo(() => {
        return (
            request?.items.reduce(
                (sum, item) => sum + item.requiredProcurementQuantity,
                0
            ) ?? 0
        );
    }, [request]);

    const handleReject = async () => {
        if (!request) return;

        if (!rejectReason.trim()) {
            showMessage("Reject reason is required.", "warning");
            return;
        }

        setActionLoading(true);

        try {
            await procurementRequestService.reject(request.id, {
                reason: rejectReason.trim()
            });

            setRejectDialogOpen(false);
            setRejectReason("");

            await fetchDetail();

            showMessage("Procurement request rejected successfully.", "success");
        } catch (error) {
            showMessage(getErrorMessage(error), "error");
        } finally {
            setActionLoading(false);
        }
    };

    const columns: GridColDef[] = [
        {
            field: "itemName",
            headerName: "Item",
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Stack spacing={0.3}>
                    <Typography fontWeight={600} fontSize={14}>
                        {params.row.itemName}
                    </Typography>
                    {params.row.notes && (
                        <Typography variant="caption" color="text.secondary">
                            {params.row.notes}
                        </Typography>
                    )}
                </Stack>
            )
        },
        {
            field: "categoryName",
            headerName: "Category",
            flex: 1,
            minWidth: 180
        },
        {
            field: "requestedQuantity",
            headerName: "Requested",
            width: 130,
            align: "center",
            headerAlign: "center"
        },
        {
            field: "availableQuantity",
            headerName: "Available",
            width: 130,
            align: "center",
            headerAlign: "center"
        },
        {
            field: "requiredProcurementQuantity",
            headerName: "To Procure",
            width: 140,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Typography fontWeight={700} color="error.main">
                    {params.row.requiredProcurementQuantity}
                </Typography>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Button
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/procurement/requests")}
                    >
                        Back
                    </Button>

                    <Breadcrumbs>
                        <Link
                            underline="hover"
                            color="inherit"
                            onClick={() => navigate("/procurement/requests")}
                            sx={{ cursor: "pointer" }}
                        >
                            Procurement Requests
                        </Link>
                        <Typography color="text.primary">Review</Typography>
                    </Breadcrumbs>
                </Stack>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress />
                    </Box>
                ) : !request ? (
                    <Alert severity="error">Procurement request not found.</Alert>
                ) : (
                    <>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            flexDirection={{ xs: "column", md: "row" }}
                            gap={2}
                            mb={3}
                        >
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Typography variant="h4" fontWeight={700}>
                                        {request.requestNumber}
                                    </Typography>
                                    <StatusChip status={request.status} />
                                </Stack>

                                <Typography color="text.secondary">
                                    Review shortage items and decide whether to create a requisition or reject.
                                </Typography>
                            </Box>

                            {canTakeDecision && (
                                <Stack direction="row" spacing={1.5}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        disabled={actionLoading}
                                        onClick={() => setRejectDialogOpen(true)}
                                    >
                                        Reject
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<AssignmentTurnedInIcon />}
                                        disabled={actionLoading}
                                        onClick={() => setCreateDialogOpen(true)}
                                    >
                                        Create Requisition
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        {!canTakeDecision && (
                            <Alert
                                severity={
                                    request.status === "Rejected"
                                        ? "error"
                                        : request.status === "RequisitionCreated"
                                            ? "success"
                                            : "info"
                                }
                                sx={{ mb: 3 }}
                            >
                                {request.status === "Rejected"
                                    ? "This procurement request has been rejected."
                                    : request.status === "RequisitionCreated"
                                        ? "A requisition has already been created from this procurement request."
                                        : "This procurement request is no longer pending."}
                            </Alert>
                        )}

                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} md={3}>
                                <InfoCard
                                    icon={<PersonIcon color="primary" />}
                                    title="Requested By"
                                    value={request.requestedBy}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <InfoCard
                                    icon={<BusinessIcon color="primary" />}
                                    title="Department"
                                    value={request.department}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <InfoCard
                                    icon={<PersonIcon color="success" />}
                                    title="Approved By"
                                    value={request.approvedByManager}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <InfoCard
                                    icon={<CalendarMonthIcon color="warning" />}
                                    title="Approved At"
                                    value={formatDateTime(request.approvedAt)}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} md={4}>
                                <SummaryCard
                                    title="Total Requested"
                                    value={totalRequested}
                                    color="text.primary"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <SummaryCard
                                    title="Available Quantity"
                                    value={totalAvailable}
                                    color="warning.main"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <SummaryCard
                                    title="Required Procurement"
                                    value={totalToProcure}
                                    color="error.main"
                                />
                            </Grid>
                        </Grid>

                        {request.managerRemarks && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography fontWeight={600}>Manager Remarks</Typography>
                                <Typography>{request.managerRemarks}</Typography>
                            </Alert>
                        )}

                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <Inventory2Icon color="primary" />
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            Items Required for Procurement
                                        </Typography>
                                        <Typography color="text.secondary" fontSize={14}>
                                            These are the shortage items that require procurement.
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                <DataGrid
                                    rows={request.items}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    autoHeight
                                    disableRowSelectionOnClick
                                    hideFooter={request.items.length <= 10}
                                    pageSizeOptions={[10, 25, 50]}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: "background.paper",
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: "action.hover"
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <CreateRequisitionDialog
                            open={createDialogOpen}
                            request={request}
                            loading={actionLoading}
                            onClose={() => setCreateDialogOpen(false)}
                            onSuccess={async (requisitionId) => {
                                setCreateDialogOpen(false);
                                await fetchDetail();
                                showMessage("Requisition created successfully.", "success");

                                if (requisitionId) {
                                    navigate(`/procurement/requisitions/${requisitionId}`);
                                }
                            }}
                            onError={(message) => showMessage(message, "error")}
                            setLoading={setActionLoading}
                        />

                        <RejectDialog
                            open={rejectDialogOpen}
                            reason={rejectReason}
                            loading={actionLoading}
                            onReasonChange={setRejectReason}
                            onClose={() => {
                                setRejectDialogOpen(false);
                                setRejectReason("");
                            }}
                            onConfirm={handleReject}
                        />
                    </>
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4500}
                    onClose={() =>
                        setSnackbar((prev) => ({
                            ...prev,
                            open: false
                        }))
                    }
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() =>
                            setSnackbar((prev) => ({
                                ...prev,
                                open: false
                            }))
                        }
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
}

function CreateRequisitionDialog({
                                     open,
                                     request,
                                     loading,
                                     onClose,
                                     onSuccess,
                                     onError,
                                     setLoading
                                 }: {
    open: boolean;
    request: ProcurementRequestDetailDto;
    loading: boolean;
    onClose: () => void;
    onSuccess: (requisitionId: string) => void;
    onError: (message: string) => void;
    setLoading: (value: boolean) => void;
}) {
    const [requiredDate, setRequiredDate] = useState("");
    const [notes, setNotes] = useState("");
    const [unitCosts, setUnitCosts] = useState<Record<string, string>>({});
    const [remarks, setRemarks] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;

        const defaultRequiredDate = new Date();
        defaultRequiredDate.setDate(defaultRequiredDate.getDate() + 7);

        setRequiredDate(defaultRequiredDate.toISOString().split("T")[0]);
        setNotes(request.managerRemarks ?? "");

        const initialCosts: Record<string, string> = {};
        const initialRemarks: Record<string, string> = {};

        request.items.forEach((item) => {
            initialCosts[item.id] = "";
            initialRemarks[item.id] = item.notes ?? "";
        });

        setUnitCosts(initialCosts);
        setRemarks(initialRemarks);
    }, [open, request]);

    const rows = useMemo(() => {
        return request.items.map((item) => {
            const unitCost = Number(unitCosts[item.id] || 0);
            const lineTotal = unitCost * item.requiredProcurementQuantity;

            return {
                ...item,
                estimatedUnitCost: unitCost,
                lineTotal
            };
        });
    }, [request.items, unitCosts]);

    const grandTotal = useMemo(() => {
        return rows.reduce((sum, item) => sum + item.lineTotal, 0);
    }, [rows]);

    const isValid = useMemo(() => {
        return rows.every((item) => item.estimatedUnitCost > 0);
    }, [rows]);

    const getErrorMessage = (error: any) => {
        return (
            error?.response?.data?.message ||
            error?.response?.data?.title ||
            error?.message ||
            "Failed to create requisition."
        );
    };

    const handleSubmit = async () => {
        if (!requiredDate) {
            onError("Required date is required.");
            return;
        }

        if (!isValid) {
            onError("Estimated unit cost must be greater than zero for every item.");
            return;
        }

        setLoading(true);

        try {
            const result = await procurementRequestService.createRequisition(
                request.id,
                {
                    requiredDate,
                    notes,
                    items: rows.map((item) => ({
                        procurementRequestItemId: item.id,
                        estimatedUnitCost: item.estimatedUnitCost,
                        remarks: remarks[item.id]?.trim() || null
                    }))
                }
            );

            onSuccess(result.requisitionId);
        } catch (error) {
            onError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        {
            field: "itemName",
            headerName: "Item",
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Box>
                    <Typography fontWeight={600} fontSize={14}>
                        {params.row.itemName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.categoryName}
                    </Typography>
                </Box>
            )
        },
        {
            field: "requiredProcurementQuantity",
            headerName: "Qty",
            width: 90,
            align: "center",
            headerAlign: "center"
        },
        {
            field: "estimatedUnitCost",
            headerName: "Estimated Unit Cost",
            width: 210,
            renderCell: (params) => {
                const item = params.row as ProcurementRequestItemDto;

                return (
                    <TextField
                        size="small"
                        type="number"
                        value={unitCosts[item.id] ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;

                            setUnitCosts((prev) => ({
                                ...prev,
                                [item.id]: value
                            }));
                        }}
                        inputProps={{
                            min: 0,
                            step: "0.01"
                        }}
                        error={
                            unitCosts[item.id] !== undefined &&
                            unitCosts[item.id] !== "" &&
                            Number(unitCosts[item.id]) <= 0
                        }
                        placeholder="0.00"
                        fullWidth
                    />
                );
            }
        },
        {
            field: "lineTotal",
            headerName: "Line Total",
            width: 150,
            align: "right",
            headerAlign: "right",
            renderCell: (params) => (
                <Typography fontWeight={700}>
                    {formatMoney(params.row.lineTotal)}
                </Typography>
            )
        },
        {
            field: "remarks",
            headerName: "Remarks",
            flex: 1,
            minWidth: 220,
            renderCell: (params) => {
                const item = params.row as ProcurementRequestItemDto;

                return (
                    <TextField
                        size="small"
                        value={remarks[item.id] ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;

                            setRemarks((prev) => ({
                                ...prev,
                                [item.id]: value
                            }));
                        }}
                        placeholder="Optional item remarks"
                        fullWidth
                    />
                );
            }
        }
    ];

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        Create Requisition
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review procurement items, enter estimated unit costs, and confirm requisition creation.
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Required Date"
                            value={requiredDate}
                            onChange={(e) => setRequiredDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional requisition notes"
                        />
                    </Grid>
                </Grid>

                <Alert severity="info" sx={{ mb: 2 }}>
                    Estimated unit cost is required because requisition risk score is calculated from the total amount.
                </Alert>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    autoHeight
                    disableRowSelectionOnClick
                    hideFooter={rows.length <= 10}
                    pageSizeOptions={[10, 25, 50]}
                    sx={{
                        borderRadius: 2,
                        "& .MuiDataGrid-cell": {
                            alignItems: "center"
                        }
                    }}
                />

                <Box
                    mt={2}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <Card variant="outlined" sx={{ minWidth: 320 }}>
                        <CardContent>
                            <Typography color="text.secondary" fontSize={14}>
                                Estimated Grand Total
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="primary.main">
                                {formatMoney(grandTotal)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    disabled={loading || !isValid}
                    onClick={handleSubmit}
                    startIcon={
                        loading ? <CircularProgress size={18} color="inherit" /> : undefined
                    }
                >
                    {loading ? "Creating..." : "Create Requisition"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function InfoCard({
                      icon,
                      title,
                      value
                  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {icon}
                    <Box>
                        <Typography color="text.secondary" fontSize={13}>
                            {title}
                        </Typography>
                        <Typography fontWeight={700}>{value || "-"}</Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function SummaryCard({
                         title,
                         value,
                         color
                     }: {
    title: string;
    value: number;
    color: string;
}) {
    return (
        <Card>
            <CardContent>
                <Typography color="text.secondary" fontSize={14}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

function StatusChip({ status }: { status: string }) {
    const color =
        status === "RequisitionCreated"
            ? "success"
            : status === "Rejected"
                ? "error"
                : status === "Pending"
                    ? "warning"
                    : "default";

    return (
        <Chip
            label={formatStatus(status)}
            color={color as any}
            size="small"
        />
    );
}

function RejectDialog({
                          open,
                          reason,
                          loading,
                          onReasonChange,
                          onClose,
                          onConfirm
                      }: {
    open: boolean;
    reason: string;
    loading: boolean;
    onReasonChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const isInvalid = !reason.trim();

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Reject Procurement Request</DialogTitle>

            <DialogContent>
                <Typography color="text.secondary" mb={2}>
                    Please provide a clear reason. This reason will be saved with the procurement request.
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Reject Reason"
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Example: Budget not approved, duplicate request, item no longer required..."
                    error={reason.length > 0 && isInvalid}
                    helperText={isInvalid ? "Reason is required." : " "}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    disabled={loading || isInvalid}
                    onClick={onConfirm}
                >
                    {loading ? "Rejecting..." : "Reject Request"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function formatStatus(status?: string | null) {
    if (!status) return "-";

    return status
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (value) => value.toUpperCase())
        .trim();
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
}

function formatMoney(value: number) {
    return Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}