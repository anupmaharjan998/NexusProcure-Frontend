import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import SearchIcon from '@mui/icons-material/Search';
import NotesIcon from '@mui/icons-material/Notes';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
    RequisitionDto,
    RequisitionFormRequest,
    RequisitionRequest,
} from '../../types/requisition';
import {
    getInventoryStocks,
    getLeafCategories,
    InventoryCategoryDto,
    InventoryStockDto,
} from '../../services/inventoryService';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RequisitionRequest) => Promise<void>;
    defaultValues?: RequisitionDto;
}

type SnackState = {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
};

const emptyItem = {
    categoryId: '',
    inventoryStockId: '',
    quantity: 1,
    estimatedCost: 0,
    remarks: '',
};

const requisitionSchema: yup.ObjectSchema<RequisitionFormRequest> = yup.object({
    isUrgent: yup.boolean().required(),
    purpose: yup.string().trim().required('Purpose is required'),
    requiredDate: yup.string().nullable().optional(),
    notes: yup.string().optional(),
    items: yup
        .array()
        .of(
            yup.object({
                categoryId: yup.string().required('Category is required'),
                inventoryStockId: yup.string().required('Stock is required'),
                quantity: yup
                    .number()
                    .typeError('Quantity must be a number')
                    .integer('Quantity must be an integer')
                    .min(1, 'Quantity must be at least 1')
                    .required('Quantity is required'),
                estimatedCost: yup
                    .number()
                    .typeError('Unit cost must be a number')
                    .min(0, 'Unit cost cannot be negative')
                    .required('Unit cost is required'),
                remarks: yup.string().optional(),
            })
        )
        .min(1, 'At least one item is required')
        .required(),
});

const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getStockLabel = (stock: InventoryStockDto | null | undefined) => {
    if (!stock) return '';
    return `${stock.name}${stock.sku ? ` - ${stock.sku}` : ''}`;
};

