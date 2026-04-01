import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    Chip,
    Divider,
    Grid,
    Link,
    Stack,
    Typography,
    Paper
} from '@mui/material';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import {
    getInventoryItemById,
    assignItem,
    unassignItem
} from '../../services/inventoryService';

export const InventoryItemDetailPage = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        loadItem();
    }, []);

    const loadItem = async () => {
        const res = await getInventoryItemById(id!);
        setItem(res);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'success';
            case 'Assigned': return 'warning';
            case 'Maintenance': return 'error';
            default: return 'default';
        }
    };

    if (!item) return null;

    return (
        <DashboardLayout>
            <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Stack spacing={3}>

                    {/* 🔹 BREADCRUMB */}
                    <Breadcrumbs>
                        <Link onClick={() => navigate('/inventory')} sx={{ cursor: 'pointer' }}>
                            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} /> Back
                        </Link>
                        <Typography>Item Detail</Typography>
                    </Breadcrumbs>

                    {/* 🔹 HEADER */}
                    <Stack direction="row" justifyContent="space-between">

                        <Stack direction="row" spacing={2}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'primary.light',
                                borderRadius: 2
                            }}>
                                <Inventory2OutlinedIcon />
                            </Box>

                            <Box>
                                <Stack direction="row" spacing={1}>
                                    <Typography variant="h5" fontWeight={700}>
                                        {item.name}
                                    </Typography>

                                    <Chip
                                        label={item.status}
                                        color={getStatusColor(item.status)}
                                    />
                                </Stack>

                                <Typography color="text.secondary">
                                    SKU: {item.sku}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* 🔹 ACTIONS */}
                        <Stack direction="row" spacing={1}>

                            <Button
                                variant="contained"
                                disabled={item.status !== 'Available'}
                                onClick={async () => {
                                    await assignItem(item.id, 'USER_ID');
                                    loadItem();
                                }}
                            >
                                Assign
                            </Button>

                            <Button
                                variant="outlined"
                                disabled={item.status !== 'Assigned'}
                                onClick={async () => {
                                    await unassignItem(item.id);
                                    loadItem();
                                }}
                            >
                                Unassign
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => navigate(`/inventory/edit/${id}`)}
                            >
                                Edit
                            </Button>

                        </Stack>
                    </Stack>

                    {/* 🔹 INFO CARDS */}
                    <Grid container spacing={2}>

                        {/* BASIC INFO */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2 }}>
                                <Stack spacing={2}>

                                    <Stack direction="row" spacing={1}>
                                        <CategoryOutlinedIcon />
                                        <Typography>
                                            Category: <b>{item.category}</b>
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" spacing={1}>
                                        <LocationOnOutlinedIcon />
                                        <Typography>
                                            Location: <b>{item.location}</b>
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" spacing={1}>
                                        <PersonOutlineOutlinedIcon />
                                        <Typography>
                                            Assigned To: <b>{item.assignedTo || 'Not Assigned'}</b>
                                        </Typography>
                                    </Stack>

                                    <Divider />

                                    <Typography>
                                        Serial Number: <b>{item.serialNumber || '-'}</b>
                                    </Typography>

                                    <Typography>
                                        Condition: <b>{item.condition}</b>
                                    </Typography>

                                </Stack>
                            </Card>
                        </Grid>

                        {/* BARCODE */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2 }}>
                                <Typography fontWeight={600} mb={2}>
                                    Barcode
                                </Typography>

                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <QrCode2OutlinedIcon sx={{ fontSize: 60 }} />

                                    <Typography mt={1} fontWeight={600}>
                                        {item.barcode}
                                    </Typography>
                                </Paper>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* DESCRIPTION */}
                    <Card sx={{ p: 2 }}>
                        <Typography fontWeight={600} mb={1}>
                            Description
                        </Typography>

                        <Typography>
                            {item.description || 'No description'}
                        </Typography>
                    </Card>

                </Stack>
            </Box>
        </DashboardLayout>
    );
};