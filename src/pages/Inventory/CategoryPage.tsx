import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    Category,
    DeleteOutline,
    EditOutlined,
    Inventory2,
    Search,
    Shield,
    Storefront,
    WarningAmber,
} from '@mui/icons-material';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
} from '../../services/inventoryService';
import { InventoryCategoryDto } from '../../types/InventoryCategoryDto.ts';
import { DashboardLayout } from '../../components/Layout/DashboardLayout.tsx';

const initialForm = {
    name: '',
    description: '',
    riskWeight: 0,
    isAssetTracked: false,
};

export default function CategoryPage() {
    const [categories, setCategories] = useState<InventoryCategoryDto[]>([]);
    const [form, setForm] = useState(initialForm);

    const [search, setSearch] = useState('');
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<InventoryCategoryDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<InventoryCategoryDto | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);

        try {
            const res = await getCategories({ pageNumber: 1, pageSize: 100 });
            setCategories(res.categories || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return categories;

        return categories.filter((category) => {
            return (
                category.name?.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query) ||
                category.categoryCode?.toLowerCase().includes(query)
            );
        });
    }, [categories, search]);

    const stats = useMemo(() => {
        const total = categories.length;
        const assetTracked = categories.filter((cat) => cat.isAssetTracked).length;
        const stockOnly = total - assetTracked;
        const totalItems = categories.reduce((sum, cat) => sum + (cat.totalItems || 0), 0);

        return {
            total,
            assetTracked,
            stockOnly,
            totalItems,
        };
    }, [categories]);

    const resetForm = () => {
        setForm(initialForm);
    };

    const openCreateDialog = () => {
        setEditTarget(null);
        resetForm();
        setOpenCreate(true);
    };

    const openEditDialog = (category: InventoryCategoryDto) => {
        setEditTarget(category);

        setForm({
            name: category.name || '',
            description: category.description || '',
            riskWeight: category.riskWeight || 0,
            isAssetTracked: Boolean(category.isAssetTracked),
        });

        setOpenCreate(true);
    };

    const closeCategoryDialog = () => {
        if (saving) return;

        setOpenCreate(false);
        setEditTarget(null);
        resetForm();
    };

    const submit = async () => {
        if (!form.name.trim()) return;

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                riskWeight: Number(form.riskWeight),
                isAssetTracked: form.isAssetTracked,
                parentCategoryId: null,
            };

            if (editTarget) {
                await updateCategory(editTarget.id, payload);
            } else {
                await createCategory(payload);
            }

            closeCategoryDialog();
            await load();
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await deleteCategory(deleteTarget.id);
            setDeleteTarget(null);
            await load();
        } finally {
            setDeleting(false);
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
                <Box sx={{ maxWidth: 1250, mx: 'auto' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            mb: 3,
                            borderRadius: 5,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            background:
                                'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                width: 260,
                                height: 260,
                                borderRadius: '50%',
                                right: -90,
                                top: -100,
                                bgcolor: 'rgba(255,255,255,0.08)',
                            }}
                        />

                        <Box
                            sx={{
                                position: 'absolute',
                                width: 160,
                                height: 160,
                                borderRadius: '50%',
                                right: 120,
                                bottom: -90,
                                bgcolor: 'rgba(255,255,255,0.06)',
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
                                        width: 64,
                                        height: 64,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Category sx={{ fontSize: 34 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Inventory Categories
                                    </Typography>

                                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
                                        Organize stock items into clear categories and define whether they are
                                        stock-only or asset-tracked.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={openCreateDialog}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#0f172a',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.1,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                                    '&:hover': {
                                        bgcolor: '#f1f5f9',
                                    },
                                }}
                            >
                                Create Category
                            </Button>
                        </Stack>
                    </Paper>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<Category />}
                                title="Total Categories"
                                value={stats.total}
                                helper="All category groups"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<Shield />}
                                title="Asset Tracked"
                                value={stats.assetTracked}
                                helper="Physical assets enabled"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<Storefront />}
                                title="Stock Only"
                                value={stats.stockOnly}
                                helper="Quantity tracking only"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                icon={<Inventory2 />}
                                title="Total Items"
                                value={stats.totalItems}
                                helper="Items under categories"
                            />
                        </Grid>
                    </Grid>

                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                        }}
                    >
                        {loading && <LinearProgress />}

                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                mb={3}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Category List
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Manage inventory grouping, risk weight, and tracking type.
                                    </Typography>
                                </Box>

                                <TextField
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search category, code, description..."
                                    size="small"
                                    sx={{
                                        minWidth: { xs: '100%', md: 360 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f8fafc',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>

                            {!loading && filteredCategories.length === 0 ? (
                                <EmptyState
                                    hasSearch={Boolean(search.trim())}
                                    onCreate={openCreateDialog}
                                />
                            ) : (
                                <Grid container spacing={2.5}>
                                    {filteredCategories.map((cat) => (
                                        <Grid item xs={12} md={6} lg={4} key={cat.id}>
                                            <CategoryCard
                                                category={cat}
                                                onEdit={() => openEditDialog(cat)}
                                                onDelete={() => setDeleteTarget(cat)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Dialog
                    open={openCreate}
                    onClose={closeCategoryDialog}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: 5,
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 3,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                {editTarget ? <EditOutlined /> : <Add />}
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {editTarget ? 'Edit Category' : 'Create Category'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {editTarget
                                        ? 'Update this inventory category.'
                                        : 'Add a new inventory category.'}
                                </Typography>
                            </Box>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2.5}>
                            <Alert severity="info" sx={{ borderRadius: 3 }}>
                                Use asset tracking for items that need individual physical records, such as
                                laptops, monitors, or equipment.
                            </Alert>

                            <TextField
                                label="Category Name"
                                placeholder="Example: Laptops, Stationery, Network Devices"
                                value={form.name}
                                onChange={(event) =>
                                    setForm({ ...form, name: event.target.value })
                                }
                                fullWidth
                                required
                                autoFocus
                            />

                            <TextField
                                label="Description"
                                placeholder="Briefly describe this category"
                                value={form.description}
                                onChange={(event) =>
                                    setForm({ ...form, description: event.target.value })
                                }
                                fullWidth
                                multiline
                                minRows={3}
                            />

                            <TextField
                                label="Risk Weight"
                                type="number"
                                value={form.riskWeight}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        riskWeight: Number(event.target.value),
                                    })
                                }
                                fullWidth
                                helperText="Higher value means this category is more critical or sensitive."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WarningAmber />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: form.isAssetTracked ? '#eff6ff' : '#f8fafc',
                                    borderColor: form.isAssetTracked ? 'primary.light' : 'divider',
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.isAssetTracked}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    isAssetTracked: event.target.checked,
                                                })
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography fontWeight={800}>
                                                Asset Tracked Category
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Enable this when each item needs its own asset record.
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start', m: 0 }}
                                />
                            </Paper>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={closeCategoryDialog}
                            disabled={saving}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={submit}
                            disabled={saving || !form.name.trim()}
                            startIcon={editTarget ? <EditOutlined /> : <Add />}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 800,
                                px: 3,
                            }}
                        >
                            {saving
                                ? editTarget
                                    ? 'Updating...'
                                    : 'Creating...'
                                : editTarget
                                    ? 'Update Category'
                                    : 'Create Category'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={Boolean(deleteTarget)}
                    onClose={() => !deleting && setDeleteTarget(null)}
                    fullWidth
                    maxWidth="xs"
                    PaperProps={{
                        sx: {
                            borderRadius: 5,
                        },
                    }}
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight={900}>
                            Delete Category?
                        </Typography>
                    </DialogTitle>

                    <DialogContent>
                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                            Are you sure you want to delete{' '}
                            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="error"
                            variant="contained"
                            onClick={confirmDelete}
                            disabled={deleting}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 800,
                            }}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}

