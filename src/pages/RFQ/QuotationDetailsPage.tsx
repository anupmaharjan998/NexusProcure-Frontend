import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Skeleton,
    Paper,
    Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getQuotationById } from '../../services/rfqService';
import { QuotationDetailResponseDto } from '../../types/QuotationDetailDto';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';


export default function QuotationDetailsPage() {
    const { quotationId } = useParams();
    const [data, setData] = useState<QuotationDetailResponseDto | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (!quotationId) return;

        setLoading(true);
        getQuotationById(quotationId)
            .then(setData)
            .finally(() => setLoading(false));
    }, [quotationId]);

    const columns: GridColDef[] = [
        { field: 'itemName', headerName: 'Item', flex: 2 },
        {
            field: 'unitPrice',
            headerName: 'Unit Price',
            flex: 1,
            valueFormatter: (p) => `Rs. ${Number(p).toLocaleString()}`
        },
        {
            field: 'taxPercentage',
            headerName: 'Tax %',
            flex: 1
        },
        {
            field: 'total',
            headerName: 'Total',
            flex: 1,
            valueFormatter: (p) => `Rs. ${Number(p).toLocaleString()}`
        }
    ];

    return (
        <DashboardLayout>
            {loading || !data ? (
                <Skeleton height={400} />
            ) : (
                <Box>
                    <Box mb={2}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            variant="text"
                        >
                            Back
                        </Button>
                    </Box>
                    <Typography variant="h4" fontWeight={700} mb={2}>
                        Quotation Details
                    </Typography>

                    {/* Vendor Info */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography fontWeight={600}>
                            {data.vendorName}
                        </Typography>
                        <Typography>{data.vendorEmail}</Typography>
                        <Typography>
                            Submitted: {new Date(data.submittedAt).toISOString().split('T')[0]}
                        </Typography>
                        {/*<Chip*/}
                        {/*    label={data.status}*/}
                        {/*    color={data.status === 'Approved' ? 'success' : 'warning'}*/}
                        {/*    size="small"*/}
                        {/*    sx={{ mt: 1 }}*/}
                        {/*/>*/}
                    </Paper>

                    <Divider sx={{ mb: 2 }} />

                    {/* Items */}
                    <DataGrid
                        rows={data.items}
                        columns={columns}
                        getRowId={(r) => r.id}
                        autoHeight
                        disableRowSelectionOnClick
                    />

                    <Box mt={3} textAlign="right">
                        <Typography variant="h6">
                            Grand Total: Rs. {data.totalAmount.toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            )}
        </DashboardLayout>
    );
}
