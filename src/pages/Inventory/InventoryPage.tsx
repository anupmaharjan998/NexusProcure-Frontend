import { Box, Card, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody, Stack, Button, Chip, Pagination, Badge, Snackbar, Alert, AlertColor, Select, MenuItem, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInventory } from '../../services/inventoryService';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory2';

export const InventoryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [data, setData] = useState<any>({ items: [], totalCount: 0, stats: { totalItems: 0, assigned: 0, available: 0, maintenance: 0 }});
    const [query, setQuery] = useState({ search: '', status: '', pageNumber: 1, pageSize: 8 });

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchData();
    }, [query]);

    useEffect(() => {
        if (location.state?.message) {
            setSnackbar({ open: true, message: location.state.message, severity: location.state.severity || 'success' });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchData = async () => {
        try {
            const res = await getInventory(query);
            setData(res);
        } catch {
            setData({ items: [], totalCount: 0, stats: { totalItems: 0, assigned: 0, available: 0, maintenance: 0 } });
        }
    };

    const getStatusChip = (status: string) => {
        switch(status) {
            case 'Assigned': return <Chip label="Assigned" color="success" size="small" />;
            case 'Available': return <Chip label="Available" color="warning" size="small" />;
            case 'Maintenance': return <Chip label="Maintenance" color="error" size="small" />;
            default: return <Chip label="Unknown" size="small" />;
        }
    };

    return (
        <DashboardLayout>
            <Box p={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h5" fontWeight={700}>Inventory Management</Typography>
                        <Typography color="text.secondary">Manage your inventory items and stock levels</Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => navigate('/inventory/categories')}>Manage Categories</Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/inventory/add-item')}>Add Item</Button>
                    </Stack>
                </Stack>

                <Grid container spacing={2} mt={2}>
                    {[{label:'Total Items',value:data.stats.totalItems},{label:'Assigned',value:data.stats.assigned},{label:'Available',value:data.stats.available},{label:'Maintenance',value:data.stats.maintenance }].map((c,i)=>(
                        <Grid item xs={12} md={3} key={i}><Card sx={{p:2}}><Typography color="text.secondary">{c.label}</Typography><Typography variant="h5" fontWeight={700}>{c.value}</Typography></Card></Grid>
                    ))}
                </Grid>

                <Card sx={{p:2, mt:2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth placeholder="Search by name, SKU..." onChange={e=>setQuery({...query,search:e.target.value,pageNumber:1})}/>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Select fullWidth value={query.status} displayEmpty onChange={e=>setQuery({...query,status:e.target.value,pageNumber:1})}>
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="Available">Available</MenuItem>
                                <MenuItem value="Maintenance">Maintenance</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </Card>

                <Card sx={{mt:2}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>SKU</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Serial No.</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.items.map((item:any)=>(
                                <TableRow key={item.id} hover>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell><Typography fontWeight={600}>{item.name}</Typography></TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.serialNumber}</TableCell>
                                    <TableCell>{item.assignedTo}</TableCell>
                                    <TableCell>{getStatusChip(item.status)}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" onClick={()=>navigate(`/inventory/item-detail/${item.id}`)}>View</Button>
                                            <Button size="small" onClick={()=>navigate(`/inventory/edit/${item.id}`)}>Edit</Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Box mt={2} display="flex" justifyContent="center">
                    <Pagination count={Math.ceil(data.totalCount/query.pageSize)} page={query.pageNumber} onChange={(_,page)=>setQuery({...query,pageNumber:page})}/>
                </Box>

                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={()=>setSnackbar({...snackbar,open:false})}>
                    <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
};