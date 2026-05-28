import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { createApprovalPolicy } from '../../services/approvalPolicyService';
import { getAllCategories } from '../../services/vendorService';
import { Role } from '../../types/Role.ts';
import { getRoles } from '../../services/roleService.ts';

interface CategoryDto {
    id: string;
    name: string;
}

interface ApprovalPolicyFormValues {
    categoryId: string;
    roleId: string;
    riskLevel: string;
    sequenceOrder: number;
    escalationHours: number;
    isActive: boolean;
}

interface ApprovalPolicyFormProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}

const initialValues: ApprovalPolicyFormValues = {
    categoryId: '',
    roleId: '',
    riskLevel: 'Low',
    sequenceOrder: 1,
    escalationHours: 24,
    isActive: true,
};

export const ApprovalPolicyForm = ({
                                       open,
                                       onClose,
                                       onSaved,
                                   }: ApprovalPolicyFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ApprovalPolicyFormValues>({
        defaultValues: initialValues,
    });

    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const loadDropdownData = async () => {
        setLoadingDropdowns(true);
        setFormError('');

        try {
            const [categoriesData, rolesData] = await Promise.all([
                getAllCategories(),
                getRoles(),
            ]);

            setCategories(categoriesData);
            setRoles(rolesData);
        } catch (err: any) {
            setFormError(
                err.response?.data?.message ||
                'Failed to load categories and roles.'
            );
        } finally {
            setLoadingDropdowns(false);
        }
    };

    useEffect(() => {
        if (open) {
            reset(initialValues);
            setFormError('');
            loadDropdownData();
        }
    }, [open]);

    const handleClose = () => {
        if (submitting) return;

        setFormError('');
        reset(initialValues);
        onClose();
    };

    const submit = async (data: ApprovalPolicyFormValues) => {
        setSubmitting(true);
        setFormError('');

        try {
            const payload = {
                categoryId: data.categoryId,
                roleId: data.roleId,
                riskLevel: data.riskLevel,
                sequenceOrder: Number(data.sequenceOrder),
                escalationHours: Number(data.escalationHours),
                isActive: Boolean(data.isActive),
            };

            await createApprovalPolicy(payload);

            await onSaved();

            reset(initialValues);
        } catch (err: any) {
            setFormError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Failed to add approval policy.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" fontWeight={900}>
                    Add Approval Policy
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Configure who should approve requests based on category and risk level.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    {formError && (
                        <Alert severity="error">
                            {formError}
                        </Alert>
                    )}

                    {loadingDropdowns ? (
                        <Stack alignItems="center" py={5}>
                            <CircularProgress />

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Loading form data...
                            </Typography>
                        </Stack>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{
                                        required: 'Category is required.',
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Category"
                                            fullWidth
                                            error={!!errors.categoryId}
                                            helperText={errors.categoryId?.message}
                                            disabled={submitting}
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

                            <Grid item xs={12}>
                                <Controller
                                    name="roleId"
                                    control={control}
                                    rules={{
                                        required: 'Approval role is required.',
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Assign to Role"
                                            fullWidth
                                            error={!!errors.roleId}
                                            helperText={errors.roleId?.message}
                                            disabled={submitting}
                                        >
                                            {roles.map((role: any) => (
                                                <MenuItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="riskLevel"
                                    control={control}
                                    rules={{
                                        required: 'Risk level is required.',
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Risk Level"
                                            fullWidth
                                            error={!!errors.riskLevel}
                                            helperText={errors.riskLevel?.message}
                                            disabled={submitting}
                                        >
                                            {['Low', 'Medium', 'High', 'Critical'].map((risk) => (
                                                <MenuItem key={risk} value={risk}>
                                                    {risk}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="sequenceOrder"
                                    control={control}
                                    rules={{
                                        required: 'Sequence order is required.',
                                        min: {
                                            value: 1,
                                            message: 'Order must be at least 1.',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            label="Approval Order"
                                            fullWidth
                                            error={!!errors.sequenceOrder}
                                            helperText={errors.sequenceOrder?.message}
                                            disabled={submitting}
                                            inputProps={{
                                                min: 1,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="escalationHours"
                                    control={control}
                                    rules={{
                                        required: 'Escalation hours is required.',
                                        min: {
                                            value: 1,
                                            message: 'Escalation hours must be at least 1.',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            label="Escalation Hours"
                                            fullWidth
                                            error={!!errors.escalationHours}
                                            helperText={errors.escalationHours?.message}
                                            disabled={submitting}
                                            inputProps={{
                                                min: 1,
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 1,
                                    }}
                                >
                                    <Controller
                                        name="isActive"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={Boolean(field.value)}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.checked)
                                                        }
                                                        disabled={submitting}
                                                    />
                                                }
                                                label="Active Policy"
                                            />
                                        )}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={submitting}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: 3,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit(submit)}
                    disabled={submitting || loadingDropdowns}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 900,
                        borderRadius: 3,
                        minWidth: 120,
                    }}
                >
                    {submitting ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : (
                        'Save Policy'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};