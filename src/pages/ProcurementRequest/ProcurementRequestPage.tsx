// src/pages/procurement/ProcurementRequestsPage.tsx

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    MenuItem,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../../components/Layout/DashboardLayout";
import {
    procurementRequestService,
    ProcurementRequestListDto
} from "../../services/procurementRequestService";

export default function ProcurementRequestPage() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState<ProcurementRequestListDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10
    });

    const fetchRequests = async () => {
        setLoading(true);

        try {
            const data = await procurementRequestService.getAll();
            setRequests(data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const stats = useMemo(() => {
        return {
            total: requests.length,
            pending: requests.filter((x) => x.status === "Pending").length,
            requisitionCreated: requests.filter((x) => x.status === "RequisitionCreated").length,
            rejected: requests.filter((x) => x.status === "Rejected").length,
            totalToProcure: requests.reduce(
                (sum, item) => sum + Number(item.totalQuantityToProcure ?? 0),
                0
            )
        };
    }, [requests]);

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                !keyword ||
                request.requestNumber?.toLowerCase().includes(keyword) ||
                request.requestedBy?.toLowerCase().includes(keyword) ||
                request.approvedByManager?.toLowerCase().includes(keyword) ||
                request.status?.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "All" || request.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    const columns: GridColDef[] = [
        {
            field: "requestNumber",
            headerName: "Request No.",
            flex: 1,
            minWidth: 160,
            renderCell: (params) => (
                <Stack spacing={0.3}>
                    <Typography fontWeight={600} fontSize={14}>
                        {params.row.requestNumber || "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.id?.slice(0, 8)}
                    </Typography>
                </Stack>
            )
        },
        {
            field: "requestedBy",
            headerName: "Requested By",
            flex: 1,
            minWidth: 180
        },
        {
            field: "approvedByManager",
            headerName: "Approved By",
            flex: 1,
            minWidth: 180
        },
        {
            field: "approvedAt",
            headerName: "Approved Date",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => formatDate(params.row.approvedAt)
        },
        {
            field: "totalItems",
            headerName: "Items",
            width: 110,
            align: "center",
            headerAlign: "center"
        },
        {
            field: "totalQuantityToProcure",
            headerName: "Qty To Procure",
            width: 160,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Typography fontWeight={700} color="error.main">
                    {params.row.totalQuantityToProcure}
                </Typography>
            )
        },
        {
            field: "status",
            headerName: "Status",
            width: 180,
            renderCell: (params) => <StatusChip status={params.row.status} />
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/procurement/requests/${params.row.id}`);
                    }}
                >
                    Review
                </Button>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    flexDirection={{ xs: "column", md: "row" }}
                    gap={2}
                    mb={3}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Procurement Requests
                        </Typography>

                        <Typography color="text.secondary">
                            Review manager-approved shortage requests and create requisitions when required.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchRequests}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            title="Total Requests"
                            value={stats.total}
                            icon={<AssignmentIcon color="primary" />}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            title="Pending Review"
                            value={stats.pending}
                            icon={<PendingActionsIcon color="warning" />}
                            color="warning.main"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            title="Requisition Created"
                            value={stats.requisitionCreated}
                            icon={<CheckCircleIcon color="success" />}
                            color="success.main"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            title="Rejected"
                            value={stats.rejected}
                            icon={<CancelIcon color="error" />}
                            color="error.main"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            title="Total Qty Needed"
                            value={stats.totalToProcure}
                            icon={<AssignmentIcon color="error" />}
                            color="error.main"
                        />
                    </Grid>
                </Grid>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "center" }}
                        >
                            <TextField
                                size="small"
                                placeholder="Search by request no, requester, manager..."
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
                                sx={{ minWidth: { xs: "100%", md: 420 } }}
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
                                sx={{ width: { xs: "100%", md: 240 } }}
                            >
                                {["All", "Pending", "RequisitionCreated", "Rejected"].map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status === "All" ? "All Statuses" : formatStatus(status)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </CardContent>
                </Card>

                {loading ? (
                    <Skeleton variant="rectangular" height={520} sx={{ borderRadius: 2 }} />
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
                            navigate(`/procurement/requests/${params.row.id}`)
                        }
                        getRowClassName={(params) => {
                            if (params.row.status === "Pending") {
                                return "pending-procurement-row";
                            }

                            if (params.row.status === "Rejected") {
                                return "rejected-procurement-row";
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
                            "& .pending-procurement-row": {
                                backgroundColor: "rgba(255, 152, 0, 0.06)"
                            },
                            "& .pending-procurement-row:hover": {
                                backgroundColor: "rgba(255, 152, 0, 0.12)"
                            },
                            "& .rejected-procurement-row": {
                                backgroundColor: "rgba(244, 67, 54, 0.04)"
                            }
                        }}
                    />
                )}
            </Box>
        </DashboardLayout>
    );
}

function StatCard({
                      title,
                      value,
                      icon,
                      color = "text.primary"
                  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
}) {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography color="text.secondary" fontSize={14}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color={color}>
                            {value}
                        </Typography>
                    </Box>

                    <Tooltip title={title}>
                        <Box>{icon}</Box>
                    </Tooltip>
                </Stack>
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
            variant={status === "Pending" ? "filled" : "outlined"}
        />
    );
}

function formatStatus(status?: string | null) {
    if (!status) return "-";

    return status
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (value) => value.toUpperCase())
        .trim();
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
}