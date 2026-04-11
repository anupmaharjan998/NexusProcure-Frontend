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
    MenuItem,
    Paper,
    Stack,
    InputAdornment,
    FormHelperText,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {Input} from '../UI/Input';
import {Button} from '../UI/Button';
import {Modal} from '../UI/Modal';
import {useEffect, useState} from 'react';
import {Vendor, VendorFormData} from '../../types/Vendor';
import {
    getAllCategories,
    getAllPaymentTerms
} from '../../services/vendorService';
import {Category} from '../../types/Category';
import {PaymentTerms} from '../../types/PaymentTerms.ts';
import {TaxType} from '../../types/TaxType.ts';

const schema = yup.object({
    vendorName: yup.string().trim().required('Vendor name is required'),
    companyName: yup.string().trim().required('Company name is required'),
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
        .required(),
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
                               loading = false,
                           }: VendorFormProps) => {
    const isEdit = !!vendor;

    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentTermsList, setPaymentTermsList] = useState<PaymentTerms[]>([]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: {errors, isValid},
    } = useForm<VendorFormData>({
        resolver: yupResolver(schema),
        mode: 'onChange',
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
            status: 'Pending',
        },
    });

    const watchedVendorName = watch('vendorName');
    const watchedCompanyName = watch('companyName');
    const watchedStatus = watch('status');
    const watchedCategoryIds = watch('categoryIds');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, terms] = await Promise.all([
                    getAllCategories(),
                    getAllPaymentTerms(),
                ]);
                setCategories(cats);
                setPaymentTermsList(terms);
            } catch (error) {
                console.error('Failed to load vendor form data', error);
            }
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
                status: vendor.status,
            });
        } else {
            reset({
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
                status: 'Pending',
            });
        }
    }, [vendor, reset]);

    const handleFormSubmit = async (data: VendorFormData) => {
        await onSubmit(data);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? 'Edit Vendor' : 'Add Vendor'}
            maxWidth="md"
            actions={
                <>
                    <Button variant="outlined" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        loading={loading}
                        onClick={handleSubmit(handleFormSubmit)}
                        disabled={!isValid || loading}
                        sx={{
                            minWidth: 140,
                            background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                        }}
                    >
                        {isEdit ? 'Save Changes' : 'Create Vendor'}
                    </Button>
                </>
            }
        >
            <form>
                <Stack spacing={3} sx={{mt: 1}}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748B',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    >
                        {isEdit
                            ? 'Update vendor details, contact records, tax information, and payment setup.'
                            : 'Register a new vendor with company, contact, tax, category, and payment details.'}
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{fontWeight: 700, color: '#1E293B', mb: 2}}
                        >
                            Basic Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Vendor Name"
                                    placeholder="Enter vendor name"
                                    {...register('vendorName')}
                                    error={!!errors.vendorName}
                                    helperText={errors.vendorName?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <StorefrontOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Company Name"
                                    placeholder="Enter company name"
                                    {...register('companyName')}
                                    error={!!errors.companyName}
                                    helperText={errors.companyName?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BusinessOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Divider />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{fontWeight: 700, color: '#1E293B', mb: 2}}
                        >
                            Contact Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Email"
                                    placeholder="Enter vendor email"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Phone Number"
                                    placeholder="Enter phone number"
                                    {...register('phoneNumber')}
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Input
                                    label="Address"
                                    placeholder="Enter full address"
                                    multiline
                                    rows={3}
                                    {...register('address')}
                                    error={!!errors.address}
                                    helperText={errors.address?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Divider />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{fontWeight: 700, color: '#1E293B', mb: 2}}
                        >
                            Tax & Classification
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="taxType"
                                    control={control}
                                    render={({field}) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label="Tax Type"
                                            error={!!errors.taxType}
                                            helperText={errors.taxType?.message}
                                            disabled={loading}
                                        >
                                            <MenuItem value={TaxType.VAT}>VAT</MenuItem>
                                            <MenuItem value={TaxType.PAN}>PAN</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Tax Number"
                                    placeholder="Enter tax number"
                                    {...register('taxId')}
                                    error={!!errors.taxId}
                                    helperText={errors.taxId?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ReceiptLongOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="categoryIds"
                                    control={control}
                                    render={({field}) => (
                                        <Autocomplete
                                            multiple
                                            options={categories}
                                            getOptionLabel={(option) => option.name}
                                            value={categories.filter(c => field.value?.includes(c.id))}
                                            onChange={(_, selected) => {
                                                field.onChange(selected.map(item => item.id));
                                            }}
                                            disableCloseOnSelect
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        label={option.name}
                                                        {...getTagProps({index})}
                                                        key={option.id}
                                                        sx={{fontWeight: 500}}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Categories"
                                                    error={!!errors.categoryIds}
                                                    helperText={
                                                        (errors.categoryIds as any)?.message ||
                                                        'Select one or more vendor categories'
                                                    }
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Divider />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{fontWeight: 700, color: '#1E293B', mb: 2}}
                        >
                            Banking & Payment
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Bank Name"
                                    placeholder="Enter bank name"
                                    {...register('bankName')}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountBalanceOutlinedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Bank Branch"
                                    placeholder="Enter bank branch"
                                    {...register('bankBranch')}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    label="Account Number"
                                    placeholder="Enter account number"
                                    {...register('bankAccount')}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="paymentTerms"
                                    control={control}
                                    render={({field}) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label="Payment Terms"
                                            error={!!errors.paymentTerms}
                                            helperText={errors.paymentTerms?.message}
                                            disabled={loading}
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
                        </Grid>
                    </Paper>

                    {vendor?.status !== 'Pending' && isEdit && (
                        <>
                            <Divider />
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    borderColor: '#E2E8F0',
                                    bgcolor: '#FFFFFF',
                                }}
                            >
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({field}) => (
                                        <FormControl disabled={loading}>
                                            <FormLabel
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#334155',
                                                    mb: 1,
                                                }}
                                            >
                                                Status
                                            </FormLabel>
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
                                            <FormHelperText>
                                                Update the current vendor availability status.
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Paper>
                        </>
                    )}

                    {!!watchedVendorName?.trim() && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: '#F8FAFC',
                                borderColor: '#E2E8F0',
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{fontWeight: 700, color: '#334155', mb: 1.25}}
                            >
                                Preview
                            </Typography>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip
                                    icon={<CheckCircleOutlineOutlinedIcon />}
                                    label={watchedVendorName.trim()}
                                    color="primary"
                                />
                                {!!watchedCompanyName?.trim() && (
                                    <Chip label={watchedCompanyName.trim()} variant="outlined" />
                                )}
                                <Chip
                                    icon={<CategoryOutlinedIcon />}
                                    label={`${watchedCategoryIds?.length || 0} categories`}
                                    variant="outlined"
                                />
                                <Chip
                                    label={watchedStatus || 'Pending'}
                                    color={
                                        watchedStatus === 'Active'
                                            ? 'success'
                                            : watchedStatus === 'Pending'
                                                ? 'warning'
                                                : watchedStatus === 'Rejected'
                                                    ? 'error'
                                                    : 'default'
                                    }
                                    variant={watchedStatus === 'Inactive' ? 'outlined' : 'filled'}
                                />
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </form>
        </Modal>
    );
};