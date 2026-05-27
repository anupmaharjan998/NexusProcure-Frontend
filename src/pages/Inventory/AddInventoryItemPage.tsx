import {
    Box, Card, Typography, Grid, TextField,
    Stack, Button, MenuItem, Snackbar, Alert, AlertColor
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Barcode from 'react-barcode';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getLeafCategories,
    createInventoryItem,
} from '../../services/inventoryService';

export const AddInventoryItemPage = () => {

    const navigate = useNavigate();
    const barcodeRef = useRef<HTMLDivElement>(null);

    const [categories, setCategories] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: '',
        sku: '',
        categoryId: '',
        description: '',
        stockId: ''
    });

    const [loading, setLoading] = useState(false);
    const [loadingSku, setLoadingSku] = useState(false);
    const [created, setCreated] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showMessage = (message: string, severity: AlertColor = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // ✅ Load Categories
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getLeafCategories();
            setCategories(res || []);
        } catch {
            showMessage("Failed to load categories", "error");
        }
    };

    // ✅ SKU GENERATION (Debounced)
    // useEffect(() => {
    //     if (!form.name.trim() || !form.categoryId || created) return;
    //
    //     const delay = setTimeout(async () => {
    //         setLoadingSku(true);
    //
    //         try {
    //             const res = await previewSku({
    //                 name: form.name,
    //                 categoryId: form.categoryId
    //             });
    //
    //             const skuValue = typeof res === "string" ? res : res.sku;
    //
    //             setForm(prev => ({
    //                 ...prev,
    //                 sku: skuValue
    //             }));
    //
    //         } catch {
    //             showMessage("Failed to generate SKU", "error");
    //         } finally {
    //             setLoadingSku(false);
    //         }
    //     }, 400);
    //
    //     return () => clearTimeout(delay);
    //
    // }, [form.name, form.categoryId, created]);

    // ✅ SUBMIT
    const handleSubmit = async () => {

        if (!form.name.trim()) {
            showMessage("Item name is required", "warning");
            return;
        }

        if (!form.categoryId) {
            showMessage("Category is required", "warning");
            return;
        }

        if (!form.sku) {
            showMessage("SKU not generated yet", "warning");
            return;
        }

        setLoading(true);

        try {
            await createInventoryItem(form);

            showMessage("Item created successfully");
            setCreated(true);

        } catch {
            showMessage("Failed to create item", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🖨️ Print Barcode
    const handlePrint = () => {
        const printContent = barcodeRef.current?.innerHTML;
        const win = window.open('', '', 'width=600,height=400');

        if (win && printContent) {
            win.document.write(`
                <html>
                    <head><title>Print Barcode</title></head>
                    <body style="text-align:center;">
                        ${printContent}
                    </body>
                </html>
            `);
            win.document.close();
            win.print();
        }
    };

    return (
        <DashboardLayout>
            <Box p={3}>

                {/* BACK */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/inventory')}
                    sx={{ mb: 2 }}
                >
                    Back to Inventory
                </Button>

                {/* HEADER */}
                <Typography variant="h5" fontWeight={700}>
                    Add New Inventory Item
                </Typography>

                <Card sx={{ p: 3, borderRadius: 3, mt: 2 }}>

                    <Typography fontWeight={600} mb={2}>
                        Basic Information
                    </Typography>

                    <Grid container spacing={2}>

                        {/* NAME */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Item Name *"
                                fullWidth
                                value={form.name}
                                disabled={created}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </Grid>

                        {/* SKU */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="SKU"
                                fullWidth
                                value={loadingSku ? "Generating SKU..." : form.sku}
                                InputProps={{ readOnly: true }}
                                helperText={
                                    loadingSku
                                        ? "Generating unique SKU..."
                                        : "Auto-generated from category & name"
                                }
                            />
                        </Grid>

                        {/* CATEGORY */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Category *"
                                fullWidth
                                value={form.categoryId}
                                disabled={created}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        categoryId: e.target.value,
                                        sku: ''
                                    })
                                }
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* DESCRIPTION */}
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={form.description}
                                disabled={created}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />
                        </Grid>

                        {/* BARCODE */}
                        <Grid item xs={12}>
                            <Typography fontWeight={600} mb={1}>
                                Barcode Preview
                            </Typography>

                            <Box
                                ref={barcodeRef}
                                textAlign="center"
                                sx={{
                                    mt: 1,
                                    p: 2,
                                    border: '1px dashed #ccc',
                                    borderRadius: 2,
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                {form.sku ? (
                                    <>
                                        <Barcode value={form.sku} height={50} />
                                        <Typography mt={1}>
                                            {form.sku}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography color="text.secondary">
                                        SKU will generate automatically
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                    </Grid>

                    {/* SUCCESS MESSAGE */}
                    {created && (
                        <Typography color="success.main" mt={2}>
                            ✔ Item created successfully. You can print the barcode.
                        </Typography>
                    )}

                    {/* ACTIONS */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={3}
                    >

                        {/* LEFT */}
                        {created && (
                            <Stack direction="row" spacing={2}>

                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                >
                                    Print Barcode
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setForm({
                                            name: '',
                                            sku: '',
                                            categoryId: '',
                                            description: '',
                                            stockId: ''
                                        });
                                        setCreated(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Add Another
                                </Button>

                            </Stack>
                        )}

                        {/* RIGHT */}
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/inventory')}
                            >
                                Back
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={
                                    loading ||
                                    !form.name ||
                                    !form.categoryId ||
                                    !form.sku ||
                                    created
                                }
                            >
                                {created ? "Created" : loading ? "Saving..." : "Create Item"}
                            </Button>
                        </Stack>

                    </Stack>

                </Card>

                {/* SNACKBAR */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Box>
        </DashboardLayout>
    );
};