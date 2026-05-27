import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    Category,
    Close,
    Edit,
    Inventory2,
    LaptopMac,
    LocationOn,
    Numbers,
    QrCode2,
    Search,
    Straighten,
    WarningAmber,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    createInventoryItem,
    createInventoryStock,
    getInventory,
    getInventoryStocks,
    getLeafCategories,
    updateInventoryItem,
    updateInventoryStock,
    InventoryItemDto,
    InventoryStockDto,
} from '../../services/inventoryService';
import { DashboardLayout } from '../../components/Layout/DashboardLayout.tsx';
import { InventoryCategoryDto } from '../../types/InventoryCategoryDto.ts';
import {InventoryItemCondition} from "../../types/enum/InventoryItemCondition.ts";
import {InventoryItemStatus} from "../../types/enum/InventoryItemStatus.ts";


const inventoryItemStatusOptions = [
    { label: 'Available', value: InventoryItemStatus.Available, apiValue: 'Available' },
    { label: 'Assigned', value: InventoryItemStatus.Assigned, apiValue: 'Assigned' },
    { label: 'Maintenance', value: InventoryItemStatus.Maintenance, apiValue: 'Maintenance' },
    { label: 'Damaged', value: InventoryItemStatus.Damaged, apiValue: 'Damaged' },
    { label: 'Lost', value: InventoryItemStatus.Lost, apiValue: 'Lost' },
    { label: 'Retired', value: InventoryItemStatus.Retired, apiValue: 'Retired' },
];

const inventoryItemConditionOptions = [
    { label: 'Good', value: InventoryItemCondition.Good },
    { label: 'Damaged', value: InventoryItemCondition.Damaged },
    { label: 'Needs Repair', value: InventoryItemCondition.NeedsRepair },
];

const initialStockForm = {
    name: '',
    categoryId: '',
    openingQuantity: 0,
    unit: 'pcs',
    reorderLevel: 5,
};

const initialAssetForm = {
    stockId: '',
    serialNumber: '',
    description: '',
    location: 'Inventory',
};

const initialEditStockForm = {
    name: '',
    categoryId: '',
    unit: 'pcs',
    reorderLevel: 5,
};

const initialEditAssetForm = {
    serialNumber: '',
    description: '',
    location: 'Inventory',
    status: InventoryItemStatus.Available,
    condition: InventoryItemCondition.Good,
};

