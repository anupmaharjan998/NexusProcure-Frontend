import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    Category,
    Inventory2,
    Numbers,
    Save,
    Straighten,
    WarningAmber,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    createInventoryStock,
    getLeafCategories,
} from '../../services/inventoryService';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { InventoryCategoryDto } from '../../types/InventoryCategoryDto';

export default function AddInventoryStockPage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<InventoryCategoryDto[]>([]);
    const [saving, setSaving] = useState(false);

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

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === form.categoryId),
        [categories, form.categoryId]
    );

    const isFormValid = form.name.trim() && form.categoryId;

    const submit = async () => {
        if (!isFormValid) return;

        setSaving(true);

        try {
            await createInventoryStock({
                name: form.name.trim(),
                categoryId: form.categoryId,
                openingQuantity: Number(form.openingQuantity),
                unit: form.unit.trim() || 'pcs',
                reorderLevel: Number(form.reorderLevel),
            });

            navigate('/inventory');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f8fafc',
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 4 },
                }}
            >
                <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/inventory')}
                        sx={{
                            mb: 3,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Back to Inventory
                    </Button>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            mb: 3,
                            borderRadius: 5,
                            background:
                                'linear-gradient(135deg, #1e293b 0%, #334155 55%, #475569 100%)',
                            color: 'white',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                right: -60,
                                top: -60,
                                width: 220,
                                height: 220,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.08)',
                            }}
                        />

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            spacing={3}
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Inventory2 sx={{ fontSize: 32 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Add Stock Item
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.76)', mt: 0.5 }}>
                                        Create a requestable inventory item with opening stock and reorder level.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                icon={<WarningAmber />}
                                label="New inventory record"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.16)',
                                    color: 'white',
                                    fontWeight: 700,
                                    '& .MuiChip-icon': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Stack>
                    </Paper>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>
                                                Stock Details
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Enter the basic information for the item users will request.
                                            </Typography>
                                        </Box>

                                        <Alert
                                            severity="info"
                                            sx={{
                                                borderRadius: 3,
                                                alignItems: 'center',
                                            }}
                                        >
                                            Stock items are requestable catalog items. Asset-tracked categories can
                                            later have physical asset records linked to this stock.
                                        </Alert>

                                        <TextField
                                            label="Stock Name"
                                            placeholder="Example: Dell Laptop, A4 Paper, Wireless Mouse"
                                            value={form.name}
                                            onChange={(event) =>
                                                setForm({ ...form, name: event.target.value })
                                            }
                                            fullWidth
                                            required
                                        />

                                        <TextField
                                            select
                                            label="Category"
                                            value={form.categoryId}
                                            onChange={(event) =>
                                                setForm({ ...form, categoryId: event.target.value })
                                            }
                                            fullWidth
                                            required
                                            helperText="Choose the leaf category where this item belongs."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Category />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {categories.map((category) => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                        sx={{ width: '100%' }}
                                                    >
                                                        <Typography>{category.name}</Typography>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                category.isAssetTracked
                                                                    ? 'Asset Tracked'
                                                                    : 'Stock Only'
                                                            }
                                                            color={
                                                                category.isAssetTracked
                                                                    ? 'primary'
                                                                    : 'default'
                                                            }
                                                        />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        {selectedCategory && (
                                            <Alert
                                                severity={
                                                    selectedCategory.isAssetTracked
                                                        ? 'warning'
                                                        : 'success'
                                                }
                                                sx={{ borderRadius: 3 }}
                                            >
                                                {selectedCategory.isAssetTracked
                                                    ? 'This stock belongs to an asset-tracked category. You can create physical asset records for this item later.'
                                                    : 'This item is stock-only. Quantity will be tracked, but no individual asset records will be created.'}
                                            </Alert>
                                        )}

                                        <Divider />

                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>
                                                Quantity Settings
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Define the starting quantity and low-stock threshold.
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    label="Opening Quantity"
                                                    type="number"
                                                    value={form.openingQuantity}
                                                    onChange={(event) =>
                                                        setForm({
                                                            ...form,
                                                            openingQuantity: Number(event.target.value),
                                                        })
                                                    }
                                                    fullWidth
                                                    helperText="Initial available stock."
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Numbers />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    label="Unit"
                                                    value={form.unit}
                                                    onChange={(event) =>
                                                        setForm({ ...form, unit: event.target.value })
                                                    }
                                                    fullWidth
                                                    helperText="Example: pcs, box, pack."
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Straighten />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    label="Reorder Level"
                                                    type="number"
                                                    value={form.reorderLevel}
                                                    onChange={(event) =>
                                                        setForm({
                                                            ...form,
                                                            reorderLevel: Number(event.target.value),
                                                        })
                                                    }
                                                    fullWidth
                                                    helperText="Low stock alert level."
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <WarningAmber />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Divider />

                                        <Stack
                                            direction={{ xs: 'column-reverse', sm: 'row' }}
                                            spacing={2}
                                            justifyContent="flex-end"
                                        >
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/inventory')}
                                                disabled={saving}
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                variant="contained"
                                                startIcon={<Save />}
                                                disabled={saving || !isFormValid}
                                                onClick={submit}
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
                                                }}
                                            >
                                                {saving ? 'Creating...' : 'Create Stock'}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    position: { md: 'sticky' },
                                    top: { md: 24 },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2.5}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 4,
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                display: 'grid',
                                                placeItems: 'center',
                                            }}
                                        >
                                            <Inventory2 sx={{ fontSize: 30 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Item Preview
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Review the item before creating it.
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Stock Name
                                                </Typography>
                                                <Typography fontWeight={800}>
                                                    {form.name.trim() || 'Not entered yet'}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Category
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                                    <Typography fontWeight={800}>
                                                        {selectedCategory?.name || 'Not selected'}
                                                    </Typography>

                                                    {selectedCategory && (
                                                        <Chip
                                                            size="small"
                                                            label={
                                                                selectedCategory.isAssetTracked
                                                                    ? 'Asset'
                                                                    : 'Stock'
                                                            }
                                                            color={
                                                                selectedCategory.isAssetTracked
                                                                    ? 'primary'
                                                                    : 'default'
                                                            }
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: '#f8fafc',
                                                    }}
                                                >
                                                    <Typography variant="caption" color="text.secondary">
                                                        Quantity
                                                    </Typography>
                                                    <Typography fontWeight={900} fontSize={22}>
                                                        {form.openingQuantity || 0}
                                                    </Typography>
                                                </Paper>

                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: '#f8fafc',
                                                    }}
                                                >
                                                    <Typography variant="caption" color="text.secondary">
                                                        Unit
                                                    </Typography>
                                                    <Typography fontWeight={900} fontSize={22}>
                                                        {form.unit || 'pcs'}
                                                    </Typography>
                                                </Paper>
                                            </Box>

                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: '#fff7ed',
                                                    borderColor: '#fed7aa',
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary">
                                                    Reorder Alert
                                                </Typography>
                                                <Typography fontWeight={800}>
                                                    Alert when stock reaches {form.reorderLevel || 0}{' '}
                                                    {form.unit || 'pcs'}
                                                </Typography>
                                            </Paper>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </DashboardLayout>
    );
}