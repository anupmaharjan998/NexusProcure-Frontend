import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
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
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { RequisitionDto, RequisitionRequest } from '../../types/requisition';
import {
    createItem,
    getItemsByCategory,
    getLeafCategories,
} from '../../services/requisitionService';

interface CategoryDto {
    id: string;
    name: string;
}

interface ItemDto {
    id: string;
    name: string;
}

interface RequisitionItemForm {
    itemName: string;
    quantity: number;
    estimatedCost: number;
}

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

const requisitionSchema: yup.ObjectSchema<RequisitionRequest> = yup.object({
    categoryId: yup.string().required('Category is required'),
    isUrgent: yup.boolean().required(),
    items: yup
        .array()
        .of(
            yup.object({
                itemName: yup.string().trim().required('Item name is required'),
                quantity: yup
                    .number()
                    .typeError('Quantity must be a number')
                    .integer('Quantity must be an integer')
                    .min(1, 'Quantity must be at least 1')
                    .required('Quantity is required'),
                estimatedCost: yup
                    .number()
                    .typeError('Unit cost must be a number')
                    .min(1, 'Unit cost must be at least 1')
                    .required('Unit cost is required'),
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

export const RequisitionForm = ({
                                    open,
                                    onClose,
                                    onSubmit,
                                    defaultValues,
                                }: Props) => {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [itemsByCategory, setItemsByCategory] = useState<ItemDto[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [creatingItemRows, setCreatingItemRows] = useState<Record<number, boolean>>({});
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
        getValues,
        formState: { errors },
    } = useForm<RequisitionRequest>({
        resolver: yupResolver(requisitionSchema),
        defaultValues: defaultValues || {
            categoryId: '',
            isUrgent: false,
            items: [{ itemName: '', quantity: 1, estimatedCost: 0 }],
        },
    });

    const selectedCategory = useWatch({
        control,
        name: 'categoryId',
    });

    const watchedItems = useWatch({
        control,
        name: 'items',
    }) as RequisitionItemForm[] | undefined;

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'items',
    });

    const totalAmount = useMemo(() => {
        return (
            watchedItems?.reduce((sum: number, item: RequisitionItemForm) => {
                const quantity = Number(item.quantity) || 0;
                const unitCost = Number(item.estimatedCost) || 0;
                return sum + quantity * unitCost;
            }, 0) || 0
        );
    }, [watchedItems]);

    useEffect(() => {
        if (!open) return;

        const loadCategories = async () => {
            setLoadingCategories(true);
            try {
                const data = await getLeafCategories();
                setCategories(data);
            } catch {
                setSnackbar({
                    open: true,
                    message: 'Failed to load categories',
                    severity: 'error',
                });
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [open]);

    useEffect(() => {
        const loadItems = async () => {
            if (!selectedCategory) {
                setItemsByCategory([]);
                return;
            }

            setLoadingItems(true);
            try {
                const data = await getItemsByCategory(selectedCategory);
                setItemsByCategory(data);
            } catch {
                setItemsByCategory([]);
                setSnackbar({
                    open: true,
                    message: 'Failed to load items for selected category',
                    severity: 'error',
                });
            } finally {
                setLoadingItems(false);
            }
        };

        loadItems();
    }, [selectedCategory]);

    useEffect(() => {
        if (!open) return;

        if (defaultValues) {
            reset(defaultValues);
        } else {
            reset({
                categoryId: '',
                isUrgent: false,
                items: [{ itemName: '', quantity: 1, estimatedCost: 0 }],
            });
        }
    }, [defaultValues, open, reset]);

    const showSnack = (message: string, severity: SnackState['severity']) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const refreshItemsForCategory = async (categoryId: string) => {
        const data = await getItemsByCategory(categoryId);
        setItemsByCategory(data);
        return data;
    };

    const createItemFromRow = async (rowIndex: number) => {
        const categoryId = getValues('categoryId');
        const itemName = getValues(`items.${rowIndex}.itemName`)?.trim();

        if (!categoryId) {
            showSnack('Please select a category first', 'error');
            return;
        }

        if (!itemName) {
            showSnack('Please enter an item name', 'error');
            return;
        }

        const exists = itemsByCategory.some(
            (item: ItemDto) => item.name.trim().toLowerCase() === itemName.toLowerCase()
        );

        if (exists) {
            showSnack('Item already exists in this category', 'info');
            return;
        }

        setCreatingItemRows((prev) => ({ ...prev, [rowIndex]: true }));

        try {
            const created = await createItem({
                name: itemName,
                description: '',
                categoryId,
            });

            const refreshed = await refreshItemsForCategory(categoryId);

            const createdItem =
                refreshed.find((item: ItemDto) => item.id === created.id) ||
                refreshed.find(
                    (item: ItemDto) =>
                        item.name.trim().toLowerCase() === itemName.toLowerCase()
                );

            if (createdItem) {
                setValue(`items.${rowIndex}.itemName`, createdItem.name, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            }

            showSnack(`Item "${itemName}" created successfully`, 'success');
        } catch (err: any) {
            showSnack(
                err?.response?.data?.message || `Failed to create item "${itemName}"`,
                'error'
            );
        } finally {
            setCreatingItemRows((prev) => ({ ...prev, [rowIndex]: false }));
        }
    };

    const handleCategoryChange = (newCategoryId: string) => {
        const currentCategoryId = getValues('categoryId');
        if (currentCategoryId === newCategoryId) return;

        setValue('categoryId', newCategoryId, {
            shouldValidate: true,
            shouldDirty: true,
        });

        replace([{ itemName: '', quantity: 1, estimatedCost: 0 }]);
    };

    const handleFormSubmit = async (data: RequisitionRequest) => {
        setSubmitting(true);

        try {
            await onSubmit(data);
            showSnack(
                defaultValues
                    ? 'Requisition updated successfully'
                    : 'Requisition created successfully',
                'success'
            );
            onClose();
        } catch (err: any) {
            showSnack(
                err?.response?.data?.message || 'Failed to submit requisition',
                'error'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const filterOptions = (options: ItemDto[], params: { inputValue: string }) => {
        const input = params.inputValue.trim().toLowerCase();
        if (!input) return options;
        return options.filter((item: ItemDto) =>
            item.name.toLowerCase().includes(input)
        );
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
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <CategoryOutlinedIcon fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Category
                                    </Typography>
                                </Stack>

                                <Controller
                                    name="categoryId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            value={field.value || ''}
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            disabled={loadingCategories || submitting}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            placeholder="Select category"
                                            InputProps={{
                                                endAdornment: loadingCategories ? (
                                                    <CircularProgress size={18} />
                                                ) : undefined,
                                            }}
                                        >
                                            {categories.map((cat: CategoryDto) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: { xs: 'flex-start', md: 'center' },
                                        pt: { xs: 0, md: 3.5 },
                                    }}
                                >
                                    <Controller
                                        name="isUrgent"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.checked)
                                                        }
                                                        disabled={submitting}
                                                    />
                                                }
                                                label="Urgent Requisition"
                                            />
                                        )}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 2.5, bgcolor: 'white' }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Inventory2OutlinedIcon fontSize="small" color="action" />
                                <Typography variant="h6" fontWeight={700}>
                                    Requisition Items
                                </Typography>
                            </Stack>

                            <Button
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    append({
                                        itemName: '',
                                        quantity: 1,
                                        estimatedCost: 0,
                                    })
                                }
                                disabled={submitting}
                            >
                                Add Item
                            </Button>
                        </Stack>

                        <Stack spacing={2}>
                            {fields.map((row, index) => {
                                const quantity =
                                    Number(watchedItems?.[index]?.quantity) || 0;
                                const unitCost =
                                    Number(watchedItems?.[index]?.estimatedCost) || 0;
                                const lineTotal = quantity * unitCost;
                                const isCreatingThisRow = !!creatingItemRows[index];

                                return (
                                    <Paper
                                        key={row.id}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: '#fcfcfd',
                                        }}
                                    >
                                        <Grid container spacing={2} alignItems="flex-start">
                                            <Grid item xs={12} md={5}>
                                                <Controller
                                                    name={`items.${index}.itemName`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <Autocomplete
                                                            freeSolo
                                                            options={itemsByCategory}
                                                            filterOptions={filterOptions}
                                                            loading={loadingItems}
                                                            getOptionLabel={(option) =>
                                                                typeof option === 'string'
                                                                    ? option
                                                                    : option.name
                                                            }
                                                            value={field.value || ''}
                                                            onChange={(_, value) => {
                                                                if (typeof value === 'string') {
                                                                    field.onChange(value);
                                                                } else {
                                                                    field.onChange(value?.name || '');
                                                                }
                                                            }}
                                                            onInputChange={(_, value, reason) => {
                                                                if (reason === 'input') {
                                                                    field.onChange(value);
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Item Name"
                                                                    error={!!fieldState.error}
                                                                    helperText={
                                                                        fieldState.error?.message ||
                                                                        'Select existing item or type a new one and press Enter'
                                                                    }
                                                                    onKeyDown={async (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const currentValue = getValues(
                                                                                `items.${index}.itemName`
                                                                            )?.trim();

                                                                            const hasText = !!currentValue;
                                                                            const exists =
                                                                                itemsByCategory.some(
                                                                                    (item: ItemDto) =>
                                                                                        item.name
                                                                                            .trim()
                                                                                            .toLowerCase() ===
                                                                                        currentValue?.toLowerCase()
                                                                                );

                                                                            if (hasText && !exists) {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                await createItemFromRow(index);
                                                                            }
                                                                        }
                                                                    }}
                                                                    InputProps={{
                                                                        ...params.InputProps,
                                                                        endAdornment: (
                                                                            <>
                                                                                {isCreatingThisRow && (
                                                                                    <CircularProgress
                                                                                        size={18}
                                                                                        sx={{ mr: 1 }}
                                                                                    />
                                                                                )}
                                                                                {loadingItems && (
                                                                                    <CircularProgress
                                                                                        size={18}
                                                                                        sx={{ mr: 1 }}
                                                                                    />
                                                                                )}
                                                                                {params.InputProps.endAdornment}
                                                                            </>
                                                                        ),
                                                                    }}
                                                                />
                                                            )}
                                                            disabled={
                                                                !selectedCategory ||
                                                                submitting ||
                                                                isCreatingThisRow
                                                            }
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={4} md={2}>
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

                                            <Grid item xs={12} sm={4} md={2.5}>
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

                                            <Grid item xs={10} sm={3} md={2}>
                                                <Box
                                                    sx={{
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        minHeight: 56,
                                                        pt: { xs: 0, md: 0.5 },
                                                    }}
                                                >
                                                    <Typography fontWeight={700}>
                                                        {formatCurrency(lineTotal)}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={2} sm={1} md={0.5}>
                                                <Box
                                                    sx={{
                                                        height: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}
                                                >
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length === 1 || submitting}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
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

                            <Typography variant="h5" fontWeight={800}>
                                Total: {formatCurrency(totalAmount)}
                            </Typography>
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
                            onClick={handleSubmit(handleFormSubmit)}
                            disabled={submitting}
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