export default function InventoryPage() {
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);

    const [stocks, setStocks] = useState<InventoryStockDto[]>([]);
    const [assetStockOptions, setAssetStockOptions] = useState<InventoryStockDto[]>([]);
    const [assets, setAssets] = useState<InventoryItemDto[]>([]);
    const [categories, setCategories] = useState<InventoryCategoryDto[]>([]);

    const [loading, setLoading] = useState(false);

    const [savingStock, setSavingStock] = useState(false);
    const [savingAsset, setSavingAsset] = useState(false);
    const [savingEditStock, setSavingEditStock] = useState(false);
    const [savingEditAsset, setSavingEditAsset] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const [search, setSearch] = useState('');
    const [stockStatus, setStockStatus] = useState('');
    const [assetStatus, setAssetStatus] = useState('');

    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [openAssetDialog, setOpenAssetDialog] = useState(false);
    const [openEditStockDialog, setOpenEditStockDialog] = useState(false);
    const [openEditAssetDialog, setOpenEditAssetDialog] = useState(false);

    const [stockForm, setStockForm] = useState(initialStockForm);
    const [assetForm, setAssetForm] = useState(initialAssetForm);

    const [editingStock, setEditingStock] = useState<InventoryStockDto | null>(null);
    const [editingAsset, setEditingAsset] = useState<InventoryItemDto | null>(null);

    const [editStockForm, setEditStockForm] = useState(initialEditStockForm);
    const [editAssetForm, setEditAssetForm] = useState(initialEditAssetForm);

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === stockForm.categoryId),
        [categories, stockForm.categoryId]
    );

    const selectedEditCategory = useMemo(
        () => categories.find((category) => category.id === editStockForm.categoryId),
        [categories, editStockForm.categoryId]
    );

    const assetTrackedStocks = assetStockOptions;

    const selectedAssetStock = useMemo(
        () => assetTrackedStocks.find((stock) => stock.id === assetForm.stockId),
        [assetTrackedStocks, assetForm.stockId]
    );

    const stockStats = useMemo(() => {
        const total = stocks.length;
        const lowStock = stocks.filter((stock) => stock.status === 'LowStock').length;
        const outOfStock = stocks.filter((stock) => stock.status === 'OutOfStock').length;
        const assetTracked = stocks.filter((stock) => stock.isAssetTracked).length;

        return {
            total,
            lowStock,
            outOfStock,
            assetTracked,
        };
    }, [stocks]);

    const assetStats = useMemo(() => {
        const total = assets.length;
        const available = assets.filter((asset) => String(asset.status) === 'Available').length;
        const assigned = assets.filter((asset) => String(asset.status) === 'Assigned').length;
        const maintenance = assets.filter((asset) => String(asset.status) === 'Maintenance').length;

        return {
            total,
            available,
            assigned,
            maintenance,
        };
    }, [assets]);

    const getStatusLabel = (value: number | string) => {
        const numericValue = Number(value);
        return (
            inventoryItemStatusOptions.find((option) => option.value === numericValue)?.label ||
            String(value)
        );
    };

    const getConditionLabel = (value: number | string) => {
        const numericValue = Number(value);
        return (
            inventoryItemConditionOptions.find((option) => option.value === numericValue)?.label ||
            String(value)
        );
    };

    const normalizeStatus = (status: unknown): InventoryItemStatus => {
        if (typeof status === 'number') {
            return status as InventoryItemStatus;
        }

        const matched = inventoryItemStatusOptions.find(
            (option) => option.apiValue === String(status)
        );

        return matched?.value || InventoryItemStatus.Available;
    };

    const normalizeCondition = (condition: unknown): InventoryItemCondition => {
        if (typeof condition === 'number') {
            return condition as InventoryItemCondition;
        }

        const matched = inventoryItemConditionOptions.find(
            (option) =>
                option.label.replace(/\s/g, '').toLowerCase() ===
                String(condition).replace(/\s/g, '').toLowerCase()
        );

        return matched?.value || InventoryItemCondition.Good;
    };

    const loadCategories = async () => {
        const res = await getLeafCategories();
        setCategories(res || []);
    };

    const loadStocks = async () => {
        setLoading(true);

        try {
            const res = await getInventoryStocks({
                search,
                status: stockStatus as any,
                pageNumber: 1,
                pageSize: 50,
            });

            setStocks(res.items || []);
        } finally {
            setLoading(false);
        }
    };

    const loadAssetStockOptions = async () => {
        const res = await getInventoryStocks({
            pageNumber: 1,
            pageSize: 100,
        });

        setAssetStockOptions(
            (res.items || []).filter((stock: InventoryStockDto) => stock.isAssetTracked)
        );
    };

    const loadAssets = async () => {
        setLoading(true);

        try {
            const res = await getInventory({
                search,
                status: assetStatus,
                pageNumber: 1,
                pageSize: 50,
            });

            setAssets(res.items || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
        loadStocks();
        loadAssetStockOptions();
    }, []);

    useEffect(() => {
        if (tab === 0) {
            loadStocks();
        } else {
            loadAssets();
        }
    }, [tab, stockStatus, assetStatus]);

    const handleSearch = () => {
        if (tab === 0) {
            loadStocks();
        } else {
            loadAssets();
        }
    };

    const closeStockDialog = () => {
        if (savingStock) return;

        setOpenStockDialog(false);
        setStockForm(initialStockForm);
    };

    const closeAssetDialog = () => {
        if (savingAsset) return;

        setOpenAssetDialog(false);
        setAssetForm(initialAssetForm);
    };

    const closeEditStockDialog = () => {
        if (savingEditStock) return;

        setOpenEditStockDialog(false);
        setEditingStock(null);
        setEditStockForm(initialEditStockForm);
    };

    const closeEditAssetDialog = () => {
        if (savingEditAsset) return;

        setOpenEditAssetDialog(false);
        setEditingAsset(null);
        setEditAssetForm(initialEditAssetForm);
    };

    const submitStock = async () => {
        if (!stockForm.name.trim() || !stockForm.categoryId) return;

        setSavingStock(true);
        setErrorMessage('');

        try {
            await createInventoryStock({
                name: stockForm.name.trim(),
                categoryId: stockForm.categoryId,
                openingQuantity: Number(stockForm.openingQuantity),
                unit: stockForm.unit.trim() || 'pcs',
                reorderLevel: Number(stockForm.reorderLevel),
            });

            closeStockDialog();
            await loadStocks();
            await loadAssetStockOptions();
        } finally {
            setSavingStock(false);
        }
    };

    const submitAsset = async () => {
        if (!assetForm.stockId) return;

        const selectedStock = assetTrackedStocks.find(
            (stock) => stock.id === assetForm.stockId
        );

        if (!selectedStock) return;

        setSavingAsset(true);
        setErrorMessage('');

        try {
            await createInventoryItem({
                name: selectedStock.name,
                stockId: assetForm.stockId,
                serialNumber: assetForm.serialNumber.trim(),
                description: assetForm.description.trim(),
                location: assetForm.location.trim() || 'Inventory',
            });

            closeAssetDialog();

            if (tab === 0) {
                setTab(1);
            }

            await loadAssets();
        } finally {
            setSavingAsset(false);
        }
    };

    const openEditStock = (stock: InventoryStockDto) => {
        setEditingStock(stock);

        setEditStockForm({
            name: stock.name || '',
            categoryId: (stock as any).categoryId || '',
            unit: stock.unit || 'pcs',
            reorderLevel: Number(stock.reorderLevel || 0),
        });

        setOpenEditStockDialog(true);
    };

    const submitEditStock = async () => {
        if (!editingStock || !editStockForm.name.trim()) return;

        setSavingEditStock(true);
        setErrorMessage('');

        try {
            await updateInventoryStock(editingStock.id, {
                name: editStockForm.name.trim(),
                categoryId: editStockForm.categoryId || (editingStock as any).categoryId,
                unit: editStockForm.unit.trim() || 'pcs',
                reorderLevel: Number(editStockForm.reorderLevel),
            });

            closeEditStockDialog();
            await loadStocks();
            await loadAssetStockOptions();
        } finally {
            setSavingEditStock(false);
        }
    };

    const openEditAsset = (asset: InventoryItemDto) => {
        setEditingAsset(asset);

        setEditAssetForm({
            serialNumber: asset.serialNumber || '',
            description: asset.description || '',
            location: asset.location || 'Inventory',
            status: normalizeStatus(asset.status),
            condition: normalizeCondition(asset.condition),
        });

        setOpenEditAssetDialog(true);
    };

    const submitEditAsset = async () => {
        if (!editingAsset) return;

        const inventoryCategoryId = (editingAsset as any).inventoryCategoryId;

        if (!inventoryCategoryId) {
            setErrorMessage(
                'Cannot update asset because inventoryCategoryId is missing from the asset API response.'
            );
            console.error('Missing inventoryCategoryId in editingAsset:', editingAsset);
            return;
        }

        setSavingEditAsset(true);
        setErrorMessage('');

        try {
            await updateInventoryItem(editingAsset.id, {
                name: editingAsset.name,
                inventoryCategoryId,
                serialNumber: editAssetForm.serialNumber.trim(),
                description: editAssetForm.description.trim(),
                location: editAssetForm.location.trim() || 'Inventory',
                status: Number(editAssetForm.status),
                condition: Number(editAssetForm.condition),
            });

            closeEditAssetDialog();
            await loadAssets();
        } finally {
            setSavingEditAsset(false);
        }
    };

    const getStockChipColor = (status: string) => {
        if (status === 'OutOfStock') return 'error';
        if (status === 'LowStock') return 'warning';
        return 'success';
    };

    const getAssetChipColor = (status: string | number) => {
        const statusNumber = Number(status);

        if (statusNumber === InventoryItemStatus.Available || status === 'Available') return 'success';
        if (statusNumber === InventoryItemStatus.Assigned || status === 'Assigned') return 'primary';
        if (statusNumber === InventoryItemStatus.Maintenance || status === 'Maintenance') return 'warning';
        if (
            statusNumber === InventoryItemStatus.Damaged ||
            statusNumber === InventoryItemStatus.Lost ||
            status === 'Damaged' ||
            status === 'Lost'
        ) {
            return 'error';
        }

        return 'default';
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
                <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
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
                                right: -80,
                                top: -100,
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
                                        width: 64,
                                        height: 64,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Inventory2 sx={{ fontSize: 34 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Inventory
                                    </Typography>

                                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
                                        Manage stock catalog items and physical asset records.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenStockDialog(true)}
                                    fullWidth
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#0f172a',
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.1,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        '&:hover': {
                                            bgcolor: '#f1f5f9',
                                        },
                                    }}
                                >
                                    Add Stock
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<LaptopMac />}
                                    onClick={() => setOpenAssetDialog(true)}
                                    fullWidth
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.45)',
                                        color: 'white',
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.1,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.08)',
                                        },
                                    }}
                                >
                                    Add Asset
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {tab === 0 ? (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<Inventory2 />} title="Total Stock" value={stockStats.total} helper="Catalog items" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<WarningAmber />} title="Low Stock" value={stockStats.lowStock} helper="Needs attention" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<WarningAmber />} title="Out of Stock" value={stockStats.outOfStock} helper="Unavailable items" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<LaptopMac />} title="Asset Tracked" value={stockStats.assetTracked} helper="Can create assets" />
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<LaptopMac />} title="Total Assets" value={assetStats.total} helper="Physical records" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<Inventory2 />} title="Available" value={assetStats.available} helper="Ready to assign" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<QrCode2 />} title="Assigned" value={assetStats.assigned} helper="Currently in use" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<WarningAmber />} title="Maintenance" value={assetStats.maintenance} helper="Needs service" />
                                </Grid>
                            </>
                        )}
                    </Grid>

                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                        }}
                    >
                        {loading && <LinearProgress />}

                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Tabs
                                value={tab}
                                onChange={(_, value) => setTab(value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 800,
                                    },
                                }}
                            >
                                <Tab icon={<Inventory2 />} iconPosition="start" label="Stock Catalog" />
                                <Tab icon={<LaptopMac />} iconPosition="start" label="Asset Items" />
                            </Tabs>

                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                alignItems={{ xs: 'stretch', md: 'center' }}
                            >
                                <TextField
                                    fullWidth
                                    placeholder={
                                        tab === 0
                                            ? 'Search stock name, SKU, category...'
                                            : 'Search asset name, serial number, assigned user...'
                                    }
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                                    sx={{
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

                                {tab === 0 ? (
                                    <TextField
                                        select
                                        label="Stock Status"
                                        value={stockStatus}
                                        onChange={(event) => setStockStatus(event.target.value)}
                                        sx={{ minWidth: { xs: '100%', md: 220 } }}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="InStock">In Stock</MenuItem>
                                        <MenuItem value="LowStock">Low Stock</MenuItem>
                                        <MenuItem value="OutOfStock">Out of Stock</MenuItem>
                                    </TextField>
                                ) : (
                                    <TextField
                                        select
                                        label="Asset Status"
                                        value={assetStatus}
                                        onChange={(event) => setAssetStatus(event.target.value)}
                                        sx={{ minWidth: { xs: '100%', md: 220 } }}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        {inventoryItemStatusOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.apiValue}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}

                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        borderRadius: 3,
                                        px: 4,
                                        minHeight: 54,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                    }}
                                >
                                    Search
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={6}>
                            <CircularProgress />
                        </Box>
                    ) : tab === 0 ? (
                        stocks.length === 0 ? (
                            <EmptyState
                                title="No stock items found"
                                description="Create your first stock item to start managing inventory."
                                buttonText="Add Stock"
                                icon={<Inventory2 />}
                                onClick={() => setOpenStockDialog(true)}
                            />
                        ) : (
                            <Grid container spacing={2.5}>
                                {stocks.map((stock) => (
                                    <Grid item xs={12} md={6} lg={4} key={stock.id}>
                                        <StockCard
                                            stock={stock}
                                            getStockChipColor={getStockChipColor}
                                            onEdit={() => openEditStock(stock)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )
                    ) : assets.length === 0 ? (
                        <EmptyState
                            title="No asset items found"
                            description="Create physical asset records for asset-tracked stock items."
                            buttonText="Add Asset"
                            icon={<LaptopMac />}
                            onClick={() => setOpenAssetDialog(true)}
                        />
                    ) : (
                        <Grid container spacing={2.5}>
                            {assets.map((asset) => (
                                <Grid item xs={12} md={6} lg={4} key={asset.id}>
                                    <AssetCard
                                        asset={asset}
                                        getStatusLabel={getStatusLabel}
                                        getAssetChipColor={getAssetChipColor}
                                        onEdit={() => openEditAsset(asset)}
                                        onView={() => navigate(`/inventory/assets/${asset.id}`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                <Dialog open={openStockDialog} onClose={closeStockDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ pb: 1 }}>
                        <DialogHeader
                            icon={<Inventory2 />}
                            title="Add Stock Item"
                            subtitle="Create a requestable catalog item and define its starting quantity."
                            onClose={closeStockDialog}
                        />
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                                        Stock items are requestable catalog items. Asset-tracked categories can have physical asset records.
                                    </Alert>

                                    <TextField
                                        label="Stock Name"
                                        value={stockForm.name}
                                        onChange={(event) => setStockForm({ ...stockForm, name: event.target.value })}
                                        fullWidth
                                        required
                                        autoFocus
                                    />

                                    <TextField
                                        select
                                        label="Category"
                                        value={stockForm.categoryId}
                                        onChange={(event) => setStockForm({ ...stockForm, categoryId: event.target.value })}
                                        fullWidth
                                        required
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
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                                    <Typography>{category.name}</Typography>
                                                    <Chip
                                                        size="small"
                                                        label={category.isAssetTracked ? 'Asset Tracked' : 'Stock Only'}
                                                        color={category.isAssetTracked ? 'primary' : 'default'}
                                                    />
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {selectedCategory && (
                                        <Alert severity={selectedCategory.isAssetTracked ? 'warning' : 'success'} sx={{ borderRadius: 3 }}>
                                            {selectedCategory.isAssetTracked
                                                ? 'This stock can have physical asset records.'
                                                : 'This is stock-only. No individual asset records will be created.'}
                                        </Alert>
                                    )}

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Opening Quantity"
                                                type="number"
                                                value={stockForm.openingQuantity}
                                                onChange={(event) => setStockForm({ ...stockForm, openingQuantity: Number(event.target.value) })}
                                                fullWidth
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
                                                value={stockForm.unit}
                                                onChange={(event) => setStockForm({ ...stockForm, unit: event.target.value })}
                                                fullWidth
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
                                                value={stockForm.reorderLevel}
                                                onChange={(event) => setStockForm({ ...stockForm, reorderLevel: Number(event.target.value) })}
                                                fullWidth
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
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <PreviewCard title="Stock Preview" icon={<Inventory2 />}>
                                    <PreviewRow label="Name" value={stockForm.name.trim() || 'Not entered'} />
                                    <PreviewRow label="Category" value={selectedCategory?.name || 'Not selected'} />
                                    <Chip
                                        size="small"
                                        label={`${stockForm.openingQuantity || 0} ${stockForm.unit || 'pcs'}`}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ width: 'fit-content' }}
                                    />
                                </PreviewCard>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeStockDialog} disabled={savingStock} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={submitStock}
                            disabled={savingStock || !stockForm.name.trim() || !stockForm.categoryId}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 3 }}
                        >
                            {savingStock ? 'Creating...' : 'Create Stock'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openAssetDialog} onClose={closeAssetDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ pb: 1 }}>
                        <DialogHeader
                            icon={<LaptopMac />}
                            title="Add Physical Asset"
                            subtitle="Create an individual asset record for an asset-tracked stock item."
                            onClose={closeAssetDialog}
                        />
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    {assetTrackedStocks.length === 0 ? (
                                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                            No asset-tracked stock items found. Create an asset-tracked stock item first.
                                        </Alert>
                                    ) : (
                                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                                            Choose an asset-tracked stock item, then enter the physical asset details.
                                        </Alert>
                                    )}

                                    <TextField
                                        select
                                        label="Asset Stock"
                                        value={assetForm.stockId}
                                        onChange={(event) => setAssetForm({ ...assetForm, stockId: event.target.value })}
                                        fullWidth
                                        required
                                        disabled={assetTrackedStocks.length === 0}
                                    >
                                        {assetTrackedStocks.map((stock) => (
                                            <MenuItem key={stock.id} value={stock.id}>
                                                {stock.name} - {stock.sku}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        label="Serial Number"
                                        value={assetForm.serialNumber}
                                        onChange={(event) => setAssetForm({ ...assetForm, serialNumber: event.target.value })}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Location"
                                        value={assetForm.location}
                                        onChange={(event) => setAssetForm({ ...assetForm, location: event.target.value })}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Description"
                                        value={assetForm.description}
                                        onChange={(event) => setAssetForm({ ...assetForm, description: event.target.value })}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <PreviewCard title="Asset Preview" icon={<LaptopMac />}>
                                    <PreviewRow label="Stock" value={selectedAssetStock?.name || 'Not selected'} />
                                    <PreviewRow label="SKU" value={selectedAssetStock?.sku || 'N/A'} />
                                    <PreviewRow label="Serial Number" value={assetForm.serialNumber.trim() || 'Not entered'} />
                                    <PreviewRow label="Location" value={assetForm.location.trim() || 'Inventory'} />
                                </PreviewCard>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeAssetDialog} disabled={savingAsset} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<LaptopMac />}
                            onClick={submitAsset}
                            disabled={savingAsset || !assetForm.stockId}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 3 }}
                        >
                            {savingAsset ? 'Creating...' : 'Create Asset'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openEditStockDialog} onClose={closeEditStockDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ pb: 1 }}>
                        <DialogHeader
                            icon={<Edit />}
                            title="Edit Stock Item"
                            subtitle="Update stock name, category, unit, and reorder settings."
                            onClose={closeEditStockDialog}
                        />
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Stock Name"
                                        value={editStockForm.name}
                                        onChange={(event) => setEditStockForm({ ...editStockForm, name: event.target.value })}
                                        fullWidth
                                        required
                                        autoFocus
                                    />

                                    <TextField
                                        select
                                        label="Category"
                                        value={editStockForm.categoryId}
                                        onChange={(event) => setEditStockForm({ ...editStockForm, categoryId: event.target.value })}
                                        fullWidth
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {selectedEditCategory && (
                                        <Alert severity={selectedEditCategory.isAssetTracked ? 'warning' : 'success'} sx={{ borderRadius: 3 }}>
                                            {selectedEditCategory.isAssetTracked
                                                ? 'This category supports physical asset records.'
                                                : 'This category is stock-only.'}
                                        </Alert>
                                    )}

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Unit"
                                                value={editStockForm.unit}
                                                onChange={(event) => setEditStockForm({ ...editStockForm, unit: event.target.value })}
                                                fullWidth
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Reorder Level"
                                                type="number"
                                                value={editStockForm.reorderLevel}
                                                onChange={(event) => setEditStockForm({ ...editStockForm, reorderLevel: Number(event.target.value) })}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <PreviewCard title="Edit Preview" icon={<Inventory2 />}>
                                    <PreviewRow label="Stock Name" value={editStockForm.name.trim() || 'Not entered'} />
                                    <PreviewRow label="Category" value={selectedEditCategory?.name || editingStock?.categoryName || 'Not selected'} />
                                    <PreviewRow label="Unit" value={editStockForm.unit || 'pcs'} />
                                </PreviewCard>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeEditStockDialog} disabled={savingEditStock} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={submitEditStock}
                            disabled={savingEditStock || !editStockForm.name.trim()}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 3 }}
                        >
                            {savingEditStock ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openEditAssetDialog} onClose={closeEditAssetDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ pb: 1 }}>
                        <DialogHeader
                            icon={<Edit />}
                            title="Edit Physical Asset"
                            subtitle="Update asset status, condition, serial number, location, and description."
                            onClose={closeEditAssetDialog}
                        />
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Asset Name"
                                        value={editingAsset?.name || ''}
                                        fullWidth
                                        disabled
                                        helperText="Asset name comes from the linked stock item."
                                    />

                                    <TextField
                                        label="Serial Number"
                                        value={editAssetForm.serialNumber}
                                        onChange={(event) => setEditAssetForm({ ...editAssetForm, serialNumber: event.target.value })}
                                        fullWidth
                                        autoFocus
                                    />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                label="Location"
                                                value={editAssetForm.location}
                                                onChange={(event) => setEditAssetForm({ ...editAssetForm, location: event.target.value })}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOn />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                select
                                                label="Status"
                                                value={editAssetForm.status}
                                                onChange={(event) =>
                                                    setEditAssetForm({
                                                        ...editAssetForm,
                                                        status: Number(event.target.value),
                                                    })
                                                }
                                                fullWidth
                                            >
                                                {inventoryItemStatusOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                select
                                                label="Condition"
                                                value={editAssetForm.condition}
                                                onChange={(event) =>
                                                    setEditAssetForm({
                                                        ...editAssetForm,
                                                        condition: Number(event.target.value),
                                                    })
                                                }
                                                fullWidth
                                            >
                                                {inventoryItemConditionOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                    </Grid>

                                    <TextField
                                        label="Description"
                                        value={editAssetForm.description}
                                        onChange={(event) => setEditAssetForm({ ...editAssetForm, description: event.target.value })}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <PreviewCard title="Asset Preview" icon={<LaptopMac />}>
                                    <PreviewRow label="Asset" value={editingAsset?.name || 'Not selected'} />
                                    <PreviewRow label="SKU" value={editingAsset?.sku || 'N/A'} />
                                    <PreviewRow label="Serial Number" value={editAssetForm.serialNumber.trim() || 'Not entered'} />
                                    <PreviewRow label="Location" value={editAssetForm.location.trim() || 'Inventory'} />

                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip
                                            size="small"
                                            label={getStatusLabel(editAssetForm.status)}
                                            color={getAssetChipColor(editAssetForm.status)}
                                            sx={{ width: 'fit-content', fontWeight: 700 }}
                                        />

                                        <Chip
                                            size="small"
                                            label={getConditionLabel(editAssetForm.condition)}
                                            variant="outlined"
                                            sx={{ width: 'fit-content', fontWeight: 700 }}
                                        />
                                    </Stack>
                                </PreviewCard>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={closeEditAssetDialog} disabled={savingEditAsset} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={submitEditAsset}
                            disabled={savingEditAsset}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 3 }}
                        >
                            {savingEditAsset ? 'Saving...' : 'Save Changes'}
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
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#eff6ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
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

