import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    createInventoryItem,
    getInventoryStocks,
    InventoryStockDto,
} from '../../services/inventoryService';
import {DashboardLayout} from "../../components/Layout/DashboardLayout.tsx";

export default function AddInventoryAssetPage() {
    const navigate = useNavigate();

    const [stocks, setStocks] = useState<InventoryStockDto[]>([]);
    const [form, setForm] = useState({
        stockId: '',
        serialNumber: '',
        description: '',
        location: 'Inventory',
    });

    useEffect(() => {
        getInventoryStocks({ pageNumber: 1, pageSize: 100 }).then((res) => {
            setStocks((res.items || []).filter((x: InventoryStockDto) => x.isAssetTracked));
        });
    }, []);

    const submit = async () => {
        await createInventoryItem({
            name: '',
            stockId: form.stockId,
            serialNumber: form.serialNumber,
            description: form.description,
            location: form.location,
        });

        navigate('/inventory');
    };

    return (
        <DashboardLayout>
            <Box p={3}>
            <Typography variant="h4" fontWeight={700} mb={3}>
                Add Physical Asset
            </Typography>

            <Card sx={{ borderRadius: 3, maxWidth: 700 }}>
                <CardContent>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Asset Stock"
                            value={form.stockId}
                            onChange={(e) => setForm({ ...form, stockId: e.target.value })}
                            fullWidth
                        >
                            {stocks.map((stock) => (
                                <MenuItem key={stock.id} value={stock.id}>
                                    {stock.name} - {stock.sku}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Serial Number"
                            value={form.serialNumber}
                            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                            fullWidth
                        />

                        <TextField
                            label="Location"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            fullWidth
                            multiline
                            minRows={3}
                        />

                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" onClick={submit}>
                                Create Asset
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/inventory')}>
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
        </DashboardLayout>
    );
}