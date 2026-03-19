import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    TextField,
    IconButton
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import {DashboardLayout} from '../../components/Layout/DashboardLayout';
import {
    getPendingQuotationsApproval
} from '../../services/approvalService';
import {QuotationPendingApproval} from '../../types/approval';


export default function QuotationApprovalList() {
    const [rows, setRows] = useState<QuotationPendingApproval[]>([]);
    const navigate = useNavigate();

    const fetchPending = async () => {
        //setLoading(true);
        try {
            const data = await getPendingQuotationsApproval();
            setRows(data);
        } finally {
            //setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const columns: GridColDef[] = [
        {
            field: "status",
            headerName: "Status",
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={
                        params.value === "Pending"
                            ? "warning"
                            : params.value === "Approved"
                                ? "success"
                                : params.value === "Rejected"
                                    ? "error"
                                    : "info"
                    }
                    size="small"
                />
            )
        },
        { field: "rfqNumber", headerName: "Rfq Number #", width: 160 },
        {
            field: "vendorName",
            headerName: "Vendor",
            width: 200
        },
        { field: "contactPerson", headerName: "Contact", width: 160 },
        { field: "submissionDate", headerName: "Submission", width: 140 },
        { field: "validUntil", headerName: "Valid Until", width: 140 },
        {
            field: "totalAmount",
            headerName: "Grand Total",
            width: 160,
            renderCell: (params) => (
                <Box>
                    <Typography fontWeight="bold">
                        Rs. {params.value}
                    </Typography>
                    {params.row.isLowest && (
                        <Typography color="success.main" fontSize={12}>
                            Lowest Price
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                        navigate(`/procurement/quotation-approval/${params.row.id}`)
                    }
                >
                    Review
                </Button>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box p={4} bgcolor="#f4f6f8" minHeight="100vh">
                <Typography variant="h4" fontWeight={600} mb={1}>
                    Quotation Approval
                </Typography>
                <Typography color="text.secondary" mb={4}>
                    Review and approve vendor quotations
                </Typography>

                {/* Summary Cards */}
                <Grid container spacing={3} mb={4}>
                    <SummaryCard title="Pending Approval" value={rows.length.toString()} />
                    {/*<SummaryCard title="Awaiting Review" value="1" />*/}
                    {/*<SummaryCard title="Under Review" value="1" />*/}
                    {/*<SummaryCard*/}
                    {/*    title="Lowest Bid"*/}
                    {/*    value="$14,289.00"*/}
                    {/*    highlight*/}
                    {/*/>*/}
                </Grid>

                {/* Search Bar */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={3}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by company name, quotation number, or contact person..."
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />
                        }}
                    />
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Box>

                {/* Data Grid */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>
                            Quotations Pending Approval ({rows.length})
                        </Typography>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            autoHeight
                            pageSizeOptions={[5, 10]}
                            disableRowSelectionOnClick
                        />
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}

function SummaryCard({
                         title,
                         value,
                         highlight
                     }: {
    title: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <Grid item xs={12} md={3}>
            <Card>
                <CardContent>
                    <Typography color="text.secondary" fontSize={14}>
                        {title}
                    </Typography>
                    <Typography
                        variant="h5"
                        fontWeight={600}
                        color={highlight ? "success.main" : "text.primary"}
                    >
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );
}