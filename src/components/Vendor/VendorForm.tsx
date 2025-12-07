import {
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    Typography,
    Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import { useEffect } from 'react';
import { Vendor, VendorFormData } from "../../types/Vendor.ts";

const schema = yup.object({
    vendorName: yup.string().trim().required('Vendor name is required'),
    companyName: yup.string().optional(),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phoneNumber: yup.string().matches(/^\+?\d{7,15}$/, 'Invalid phone number').required('Phone number is required'),
    address: yup.string().required('Address is required'),
    taxId: yup.string().optional(),
    category: yup.string().required('Category is required'),
    bankAccount: yup.string().optional(),
    paymentTerms: yup.string().optional(),
    status: yup.mixed<'Active' | 'Inactive' | 'Pending' | 'Rejected'>().required('Status is required'),
});

interface VendorFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: VendorFormData) => Promise<void>;
    vendor?: Vendor;
    loading?: boolean;
}

export const VendorForm = ({ open, onClose, onSubmit, vendor, loading = false }: VendorFormProps) => {
    const isEdit = !!vendor;

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<VendorFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vendorName: '',
            companyName: '',
            email: '',
            phoneNumber: '',
            address: '',
            taxId: '',
            category: '',
            bankAccount: '',
            paymentTerms: '',
            status: 'Pending',
        },
    });

    useEffect(() => {
        if (vendor) {
            reset({
                vendorName: vendor.vendorName,
                companyName: vendor.companyName || '',
                email: vendor.email || '',
                phoneNumber: vendor.phoneNumber || '',
                address: vendor.address || '',
                taxId: vendor.taxId || '',
                category: vendor.category || '',
                bankAccount: vendor.bankAccount || '',
                paymentTerms: vendor.paymentTerms || '',
                status: vendor.status,
            });
        } else {
            reset({
                vendorName: '',
                companyName: '',
                email: '',
                phoneNumber: '',
                address: '',
                taxId: '',
                category: '',
                bankAccount: '',
                paymentTerms: '',
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
            title={isEdit ? 'Edit Vendor' : 'Add New Vendor'}
            maxWidth="md"
            actions={
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit(handleFormSubmit)} loading={loading}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </Box>
            }
        >
            <form>
                <Grid container spacing={3}>
                    {/* Vendor Info */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Vendor Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Vendor Name *"
                            placeholder="Enter vendor name"
                            {...register('vendorName')}
                            error={!!errors.vendorName}
                            helperText={errors.vendorName?.message}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Company Name"
                            placeholder="Optional"
                            {...register('companyName')}
                            error={!!errors.companyName}
                            helperText={errors.companyName?.message}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Contact Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Email *"
                            placeholder="vendor@example.com"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Phone Number *"
                            placeholder="+977XXXXXXXXX"
                            {...register('phoneNumber')}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber?.message}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Input
                            label="Address *"
                            multiline
                            rows={2}
                            placeholder="Vendor address"
                            {...register('address')}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Tax & Category */}
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Tax ID"
                            placeholder="Optional"
                            {...register('taxId')}
                            error={!!errors.taxId}
                            helperText={errors.taxId?.message}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Category *"
                            placeholder="E.g., Electronics, Office Supplies"
                            {...register('category')}
                            error={!!errors.category}
                            helperText={errors.category?.message}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Payment Info */}
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Bank Account"
                            placeholder="Optional"
                            {...register('bankAccount')}
                            error={!!errors.bankAccount}
                            helperText={errors.bankAccount?.message}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            label="Payment Terms"
                            placeholder="Optional, e.g., Net 30"
                            {...register('paymentTerms')}
                            error={!!errors.paymentTerms}
                            helperText={errors.paymentTerms?.message}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <FormControl component="fieldset" disabled={loading}>
                                    <FormLabel>Status *</FormLabel>
                                    <RadioGroup
                                        row
                                        {...field}
                                        value={field.value || 'Pending'}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    >
                                        <FormControlLabel value="Active" control={<Radio color="success"/>} label="Active" />
                                        <FormControlLabel value="Inactive" control={<Radio color="warning"/>} label="Inactive" />
                                        <FormControlLabel value="Pending" control={<Radio color="info"/>} label="Pending" />
                                        <FormControlLabel value="Rejected" control={<Radio color="info"/>} label="Rejected" />
                                    </RadioGroup>
                                    {errors.status && (
                                        <Box sx={{ color: "error.main", fontSize: 12, mt: 0.5 }}>
                                            {errors.status.message}
                                        </Box>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};
