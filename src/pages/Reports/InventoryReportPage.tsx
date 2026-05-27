import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getLowStockReport } from '../../services/reportService';
import { LowStockReportDto } from '../../types/reports';

export default function InventoryReportPage() {
    const [items, setItems] = useState<LowStockReportDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const result = await getLowStockReport();
            setItems(result);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Inventory Reports
                </Typography>

                <Typography color="text.secondary" mb={3}>
                    Low stock and reorder level monitoring.
                </Typography>

                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Low Stock Report
                        </Typography>

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={5}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">
                                            Available Qty
                                        </TableCell>
                                        <TableCell align="right">
                                            Reorder Level
                                        </TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                No low stock items found.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {items.map((item) => (
                                        <TableRow key={item.stockId}>
                                            <TableCell>{item.itemName}</TableCell>

                                            <TableCell>
                                                {item.categoryName}
                                            </TableCell>

                                            <TableCell align="right">
                                                {item.availableQuantity}
                                            </TableCell>

                                            <TableCell align="right">
                                                {item.reorderLevel}
                                            </TableCell>

                                            <TableCell>{item.unit}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    color={
                                                        item.stockStatus ===
                                                        'Out of Stock'
                                                            ? 'error'
                                                            : 'warning'
                                                    }
                                                    label={item.stockStatus}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}