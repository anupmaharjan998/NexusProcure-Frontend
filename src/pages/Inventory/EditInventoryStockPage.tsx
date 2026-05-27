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
    createInventoryStock,
    getLeafCategories,
} from '../../services/inventoryService';
import {InventoryCategoryDto} from "../../types/InventoryCategoryDto.ts";
import {DashboardLayout} from "../../components/Layout/DashboardLayout.tsx";

export default function AddInventoryStockPage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<InventoryCategoryDto[]>([]);
    const [form, setForm] = useState({
        name: '',
        categoryId: '',
        openingQuantity: 0,
        unit: 'pcs',
        reorderLevel: 5,
    });

    useEffect(() => {
        getLeafCategories().then(setCategories);
    }, []);

    const submit = async () => {
        await createInventoryStock({
            name: form.name,
            categoryId: form.categoryId,
            openingQuantity: Number(form.openingQuantity),
            unit: form.unit,
            reorderLevel: Number(form.reorderLevel),
        });

        navigate('/inventory');
    };

    return (
        <DashboardLayout>
            <Box p={3}>
            <Typography variant="h4" fontWeight={700} mb={3}>
                Add Stock Item
            </Typography>

            <Card sx={{ borderRadius: 3, maxWidth: 700 }}>
                <CardContent>
                    <Stack spacing={3}>
                        <TextField
                            label="Stock Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            fullWidth
                        />

                        <TextField
                            select
                            label="Category"
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            fullWidth
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name} {cat.isAssetTracked ? '(Asset Tracked)' : '(Stock Only)'}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Opening Quantity"
                            type="number"
                            value={form.openingQuantity}
                            onChange={(e) =>
                                setForm({ ...form, openingQuantity: Number(e.target.value) })
                            }
                            fullWidth
                        />

                        <TextField
                            label="Unit"
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                            fullWidth
                        />

                        <TextField
                            label="Reorder Level"
                            type="number"
                            value={form.reorderLevel}
                            onChange={(e) =>
                                setForm({ ...form, reorderLevel: Number(e.target.value) })
                            }
                            fullWidth
                        />

                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" onClick={submit}>
                                Create Stock
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