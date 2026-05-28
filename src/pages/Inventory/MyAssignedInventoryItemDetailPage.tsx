import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DevicesIcon from '@mui/icons-material/Devices';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import { useNavigate, useParams } from 'react-router-dom';
import Barcode from 'react-barcode';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getMyAssignedInventoryItemDetail } from '../../services/inventoryRequestService';
import { MyAssignedInventoryItemDetail } from '../../types/InventoryRequest';

const conditionColor = (condition?: string | null) => {
    if (condition === 'Good' || condition === 'New') return 'success';
    if (condition === 'Damaged' || condition === 'Faulty') return 'error';
    if (condition === 'Maintenance') return 'warning';

    return 'default';
};

const statusColor = (status?: string | null) => {
    if (status === 'Assigned') return 'success';
    if (status === 'Available') return 'info';
    if (status === 'Damaged' || status === 'Lost') return 'error';
    if (status === 'Maintenance') return 'warning';

    return 'default';
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
};

type DetailRowProps = {
    label: string;
    value?: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Box
                sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                }}
            >
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    {label}
                </Typography>

                <Typography sx={{ mt: 0.5 }} fontWeight={800}>
                    {value || '-'}
                </Typography>
            </Box>
        </Grid>
    );
}

export default function MyAssignedInventoryItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const printRef = useRef<HTMLDivElement | null>(null);

    const [item, setItem] = useState<MyAssignedInventoryItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const barcodeValue = useMemo(() => {
        if (!item) return '';

        return item.barcode || item.sku || item.serialNumber || item.id;
    }, [item]);

    const loadItem = async () => {
        if (!id) {
            setError('Inventory item id is missing.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await getMyAssignedInventoryItemDetail(id);
            setItem(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load inventory item details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItem();
    }, [id]);

    const handlePrintBarcode = () => {
        if (!item) return;

        const printContent = printRef.current?.innerHTML;

        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=700,height=500');

        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 24px;
                            text-align: center;
                        }

                        .barcode-card {
                            width: 360px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #111827;
                            border-radius: 12px;
                        }

                        .item-name {
                            font-size: 18px;
                            font-weight: 800;
                            margin-bottom: 4px;
                        }

                        .meta {
                            font-size: 12px;
                            color: #374151;
                            margin-bottom: 12px;
                        }

                        @media print {
                            button {
                                display: none;
                            }

                            body {
                                padding: 0;
                            }

                            .barcode-card {
                                border: 1px solid #000;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function () {
                            window.print();
                            window.onafterprint = function () {
                                window.close();
                            };
                        };
                    </script>
                </body>
            </html>
        `);

        printWindow.document.close();
    };

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 5,
                        color: 'white',
                        background:
                            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <DevicesIcon sx={{ fontSize: 42 }} />

                            <Box>
                                <Typography variant="h4" fontWeight={900}>
                                    Device Details
                                </Typography>

                                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.75)' }}>
                                    View full details and print barcode for this assigned device.
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{
                                bgcolor: 'white',
                                color: '#0f172a',
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 900,
                                '&:hover': {
                                    bgcolor: '#e2e8f0',
                                },
                            }}
                        >
                            Back
                        </Button>
                    </Stack>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Card elevation={0} sx={{ borderRadius: 5 }}>
                        <CardContent>
                            <Stack alignItems="center" py={8}>
                                <CircularProgress />
                            </Stack>
                        </CardContent>
                    </Card>
                ) : !item ? (
                    <Alert severity="warning">Inventory item was not found.</Alert>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={8}>
                            <Card elevation={0} sx={{ borderRadius: 5 }}>
                                <CardContent>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        spacing={2}
                                        sx={{ mb: 3 }}
                                    >
                                        <Box>
                                            <Typography variant="h5" fontWeight={900}>
                                                {item.itemName}
                                            </Typography>

                                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                                {item.categoryName || 'No category'}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            <Chip
                                                label={item.status || 'Unknown'}
                                                color={statusColor(item.status) as any}
                                                sx={{ fontWeight: 800 }}
                                            />

                                            <Chip
                                                label={item.condition || 'Unknown'}
                                                color={conditionColor(item.condition) as any}
                                                sx={{ fontWeight: 800 }}
                                            />
                                        </Stack>
                                    </Stack>

                                    <Divider sx={{ mb: 3 }} />

                                    <Grid container spacing={2}>
                                        <DetailRow label="Item Name" value={item.itemName} />
                                        <DetailRow label="Category" value={item.categoryName} />
                                        <DetailRow label="SKU" value={item.sku} />
                                        <DetailRow label="Barcode" value={item.barcode} />
                                        <DetailRow label="Serial Number" value={item.serialNumber} />
                                        <DetailRow label="Assigned To" value={item.assignedTo} />
                                        <DetailRow label="Department" value={item.department} />
                                        <DetailRow label="Location" value={item.location} />
                                        <DetailRow label="Status" value={item.status} />
                                        <DetailRow label="Condition" value={item.condition} />
                                        <DetailRow label="Assigned Date" value={formatDate(item.assignedAt)} />
                                        <DetailRow label="Created Date" value={formatDate(item.createdAt)} />
                                        <DetailRow label="Updated Date" value={formatDate(item.updatedAt)} />
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Card elevation={0} sx={{ borderRadius: 5 }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                        <BarcodeIcon color="primary" />

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Barcode
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Generate and print item barcode.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box
                                        ref={printRef}
                                        sx={{
                                            p: 3,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 4,
                                            textAlign: 'center',
                                            bgcolor: '#ffffff',
                                        }}
                                    >
                                        <Box className="barcode-card">
                                            <Typography className="item-name" fontWeight={900}>
                                                {item.itemName}
                                            </Typography>

                                            <Typography className="meta" color="text.secondary" sx={{ mb: 1 }}>
                                                {item.categoryName || 'Inventory Item'}
                                            </Typography>

                                            <Barcode
                                                value={barcodeValue}
                                                height={80}
                                                width={1.7}
                                                fontSize={14}
                                                margin={8}
                                            />

                                            <Typography variant="caption" color="text.secondary">
                                                Serial No: {item.serialNumber || '-'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PrintIcon />}
                                        onClick={handlePrintBarcode}
                                        sx={{
                                            mt: 2,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            fontWeight: 900,
                                        }}
                                    >
                                        Print Barcode
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </DashboardLayout>
    );
}