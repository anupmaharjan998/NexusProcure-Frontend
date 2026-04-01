import {
    Box, Card, Typography, Grid, TextField,
    Stack, Button, Chip, IconButton, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Pagination, MenuItem
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory
} from '../../services/inventoryService';

import { Snackbar, Alert } from '@mui/material';

export const CategoryPage = () => {

    const navigate = useNavigate();

    const [data, setData] = useState<any>({
        categories: [],
        categoryStats: {
            totalCategories: 0,
            totalSubcategories: 0,
            totalItems: 0
        }
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // success | error | warning | info
    });
    const showMessage = (message: string, severity: any = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        id: null,
        type: '' // 'category' | 'subcategory'
    });

    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [editSubMode, setEditSubMode] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        riskWeight: 0,
        parentCategoryId: null
    });

    const [editMode, setEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const [openSub, setOpenSub] = useState(false);
    const [subForm, setSubForm] = useState({
        name: '',
        description: '',
        parentCategoryId: null
    });

    // ✅ Fetch Data
    const fetchData = async (searchValue = '', pageValue = page) => {
        setLoading(true);
        try {
            const res = await getCategories({
                search: searchValue,
                pageNumber: pageValue,
                pageSize: pageSize
            });

            setData(res);
            setTotalCount(res.totalCount || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Debounced search + pagination
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchData(search, page);
        }, 400);

        return () => clearTimeout(delay);
    }, [search, page, pageSize]);

    // ✅ Add or Update Category
    const handleSaveCategory = async () => {
        if (!form.name) {
            showMessage("Category name is required", "warning");
            return;
        }

        try {
            if (editMode && selectedCategory) {
                await updateCategory(selectedCategory.id, form);
                showMessage("Category updated successfully");
            } else {
                await createCategory(form);
                showMessage("Category created successfully");
            }

            await fetchData(search, page);

            setForm({
                name: '',
                description: '',
                riskWeight: 0,
                parentCategoryId: null
            });

            setEditMode(false);
            setSelectedCategory(null);
            setOpen(false);

        } catch (err) {
            showMessage("Operation failed", "error");
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ background: '#ede9fe', p: 1.5, borderRadius: 2 }}>
                            <CategoryIcon color="primary" />
                        </Box>

                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Category Management
                            </Typography>
                            <Typography color="text.secondary">
                                Manage inventory categories and subcategories
                            </Typography>
                        </Box>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditMode(false);
                            setForm({
                                name: '',
                                description: '',
                                riskWeight: 0,
                                parentCategoryId: null
                            });
                            setOpen(true);
                        }}
                    >
                        Add Category
                    </Button>
                </Stack>

                {/* KPI */}
                <Grid container spacing={2} mt={2}>
                    {[
                        { label: 'Total Categories', value: data.categoryStats.totalCategories },
                        { label: 'Total Subcategories', value: data.categoryStats.totalSubCategories },
                        { label: 'Total Items', value: data.categoryStats.totalItems }
                    ].map((c, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Card sx={{ p: 2, borderRadius: 3 }}>
                                <Typography color="text.secondary">{c.label}</Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {c.value}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* SEARCH */}
                <Card sx={{ p: 2, mt: 2, borderRadius: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search categories and subcategories..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </Card>

                {/* CATEGORY LIST */}
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box mt={2}>
                        {data.categories.map((cat: any) => (
                            <Card key={cat.id} sx={{ mb: 3, p: 2, borderRadius: 3 }}>

                                <Stack direction="row" justifyContent="space-between">
                                    <Box>
                                        <Typography fontWeight={700}>{cat.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {cat.description}
                                        </Typography>
                                        <Chip label={`${cat.totalItems} items`} size="small" sx={{ mt: 1 }} />
                                    </Box>

                                    <Stack direction="row" spacing={1}>

                                        {/* ADD SUBCATEGORY */}
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                setEditSubMode(false);
                                                setSelectedSubCategory(null);

                                                setSubForm({
                                                    name: '',
                                                    description: '',
                                                    parentCategoryId: cat.id
                                                });

                                                setOpenSub(true);
                                            }}
                                        >
                                            Add Subcategory
                                        </Button>

                                        {/* EDIT */}
                                        <IconButton onClick={() => {
                                            setEditMode(true);
                                            setSelectedCategory(cat);
                                            setForm({
                                                name: cat.name,
                                                description: cat.description || '',
                                                riskWeight: cat.riskWeight || 0,
                                                parentCategoryId: null
                                            });
                                            setOpen(true);
                                        }}>
                                            <EditIcon />
                                        </IconButton>

                                        {/* DELETE */}
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                setDeleteDialog({
                                                    open: true,
                                                    id: cat.id,
                                                    type: 'category'
                                                });
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>

                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Grid container sx={{ fontWeight: 600, mb: 1 }}>
                                    <Grid item xs={3}>Subcategory Name</Grid>
                                    <Grid item xs={2}>Code</Grid>
                                    <Grid item xs={4}>Description</Grid>
                                    <Grid item xs={1}>Items</Grid>
                                    <Grid item xs={2}>Actions</Grid>
                                </Grid>

                                {cat.subCategories?.map((sub: any) => (
                                    <Grid container key={sub.id} alignItems="center" py={1} sx={{ '&:hover': { background: '#f9fafb' } }}>
                                        <Grid item xs={3}>{sub.name}</Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="body2" color="text.secondary">{sub.categoryCode}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                {sub.description}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Chip label={sub.totalItems} size="small" />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditSubMode(true);
                                                    setSelectedSubCategory(sub);

                                                    setSubForm({
                                                        name: sub.name,
                                                        description: sub.description || '',
                                                        parentCategoryId: cat.id
                                                    });

                                                    setOpenSub(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setDeleteDialog({
                                                        open: true,
                                                        id: sub.id,
                                                        type: 'subcategory'
                                                    });
                                                }}
                                                disabled={sub.totalItems > 0}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Card>
                        ))}
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>

                    <Typography variant="body2">
                        Showing {pageSize} per page
                    </Typography>

                    <TextField
                        select
                        size="small"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                        sx={{ width: 120 }}
                    >
                        {[5, 10, 20, 50].map(size => (
                            <MenuItem key={size} value={size}>
                                {size} / page
                            </MenuItem>
                        ))}
                    </TextField>

                </Box>

                {/* PAGINATION */}
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={Math.ceil(totalCount / pageSize)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>

                {/* ADD/EDIT CATEGORY DIALOG */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>

                    <DialogContent>
                        <Stack spacing={2} mt={1}>

                            <TextField
                                label="Category Name"
                                fullWidth
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />

                            <TextField
                                label="Risk Weight (%)"
                                type="number"
                                fullWidth
                                value={form.riskWeight}
                                inputProps={{ min: 0, max: 100 }}
                                helperText="Enter a value between 0 and 100"
                                onChange={(e) => {
                                    let value = Number(e.target.value);
                                    if (value > 100) value = 100;
                                    if (value < 0) value = 0;
                                    setForm({ ...form, riskWeight: value });
                                }}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />

                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveCategory}>
                            {editMode ? "Update" : "Create"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ADD SUBCATEGORY DIALOG */}
                <Dialog open={openSub} onClose={() => setOpenSub(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {editSubMode ? "Edit Subcategory" : "Add Subcategory"}
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={2} mt={1}>

                            <TextField
                                label="Subcategory Name"
                                fullWidth
                                value={subForm.name}
                                onChange={(e) =>
                                    setSubForm({ ...subForm, name: e.target.value })
                                }
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={subForm.description}
                                onChange={(e) =>
                                    setSubForm({ ...subForm, description: e.target.value })
                                }
                            />

                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpenSub(false)}>Cancel</Button>

                        <Button
                            variant="contained"
                            onClick={async () => {
                                if (!subForm.name) {
                                    showMessage("Subcategory name is required", "warning");
                                    return;
                                }

                                try {
                                    if (editSubMode && selectedSubCategory) {
                                        await updateCategory(selectedSubCategory.id, {
                                            name: subForm.name,
                                            description: subForm.description
                                        });

                                        showMessage("Subcategory updated successfully");

                                    } else {
                                        await createSubCategory(subForm);
                                        showMessage("Subcategory created successfully");
                                    }

                                    await fetchData(search, page);

                                    setOpenSub(false);
                                    setEditSubMode(false);
                                    setSelectedSubCategory(null);

                                } catch (err) {
                                    showMessage("Operation failed", "error");
                                }
                            }}
                        >
                            {editSubMode ? "Update" : "Create"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, id: null, type: '' })}
                >
                    <DialogTitle>
                        Confirm Delete
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this {deleteDialog.type}?
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() =>
                                setDeleteDialog({ open: false, id: null, type: '' })
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            color="error"
                            variant="contained"
                            onClick={async () => {
                                try {
                                    await deleteCategory(deleteDialog.id);

                                    showMessage(
                                        `${deleteDialog.type === 'category' ? 'Category' : 'Subcategory'} deleted successfully`
                                    );

                                    await fetchData(search, page);

                                } catch (err) {
                                    showMessage("Delete failed", "error");
                                } finally {
                                    setDeleteDialog({ open: false, id: null, type: '' });
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Box>
        </DashboardLayout>
    );
};