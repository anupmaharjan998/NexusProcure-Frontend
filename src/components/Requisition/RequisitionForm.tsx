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

type RequisitionFormValues = {
    isUrgent: boolean;
    purpose: string;
    notes?: string;
    items: {
        inventoryStockId: string;
        quantity: number;
        estimatedCost: number;
        remarks?: string;
    }[];
};

const emptyItem = {
    inventoryStockId: '',
    quantity: 1,
    estimatedCost: 0,
    remarks: '',
};

const requisitionSchema: yup.ObjectSchema<RequisitionFormValues> = yup.object({
    isUrgent: yup.boolean().required(),
    purpose: yup.string().trim().required('Purpose is required'),
    notes: yup.string().optional(),
    items: yup
        .array()
        .of(
            yup.object({
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
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [stocks, setStocks] = useState<InventoryStockDto[]>([]);
    const [stockSearchByRow, setStockSearchByRow] = useState<Record<number, string>>({});

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingStocks, setLoadingStocks] = useState(false);
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
    } = useForm<RequisitionFormValues>({
        resolver: yupResolver(requisitionSchema),
        defaultValues: {
            isUrgent: false,
            purpose: '',
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

    const selectedCategory = useMemo(() => {
        return categories.find((category) => category.id === selectedCategoryId) || null;
    }, [categories, selectedCategoryId]);

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

    const showSnack = (message: string, severity: SnackState['severity']) => {
        setSnackbar({ open: true, message, severity });
    };

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

    const loadStocksForCategory = async (categoryId: string) => {
        if (!categoryId) {
            setStocks([]);
            return;
        }

        setLoadingStocks(true);

        try {
            const res = await getInventoryStocks({
                categoryId,
                pageNumber: 1,
                pageSize: 200,
            });

            setStocks(res.items || []);
        } catch {
            showSnack('Failed to load stocks for selected category', 'error');
        } finally {
            setLoadingStocks(false);
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
                notes: defaultValues.notes || '',
                items: defaultValues.items?.length
                    ? defaultValues.items.map((item) => ({
                        inventoryStockId: item.inventoryStockId,
                        quantity: item.quantity,
                        estimatedCost: item.estimatedCost,
                        remarks: item.remarks || '',
                    }))
                    : [{ ...emptyItem }],
            });

            setSelectedCategoryId('');
            setStocks([]);
            setStockSearchByRow({});
        } else {
            reset({
                isUrgent: false,
                purpose: '',
                notes: '',
                items: [{ ...emptyItem }],
            });

            setSelectedCategoryId('');
            setStocks([]);
            setStockSearchByRow({});
        }
    }, [defaultValues, open, reset]);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setStockSearchByRow({});

        watchedItems?.forEach((_, index) => {
            setValue(`items.${index}.inventoryStockId`, '', {
                shouldValidate: true,
                shouldDirty: true,
            });

            setValue(`items.${index}.estimatedCost`, 0, {
                shouldValidate: true,
                shouldDirty: true,
            });
        });

        loadStocksForCategory(categoryId);
    };

    const handleAddItem = () => {
        append({ ...emptyItem });
    };

    const handleRemoveItem = (index: number) => {
        remove(index);

        setStockSearchByRow((prev) => {
            const next: Record<number, string> = {};

            Object.entries(prev).forEach(([key, value]) => {
                const numericKey = Number(key);

                if (numericKey < index) {
                    next[numericKey] = value;
                }

                if (numericKey > index) {
                    next[numericKey - 1] = value;
                }
            });

            return next;
        });
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const submitForm = async (data: RequisitionFormValues) => {
        if (!selectedCategoryId) {
            showSnack('Please select a category before submitting requisition.', 'error');
            return;
        }

        if (duplicatedStockIds.length > 0) {
            showSnack('Duplicate stock items are not allowed. Increase quantity instead.', 'error');
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit({
                isUrgent: data.isUrgent,
                purpose: data.purpose.trim(),
                requiredDate: null,
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

    const findSelectedStock = (stockId: string) => {
        return stocks.find((stock) => stock.id === stockId) || null;
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
                                <TextField
                                    select
                                    label="Category"
                                    value={selectedCategoryId}
                                    onChange={(event) =>
                                        handleCategoryChange(event.target.value)
                                    }
                                    fullWidth
                                    required
                                    disabled={submitting || loadingCategories}
                                    error={!selectedCategoryId && Boolean(errors.items)}
                                    helperText={
                                        selectedCategoryId
                                            ? 'All requested items must be from this category'
                                            : 'Select one category for this requisition'
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
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Urgent requisitions may increase risk score.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {selectedCategory && (
                            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                This requisition is limited to the{' '}
                                <strong>{selectedCategory.name}</strong> category.
                            </Alert>
                        )}
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
                                        Add items from the selected category only.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddItem}
                                disabled={submitting || !selectedCategoryId}
                            >
                                Add Item
                            </Button>
                        </Stack>

                        {!selectedCategoryId && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Please select a category before choosing stock items.
                            </Alert>
                        )}

                        {duplicatedStockIds.length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Duplicate stock items are not allowed. Increase quantity instead.
                            </Alert>
                        )}

                        <Stack spacing={2}>
                            {fields.map((fieldArrayItem, index) => {
                                const item = watchedItems?.[index];

                                const selectedStock = item?.inventoryStockId
                                    ? findSelectedStock(item.inventoryStockId)
                                    : null;

                                const quantity = Number(item?.quantity || 0);
                                const estimatedCost = Number(item?.estimatedCost || 0);
                                const lineTotal = quantity * estimatedCost;

                                const isDuplicate =
                                    !!item?.inventoryStockId &&
                                    duplicatedStockIds.includes(item.inventoryStockId);

                                return (
                                    <Card
                                        key={fieldArrayItem.id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 3,
                                            borderColor: isDuplicate ? 'error.main' : 'divider',
                                            bgcolor: isDuplicate ? '#fef2f2' : 'white',
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="flex-start">
                                                <Grid item xs={12} md={5}>
                                                    <Controller
                                                        name={`items.${index}.inventoryStockId`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <Autocomplete
                                                                value={selectedStock}
                                                                inputValue={
                                                                    stockSearchByRow[index] ??
                                                                    getStockLabel(selectedStock)
                                                                }
                                                                options={stocks}
                                                                loading={loadingStocks}
                                                                getOptionLabel={(option) =>
                                                                    getStockLabel(option)
                                                                }
                                                                isOptionEqualToValue={(option, value) =>
                                                                    option.id === value.id
                                                                }
                                                                getOptionDisabled={(option) =>
                                                                    selectedStockIds.includes(option.id) &&
                                                                    option.id !== item?.inventoryStockId
                                                                }
                                                                onInputChange={(_, value, reason) => {
                                                                    if (
                                                                        reason === 'input' ||
                                                                        reason === 'clear'
                                                                    ) {
                                                                        setStockSearchByRow((prev) => ({
                                                                            ...prev,
                                                                            [index]: value,
                                                                        }));
                                                                    }

                                                                    if (reason === 'clear') {
                                                                        field.onChange('');

                                                                        setValue(
                                                                            `items.${index}.estimatedCost`,
                                                                            0,
                                                                            {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                onChange={(_, stock) => {
                                                                    field.onChange(stock?.id || '');

                                                                    setStockSearchByRow((prev) => ({
                                                                        ...prev,
                                                                        [index]: stock
                                                                            ? getStockLabel(stock)
                                                                            : '',
                                                                    }));

                                                                    setValue(
                                                                        `items.${index}.estimatedCost`,
                                                                        Number(
                                                                            stock?.estimatedUnitCost || 0
                                                                        ),
                                                                        {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                        }
                                                                    );
                                                                }}
                                                                disabled={submitting || !selectedCategoryId}
                                                                noOptionsText={
                                                                    !selectedCategoryId
                                                                        ? 'Select category first'
                                                                        : 'No stock found'
                                                                }
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        label="Stock"
                                                                        placeholder="Search stock"
                                                                        error={
                                                                            !!fieldState.error || isDuplicate
                                                                        }
                                                                        helperText={
                                                                            fieldState.error?.message ||
                                                                            (isDuplicate
                                                                                ? 'Duplicate stock item'
                                                                                : selectedStock
                                                                                    ? `Available: ${
                                                                                        selectedStock.quantityAvailable ??
                                                                                        0
                                                                                    } ${
                                                                                        selectedStock.unit || ''
                                                                                    }`
                                                                                    : 'Select stock from selected category')
                                                                        }
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            startAdornment: (
                                                                                <>
                                                                                    <InputAdornment position="start">
                                                                                        <SearchIcon />
                                                                                    </InputAdornment>
                                                                                    {
                                                                                        params.InputProps
                                                                                            .startAdornment
                                                                                    }
                                                                                </>
                                                                            ),
                                                                            endAdornment: (
                                                                                <>
                                                                                    {loadingStocks ? (
                                                                                        <CircularProgress size={18} />
                                                                                    ) : null}
                                                                                    {
                                                                                        params.InputProps
                                                                                            .endAdornment
                                                                                    }
                                                                                </>
                                                                            ),
                                                                        }}
                                                                    />
                                                                )}
                                                                renderOption={(props, option) => (
                                                                    <Box
                                                                        component="li"
                                                                        {...props}
                                                                        key={option.id}
                                                                    >
                                                                        <Stack spacing={0.3}>
                                                                            <Typography fontWeight={800}>
                                                                                {option.name}
                                                                                {option.sku
                                                                                    ? ` - ${option.sku}`
                                                                                    : ''}
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                            >
                                                                                Available:{' '}
                                                                                {option.quantityAvailable ??
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

                                                <Grid item xs={12} sm={4} md={1.5}>
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
                                                                            : parseInt(
                                                                            e.target.value,
                                                                            10
                                                                        ) || 0
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

                                                <Grid item xs={12} sm={4} md={1.8}>
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
                                                                            : parseFloat(
                                                                            e.target.value
                                                                        ) || 0
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

                                                <Grid item xs={12} sm={4} md={2}>
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

                                                <Grid item xs={10} md={1}>
                                                    <Stack spacing={0.5}>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
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
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={
                                                            fields.length === 1 || submitting
                                                        }
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
                                    label={`${fields.length} item${
                                        fields.length > 1 ? 's' : ''
                                    }`}
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
                        {fields.length} item{fields.length > 1 ? 's' : ''} in this
                        requisition
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button onClick={handleClose} disabled={submitting}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit(submitForm)}
                            disabled={
                                submitting ||
                                duplicatedStockIds.length > 0 ||
                                !selectedCategoryId
                            }
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