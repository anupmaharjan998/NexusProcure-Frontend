import {
    Box,
    Chip,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    Typography,
    Divider,
    TextField,
    Autocomplete,
    MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { useEffect, useState } from 'react';
import { Vendor, VendorFormData } from '../../types/Vendor';
import {
    getAllCategories,
    getAllPaymentTerms
} from '../../services/vendorService';
import { Category } from '../../types/Category';
import { PaymentTerms } from "../../types/PaymentTerms.ts";
import { TaxType } from "../../types/TaxType.ts";

/* ---------------- VALIDATION ---------------- */
const schema = yup.object({
    vendorName: yup.string().trim().required('Vendor name is required'),
    companyName: yup.string().required('Company name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: yup
        .string()
        .matches(/^\+?\d{7,15}$/, 'Invalid phone number')
        .required('Phone number is required'),
    address: yup.string().required('Address is required'),
    taxType: yup
        .mixed<TaxType>()
        .oneOf(Object.values(TaxType).filter(v => typeof v === 'number'))
        .required(),
    taxId: yup.string().required('Tax number is required'),
    categoryIds: yup
        .array()
        .of(yup.string().required())
        .min(1, 'At least one category is required')
        .required(),
    bankName: yup.string().optional(),
    bankBranch: yup.string().optional(),
    bankAccount: yup.string().optional(),
    paymentTerms: yup.number().required('Payment terms is required'),
    status: yup
        .mixed<'Active' | 'Inactive' | 'Pending' | 'Rejected'>()
        .required()
});

interface VendorFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: VendorFormData) => Promise<void>;
    vendor?: Vendor;
    loading?: boolean;
}

export const VendorForm = ({
                               open,
                               onClose,
                               onSubmit,
                               vendor,
                               loading = false
                           }: VendorFormProps) => {
    const isEdit = !!vendor;

    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentTermsList, setPaymentTermsList] = useState<PaymentTerms[]>([]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<VendorFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vendorName: '',
            companyName: '',
            email: '',
            phoneNumber: '',
            address: '',
            taxType: TaxType.VAT,
            taxId: '',
            categoryIds: [],
            bankName: '',
            bankBranch: '',
            bankAccount: '',
            paymentTerms: 0,
            status: 'Pending'
        }
    });

    useEffect(() => {
        const loadData = async () => {
            const [cats, terms] = await Promise.all([
                getAllCategories(),
                getAllPaymentTerms()
            ]);
            setCategories(cats);
            setPaymentTermsList(terms);
        };

        loadData();
    }, []);

    useEffect(() => {
        if (vendor) {
            reset({
                vendorName: vendor.vendorName,
                companyName: vendor.companyName || '',
                email: vendor.email || '',
                phoneNumber: vendor.phoneNumber || '',
                address: vendor.address || '',
                taxType: vendor.taxType,
                taxId: vendor.taxId || '',
                categoryIds: vendor.categoryIds || [],
                bankName: vendor.bankName || '',
                bankBranch: vendor.bankBranch || '',
                bankAccount: vendor.bankAccount || '',
                paymentTerms: vendor.paymentTerms,
                status: vendor.status
            });
        }
    }, [vendor, reset]);

    const handleFormSubmit = async (data: VendorFormData) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Vendor' : 'Add Vendor'}
            maxWidth="md"
            actions={
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        loading={loading}
                        onClick={handleSubmit(handleFormSubmit)}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </Box>
            }
        >
            <form>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6">Vendor Information</Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Vendor Name *"
                            {...register('vendorName')}
                            error={!!errors.vendorName}
                            helperText={errors.vendorName?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Company Name *"
                            {...register('companyName')}
                            error={!!errors.companyName}
                            helperText={errors.companyName?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6">Contact Information</Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Email *"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Phone Number *"
                            {...register('phoneNumber')}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Input
                            label="Address *"
                            multiline
                            rows={2}
                            {...register('address')}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6">Tax Details</Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="taxType"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    label="Tax Type *"
                                    error={!!errors.taxType}
                                    helperText={errors.taxType?.message}
                                >
                                    <MenuItem value={TaxType.VAT}>VAT</MenuItem>
                                    <MenuItem value={TaxType.PAN}>PAN</MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Tax Number *"
                            {...register('taxId')}
                            error={!!errors.taxId}
                            helperText={errors.taxId?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="categoryIds"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    options={categories}
                                    getOptionLabel={(option) => option.name}
                                    value={categories.filter(c => field.value?.includes(c.id))}
                                    onChange={(_, selected) => {
                                        field.onChange(selected.map(item => item.id));
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={option.name}
                                                {...getTagProps({ index })}
                                                key={option.id}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Categories *"
                                            error={!!errors.categoryIds}
                                            helperText={
                                                (errors.categoryIds as any)?.message ||
                                                'Select one or more categories'
                                            }
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6">Bank Details</Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input label="Bank Name" {...register('bankName')} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input label="Bank Branch" {...register('bankBranch')} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input label="Account Number" {...register('bankAccount')} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="paymentTerms"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    label="Payment Terms *"
                                    error={!!errors.paymentTerms}
                                    helperText={errors.paymentTerms?.message}
                                >
                                    {paymentTermsList.map(term => (
                                        <MenuItem key={term.value} value={term.value}>
                                            {term.displayName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    {vendor?.status !== 'Pending' && isEdit && (
                        <Grid item xs={12}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <FormControl>
                                        <FormLabel>Status</FormLabel>
                                        <RadioGroup row {...field}>
                                            <FormControlLabel
                                                value="Active"
                                                control={<Radio color="success" />}
                                                label="Active"
                                            />
                                            <FormControlLabel
                                                value="Inactive"
                                                control={<Radio color="warning" />}
                                                label="Inactive"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    )}
                </Grid>
            </form>
        </Modal>
    );
};