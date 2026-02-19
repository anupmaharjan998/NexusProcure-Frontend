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
import {Controller, useForm, useFieldArray} from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {useEffect, useMemo, useState} from 'react';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';

import {RequisitionDto, RequisitionRequest} from '../../types/requisition';
import {getAllCategories} from '../../services/vendorService';

/* ---------------- Types ---------------- */

interface CategoryDto {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RequisitionRequest) => Promise<void>;
    defaultValues?: RequisitionDto;
}

/* ---------------- Yup Schema ---------------- */

const requisitionSchema: yup.ObjectSchema<RequisitionRequest> = yup.object({
    requestedById: yup
        .string()
        .required('Requester is required'),

    categoryId: yup
        .string()
        .required('Category is required'),

    isUrgent: yup.boolean().required(),

    items: yup
        .array()
        .of(
            yup.object({
                itemName: yup
                    .string()
                    .required('Item name is required'),

                quantity: yup
                    .number()
                    .typeError('Quantity must be a number')
                    .integer('Quantity must be an integer')
                    .min(1, 'Quantity must be at least 1')
                    .required('Quantity is required'),

                estimatedCost: yup
                    .number()
                    .typeError('Amount must be a number')
                    .min(1, 'Amount cannot be negative')
                    .required('Unit cost is required')
            })
        )
        .min(1, 'At least one item is required')
        .required()
});

/* ---------------- Component ---------------- */

export const RequisitionForm = ({
                                    open,
                                    onClose,
                                    onSubmit,
                                    defaultValues
                                }: Props) => {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset
    } = useForm<RequisitionRequest>({
        resolver: yupResolver(requisitionSchema),
        defaultValues: defaultValues || {
            categoryId: '',
            isUrgent: false,
            items: [{itemName: '', quantity: 1, estimatedCost: 0}]
        }
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'items'
    });

    const items = watch('items');

    const totalAmount =
        items?.reduce(
            (sum, i) => sum + (i.quantity || 0) * (i.estimatedCost || 0),
            0
        ) || 0;

    /* ---------------- Load Categories ---------------- */

    useEffect(() => {
        const loadCategories = async () => {
            setLoadingCategories(true);
            try {
                const cats = await getAllCategories();
                setCategories(cats);
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    /* ---------------- Handlers ---------------- */

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

    /* ---------------- UI ---------------- */

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
                            render={({field, fieldState}) => (
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
                                                <CircularProgress size={20}/>
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
                            render={({field}) => (
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

                <Divider sx={{mb: 3}}/>

                {/* Items */}
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Requisition Items
                </Typography>

                <Grid container spacing={2}>
                    {fields.map((field, index) => {
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
                                            render={({field, fieldState}) => (
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
                                            render={({field, fieldState}) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    label="Qty"
                                                    fullWidth
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    inputProps={{min: 1}}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={3}>
                                        <Controller
                                            name={`items.${index}.estimatedCost`}
                                            control={control}
                                            render={({field, fieldState}) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    label="Unit Cost"
                                                    fullWidth
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    inputProps={{min: 0, step: 0.01}}
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
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>

                <Button
                    startIcon={<AddIcon/>}
                    sx={{mt: 2}}
                    onClick={() =>
                        append({itemName: '', quantity: 1, estimatedCost: 0})
                    }
                    disabled={submitting}
                >
                    Add Item
                </Button>

                <Divider sx={{my: 3}}/>

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
                    startIcon={submitting ? <CircularProgress size={20}/> : null}
                >
                    {defaultValues ? 'Update Requisition' : 'Create Requisition'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