export const RequisitionForm = ({
                                    open,
                                    onClose,
                                    onSubmit,
                                    defaultValues,
                                }: Props) => {
    const [categories, setCategories] = useState<InventoryCategoryDto[]>([]);
    const [stocksByRow, setStocksByRow] = useState<Record<number, InventoryStockDto[]>>({});
    const [stockSearchByRow, setStockSearchByRow] = useState<Record<number, string>>({});
    const [loadingStockRow, setLoadingStockRow] = useState<Record<number, boolean>>({});

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [snackbar, setSnackbar] = useState<SnackState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<RequisitionFormRequest>({
        resolver: yupResolver(requisitionSchema),
        defaultValues: {
            isUrgent: false,
            purpose: '',
            requiredDate: null,
            notes: '',
            items: [{ ...emptyItem }],
        },
    });

    const watchedItems = useWatch({
        control,
        name: 'items',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const totalAmount = useMemo(() => {
        return (
            watchedItems?.reduce((sum, item) => {
                const quantity = Number(item.quantity) || 0;
                const unitCost = Number(item.estimatedCost) || 0;
                return sum + quantity * unitCost;
            }, 0) || 0
        );
    }, [watchedItems]);

    const selectedStockIds = useMemo(() => {
        return (watchedItems || [])
            .map((item) => item.inventoryStockId)
            .filter(Boolean);
    }, [watchedItems]);

    const duplicatedStockIds = useMemo(() => {
        return selectedStockIds.filter(
            (id, index) => selectedStockIds.indexOf(id) !== index
        );
    }, [selectedStockIds]);

    const loadCategories = async () => {
        setLoadingCategories(true);

        try {
            const data = await getLeafCategories();
            setCategories(data || []);
        } catch {
            showSnack('Failed to load categories', 'error');
        } finally {
            setLoadingCategories(false);
        }
    };

    const loadStocksForRow = async (
        rowIndex: number,
        categoryId: string,
        search = ''
    ) => {
        if (!categoryId) {
            setStocksByRow((prev) => ({ ...prev, [rowIndex]: [] }));
            return;
        }

        setLoadingStockRow((prev) => ({ ...prev, [rowIndex]: true }));

        try {
            const res = await getInventoryStocks({
                categoryId,
                search,
                pageNumber: 1,
                pageSize: 100,
            });

            setStocksByRow((prev) => ({
                ...prev,
                [rowIndex]: res.items || [],
            }));
        } catch {
            showSnack('Failed to load stocks for selected category', 'error');
        } finally {
            setLoadingStockRow((prev) => ({ ...prev, [rowIndex]: false }));
        }
    };

    useEffect(() => {
        if (!open) return;
        loadCategories();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        if (defaultValues) {
            reset({
                isUrgent: defaultValues.isUrgent || false,
                purpose: defaultValues.purpose || '',
                requiredDate: defaultValues.requiredDate
                    ? defaultValues.requiredDate.slice(0, 16)
                    : null,
                notes: defaultValues.notes || '',
                items: defaultValues.items?.length
                    ? defaultValues.items.map((item) => ({
                        categoryId: '',
                        inventoryStockId: item.inventoryStockId,
                        quantity: item.quantity,
                        estimatedCost: item.estimatedCost,
                        remarks: item.remarks || '',
                    }))
                    : [{ ...emptyItem }],
            });
        } else {
            reset({
                isUrgent: false,
                purpose: '',
                requiredDate: null,
                notes: '',
                items: [{ ...emptyItem }],
            });

            setStocksByRow({});
            setStockSearchByRow({});
        }
    }, [defaultValues, open, reset]);

    useEffect(() => {
        if (!open) return;

        watchedItems?.forEach((item, index) => {
            const categoryId = item?.categoryId;
            const search = stockSearchByRow[index] || '';

            if (!categoryId) return;

            const timeout = window.setTimeout(() => {
                loadStocksForRow(index, categoryId, search);
            }, 350);

            return () => window.clearTimeout(timeout);
        });
    }, [stockSearchByRow, open]);

    const showSnack = (message: string, severity: SnackState['severity']) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCategoryChange = (
        index: number,
        categoryId: string,
        onChange: (value: string) => void
    ) => {
        onChange(categoryId);

        setValue(`items.${index}.inventoryStockId`, '', {
            shouldValidate: true,
            shouldDirty: true,
        });

        setValue(`items.${index}.estimatedCost`, 0, {
            shouldValidate: true,
            shouldDirty: true,
        });

        setStocksByRow((prev) => ({ ...prev, [index]: [] }));
        setStockSearchByRow((prev) => ({ ...prev, [index]: '' }));

        if (categoryId) {
            loadStocksForRow(index, categoryId, '');
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const submitForm = async (data: RequisitionFormRequest) => {
        if (duplicatedStockIds.length > 0) {
            showSnack('Duplicate stock items are not allowed. Increase quantity instead.', 'error');
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit({
                isUrgent: data.isUrgent,
                purpose: data.purpose.trim(),
                requiredDate: data.requiredDate
                    ? new Date(data.requiredDate).toISOString()
                    : null,
                notes: data.notes?.trim() || '',
                items: data.items.map((item) => ({
                    inventoryStockId: item.inventoryStockId,
                    quantity: Number(item.quantity),
                    estimatedCost: Number(item.estimatedCost),
                    remarks: item.remarks?.trim() || '',
                })),
            });

            showSnack(
                defaultValues
                    ? 'Requisition updated successfully'
                    : 'Requisition created successfully',
                'success'
            );

            onClose();
        } catch (err: any) {
            showSnack(
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                'Failed to submit requisition',
                'error'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const findSelectedStock = (rowIndex: number, stockId: string) => {
        return (stocksByRow[rowIndex] || []).find((stock) => stock.id === stockId) || null;
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5, fontWeight: 700, fontSize: 32 }}>
                    {defaultValues ? 'Edit Requisition' : 'Create Requisition'}
                </DialogTitle>

                <DialogContent dividers sx={{ px: 3, py: 3, bgcolor: '#fafafa' }}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: 'white' }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Controller
                                    name="purpose"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Purpose"
                                            placeholder="Example: Office equipment for new staff"
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            disabled={submitting}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <NotesIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="requiredDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value || ''}
                                            label="Required Date"
                                            type="datetime-local"
                                            fullWidth
                                            disabled={submitting}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Notes"
                                            placeholder="Optional notes"
                                            fullWidth
                                            disabled={submitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="isUrgent"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!field.value}
                                                    onChange={(event) =>
                                                        field.onChange(event.target.checked)
                                                    }
                                                    disabled={submitting}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        Mark as urgent
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Urgent requisitions may increase risk score.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 2.5, bgcolor: 'white' }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                            spacing={2}
                            mb={2}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Inventory2OutlinedIcon color="action" />
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>
                                        Requested Items
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Select category first, then choose stock from that category.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => append({ ...emptyItem })}
                                disabled={submitting}
                            >
                                Add Item
                            </Button>
                        </Stack>

                        {duplicatedStockIds.length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Duplicate stock items are not allowed. Increase quantity instead.
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            {fields.map((field, index) => {
                                const item = watchedItems?.[index];
                                const selectedStock = item?.inventoryStockId
                                    ? findSelectedStock(index, item.inventoryStockId)
                                    : null;

                                const rowStocks = stocksByRow[index] || [];
                                const rowLoading = loadingStockRow[index] || false;

                                const quantity = Number(item?.quantity || 0);
                                const estimatedCost = Number(item?.estimatedCost || 0);
                                const lineTotal = quantity * estimatedCost;

                                const isDuplicate =
                                    !!item?.inventoryStockId &&
                                    duplicatedStockIds.includes(item.inventoryStockId);

                                return (
                                    <Card
                                        key={field.id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 3,
                                            borderColor: isDuplicate ? 'error.main' : 'divider',
                                            bgcolor: isDuplicate ? '#fef2f2' : 'white',
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="flex-start">
                                                <Grid item xs={12} md={3}>
                                                    <Controller
                                                        name={`items.${index}.categoryId`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <TextField
                                                                select
                                                                label="Category"
                                                                value={field.value || ''}
                                                                fullWidth
                                                                disabled={submitting || loadingCategories}
                                                                error={!!fieldState.error}
                                                                helperText={
                                                                    fieldState.error?.message ||
                                                                    'Select category first'
                                                                }
                                                                onChange={(event) =>
                                                                    handleCategoryChange(
                                                                        index,
                                                                        event.target.value,
                                                                        field.onChange
                                                                    )
                                                                }
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <CategoryOutlinedIcon />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            >
                                                                {categories.map((category) => (
                                                                    <MenuItem key={category.id} value={category.id}>
                                                                        {category.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        )}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={4}>
                                                    <Controller
                                                        name={`items.${index}.inventoryStockId`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <Autocomplete
                                                                value={selectedStock}
                                                                inputValue={stockSearchByRow[index] || ''}
                                                                options={rowStocks}
                                                                loading={rowLoading}
                                                                filterOptions={(x) => x}
                                                                getOptionLabel={(option) =>
                                                                    getStockLabel(option)
                                                                }
                                                                isOptionEqualToValue={(option, value) =>
                                                                    option.id === value.id
                                                                }
                                                                onInputChange={(_, value, reason) => {
                                                                    if (reason === 'input' || reason === 'clear') {
                                                                        setStockSearchByRow((prev) => ({
                                                                            ...prev,
                                                                            [index]: value,
                                                                        }));
                                                                    }
                                                                }}
                                                                onChange={(_, stock) => {
                                                                    field.onChange(stock?.id || '');

                                                                    if (stock?.estimatedUnitCost !== undefined) {
                                                                        setValue(
                                                                            `items.${index}.estimatedCost`,
                                                                            Number(stock.estimatedUnitCost || 0),
                                                                            {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={submitting || !item?.categoryId}
                                                                noOptionsText={
                                                                    !item?.categoryId
                                                                        ? 'Select category first'
                                                                        : 'No stock found'
                                                                }
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Stock"
                                                                        placeholder="Search stock"
                                                                        error={!!fieldState.error || isDuplicate}
                                                                        helperText={
                                                                            fieldState.error?.message ||
                                                                            (isDuplicate
                                                                                ? 'Duplicate stock item'
                                                                                : selectedStock
                                                                                    ? `Available: ${
                                                                                        selectedStock.quantityAvailable ??
                                                                                        selectedStock.availableQuantity ??
                                                                                        0
                                                                                    } ${selectedStock.unit || ''}`
                                                                                    : 'Select stock from category')
                                                                        }
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            startAdornment: (
                                                                                <>
                                                                                    <InputAdornment position="start">
                                                                                        <SearchIcon />
                                                                                    </InputAdornment>
                                                                                    {params.InputProps.startAdornment}
                                                                                </>
                                                                            ),
                                                                            endAdornment: (
                                                                                <>
                                                                                    {rowLoading ? (
                                                                                        <CircularProgress size={18} />
                                                                                    ) : null}
                                                                                    {params.InputProps.endAdornment}
                                                                                </>
                                                                            ),
                                                                        }}
                                                                    />
                                                                )}
                                                                renderOption={(props, option) => (
                                                                    <Box component="li" {...props} key={option.id}>
                                                                        <Stack spacing={0.3}>
                                                                            <Typography fontWeight={800}>
                                                                                {option.name}
                                                                                {option.sku ? ` - ${option.sku}` : ''}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Available:{' '}
                                                                                {option.quantityAvailable ??
                                                                                    option.availableQuantity ??
                                                                                    0}{' '}
                                                                                {option.unit || ''}
                                                                            </Typography>
                                                                        </Stack>
                                                                    </Box>
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={4} md={1.3}>
                                                    <Controller
                                                        name={`items.${index}.quantity`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <TextField
                                                                value={field.value ?? ''}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target.value === ''
                                                                            ? ''
                                                                            : parseInt(e.target.value, 10) || 0
                                                                    )
                                                                }
                                                                type="number"
                                                                label="Qty"
                                                                fullWidth
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                inputProps={{ min: 1 }}
                                                                disabled={submitting}
                                                            />
                                                        )}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={4} md={1.5}>
                                                    <Controller
                                                        name={`items.${index}.estimatedCost`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <TextField
                                                                value={field.value ?? ''}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target.value === ''
                                                                            ? ''
                                                                            : parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                type="number"
                                                                label="Unit Cost"
                                                                fullWidth
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                inputProps={{ min: 0, step: 0.01 }}
                                                                disabled={submitting}
                                                            />
                                                        )}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={4} md={1.7}>
                                                    <Controller
                                                        name={`items.${index}.remarks`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                label="Remarks"
                                                                fullWidth
                                                                disabled={submitting}
                                                            />
                                                        )}
                                                    />
                                                </Grid>

                                                <Grid item xs={10} md={0.8}>
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Total
                                                        </Typography>
                                                        <Typography fontWeight={800}>
                                                            {formatCurrency(lineTotal)}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>

                                                <Grid item xs={2} md={0.7}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length === 1 || submitting}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalculateOutlinedIcon fontSize="small" color="action" />
                                <Typography color="text.secondary">
                                    Review the line totals before submitting.
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    label={`${fields.length} item${fields.length > 1 ? 's' : ''}`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Typography variant="h5" fontWeight={800}>
                                    Total: {formatCurrency(totalAmount)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        justifyContent: 'space-between',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {fields.length} item{fields.length > 1 ? 's' : ''} in this requisition
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button onClick={handleClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit(submitForm)}
                            disabled={submitting || duplicatedStockIds.length > 0}
                            startIcon={
                                submitting ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : null
                            }
                            sx={{ px: 3 }}
                        >
                            {defaultValues ? 'Update Requisition' : 'Submit Requisition'}
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>

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
        </>
    );
};