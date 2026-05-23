import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CircularProgress,
    Grid,
    Link,
    MenuItem,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Barcode from 'react-barcode';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getInventoryItemById,
    getLeafCategories,
    updateInventoryItem,
} from '../../services/inventoryService';

interface CategoryDto {
    id: string;
    name: string;
}

interface InventoryItemResponse {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    serialNumber: string | null;
    category: string;
    status: string;
    condition: string;
    location: string;
    assignedTo: string | null;
    assignedDate: string;
    description: string;
    createdAt: string;
}

interface InventoryItemFormState {
    name: string;
    description: string;
    serialNumber: string;
    sku: string;
    barcode: string;
    status: string;
    location: string;
    condition: string;
    inventoryCategoryId: string;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

const initialForm: InventoryItemFormState = {
    name: '',
    description: '',
    serialNumber: '',
    sku: '',
    barcode: '',
    status: 'Available',
    location: '',
    condition: 'Good',
    inventoryCategoryId: '',
};

export const EditInventoryItemPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const hasInitialized = useRef(false);

    const [form, setForm] = useState<InventoryItemFormState>(initialForm);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingSku, setLoadingSku] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showMessage = (
        message: string,
        severity: SnackbarState['severity'] = 'success'
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;

        setLoading(true);
        setError('');
        hasInitialized.current = false;

        try {
            const [itemRes, categoryRes]: [InventoryItemResponse, CategoryDto[]] =
                await Promise.all([getInventoryItemById(id), getLeafCategories()]);

            setCategories(categoryRes || []);

            const matchedCategory = (categoryRes || []).find(
                (cat) => cat.name.trim().toLowerCase() === itemRes.category?.trim().toLowerCase()
            );

            setForm({
                name: itemRes.name || '',
                description: itemRes.description || '',
                serialNumber: itemRes.serialNumber || '',
                sku: itemRes.sku || '',
                barcode: itemRes.barcode || '',
                status: itemRes.status || 'Available',
                location: itemRes.location || '',
                condition: itemRes.condition || 'Good',
                inventoryCategoryId: matchedCategory?.id || '',
            });

            hasInitialized.current = true;

            if (!matchedCategory && itemRes.category) {
                showMessage(
                    `Could not automatically match category "${itemRes.category}"`,
                    'warning'
                );
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load item data');
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (!hasInitialized.current) return;
    //     if (!form.name.trim() || !form.inventoryCategoryId) return;
    //
    //     const delay = setTimeout(async () => {
    //         setLoadingSku(true);
    //
    //         try {
    //             const res = await previewSku({
    //                 name: form.name.trim(),
    //                 categoryId: form.inventoryCategoryId,
    //             });
    //
    //             const nextSku = typeof res === 'string' ? res : res?.sku || '';
    //             const nextBarcode =
    //                 typeof res === 'string' ? res : res?.barcode || nextSku;
    //
    //             setForm((prev) => ({
    //                 ...prev,
    //                 sku: nextSku,
    //                 barcode: nextBarcode,
    //             }));
    //         } catch (err: any) {
    //             showMessage(
    //                 err?.response?.data?.message || 'Failed to generate SKU and barcode',
    //                 'error'
    //             );
    //         } finally {
    //             setLoadingSku(false);
    //         }
    //     }, 400);
    //
    //     return () => clearTimeout(delay);
    // }, [form.name, form.inventoryCategoryId]);

    const handleChange =
        (field: keyof InventoryItemFormState) =>
            (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
                const value = e.target.value;

                setForm((prev) => ({
                    ...prev,
                    [field]: value,
                }));
            };

    const handleSubmit = async () => {
        if (!id) return;

        if (!form.name.trim()) {
            showMessage('Item name is required', 'warning');
            return;
        }

        if (!form.inventoryCategoryId) {
            showMessage('Category is required', 'warning');
            return;
        }

        if (!form.sku.trim()) {
            showMessage('SKU is not ready yet', 'warning');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                serialNumber: form.serialNumber.trim(),
                status: form.status,
                location: form.location.trim(),
                condition: form.condition,
                inventoryCategoryId: form.inventoryCategoryId,
            };

            await updateInventoryItem(id, payload);

            navigate(`/inventory/item-detail/${id}`, {
                state: {
                    message: 'Item updated successfully',
                    severity: 'success',
                },
            });

        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update item');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Stack spacing={3}>
                    <Box>
                        <Breadcrumbs sx={{ mb: 1 }}>
                            <Link
                                underline="hover"
                                color="inherit"
                                sx={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                                onClick={() => navigate('/inventory')}
                            >
                                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
                                Inventory
                            </Link>

                            <Link
                                underline="hover"
                                color="inherit"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/inventory/${id}`)}
                            >
                                Item Details
                            </Link>

                            <Typography color="text.primary">Edit Item</Typography>
                        </Breadcrumbs>

                        <Typography variant="h4" fontWeight={800}>
                            Edit Inventory Item
                        </Typography>
                        <Typography color="text.secondary">
                            Update item information. SKU and barcode refresh automatically when item
                            name or category changes.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    {loading ? (
                        <Card sx={{ p: 4, borderRadius: 3 }}>
                            <Stack alignItems="center" spacing={2}>
                                <CircularProgress />
                                <Typography>Loading item...</Typography>
                            </Stack>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={8}>
                                <Card sx={{ p: 3, borderRadius: 3 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <Inventory2OutlinedIcon color="action" />
                                        <Typography fontWeight={700} variant="h6">
                                            Basic Information
                                        </Typography>
                                    </Stack>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Item Name *"
                                                fullWidth
                                                value={form.name}
                                                onChange={handleChange('name')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                select
                                                label="Category *"
                                                fullWidth
                                                value={form.inventoryCategoryId}
                                                onChange={handleChange('inventoryCategoryId')}
                                                helperText="Preselected from the item's current category"
                                            >
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Serial Number"
                                                fullWidth
                                                value={form.serialNumber}
                                                onChange={handleChange('serialNumber')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Location"
                                                fullWidth
                                                value={form.location}
                                                onChange={handleChange('location')}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                select
                                                label="Status"
                                                fullWidth
                                                value={form.status}
                                                onChange={handleChange('status')}
                                            >
                                                <MenuItem value="Available">Available</MenuItem>
                                                <MenuItem value="Assigned">Assigned</MenuItem>
                                                <MenuItem value="Maintenance">Maintenance</MenuItem>
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                select
                                                label="Condition"
                                                fullWidth
                                                value={form.condition}
                                                onChange={handleChange('condition')}
                                            >
                                                <MenuItem value="Good">Good</MenuItem>
                                                <MenuItem value="Damaged">Damaged</MenuItem>
                                                <MenuItem value="Needs Repair">Needs Repair</MenuItem>
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                label="Description"
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                value={form.description}
                                                onChange={handleChange('description')}
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={4}>
                                <Stack spacing={3}>
                                    <Card sx={{ p: 3, borderRadius: 3 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                            <CategoryOutlinedIcon color="action" />
                                            <Typography fontWeight={700} variant="h6">
                                                Generated Codes
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={2}>
                                            <TextField
                                                label="SKU"
                                                fullWidth
                                                value={loadingSku ? 'Generating SKU...' : form.sku}
                                                InputProps={{ readOnly: true }}
                                                helperText={
                                                    loadingSku
                                                        ? 'Refreshing SKU from backend...'
                                                        : 'Generated from item name and category'
                                                }
                                            />

                                            <TextField
                                                label="Barcode"
                                                fullWidth
                                                value={loadingSku ? 'Generating barcode...' : form.barcode}
                                                InputProps={{ readOnly: true }}
                                                helperText={
                                                    loadingSku
                                                        ? 'Refreshing barcode from backend...'
                                                        : 'Generated from backend'
                                                }
                                            />
                                        </Stack>
                                    </Card>

                                    <Card sx={{ p: 3, borderRadius: 3 }}>
                                        <Typography fontWeight={700} variant="h6" mb={2}>
                                            Barcode Preview
                                        </Typography>

                                        <Box
                                            textAlign="center"
                                            sx={{
                                                mt: 1,
                                                p: 2,
                                                border: '1px dashed #ccc',
                                                borderRadius: 2,
                                                backgroundColor: '#fafafa',
                                                minHeight: 140,
                                                display: 'grid',
                                                placeItems: 'center',
                                            }}
                                        >
                                            {loadingSku ? (
                                                <Stack spacing={1} alignItems="center">
                                                    <CircularProgress size={24} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Regenerating barcode...
                                                    </Typography>
                                                </Stack>
                                            ) : form.barcode ? (
                                                <Stack spacing={1} alignItems="center">
                                                    <Barcode
                                                        value={form.barcode}
                                                        height={50}
                                                        displayValue={false}
                                                        width={1.5}
                                                        margin={0}
                                                    />
                                                    <Typography>{form.barcode}</Typography>
                                                </Stack>
                                            ) : (
                                                <Typography color="text.secondary">
                                                    Barcode will appear here
                                                </Typography>
                                            )}
                                        </Box>
                                    </Card>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}

                    {!loading && (
                        <Card sx={{ p: 3, borderRadius: 3 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="flex-end"
                                spacing={1.5}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/inventory`)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={
                                        saving ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <SaveOutlinedIcon />
                                        )
                                    }
                                    onClick={handleSubmit}
                                    disabled={saving || loadingSku}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Stack>
                        </Card>
                    )}
                </Stack>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default EditInventoryItemPage;