import {
    Box,
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
    addCategory,
    getAllPaymentTerms
} from '../../services/vendorService';
import { Category } from '../../types/Category';
import {PaymentTerms} from "../../types/PaymentTerms.ts";
import {TaxType} from "../../types/TaxType.ts";

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
    category: yup.string().optional(),
    categoryId: yup.string().optional(),
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
    const [categoryInput, setCategoryInput] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
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
            category: '',
            categoryId: '',
            bankName: '',
            bankBranch: '',
            bankAccount: '',
            paymentTerms: 0,
            status: 'Pending'
        }
    });

    /* ---------------- LOAD DROPDOWNS ---------------- */
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

    /* ---------------- EDIT MODE ---------------- */
    useEffect(() => {
        if (vendor) {
            // Find the category name by categoryId
            const selectedCategory = categories.find(
                c => c.id === vendor.categoryId
            );
            reset({
                ...vendor,
                category: selectedCategory ? selectedCategory.name : '',
                paymentTerms: vendor.paymentTerms
            });
            setCategoryInput(selectedCategory ? selectedCategory.name : '');
        }
    }, [vendor, reset, categories]);

    const handleFormSubmit = async (data: VendorFormData) => {
        if (!data.category) {
            // optionally show error or return
            return;
        }

        const selectedCategory = categories.find(
            c => c.name.toLowerCase() === data.category!.toLowerCase()
        );

        if (!selectedCategory) return;

        const payload = {
            ...data,
            categoryId: selectedCategory.id
        };

        await onSubmit(payload);
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
                    {/* ---------------- BASIC INFO ---------------- */}
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

                    {/* ---------------- CONTACT ---------------- */}
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

                    {/* ---------------- TAX DETAILS ---------------- */}
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

                    {/* ---------------- CATEGORY (ADDABLE) ---------------- */}
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    freeSolo
                                    options={categories.map(c => c.name)}
                                    value={field.value || ''}
                                    inputValue={categoryInput}
                                    onInputChange={(_, value) =>
                                        setCategoryInput(value)
                                    }
                                    onChange={(_, value) => {
                                        if (typeof value === 'string') {
                                            field.onChange(value);
                                        }
                                    }}
                                    onKeyDown={async e => {
                                        if (
                                            e.key === 'Enter' &&
                                            categoryInput.trim()
                                        ) {
                                            e.preventDefault();

                                            const exists = categories.some(
                                                c =>
                                                    c.name.toLowerCase() ===
                                                    categoryInput.toLowerCase()
                                            );

                                            if (!exists) {
                                                setAddingCategory(true);
                                                await addCategory(categoryInput.trim());
                                                const updated =
                                                    await getAllCategories();
                                                setCategories(updated);
                                                setAddingCategory(false);
                                            }

                                            field.onChange(categoryInput.trim());
                                        }
                                    }}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label="Category *"
                                            error={!!errors.category}
                                            helperText={
                                                errors.category?.message ||
                                                'Type and press Enter to add new category'
                                            }
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>

                    {/* ---------------- BANK DETAILS ---------------- */}
                    <Grid item xs={12}>
                        <Typography variant="h6">Bank Details</Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Bank Name *"
                            {...register('bankName')}
                            error={!!errors.bankName}
                            helperText={errors.bankName?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Bank Branch"
                            {...register('bankBranch')}
                            error={!!errors.bankBranch}
                            helperText={errors.bankBranch?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Account Number *"
                            {...register('bankAccount')}
                            error={!!errors.bankAccount}
                            helperText={errors.bankAccount?.message}
                        />
                    </Grid>

                    {/* ---------------- PAYMENT TERMS ---------------- */}
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
                                        <MenuItem
                                            key={term.value}
                                            value={term.value}
                                        >
                                            {term.displayName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    {/* ---------------- STATUS ---------------- */}
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
