import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button,
    Divider,
    CircularProgress
} from '@mui/material';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { compareQuotations, selectQuotationForApproval } from '../../services/rfqService';
import {
    QuotationComparisonResponseDto,
    QuotationDetailResponseDto
} from '../../types/QuotationDetailDto';

export default function QuotationComparePage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { rfqId } = useParams();
    const [selectedQuotationId, setSelectedQuotationId] =
        useState<string | null>(null);


    const ids = params.get('ids')?.split(',') ?? [];

    const [data, setData] =
        useState<QuotationComparisonResponseDto | null>(null);

    const [loading, setLoading] = useState(false);

    /* ================= Fetch ================= */

    const idsParam = params.get('ids');

    useEffect(() => {
        debugger;
        if (!rfqId || !idsParam) return;

        const parsedIds = idsParam.split(',');

        if (parsedIds.length < 2) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await compareQuotations(parsedIds);
                setData(response);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [rfqId, idsParam]);


    if (loading || !data) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    const { summary, quotations } = data;

    const lowest = summary.lowest;

    const currency = (value: number) =>
        `Rs. ${value.toLocaleString()}`;



    const handleProceed = async () => {
        if (!selectedQuotationId) return;

        try {
            await selectQuotationForApproval(
                rfqId!,
                selectedQuotationId
            );

            navigate(`/rfqs/${rfqId}`);
        } catch (error) {
            console.error(error);
        }
    };


    /* ================= Render ================= */

    return (
        <DashboardLayout>
            <Box>

                {/* ===== Header ===== */}
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Quotation Comparison
                        </Typography>
                        <Typography color="text.secondary">
                            Comparing {quotations.length} quotations
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/rfqs/${rfqId}`)}
                    >
                        Back to List
                    </Button>
                </Box>

                {/* ===== Summary Cards ===== */}
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(3, 1fr)"
                    gap={2}
                    mb={4}
                >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle2">
                            Best Price
                        </Typography>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="success.main"
                            mt={1}
                        >
                            {currency(summary.lowest)}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle2">
                            Price Range
                        </Typography>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="primary.main"
                            mt={1}
                        >
                            {currency(summary.priceRange)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Difference between highest and lowest
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle2">
                            Average Price
                        </Typography>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: '#9333ea' }}
                            mt={1}
                        >
                            {currency(Math.round(summary.average))}
                        </Typography>
                    </Paper>
                </Box>

                {/* ===== Detailed Comparison ===== */}
                <Paper sx={{ p: 3, overflowX: 'auto' }}>

                    <Typography variant="h6" mb={3}>
                        Detailed Comparison
                    </Typography>

                    <Box minWidth={1000}>

                        {/* ===== Vendor Header Row ===== */}
                        <Box
                            display="grid"
                            gridTemplateColumns={`250px repeat(${quotations.length}, 1fr)`}
                            mb={2}
                            fontWeight={600}
                        >
                            <Box>Criteria</Box>
                            {quotations.map(q => (
                                <Box key={q.id}>
                                    {q.vendorName}
                                    {q.grandTotal === lowest && (
                                        <Chip
                                            label="Best Price"
                                            color="success"
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* ===== Vendor Info ===== */}
                        <Typography fontWeight={600} mb={1}>
                            Vendor Information
                        </Typography>

                        {[
                            ['Email', (q: QuotationDetailResponseDto) => q.vendorEmail],
                            ['Contact Person', (q: QuotationDetailResponseDto) => q.contactPerson],
                            ['Submitted At', (q: QuotationDetailResponseDto) =>
                                new Date(q.submittedAt).toLocaleDateString()]
                        ].map(([label, accessor]) => (
                            <Box
                                key={label}
                                display="grid"
                                gridTemplateColumns={`250px repeat(${quotations.length}, 1fr)`}
                                mb={1}
                            >
                                <Box fontWeight={500}>{label}</Box>
                                {quotations.map(q => (
                                    <Box key={q.id}>
                                        {(accessor as any)(q)}
                                    </Box>
                                ))}
                            </Box>
                        ))}

                        <Divider sx={{ my: 3 }} />

                        {/* ===== Line Items ===== */}
                        <Typography fontWeight={600} mb={1}>
                            Line Items
                        </Typography>

                        {/* Collect all unique item names */}
                        {Array.from(
                            new Set(
                                quotations.flatMap(q =>
                                    q.items.map(i => i.itemName)
                                )
                            )
                        ).map(itemName => (
                            <Box
                                key={itemName}
                                display="grid"
                                gridTemplateColumns={`250px repeat(${quotations.length}, 1fr)`}
                                mb={1}
                            >
                                <Box fontWeight={500}>{itemName}</Box>
                                {quotations.map(q => {
                                    const item = q.items.find(
                                        i => i.itemName === itemName
                                    );

                                    return (
                                        <Box key={q.id}>
                                            {item
                                                ? `${currency(item.unitPrice)} x ${item.quantity}`
                                                : 'Not quoted'}
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}

                        <Divider sx={{ my: 3 }} />

                        {/* ===== Grand Total ===== */}
                        <Typography fontWeight={600} mb={1}>
                            Grand Total
                        </Typography>

                        <Box
                            display="grid"
                            gridTemplateColumns={`250px repeat(${quotations.length}, 1fr)`}
                        >
                            <Box>Total</Box>
                            {/*{quotations.map(q => (*/}
                            {/*    <Box*/}
                            {/*        key={q.id}*/}
                            {/*        sx={{*/}
                            {/*            color:*/}
                            {/*                q.grandTotal === lowest*/}
                            {/*                    ? 'success.main'*/}
                            {/*                    : 'inherit',*/}
                            {/*            fontWeight:*/}
                            {/*                q.grandTotal === lowest*/}
                            {/*                    ? 700*/}
                            {/*                    : 500*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        {currency(q.grandTotal)}*/}
                            {/*    </Box>*/}
                            {/*    */}
                            {/*))}*/}

                            {quotations.map(q => (
                                <Box key={q.id}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography fontWeight={600}>
                                            {q.vendorName}
                                        </Typography>

                                        {q.grandTotal === lowest && (
                                            <Chip
                                                label="Best Price"
                                                color="success"
                                                size="small"
                                            />
                                        )}
                                    </Box>

                                    <Button
                                        size="small"
                                        variant={
                                            selectedQuotationId === q.id
                                                ? "contained"
                                                : "outlined"
                                        }
                                        sx={{ mt: 1 }}
                                        onClick={() => setSelectedQuotationId(q.id)}
                                    >
                                        {selectedQuotationId === q.id
                                            ? "Selected"
                                            : "Select"}
                                    </Button>
                                </Box>
                            ))}

                        </Box>

                        <Box mt={4} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!selectedQuotationId}
                                onClick={handleProceed}
                            >
                                Proceed to Approval
                            </Button>
                        </Box>


                    </Box>
                </Paper>

                <Box mt={3}>
                    <Typography variant="body2" color="text.secondary">
                        Tip: The quotation with the lowest price is highlighted in green.
                    </Typography>
                </Box>

            </Box>
        </DashboardLayout>
    );
}
