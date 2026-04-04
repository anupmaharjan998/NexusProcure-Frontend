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
    Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../../components/Layout/DashboardLayout";
import { getPurchaseOrders } from "../../services/purchaseOrderService";
import { PurchaseOrderDto } from "../../types/purchaseOrder";

export default function PurchaseOrderPage() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

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

    const filteredRows = useMemo(() => {

        return orders.filter(o => {

            const matchSearch =
                o.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
                o.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
                o.reqNumber?.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                statusFilter === "All" ||
                o.status === statusFilter;

            return matchSearch && matchStatus;

        });

    }, [orders, search, statusFilter]);

    const columns: GridColDef[] = [

        {
            field: "poNumber",
            headerName: "PO Number",
            flex: 1
        },

        {
            field: "vendorName",
            headerName: "Vendor",
            flex: 1
        },

        {
            field: "poDate",
            headerName: "PO Date",
            flex: 1,
            valueFormatter: (params) =>
                params
                    ? new Date(params as string).toLocaleDateString()
                    : "-"
        },

        {
            field: "deliveryDate",
            headerName: "Delivery Date",
            flex: 1,
            valueFormatter: (params) =>
                params
                    ? new Date(params as string).toLocaleDateString()
                    : "-"
        },

        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => {

                const color =
                    params.value === "Issued" ? "primary" :
                        params.value === "Confirmed" ? "secondary" :
                            params.value === "Completed" ? "success" :
                                "warning";

                return (
                    <Chip
                        label={params.value}
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
            renderCell: (params) => {

                const color =
                    params.value === "Delivered" ? "success" :
                        params.value === "InTransit" ? "warning" :
                            "default";

                return (
                    <Chip
                        label={params.value}
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
            valueFormatter: (params) =>
                `$ ${Number(params ?? 0).toLocaleString()}`
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
                        Manage and track all purchase orders
                    </Typography>
                </Box>

                <Grid container spacing={2} mb={3}>

                    <Grid item xs={12} md={3}>
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

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Total Value
                                </Typography>
                                <Typography variant="h5" color="success.main">
                                    $ {stats.totalValue.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    In Transit
                                </Typography>
                                <Typography variant="h5">
                                    {stats.inTransit}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">
                                    Delivered
                                </Typography>
                                <Typography variant="h5">
                                    {stats.delivered}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>

                <Box display="flex" gap={2} mb={3}>

                    <TextField
                        size="small"
                        placeholder="Search by PO number, vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />
                        }}
                        sx={{ minWidth: 300 }}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ width: 180 }}
                    >
                        {["All", "Issued", "Confirmed", "Completed"].map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>

                </Box>

                {loading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : (

                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight
                        disableRowSelectionOnClick
                        onRowClick={(params) =>
                            navigate(`/procurement/purchase-orders/${params.row.id}`)
                        }
                        sx={{
                            borderRadius: 2,
                            '& .MuiDataGrid-row:hover': {
                                cursor: 'pointer',
                                backgroundColor: 'action.hover'
                            }
                        }}
                    />

                )}

            </Box>

        </DashboardLayout>
    );
}