function StockCard({
                       stock,
                       getStockChipColor,
                       onEdit,
                   }: {
    stock: InventoryStockDto;
    getStockChipColor: (status: string) => any;
    onEdit: () => void;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                height: '100%',
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
                            <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: '#eff6ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                                <Inventory2 />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {stock.name}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    SKU: {stock.sku}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip size="small" label={stock.status} color={getStockChipColor(stock.status)} sx={{ fontWeight: 700 }} />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        Category: <b>{stock.categoryName}</b>
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
                        <Stack direction="row" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Available
                                </Typography>

                                <Typography variant="h5" fontWeight={900}>
                                    {stock.quantityAvailable} {stock.unit}
                                </Typography>
                            </Box>

                            <Box textAlign="right">
                                <Typography variant="caption" color="text.secondary">
                                    Reorder Level
                                </Typography>

                                <Typography fontWeight={800}>
                                    {stock.reorderLevel}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Chip
                        size="small"
                        label={stock.isAssetTracked ? 'Asset Tracked' : 'Stock Only'}
                        color={stock.isAssetTracked ? 'primary' : 'default'}
                        sx={{ width: 'fit-content', fontWeight: 700 }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={onEdit}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}
                    >
                        Edit Stock
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

function AssetCard({
                       asset,
                       getStatusLabel,
                       getAssetChipColor,
                       onEdit,
                       onView,
                   }: {
    asset: InventoryItemDto;
    getStatusLabel: (status: string | number) => string;
    getAssetChipColor: (status: string | number) => any;
    onEdit: () => void;
    onView: () => void;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                height: '100%',
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
                            <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: '#eff6ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                                <LaptopMac />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {asset.name}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    SKU: {asset.sku}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            size="small"
                            label={getStatusLabel(asset.status as any)}
                            color={getAssetChipColor(asset.status as any)}
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Category: <b>{asset.category}</b>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Serial: <b>{asset.serialNumber || '-'}</b>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Location: <b>{asset.location || '-'}</b>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Assigned To: <b>{asset.assignedTo || 'Not assigned'}</b>
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" startIcon={<Edit />} onClick={onEdit} fullWidth sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>
                            Edit
                        </Button>

                        <Button variant="outlined" onClick={onView} fullWidth sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>
                            Details
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function EmptyState({
                        title,
                        description,
                        buttonText,
                        icon,
                        onClick,
                    }: {
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Paper variant="outlined" sx={{ py: 7, px: 2, borderRadius: 5, textAlign: 'center', bgcolor: 'white' }}>
            <Box sx={{ width: 74, height: 74, borderRadius: 5, bgcolor: '#eff6ff', color: 'primary.main', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
                {icon}
            </Box>

            <Typography variant="h6" fontWeight={900}>
                {title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                {description}
            </Typography>

            <Button variant="contained" startIcon={<Add />} onClick={onClick} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>
                {buttonText}
            </Button>
        </Paper>
    );
}

function DialogHeader({
                          icon,
                          title,
                          subtitle,
                          onClose,
                      }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClose: () => void;
}) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'primary.main', color: 'white', display: 'grid', placeItems: 'center' }}>
                    {icon}
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight={900}>
                        {title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Stack>

            <Tooltip title="Close">
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

function PreviewCard({
                         title,
                         icon,
                         children,
                     }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, bgcolor: '#f8fafc', height: '100%' }}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#eff6ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                        {icon}
                    </Box>

                    <Box>
                        <Typography fontWeight={900}>{title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Review before saving
                        </Typography>
                    </Box>
                </Stack>

                <Divider />

                {children}
            </Stack>
        </Paper>
    );
}

function PreviewRow({
                        label,
                        value,
                    }: {
    label: string;
    value: string;
}) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>

            <Typography fontWeight={800}>{value}</Typography>
        </Box>
    );
}