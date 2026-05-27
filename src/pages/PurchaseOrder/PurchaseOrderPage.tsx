import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Chip,
    Skeleton,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PushPinIcon from "@mui/icons-material/PushPin";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../../components/Layout/DashboardLayout";
import {
    getPurchaseOrderReceiptDetail,
    getPurchaseOrders
} from "../../services/purchaseOrderService";
import {
    PurchaseOrderDeliveryListDto,
    PurchaseOrderDto
} from "../../types/purchaseOrder";
import ReceivePurchaseOrderDialog from "../../components/PurchaseOrders/ReceivePurchaseOrderDialog";

export default function PurchaseOrderPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] =
        useState<PurchaseOrderDeliveryListDto | null>(null);
    const [receiveLoadingId, setReceiveLoadingId] = useState<string | null>(null);

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10
    });

    const [stats, setStats] = useState({
        totalPOs: 0,
        totalValue: 0,
        inTransit: 0,
        delivered: 0
    });

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await getPurchaseOrders();

            setOrders(data?.orders ?? []);

            setStats({
                totalPOs: data?.totalPOs ?? 0,
                totalValue: data?.totalValue ?? 0,
                inTransit: data?.inTransit ?? 0,
                delivered: data?.delivered ?? 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isTodayDelivery = (deliveryDate?: string | null) => {
        if (!deliveryDate) return false;

        const today = new Date();
        const date = new Date(deliveryDate);

        return (
            today.getFullYear() === date.getFullYear() &&
            today.getMonth() === date.getMonth() &&
            today.getDate() === date.getDate()
        );
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString();
    };

    const getDeliveryPriority = (order: PurchaseOrderDto) => {
        if (
            isTodayDelivery(order.deliveryDate) &&
            order.deliveryStatus !== "Received"
        ) {
            return 0;
        }

        if (order.deliveryStatus === "PartiallyReceived") {
            return 1;
        }

        if (order.deliveryStatus === "Pending") {
            return 2;
        }

        return 3;
    };

    const openReceiveDialog = async (purchaseOrderId: string) => {
        setReceiveLoadingId(purchaseOrderId);

        try {
            const delivery = await getPurchaseOrderReceiptDetail(purchaseOrderId);
            setSelectedDelivery(delivery);
            setReceiveDialogOpen(true);
        } finally {
            setReceiveLoadingId(null);
        }
    };

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return orders
            .filter((o) => {
                const matchSearch =
                    !keyword ||
                    o.poNumber?.toLowerCase().includes(keyword) ||
                    o.vendorName?.toLowerCase().includes(keyword) ||
                    o.reqNumber?.toLowerCase().includes(keyword);

                const matchStatus =
                    statusFilter === "All" ||
                    o.status === statusFilter ||
                    o.deliveryStatus === statusFilter;

                return matchSearch && matchStatus;
            })
            .sort((a, b) => {
                const priorityA = getDeliveryPriority(a);
                const priorityB = getDeliveryPriority(b);

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                const dateA = a.deliveryDate
                    ? new Date(a.deliveryDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                const dateB = b.deliveryDate
                    ? new Date(b.deliveryDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                return dateA - dateB;
            });
    }, [orders, search, statusFilter]);

    const todayDeliveryCount = useMemo(() => {
        return orders.filter(
            (o) =>
                isTodayDelivery(o.deliveryDate) &&
                o.deliveryStatus !== "Received"
        ).length;
    }, [orders]);

    const pendingCount = useMemo(() => {
        return orders.filter((o) => o.deliveryStatus === "Pending").length;
    }, [orders]);

    const partiallyReceivedCount = useMemo(() => {
        return orders.filter((o) => o.deliveryStatus === "PartiallyReceived").length;
    }, [orders]);

    const receivedCount = useMemo(() => {
        return orders.filter((o) => o.deliveryStatus === "Received").length;
    }, [orders]);

    const columns: GridColDef[] = [
        {
            field: "todayPin",
            headerName: "",
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const row = params.row as PurchaseOrderDto;

                if (
                    isTodayDelivery(row.deliveryDate) &&
                    row.deliveryStatus !== "Received"
                ) {
                    return (
                        <Tooltip title="Delivery expected today">
                            <Chip
                                icon={<PushPinIcon />}
                                label="Today"
                                color="error"
                                size="small"
                            />
                        </Tooltip>
                    );
                }

                if (row.deliveryStatus === "PartiallyReceived") {
                    return (
                        <Tooltip title="Remaining items pending">
                            <Chip
                                label="Partial"
                                color="warning"
                                size="small"
                            />
                        </Tooltip>
                    );
                }

                return null;
            }
        },
        {
            field: "poNumber",
            headerName: "PO Number",
            flex: 1,
            minWidth: 150
        },
        {
            field: "vendorName",
            headerName: "Vendor",
            flex: 1,
            minWidth: 180
        },
        {
            field: "reqNumber",
            headerName: "Requisition",
            flex: 1,
            minWidth: 140,
            renderCell: (params) => params.row.reqNumber ?? "-"
        },
        {
            field: "poDate",
            headerName: "PO Date",
            flex: 1,
            minWidth: 130,
            renderCell: (params) => formatDate(params.row.poDate)
        },
        {
            field: "deliveryDate",
            headerName: "Delivery Date",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => formatDate(params.row.deliveryDate)
        },
        {
            field: "status",
            headerName: "PO Status",
            flex: 1,
            minWidth: 130,
            renderCell: (params) => {
                const value = params.value as string;

                const color =
                    value === "Completed"
                        ? "success"
                        : value === "Cancelled"
                            ? "error"
                            : value === "Issued"
                                ? "primary"
                                : "warning";

                return (
                    <Chip
                        label={value}
                        color={color as any}
                        size="small"
                    />
                );
            }
        },
        {
            field: "deliveryStatus",
            headerName: "Delivery",
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                const value = params.value as string;

                const color =
                    value === "Received"
                        ? "success"
                        : value === "PartiallyReceived"
                            ? "warning"
                            : "default";

                const label =
                    value === "PartiallyReceived"
                        ? "Partially Received"
                        : value;

                return (
                    <Chip
                        label={label}
                        color={color as any}
                        size="small"
                    />
                );
            }
        },
        {
            field: "totalAmount",
            headerName: "Total",
            flex: 1,
            minWidth: 130,
            align: "right",
            headerAlign: "right",
            renderCell: (params) =>
                `$ ${Number(params.row.totalAmount ?? 0).toLocaleString()}`
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 260,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const row = params.row as PurchaseOrderDto;

                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/procurement/purchase-orders/${row.id}`);
                            }}
                        >
                            Detail
                        </Button>

                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<LocalShippingIcon />}
                            disabled={
                                row.deliveryStatus === "Received" ||
                                receiveLoadingId === row.id
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                openReceiveDialog(row.id);
                            }}
                        >
                            Receive
                        </Button>
                    </Stack>
                );
            }
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box mb={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Purchase Orders
                    </Typography>

                    <Typography color="text.secondary">
                        Manage, track, and receive purchase orders
                    </Typography>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Total POs
                                </Typography>
                                <Typography variant="h5">
                                    {stats.totalPOs}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Today Delivery
                                </Typography>
                                <Typography variant="h5" color="error.main">
                                    {todayDeliveryCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Pending
                                </Typography>
                                <Typography variant="h5">
                                    {pendingCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Partial
                                </Typography>
                                <Typography variant="h5" color="warning.main">
                                    {partiallyReceivedCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Received
                                </Typography>
                                <Typography variant="h5" color="success.main">
                                    {receivedCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    gap={2}
                    mb={3}
                    flexWrap="wrap"
                    alignItems="center"
                >
                    <TextField
                        size="small"
                        placeholder="Search by PO number, vendor, requisition..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPaginationModel((prev) => ({
                                ...prev,
                                page: 0
                            }));
                        }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />
                        }}
                        sx={{ minWidth: 340 }}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPaginationModel((prev) => ({
                                ...prev,
                                page: 0
                            }));
                        }}
                        sx={{ width: 220 }}
                    >
                        {[
                            "All",
                            "Issued",
                            "Completed",
                            "Cancelled",
                            "Pending",
                            "PartiallyReceived",
                            "Received"
                        ].map((s) => (
                            <MenuItem key={s} value={s}>
                                {s === "PartiallyReceived"
                                    ? "Partially Received"
                                    : s}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {loading ? (
                    <Skeleton variant="rectangular" height={500} />
                ) : (
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight
                        disableRowSelectionOnClick
                        pagination
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25, 50, 100]}
                        onRowClick={(params) =>
                            navigate(`/procurement/purchase-orders/${params.row.id}`)
                        }
                        getRowClassName={(params) => {
                            const row = params.row as PurchaseOrderDto;

                            if (
                                isTodayDelivery(row.deliveryDate) &&
                                row.deliveryStatus !== "Received"
                            ) {
                                return "today-delivery-row";
                            }

                            if (row.deliveryStatus === "PartiallyReceived") {
                                return "partial-delivery-row";
                            }

                            return "";
                        }}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                            "& .MuiDataGrid-row:hover": {
                                cursor: "pointer",
                                backgroundColor: "action.hover"
                            },
                            "& .today-delivery-row": {
                                backgroundColor: "rgba(244, 67, 54, 0.08)"
                            },
                            "& .today-delivery-row:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.14)"
                            },
                            "& .partial-delivery-row": {
                                backgroundColor: "rgba(255, 152, 0, 0.08)"
                            },
                            "& .partial-delivery-row:hover": {
                                backgroundColor: "rgba(255, 152, 0, 0.14)"
                            }
                        }}
                    />
                )}

                <ReceivePurchaseOrderDialog
                    open={receiveDialogOpen}
                    delivery={selectedDelivery}
                    onClose={() => {
                        setReceiveDialogOpen(false);
                        setSelectedDelivery(null);
                    }}
                    onReceived={async () => {
                        await fetchData();
                    }}
                />
            </Box>
        </DashboardLayout>
    );
}