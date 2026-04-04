import {
    Alert,
    AlertColor,
    Box,
    Button,
    Card,
    Chip,
    Grid,
    InputAdornment,
    MenuItem,
    Pagination,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    TableContainer,
    Avatar,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { getInventory } from '../../services/inventoryService';

interface InventoryStats {
    totalItems: number;
    assigned: number;
    available: number;
    maintenance: number;
}

interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    category?: string;
    serialNumber?: string | null;
    assignedTo?: string | null;
    status: string;
    location?: string | null;
}

interface InventoryResponse {
    items: InventoryItem[];
    totalCount: number;
    stats: InventoryStats;
}

interface InventoryQuery {
    search: string;
    status: string;
    pageNumber: number;
    pageSize: number;
}

export const InventoryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [data, setData] = useState<InventoryResponse>({
        items: [],
        totalCount: 0,
        stats: {
            totalItems: 0,
            assigned: 0,
            available: 0,
            maintenance: 0,
        },
    });

    const [query, setQuery] = useState<InventoryQuery>({
        search: '',
        status: '',
        pageNumber: 1,
        pageSize: 10,
    });

    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
            severity: AlertColor;
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchData();
    }, [query]);

    useEffect(() => {
        if (location.state?.message) {
            setSnackbar({
                open: true,
                message: location.state.message,
                severity: location.state.severity || 'success',
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getInventory(query);
            setData(res);
        } catch {
            setData({
                items: [],
                totalCount: 0,
                stats: {
                    totalItems: 0,
                    assigned: 0,
                    available: 0,
                    maintenance: 0,
                },
            });

            setSnackbar({
                open: true,
                message: 'Failed to load inventory items',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(data.totalCount / query.pageSize));
    }, [data.totalCount, query.pageSize]);

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Assigned':
                return <Chip label="Assigned" color="warning" size="small" sx={{ fontWeight: 600 }} />;
            case 'Available':
                return <Chip label="Available" color="success" size="small" sx={{ fontWeight: 600 }} />;
            case 'Maintenance':
                return <Chip label="Maintenance" color="error" size="small" sx={{ fontWeight: 600 }} />;
            default:
                return <Chip label={status || 'Unknown'} size="small" />;
        }
    };

    const statCards = [
        {
            label: 'Total Items',
            value: data.stats.totalItems,
            icon: <Inventory2OutlinedIcon />,
        },
        {
            label: 'Assigned',
            value: data.stats.assigned,
            icon: <AssignmentTurnedInOutlinedIcon />,
        },
        {
            label: 'Available',
            value: data.stats.available,
            icon: <CheckCircleOutlineOutlinedIcon />,
        },
        {
            label: 'Maintenance',
            value: data.stats.maintenance,
            icon: <BuildOutlinedIcon />,
        },
    ];

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={800}>
                                Inventory Management
                            </Typography>
                            <Typography color="text.secondary">
                                Manage inventory items, assignments, and stock visibility
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Button
                                variant="outlined"
                                startIcon={<CategoryIcon />}
                                onClick={() => navigate('/inventory/categories')}
                            >
                                Manage Categories
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/inventory/add-item')}
                            >
                                Add Item
                            </Button>
                        </Stack>
                    </Stack>

                    <Grid container spacing={2}>
                        {statCards.map((card) => (
                            <Grid item xs={12} sm={6} lg={3} key={card.label}>
                                <Card
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography color="text.secondary" variant="body2">
                                                {card.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={800} mt={0.5}>
                                                {card.value}
                                            </Typography>
                                        </Box>

                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.lighter',
                                                color: 'primary.main',
                                                width: 48,
                                                height: 48,
                                            }}
                                        >
                                            {card.icon}
                                        </Avatar>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Card
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by item name, SKU, serial number..."
                                    value={query.search}
                                    onChange={(e) =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                            pageNumber: 1,
                                        }))
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={query.status}
                                        label="Status"
                                        onChange={(e) =>
                                            setQuery((prev) => ({
                                                ...prev,
                                                status: e.target.value,
                                                pageNumber: 1,
                                            }))
                                        }
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Assigned">Assigned</MenuItem>
                                        <MenuItem value="Available">Available</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        {data.totalCount} item{data.totalCount !== 1 ? 's' : ''} found
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                        }}
                    >
                        {loading ? (
                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Skeleton variant="rounded" height={52} />
                                    <Skeleton variant="rounded" height={52} />
                                    <Skeleton variant="rounded" height={52} />
                                    <Skeleton variant="rounded" height={52} />
                                </Stack>
                            </Box>
                        ) : data.items.length === 0 ? (
                            <Box sx={{ p: 5, textAlign: 'center' }}>
                                <Inventory2OutlinedIcon
                                    sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }}
                                />
                                <Typography variant="h6" fontWeight={700}>
                                    No inventory items found
                                </Typography>
                                <Typography color="text.secondary" mt={0.5}>
                                    Try changing the filters or add a new inventory item.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/inventory/add-item')}
                                >
                                    Add Item
                                </Button>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Serial No.</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {data.items.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                sx={{
                                                    '&:last-child td': { borderBottom: 0 },
                                                }}
                                            >
                                                <TableCell>
                                                    <Stack spacing={0.25}>
                                                        <Typography fontWeight={700}>{item.name}</Typography>
                                                        {/*<Typography variant="body2" color="text.secondary">*/}
                                                        {/*    ID: {item.id.slice(0, 8)}...*/}
                                                        {/*</Typography>*/}
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>{item.sku || '-'}</TableCell>
                                                <TableCell>{item.category || '-'}</TableCell>
                                                <TableCell>{item.serialNumber || '-'}</TableCell>
                                                <TableCell>{item.assignedTo || 'Not Assigned'}</TableCell>
                                                <TableCell>{getStatusChip(item.status)}</TableCell>
                                                <TableCell>{item.location || '-'}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            startIcon={<VisibilityOutlinedIcon />}
                                                            onClick={() =>
                                                                navigate(`/inventory/item-detail/${item.id}`)
                                                            }
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            startIcon={<EditOutlinedIcon />}
                                                            onClick={() =>
                                                                navigate(`/inventory/item-edit/${item.id}`)
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>

                    {data.items.length > 0 && (
                        <Card
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                spacing={2}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Showing page {query.pageNumber} of {totalPages}
                                </Typography>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Rows per page
                                    </Typography>

                                    <FormControl size="small" sx={{ minWidth: 90 }}>
                                        <Select
                                            value={query.pageSize}
                                            onChange={(e) =>
                                                setQuery((prev) => ({
                                                    ...prev,
                                                    pageSize: Number(e.target.value),
                                                    pageNumber: 1,
                                                }))
                                            }
                                        >
                                            <MenuItem value={5}>5</MenuItem>
                                            <MenuItem value={10}>10</MenuItem>
                                            <MenuItem value={20}>20</MenuItem>
                                            <MenuItem value={50}>50</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Pagination
                                        count={totalPages}
                                        page={query.pageNumber}
                                        color="primary"
                                        shape="rounded"
                                        onChange={(_, page) =>
                                            setQuery((prev) => ({
                                                ...prev,
                                                pageNumber: page,
                                            }))
                                        }
                                    />
                                </Stack>
                            </Stack>
                        </Card>
                    )}

                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
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
                </Stack>
            </Box>
        </DashboardLayout>
    );
};

export default InventoryPage;