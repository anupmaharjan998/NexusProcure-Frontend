import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Avatar,
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
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    CalendarMonth,
    Close,
    HowToReg,
    ManageAccounts,
    Person,
    PersonAdd,
    Search,
    Security,
    WarningAmber,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout.tsx';
import {
    createDelegation,
    deactivateDelegation,
    DelegationDto,
    getDelegationPermissions,
    getDelegations,
} from '../../services/delegationService';
import { searchUsers } from '../../services/inventoryService';

const delegationScopes = ['All'];

const initialForm = {
    userId: '',
    delegateUserId: '',
    startDate: '',
    endDate: '',
    scope: 'All',
    reason: '',
};

const getUserLabel = (user: any) => {
    if (!user) return '';
    return user.fullName || user.name || user.email || '';
};

export default function DelegationPage() {
    const [delegations, setDelegations] = useState<DelegationDto[]>([]);
    const [permissions, setPermissions] = useState({
        canManageAll: false,
        canCreateOwn: false,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [revokingId, setRevokingId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [openCreate, setOpenCreate] = useState(false);
    const [form, setForm] = useState(initialForm);

    const [delegatorInput, setDelegatorInput] = useState('');
    const [delegatorUsers, setDelegatorUsers] = useState<any[]>([]);
    const [selectedDelegator, setSelectedDelegator] = useState<any | null>(null);
    const [searchingDelegators, setSearchingDelegators] = useState(false);

    const [delegateInput, setDelegateInput] = useState('');
    const [delegateUsers, setDelegateUsers] = useState<any[]>([]);
    const [selectedDelegate, setSelectedDelegate] = useState<any | null>(null);
    const [searchingDelegates, setSearchingDelegates] = useState(false);

    const load = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const [permissionData, delegationData] = await Promise.all([
                getDelegationPermissions(),
                getDelegations(),
            ]);

            setPermissions(permissionData);
            setDelegations(delegationData || []);
        } catch {
            setErrorMessage('Failed to load delegations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!openCreate || !permissions.canManageAll) return;

        const query = delegatorInput.trim();

        if (query.length < 2) {
            setDelegatorUsers([]);
            return;
        }

        const timeout = window.setTimeout(async () => {
            setSearchingDelegators(true);

            try {
                const data = await searchUsers(query);
                setDelegatorUsers(data || []);
            } catch {
                setErrorMessage('Failed to search delegator users.');
            } finally {
                setSearchingDelegators(false);
            }
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [delegatorInput, openCreate, permissions.canManageAll]);

    useEffect(() => {
        if (!openCreate) return;

        const query = delegateInput.trim();

        if (query.length < 2) {
            setDelegateUsers([]);
            return;
        }

        const timeout = window.setTimeout(async () => {
            setSearchingDelegates(true);

            try {
                const data = await searchUsers(query);
                setDelegateUsers(data || []);
            } catch {
                setErrorMessage('Failed to search delegate users.');
            } finally {
                setSearchingDelegates(false);
            }
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [delegateInput, openCreate]);

    const stats = useMemo(() => {
        const total = delegations.length;
        const active = delegations.filter((d) => d.status === 'Active').length;
        const scheduled = delegations.filter((d) => d.status === 'Scheduled').length;
        const ended = delegations.filter(
            (d) => d.status === 'Revoked' || d.status === 'Expired'
        ).length;

        return {
            total,
            active,
            scheduled,
            ended,
        };
    }, [delegations]);

    const filteredDelegations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return delegations.filter((delegation) => {
            const matchesSearch =
                !query ||
                delegation.delegatorName.toLowerCase().includes(query) ||
                delegation.delegateName.toLowerCase().includes(query) ||
                delegation.scope.toLowerCase().includes(query) ||
                delegation.status.toLowerCase().includes(query);

            const matchesStatus =
                !statusFilter ||
                delegation.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [delegations, search, statusFilter]);

    const closeCreateDialog = () => {
        if (saving) return;

        setOpenCreate(false);
        setForm(initialForm);

        setDelegatorInput('');
        setDelegatorUsers([]);
        setSelectedDelegator(null);

        setDelegateInput('');
        setDelegateUsers([]);
        setSelectedDelegate(null);
    };

    const canSubmit =
        form.delegateUserId &&
        form.startDate &&
        form.endDate &&
        (!permissions.canManageAll || form.userId);

    const submitCreate = async () => {
        if (!canSubmit) return;

        if (new Date(form.startDate) >= new Date(form.endDate)) {
            setErrorMessage('End date must be after start date.');
            return;
        }

        if (permissions.canManageAll && form.userId === form.delegateUserId) {
            setErrorMessage('Delegator and delegate cannot be the same user.');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await createDelegation({
                userId: permissions.canManageAll ? form.userId : undefined,
                delegateUserId: form.delegateUserId,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                scope: form.scope || 'All',
                reason: form.reason.trim(),
            });

            closeCreateDialog();
            await load();
        } catch {
            setErrorMessage('Failed to create delegation.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        setRevokingId(id);
        setErrorMessage('');

        try {
            await deactivateDelegation(id);
            await load();
        } catch {
            setErrorMessage('Failed to revoke delegation.');
        } finally {
            setRevokingId('');
        }
    };

    const getStatusColor = (status: string) => {
        const value = status.toLowerCase();

        if (value === 'active') return 'success';
        if (value === 'scheduled') return 'primary';
        if (value === 'expired') return 'default';
        if (value === 'revoked') return 'error';

        return 'default';
    };

    const formatDate = (value: string) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString();
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
                                right: -90,
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
                                        width: 68,
                                        height: 68,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.14)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <ManageAccounts sx={{ fontSize: 38 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" fontWeight={900}>
                                        Delegations
                                    </Typography>

                                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
                                        {permissions.canManageAll
                                            ? 'Manage delegation between users across the system.'
                                            : 'Delegate your approval responsibilities to another user.'}
                                    </Typography>
                                </Box>
                            </Stack>

                            {permissions.canCreateOwn && (
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenCreate(true)}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#0f172a',
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.1,
                                        textTransform: 'none',
                                        fontWeight: 900,
                                        '&:hover': {
                                            bgcolor: '#f1f5f9',
                                        },
                                    }}
                                >
                                    Create Delegation
                                </Button>
                            )}
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<ManageAccounts />} title="Total" value={stats.total} helper="All delegations" />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<HowToReg />} title="Active" value={stats.active} helper="Currently valid" />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<CalendarMonth />} title="Scheduled" value={stats.scheduled} helper="Starts later" />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<WarningAmber />} title="Ended" value={stats.ended} helper="Expired or revoked" />
                        </Grid>
                    </Grid>

                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
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
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Delegation Records
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {permissions.canManageAll
                                            ? 'Showing all delegation records.'
                                            : 'Showing your delegation records.'}
                                    </Typography>
                                </Box>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1.5}
                                    sx={{ width: { xs: '100%', md: 'auto' } }}
                                >
                                    <TextField
                                        placeholder="Search users, status..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: { xs: '100%', md: 320 },
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

                                    <TextField
                                        select
                                        label="Status"
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        size="small"
                                        sx={{
                                            minWidth: { xs: '100%', sm: 180 },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                            },
                                        }}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                                        <MenuItem value="Expired">Expired</MenuItem>
                                        <MenuItem value="Revoked">Revoked</MenuItem>
                                    </TextField>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={6}>
                            <CircularProgress />
                        </Box>
                    ) : filteredDelegations.length === 0 ? (
                        <EmptyState onCreate={() => setOpenCreate(true)} canCreate={permissions.canCreateOwn} />
                    ) : (
                        <Grid container spacing={2.5}>
                            {filteredDelegations.map((delegation) => (
                                <Grid item xs={12} md={6} lg={4} key={delegation.id}>
                                    <DelegationCard
                                        delegation={delegation}
                                        getStatusColor={getStatusColor}
                                        formatDate={formatDate}
                                        revoking={revokingId === delegation.id}
                                        onDeactivate={() => handleDeactivate(delegation.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                <Dialog
                    open={openCreate}
                    onClose={closeCreateDialog}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            borderRadius: 5,
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 3,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                >
                                    <PersonAdd />
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Create Delegation
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {permissions.canManageAll
                                            ? 'Choose who is delegating and who will receive delegation.'
                                            : 'Choose who will receive your delegation.'}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Tooltip title="Close">
                                <IconButton onClick={closeCreateDialog} disabled={saving}>
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                                        Type at least 2 characters in the user field to search.
                                    </Alert>

                                    {permissions.canManageAll && (
                                        <UserAutocomplete
                                            label="Delegator User"
                                            placeholder="Type delegator name or email"
                                            value={selectedDelegator}
                                            inputValue={delegatorInput}
                                            options={delegatorUsers}
                                            loading={searchingDelegators}
                                            onInputChange={setDelegatorInput}
                                            onChange={(user) => {
                                                setSelectedDelegator(user);

                                                setDelegatorInput(user ? getUserLabel(user) : '');

                                                setForm({
                                                    ...form,
                                                    userId: user?.id || '',
                                                });
                                            }}
                                        />
                                    )}

                                    <UserAutocomplete
                                        label="Delegate User"
                                        placeholder="Type delegate name or email"
                                        value={selectedDelegate}
                                        inputValue={delegateInput}
                                        options={delegateUsers}
                                        loading={searchingDelegates}
                                        onInputChange={setDelegateInput}
                                        onChange={(user) => {
                                            setSelectedDelegate(user);

                                            setDelegateInput(user ? getUserLabel(user) : '');

                                            setForm({
                                                ...form,
                                                delegateUserId: user?.id || '',
                                            });
                                        }}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Start Date"
                                                type="datetime-local"
                                                value={form.startDate}
                                                onChange={(event) =>
                                                    setForm({
                                                        ...form,
                                                        startDate: event.target.value,
                                                    })
                                                }
                                                fullWidth
                                                required
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="End Date"
                                                type="datetime-local"
                                                value={form.endDate}
                                                onChange={(event) =>
                                                    setForm({
                                                        ...form,
                                                        endDate: event.target.value,
                                                    })
                                                }
                                                fullWidth
                                                required
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>

                                    <TextField
                                        select
                                        label="Delegation Scope"
                                        value={form.scope}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                scope: event.target.value,
                                            })
                                        }
                                        fullWidth
                                    >
                                        {delegationScopes.map((scope) => (
                                            <MenuItem key={scope} value={scope}>
                                                {scope}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        label="Reason / Notes"
                                        placeholder="Example: Delegating approvals while on leave."
                                        value={form.reason}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                reason: event.target.value,
                                            })
                                        }
                                        fullWidth
                                        multiline
                                        minRows={3}
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 4,
                                        bgcolor: '#f8fafc',
                                        height: '100%',
                                    }}
                                >
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
                                            <Security sx={{ fontSize: 30 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                Delegation Preview
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Review before saving.
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <PreviewRow
                                            label="Delegator"
                                            value={
                                                permissions.canManageAll
                                                    ? getUserLabel(selectedDelegator) || 'Not selected'
                                                    : 'Current logged-in user'
                                            }
                                        />

                                        <PreviewRow
                                            label="Delegate"
                                            value={getUserLabel(selectedDelegate) || 'Not selected'}
                                        />

                                        <PreviewRow label="Scope" value={form.scope || 'All'} />
                                        <PreviewRow label="Start" value={form.startDate || 'Not selected'} />
                                        <PreviewRow label="End" value={form.endDate || 'Not selected'} />
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={closeCreateDialog}
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
                            startIcon={<Add />}
                            onClick={submitCreate}
                            disabled={saving || !canSubmit}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 900,
                                px: 3,
                            }}
                        >
                            {saving ? 'Creating...' : 'Create Delegation'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}

function UserAutocomplete({
                              label,
                              placeholder,
                              value,
                              inputValue,
                              options,
                              loading,
                              onInputChange,
                              onChange,
                          }: {
    label: string;
    placeholder: string;
    value: any | null;
    inputValue: string;
    options: any[];
    loading: boolean;
    onInputChange: (value: string) => void;
    onChange: (user: any | null) => void;
}) {
    return (
        <Autocomplete
            value={value}
            inputValue={inputValue}
            options={options}
            loading={loading}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, selected) => option.id === selected.id}
            getOptionLabel={(option) => getUserLabel(option)}
            onInputChange={(_, newInputValue, reason) => {
                if (reason === 'input') {
                    onInputChange(newInputValue);
                }

                if (reason === 'clear') {
                    onInputChange('');
                    onChange(null);
                }
            }}
            onChange={(_, selectedUser) => {
                onChange(selectedUser);
            }}
            noOptionsText={
                inputValue.trim().length < 2
                    ? 'Type at least 2 characters'
                    : 'No users found'
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    fullWidth
                    required
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                            </>
                        ),
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                            {getUserLabel(option).charAt(0).toUpperCase()}
                        </Avatar>

                        <Box>
                            <Typography variant="body2" fontWeight={800}>
                                {getUserLabel(option)}
                            </Typography>

                            {option.email && (
                                <Typography variant="caption" color="text.secondary">
                                    {option.email}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Box>
            )}
        />
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

function DelegationCard({
                            delegation,
                            getStatusColor,
                            formatDate,
                            revoking,
                            onDeactivate,
                        }: {
    delegation: DelegationDto;
    getStatusColor: (status: string) => any;
    formatDate: (value: string) => string;
    revoking: boolean;
    onDeactivate: () => void;
}) {
    const canRevoke =
        delegation.status === 'Active' || delegation.status === 'Scheduled';

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
                                    width: 46,
                                    height: 46,
                                    borderRadius: 3,
                                    bgcolor: '#eff6ff',
                                    color: 'primary.main',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <ManageAccounts />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    {delegation.scope}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    Created {formatDate(delegation.createdAt)}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            size="small"
                            label={delegation.status}
                            color={getStatusColor(delegation.status)}
                            sx={{ fontWeight: 800 }}
                        />
                    </Stack>

                    <Divider />

                    <InfoLine icon={<Person />} label="From" value={delegation.delegatorName} />
                    <InfoLine icon={<PersonAdd />} label="To" value={delegation.delegateName} />
                    <InfoLine icon={<CalendarMonth />} label="Start" value={formatDate(delegation.startDate)} />
                    <InfoLine icon={<CalendarMonth />} label="End" value={formatDate(delegation.endDate)} />

                    {delegation.reason && (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            {delegation.reason}
                        </Alert>
                    )}

                    <Button
                        variant="outlined"
                        color="error"
                        disabled={!canRevoke || revoking}
                        onClick={onDeactivate}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 900,
                        }}
                    >
                        {revoking ? 'Revoking...' : canRevoke ? 'Revoke' : 'Cannot Revoke'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

function InfoLine({
                      icon,
                      label,
                      value,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>
                {icon}
            </Box>

            <Typography variant="body2" color="text.secondary">
                {label}:
            </Typography>

            <Typography variant="body2" fontWeight={800}>
                {value || '-'}
            </Typography>
        </Stack>
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

            <Typography fontWeight={900}>{value}</Typography>
        </Box>
    );
}

function EmptyState({
                        onCreate,
                        canCreate,
                    }: {
    onCreate: () => void;
    canCreate: boolean;
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: 7,
                px: 2,
                borderRadius: 5,
                textAlign: 'center',
                bgcolor: 'white',
            }}
        >
            <Box
                sx={{
                    width: 74,
                    height: 74,
                    borderRadius: 5,
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <ManageAccounts sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h6" fontWeight={900}>
                No delegations found
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Delegation records will appear here.
            </Typography>

            {canCreate && (
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onCreate}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 900,
                    }}
                >
                    Create Delegation
                </Button>
            )}
        </Paper>
    );
}