function StatCard({
                      icon,
                      title,
                      value,
                      helper,
                  }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    helper: string;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            bgcolor: '#eff6ff',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={900}>
                            {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {helper}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function CategoryCard({
                          category,
                          onEdit,
                          onDelete,
                      }: {
    category: InventoryCategoryDto;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                transition: '0.2s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 35px rgba(15,23,42,0.10)',
                },
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 3,
                                    bgcolor: category.isAssetTracked ? '#eff6ff' : '#f1f5f9',
                                    color: category.isAssetTracked ? 'primary.main' : 'text.secondary',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                {category.isAssetTracked ? <Shield /> : <Storefront />}
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {category.name}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    Code: {category.categoryCode || 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Edit category">
                                <IconButton color="primary" onClick={onEdit}>
                                    <EditOutlined />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete category">
                                <IconButton color="error" onClick={onDelete}>
                                    <DeleteOutline />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            size="small"
                            label={category.isAssetTracked ? 'Asset Tracked' : 'Stock Only'}
                            color={category.isAssetTracked ? 'primary' : 'default'}
                            sx={{ fontWeight: 700 }}
                        />

                        <Chip
                            size="small"
                            label={`Risk: ${category.riskWeight ?? 0}`}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />

                        <Chip
                            size="small"
                            label={`${category.totalItems || 0} Items`}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            minHeight: 42,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {category.description || 'No description added for this category.'}
                    </Typography>

                    {Boolean(category.subCategories?.length) && (
                        <>
                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" fontWeight={900} mb={1}>
                                    Sub Categories
                                </Typography>

                                <Stack spacing={1}>
                                    {category.subCategories?.map((sub) => (
                                        <Paper
                                            key={sub.id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.25,
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                spacing={1}
                                            >
                                                <Typography fontWeight={700} variant="body2">
                                                    {sub.name}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={
                                                        sub.isAssetTracked
                                                            ? 'Asset'
                                                            : 'Stock'
                                                    }
                                                    color={
                                                        sub.isAssetTracked
                                                            ? 'primary'
                                                            : 'default'
                                                    }
                                                />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function EmptyState({
                        hasSearch,
                        onCreate,
                    }: {
    hasSearch: boolean;
    onCreate: () => void;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: 7,
                px: 2,
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: '#f8fafc',
            }}
        >
            <Box
                sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 5,
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <Category sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h6" fontWeight={900}>
                {hasSearch ? 'No matching categories found' : 'No categories created yet'}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                {hasSearch
                    ? 'Try searching with another category name, code, or description.'
                    : 'Create your first inventory category to start organizing stock items.'}
            </Typography>

            {!hasSearch && (
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onCreate}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 800,
                    }}
                >
                    Create Category
                </Button>
            )}
        </Paper>
    );
}