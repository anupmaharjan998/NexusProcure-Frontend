import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getMonthlySpendReport } from '../../services/reportService';
import { MonthlySpendDto } from '../../types/reports';

const formatCurrency = (value: number) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
};

export default function SpendingAnalyticsPage() {
    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState(currentYear);
    const [items, setItems] = useState<MonthlySpendDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [year]);

    const load = async () => {
        try {
            setLoading(true);
            const result = await getMonthlySpendReport(year);
            setItems(result);
        } finally {
            setLoading(false);
        }
    };

    const years = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
    ];

    const totalSpend = items.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
    );

    return (
        <DashboardLayout>
            <Box>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                    mb={3}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Spending Analytics
                        </Typography>

                        <Typography color="text.secondary">
                            Monthly procurement spending trend.
                        </Typography>
                    </Box>

                    <TextField
                        select
                        label="Year"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        sx={{ width: 160 }}
                    >
                        {years.map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary">
                            Total Spend for {year}
                        </Typography>

                        <Typography variant="h4" fontWeight={700}>
                            {formatCurrency(totalSpend)}
                        </Typography>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Monthly Spend Chart
                        </Typography>

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={5}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box height={420}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={items}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="monthName" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(Number(value))
                                            }
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="totalAmount"
                                            name="Monthly Spend"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}