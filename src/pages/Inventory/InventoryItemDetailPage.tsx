import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    AssignmentReturn,
    Badge,
    Category,
    CheckCircle,
    History,
    Inventory2,
    LocationOn,
    Notes,
    Person,
    QrCode2,
    Search,
    Tag,
    WarningAmber,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
    assignItem,
    getInventoryItemById,
    searchUsers,
    unassignItem,
} from '../../services/inventoryService';
import { DashboardLayout } from '../../components/Layout/DashboardLayout.tsx';
import { InventoryItemDetailDto } from '../../types/InventoryItemDetailDto.ts';

enum InventoryItemStatus {
    Available = 1,
    Assigned = 2,
    Maintenance = 3,
    Damaged = 4,
    Lost = 5,
    Retired = 6,
}

export default function InventoryItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState<InventoryItemDetailDto | null>(null);

    const [loading, setLoading] = useState(true);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [unassigning, setUnassigning] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [userSearch, setUserSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [notes, setNotes] = useState('');

    const load = async () => {
        if (!id) return;

        setLoading(true);
        setErrorMessage('');

        try {
            const data = await getInventoryItemById(id);
            setItem(data);
        } catch {
            setErrorMessage('Failed to load asset details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    const isAssigned = useMemo(() => {
        if (!item) return false;

        return (
            Number(item.status) === InventoryItemStatus.Assigned ||
            String(item.status).toLowerCase() === 'assigned'
        );
    }, [item]);

    const selectedUser = useMemo(() => {
        return users.find((user) => user.id === selectedUserId);
    }, [users, selectedUserId]);

    const getStatusLabel = (status: unknown) => {
        const value = String(status).toLowerCase();

        if (value === '1') return 'Available';
        if (value === '2') return 'Assigned';
        if (value === '3') return 'Maintenance';
        if (value === '4') return 'Damaged';
        if (value === '5') return 'Lost';
        if (value === '6') return 'Retired';

        return String(status);
    };

    const getConditionLabel = (condition: unknown) => {
        const value = String(condition).toLowerCase();

        if (value === '1') return 'Good';
        if (value === '2') return 'Damaged';
        if (value === '3') return 'Needs Repair';

        return String(condition);
    };

    const getStatusColor = (status: unknown) => {
        const value = String(status).toLowerCase();

        if (value.includes('assigned') || value === '2') return 'warning';
        if (value.includes('available') || value === '1') return 'success';
        if (value.includes('maintenance') || value === '3') return 'info';
        if (
            value.includes('damaged') ||
            value.includes('lost') ||
            value === '4' ||
            value === '5'
        ) {
            return 'error';
        }
        if (value.includes('retired') || value === '6') return 'default';

        return 'default';
    };

    const getConditionColor = (condition: unknown) => {
        const value = String(condition).toLowerCase();

        if (value.includes('good') || value === '1') return 'success';
        if (value.includes('needs') || value.includes('repair') || value === '3') {
            return 'warning';
        }
        if (value.includes('damaged') || value === '2') return 'error';

        return 'default';
    };

    const handleSearchUsers = async () => {
        if (!userSearch.trim()) return;

        setSearchingUsers(true);
        setErrorMessage('');

        try {
            const data = await searchUsers(userSearch.trim());
            setUsers(data || []);
        } catch {
            setErrorMessage('Failed to search users.');
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleAssign = async () => {
        if (!id || !selectedUserId) return;

        setAssigning(true);
        setErrorMessage('');

        try {
            await assignItem(id, selectedUserId, notes.trim());

            setSelectedUserId('');
            setUserSearch('');
            setUsers([]);
            setNotes('');

            await load();
        } catch {
            setErrorMessage('Failed to assign asset.');
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassign = async () => {
        if (!id) return;

        setUnassigning(true);
        setErrorMessage('');

        try {
            await unassignItem(id);
            await load();
        } catch {
            setErrorMessage('Failed to return asset.');
        } finally {
            setUnassigning(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box
                    sx={{
                        minHeight: '100vh',
                        bgcolor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress />
                        <Typography color="text.secondary">
                            Loading asset details...
                        </Typography>
                    </Stack>
                </Box>
            </DashboardLayout>
        );
    }

    if (!item) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 4 }}>
                    <Alert severity="error" sx={{ borderRadius: 3 }}>
                        Asset details could not be found.
                    </Alert>
                </Box>
            </DashboardLayout>
        );
    }

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
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/inventory')}
                        sx={{
                            mb: 3,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 700,
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

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={3}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 68,
                                        height: 68,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Inventory2 sx={{ fontSize: 36 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        {item.name}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mt: 1 }}
                                    >
                                        <Chip
                                            size="small"
                                            label={`SKU: ${item.sku}`}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.14)',
                                                color: 'white',
                                                fontWeight: 700,
                                            }}
                                        />

                                        <Chip
                                            size="small"
                                            label={getStatusLabel(item.status)}
                                            color={getStatusColor(item.status)}
                                            sx={{ fontWeight: 800 }}
                                        />

                                        <Chip
                                            size="small"
                                            label={`Condition: ${getConditionLabel(item.condition)}`}
                                            color={getConditionColor(item.condition)}
                                            sx={{ fontWeight: 800 }}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            {isAssigned ? (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<AssignmentReturn />}
                                    onClick={handleUnassign}
                                    disabled={unassigning}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.1,
                                        textTransform: 'none',
                                        fontWeight: 900,
                                    }}
                                >
                                    {unassigning ? 'Returning...' : 'Return Asset'}
                                </Button>
                            ) : (
                                <Chip
                                    icon={<CheckCircle />}
                                    label="Ready to assign"
                                    color="success"
                                    sx={{
                                        fontWeight: 800,
                                        height: 42,
                                        px: 1,
                                    }}
                                />
                            )}
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {(assigning || unassigning) && (
                        <LinearProgress sx={{ mb: 3, borderRadius: 99 }} />
                    )}

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Asset Information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Complete details of this physical inventory asset.
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<QrCode2 />}
                                                    label="Barcode"
                                                    value={item.barcode || '-'}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<Category />}
                                                    label="Category"
                                                    value={item.category || '-'}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<Tag />}
                                                    label="Serial Number"
                                                    value={item.serialNumber || '-'}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<LocationOn />}
                                                    label="Location"
                                                    value={item.location || '-'}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<Badge />}
                                                    label="Assigned To"
                                                    value={item.assignedTo || 'Not assigned'}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <InfoTile
                                                    icon={<WarningAmber />}
                                                    label="Condition"
                                                    value={getConditionLabel(item.condition)}
                                                    chipColor={getConditionColor(item.condition)}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Divider />

                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                                <Notes color="action" />
                                                <Typography variant="h6" fontWeight={900}>
                                                    Description
                                                </Typography>
                                            </Stack>

                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    bgcolor: '#f8fafc',
                                                    minHeight: 80,
                                                }}
                                            >
                                                <Typography
                                                    color={
                                                        item.description
                                                            ? 'text.primary'
                                                            : 'text.secondary'
                                                    }
                                                >
                                                    {item.description ||
                                                        'No description added for this asset.'}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card
                                elevation={0}
                                sx={{
                                    mt: 3,
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                    <Stack spacing={2.5}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    borderRadius: 3,
                                                    bgcolor: '#eff6ff',
                                                    color: 'primary.main',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                }}
                                            >
                                                <History />
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" fontWeight={900}>
                                                    Assignment History
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Track who used this asset and when it was returned.
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Divider />

                                        {item.assignmentHistory?.length ? (
                                            <Stack spacing={2}>
                                                {item.assignmentHistory.map((history, index) => (
                                                    <Stack
                                                        key={index}
                                                        direction="row"
                                                        spacing={2}
                                                        alignItems="stretch"
                                                    >
                                                        <Stack alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 14,
                                                                    height: 14,
                                                                    borderRadius: '50%',
                                                                    bgcolor: history.returnedDate
                                                                        ? 'success.main'
                                                                        : 'warning.main',
                                                                    mt: 1,
                                                                }}
                                                            />

                                                            {index <
                                                                item.assignmentHistory.length - 1 && (
                                                                    <Box
                                                                        sx={{
                                                                            width: 2,
                                                                            flex: 1,
                                                                            bgcolor: 'divider',
                                                                            mt: 0.5,
                                                                        }}
                                                                    />
                                                                )}
                                                        </Stack>

                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 3,
                                                                bgcolor: '#f8fafc',
                                                                flex: 1,
                                                            }}
                                                        >
                                                            <Stack spacing={0.5}>
                                                                <Typography fontWeight={900}>
                                                                    {history.userName || 'Unknown user'}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    Assigned:{' '}
                                                                    {formatDate(history.assignedDate)}
                                                                </Typography>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    Returned:{' '}
                                                                    {history.returnedDate
                                                                        ? formatDate(history.returnedDate)
                                                                        : 'Not returned'}
                                                                </Typography>

                                                                <Chip
                                                                    size="small"
                                                                    label={
                                                                        history.returnedDate
                                                                            ? 'Returned'
                                                                            : 'Currently assigned'
                                                                    }
                                                                    color={
                                                                        history.returnedDate
                                                                            ? 'success'
                                                                            : 'warning'
                                                                    }
                                                                    sx={{
                                                                        width: 'fit-content',
                                                                        fontWeight: 800,
                                                                        mt: 1,
                                                                    }}
                                                                />
                                                            </Stack>
                                                        </Paper>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <EmptyHistory />
                                        )}
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
                                    {isAssigned ? (
                                        <Stack spacing={2.5}>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 4,
                                                    bgcolor: '#fff7ed',
                                                    color: 'warning.main',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                }}
                                            >
                                                <Person sx={{ fontSize: 30 }} />
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" fontWeight={900}>
                                                    Currently Assigned
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    This asset is already assigned to a user.
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            <InfoTile
                                                icon={<Person />}
                                                label="Assigned To"
                                                value={item.assignedTo || 'Unknown user'}
                                            />

                                            <Button
                                                variant="contained"
                                                color="warning"
                                                startIcon={<AssignmentReturn />}
                                                onClick={handleUnassign}
                                                disabled={unassigning}
                                                fullWidth
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 900,
                                                    py: 1.1,
                                                }}
                                            >
                                                {unassigning
                                                    ? 'Returning...'
                                                    : 'Unassign / Return Asset'}
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack spacing={2.5}>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 4,
                                                    bgcolor: '#eff6ff',
                                                    color: 'primary.main',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                }}
                                            >
                                                <Person sx={{ fontSize: 30 }} />
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" fontWeight={900}>
                                                    Assign Asset
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Search for a user and assign this asset with optional notes.
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    label="Search User"
                                                    placeholder="Name or email"
                                                    value={userSearch}
                                                    onChange={(event) =>
                                                        setUserSearch(event.target.value)
                                                    }
                                                    onKeyDown={(event) =>
                                                        event.key === 'Enter' && handleSearchUsers()
                                                    }
                                                    fullWidth
                                                    size="small"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Search />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />

                                                <Tooltip title="Search users">
                                                    <span>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleSearchUsers}
                                                            disabled={
                                                                searchingUsers || !userSearch.trim()
                                                            }
                                                            sx={{
                                                                minHeight: 40,
                                                                borderRadius: 3,
                                                                textTransform: 'none',
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            {searchingUsers ? '...' : 'Search'}
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            </Stack>

                                            <TextField
                                                select
                                                label="Select User"
                                                value={selectedUserId}
                                                onChange={(event) =>
                                                    setSelectedUserId(event.target.value)
                                                }
                                                fullWidth
                                                size="small"
                                                disabled={users.length === 0}
                                                helperText={
                                                    users.length === 0
                                                        ? 'Search users first.'
                                                        : `${users.length} user(s) found.`
                                                }
                                            >
                                                {users.map((user) => (
                                                    <MenuItem key={user.id} value={user.id}>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1.5}
                                                            alignItems="center"
                                                        >
                                                            <Avatar sx={{ width: 28, height: 28 }}>
                                                                {(
                                                                    user.fullName ||
                                                                    user.name ||
                                                                    user.email ||
                                                                    '?'
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </Avatar>

                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={800}
                                                                >
                                                                    {user.fullName ||
                                                                        user.name ||
                                                                        user.email}
                                                                </Typography>
                                                                {user.email && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {user.email}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </TextField>

                                            {selectedUser && (
                                                <Alert severity="success" sx={{ borderRadius: 3 }}>
                                                    Selected user:{' '}
                                                    <strong>
                                                        {selectedUser.fullName ||
                                                            selectedUser.name ||
                                                            selectedUser.email}
                                                    </strong>
                                                </Alert>
                                            )}

                                            <TextField
                                                label="Assignment Notes"
                                                placeholder="Example: Assigned for office use"
                                                value={notes}
                                                onChange={(event) => setNotes(event.target.value)}
                                                fullWidth
                                                multiline
                                                minRows={3}
                                            />

                                            <Button
                                                variant="contained"
                                                startIcon={<CheckCircle />}
                                                onClick={handleAssign}
                                                disabled={assigning || !selectedUserId}
                                                fullWidth
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    fontWeight: 900,
                                                    py: 1.1,
                                                }}
                                            >
                                                {assigning ? 'Assigning...' : 'Assign Asset'}
                                            </Button>
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

function InfoTile({
                      icon,
                      label,
                      value,
                      chipColor,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    chipColor?: any;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'white',
                height: '100%',
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        color: 'text.secondary',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>

                    {chipColor ? (
                        <Chip
                            size="small"
                            label={value}
                            color={chipColor}
                            sx={{ mt: 0.5, fontWeight: 800 }}
                        />
                    ) : (
                        <Typography fontWeight={800} noWrap title={value}>
                            {value}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}

function EmptyHistory() {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: 5,
                px: 2,
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: '#f8fafc',
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 4,
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <History sx={{ fontSize: 32 }} />
            </Box>

            <Typography fontWeight={900}>No assignment history</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Assignment activity will appear here after this asset is assigned.
            </Typography>
        </Paper>
    );
}

function formatDate(value: string) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}