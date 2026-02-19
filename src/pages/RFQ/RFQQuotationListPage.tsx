import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    Chip,
    Skeleton,
    Paper,
    Button
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getQuotationsByRfq,
    clearSelectedQuotation
} from '../../services/rfqService';
import { QuotationDto } from '../../types/QuotationDto';

export default function RFQQuotationListPage() {
    const { rfqId } = useParams();
    const navigate = useNavigate();

    const [quotations, setQuotations] = useState<QuotationDto[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const winner = quotations.find(q => q.isSelected);

    /* ================= Fetch ================= */

    const fetchData = async () => {
        if (!rfqId) return;

        setLoading(true);
        setError('');

        try {
            const data = await getQuotationsByRfq(rfqId);
            setQuotations(data.quotations || []);
            setSummary(data.summary);
        } catch {
            setError('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [rfqId]);

    /* ================= Clear Winner ================= */

    const handleClearSelection = async () => {
        if (!rfqId) return;

        try {
            await clearSelectedQuotation(rfqId);
            fetchData();
        } catch {
            setError('Failed to clear selection');
        }
    };

    /* ================= Columns ================= */

    const columns: GridColDef[] = [
        {
            field: 'vendorName',
            headerName: 'Vendor',
            flex: 1.5,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {params.row.isSelected && (
                        <Chip
                            label="WINNER"
                            size="small"
                            color="success"
                        />
                    )}
                    <Typography fontWeight={params.row.isSelected ? 600 : 400}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'vendorEmail',
            headerName: 'Email',
            flex: 1.5
        },
        {
            field: 'submittedAt',
            headerName: 'Submitted On',
            flex: 1,
            valueFormatter: (params) => {
                if (!params) return '';
                return new Date(params as string)
                    .toISOString()
                    .split('T')[0];
            }
        },
        {
            field: 'totalAmount',
            headerName: 'Total Amount',
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <Typography
                        fontWeight={params.row.isSelected ? 700 : 500}
                        color={
                            params.row.isSelected
                                ? 'success.main'
                                : 'inherit'
                        }
                    >
                        Rs. {Number(params.value).toLocaleString()}
                    </Typography>

                    {params.row.isSelected && (
                        <Typography
                            variant="caption"
                            color="success.main"
                        >
                            Best Price
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => {
                const color =
                    params.value === 'Approved'
                        ? 'success'
                        : params.value === 'Rejected'
                            ? 'error'
                            : 'warning';

                return (
                    <Chip
                        label={params.value}
                        color={color}
                        size="small"
                    />
                );
            }
        }
    ];

    /* ================= Render ================= */

    return (
        <DashboardLayout>
            <Box>

                {/* ================= Header ================= */}

                <Box mb={3}>
                    <Typography variant="h4" fontWeight={700}>
                        Submitted Quotations
                    </Typography>
                    <Typography color="text.secondary">
                        Review and compare vendor quotations
                    </Typography>
                </Box>

                {/* ================= Summary ================= */}

                {summary && (
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(4, 1fr)"
                        gap={2}
                        mb={3}
                    >
                        {[
                            ['Total Quotations', summary.total],
                            ['Lowest', `Rs. ${summary.lowest?.toLocaleString()}`],
                            ['Highest', `Rs. ${summary.highest?.toLocaleString()}`],
                            ['Average', `Rs. ${Math.round(summary.average)?.toLocaleString()}`]
                        ].map(([label, value]) => (
                            <Paper key={label} sx={{ p: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="h6" fontWeight={600}>
                                    {value}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                )}

                {/* ================= Winner Banner ================= */}

                {winner && (
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            border: '2px solid #16a34a',
                            backgroundColor: '#f0fdf4',
                            borderRadius: 3
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center">

                            <Box display="flex" gap={3} alignItems="center">

                                <Box
                                    sx={{
                                        background: '#16a34a',
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 28
                                    }}
                                >
                                    🏆
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Selected Winner
                                        <Chip
                                            label="BEST CHOICE"
                                            size="small"
                                            color="success"
                                            sx={{ ml: 1 }}
                                        />
                                    </Typography>

                                    <Typography>
                                        Vendor: <strong>{winner.vendorName}</strong>
                                    </Typography>

                                    <Typography fontWeight={600} color="success.main">
                                        Rs. {winner.totalAmount.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/rfqs/quotation/${winner.id}`)}
                                >
                                    View Details
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearSelection}
                                >
                                    Clear Selection
                                </Button>
                            </Box>

                        </Box>
                    </Paper>
                )}

                {/* ================= Compare Button ================= */}

                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        disabled={selectedIds.length < 2 || !!winner}
                        onClick={() =>
                            navigate(
                                `/rfqs/${rfqId}/compare?ids=${selectedIds.join(',')}`
                            )
                        }
                    >
                        Compare ({selectedIds.length})
                    </Button>
                </Box>

                {/* ================= Error ================= */}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* ================= Table ================= */}

                {loading ? (
                    <Skeleton variant="rectangular" height={400} />
                ) : quotations.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography variant="h6">
                            No quotations submitted
                        </Typography>
                        <Typography color="text.secondary">
                            Vendors have not submitted quotations yet
                        </Typography>
                    </Box>
                ) : (
                    <DataGrid
                        rows={quotations}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight
                        checkboxSelection
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 20]}
                        getRowClassName={(params) =>
                            params.row.isSelected ? 'winner-row' : ''
                        }
                        isRowSelectable={(params) => !params.row.isSelected}
                        onRowSelectionModelChange={(ids) => {
                            const filtered = (ids as string[]).filter((id) => {
                                const q = quotations.find(q => q.id === id);
                                return !q?.isSelected;
                            });

                            setSelectedIds(filtered);
                        }}
                        onRowClick={(params, event) => {
                            if ((event.target as HTMLElement).closest(
                                '.MuiDataGrid-cellCheckbox'
                            )) {
                                return;
                            }
                            navigate(`/rfqs/quotation/${params.row.id}`);
                        }}
                        sx={{
                            borderRadius: 2,

                            '& .winner-row': {
                                backgroundColor: '#ecfdf5 !important',
                                borderLeft: '4px solid #16a34a'
                            },

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
