import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    IconButton,
    Typography,
    Divider,
    MenuItem,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useMemo, useState } from 'react';
import { RequisitionRequest } from '../../types/requisition';
import { getAllCategories } from '../../services/vendorService';

interface CategoryDto {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RequisitionRequest) => Promise<void>;
    defaultValues?: RequisitionRequest;
}

export const RequisitionForm = ({
                                    open,
                                    onClose,
                                    onSubmit,
                                    defaultValues
                                }: Props) => {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Search & filter state
    const [search, setSearch] = useState('');
    const [minCost, setMinCost] = useState<number | ''>('');
    const [maxCost, setMaxCost] = useState<number | ''>('');

    const {
        control,
        handleSubmit,
        watch,
        reset
    } = useForm<RequisitionRequest>({
        defaultValues: defaultValues || {
            categoryId: '',
            isUrgent: false,
            items: [{ itemName: '', quantity: 1, estimatedCost: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const items = watch('items');

    const totalAmount = items?.reduce(
        (sum, i) => sum + (i.quantity || 0) * (i.estimatedCost || 0),
        0
    ) || 0;

    useEffect(() => {
        const loadCategoryData = async () => {
            setLoadingCategories(true);
            try {
                const cats = await getAllCategories();
                setCategories(cats);
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategoryData();
    }, []);

    const handleClose = () => {
        if (!submitting) {
            reset();
            onClose();
        }
    };

    const handleFormSubmit = async (data: RequisitionRequest) => {
        setSubmitting(true);
        try {
            await onSubmit(data);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    };

    // Apply search & filters to UI only
    const filteredFields = useMemo(() => {
        return fields.filter((_, index) => {
            const item = items?.[index];
            if (!item) return false;

            if (
                search &&
                !item.itemName.toLowerCase().includes(search.toLowerCase())
            ) {
                return false;
            }

            if (minCost !== '' && item.estimatedCost < minCost) return false;
            if (maxCost !== '' && item.estimatedCost > maxCost) return false;

            return true;
        });
    }, [fields, items, search, minCost, maxCost]);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>
                {defaultValues ? 'Edit Requisition' : 'Create Requisition'}
            </DialogTitle>

            <DialogContent dividers>
                {/* Category & Urgency */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={8}>
                        <Controller
                            name="categoryId"
                            control={control}
                            rules={{ required: 'Category is required' }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Category"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    disabled={loadingCategories}
                                    InputProps={{
                                        endAdornment: loadingCategories && (
                                            <InputAdornment position="end">
                                                <CircularProgress size={20} />
                                            </InputAdornment>
                                        )
                                    }}
                                >
                                    {categories.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item xs={4} display="flex" alignItems="center">
                        <Controller
                            name="isUrgent"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...field}
                                            checked={field.value}
                                        />
                                    }
                                    label="Urgent Requisition"
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Search & Filters */}
                {/*<Grid container spacing={2} mb={3}>*/}
                {/*    <Grid item xs={6}>*/}
                {/*        <TextField*/}
                {/*            fullWidth*/}
                {/*            label="Search Item"*/}
                {/*            value={search}*/}
                {/*            onChange={e => setSearch(e.target.value)}*/}
                {/*            InputProps={{*/}
                {/*                startAdornment: (*/}
                {/*                    <InputAdornment position="start">*/}
                {/*                        <SearchIcon />*/}
                {/*                    </InputAdornment>*/}
                {/*                )*/}
                {/*            }}*/}
                {/*        />*/}
                {/*    </Grid>*/}

                {/*    <Grid item xs={3}>*/}
                {/*        <TextField*/}
                {/*            type="number"*/}
                {/*            label="Min Cost"*/}
                {/*            fullWidth*/}
                {/*            value={minCost}*/}
                {/*            onChange={e =>*/}
                {/*                setMinCost(*/}
                {/*                    e.target.value === ''*/}
                {/*                        ? ''*/}
                {/*                        : Number(e.target.value)*/}
                {/*                )*/}
                {/*            }*/}
                {/*        />*/}
                {/*    </Grid>*/}

                {/*    <Grid item xs={3}>*/}
                {/*        <TextField*/}
                {/*            type="number"*/}
                {/*            label="Max Cost"*/}
                {/*            fullWidth*/}
                {/*            value={maxCost}*/}
                {/*            onChange={e =>*/}
                {/*                setMaxCost(*/}
                {/*                    e.target.value === ''*/}
                {/*                        ? ''*/}
                {/*                        : Number(e.target.value)*/}
                {/*                )*/}
                {/*            }*/}
                {/*        />*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}

                {/* Items */}
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Requisition Items
                </Typography>

                {filteredFields.length === 0 && (
                    <Typography color="text.secondary" mb={2}>
                        No items match your search or filters.
                    </Typography>
                )}

                <Grid container spacing={2}>
                    {filteredFields.map((field) => {
                        const index = fields.findIndex(f => f.id === field.id);
                        const lineTotal =
                            (items?.[index]?.quantity || 0) *
                            (items?.[index]?.estimatedCost || 0);

                        return (
                            <Grid item xs={12} key={field.id}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={4}>
                                        <Controller
                                            name={`items.${index}.itemName`}
                                            control={control}
                                            rules={{ required: 'Item name required' }}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    {...field}
                                                    label="Item Name"
                                                    fullWidth
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Controller
                                            name={`items.${index}.quantity`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    label="Qty"
                                                    fullWidth
                                                    inputProps={{ min: 1 }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={3}>
                                        <Controller
                                            name={`items.${index}.estimatedCost`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    label="Unit Cost"
                                                    fullWidth
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography fontWeight={600}>
                                            Rs. {lineTotal.toFixed(2)}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={1}>
                                        <IconButton
                                            color="error"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1 || submitting}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>

                <Button
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() =>
                        append({ itemName: '', quantity: 1, estimatedCost: 0 })
                    }
                    disabled={submitting}
                >
                    Add Item
                </Button>

                <Divider sx={{ my: 3 }} />

                <Box display="flex" justifyContent="flex-end">
                    <Typography variant="h6">
                        Total: Rs. {totalAmount.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={submitting}
                    startIcon={
                        submitting ? <CircularProgress size={20} /> : null
                    }
                >
                    {defaultValues ? 'Update Requisition' : 'Create Requisition'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
