import { Grid, TextField, Box, Alert, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import {
    TotalAmountRiskScore,
    TotalAmountRiskScoreRequest,
} from '../../types/TotalAmountRiskScore';
import { useEffect } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TotalAmountRiskScoreRequest) => Promise<void>;
    riskScore?: TotalAmountRiskScore;
    loading?: boolean;
}

export const TotalAmountRiskScoreForm = ({
                                             open,
                                             onClose,
                                             onSubmit,
                                             riskScore,
                                             loading,
                                         }: Props) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TotalAmountRiskScoreRequest>({
        defaultValues: {
            minAmount: 0,
            maxAmount: null,
            riskPoints: 0,
            isActive: true,
        },
    });

    useEffect(() => {
        reset({
            minAmount: riskScore?.minAmount ?? 0,
            maxAmount: riskScore?.maxAmount ?? null,
            riskPoints: riskScore?.riskPoints ?? 0,
            isActive: riskScore?.isActive ?? true,
        });
    }, [riskScore, reset, open]);

    const submit = async (data: TotalAmountRiskScoreRequest) => {
        const payload: TotalAmountRiskScoreRequest = {
            minAmount: Number(data.minAmount),
            maxAmount:
                data.maxAmount === null ||
                data.maxAmount === undefined ||
                data.maxAmount === ('' as any)
                    ? null
                    : Number(data.maxAmount),
            riskPoints: Number(data.riskPoints),
            isActive: data.isActive ?? true,
        };

        await onSubmit(payload);
        reset({
            minAmount: 0,
            maxAmount: null,
            riskPoints: 0,
            isActive: true,
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={riskScore ? 'Edit Risk Score' : 'Add Risk Score'}
            maxWidth="sm"
            actions={
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit(submit)}
                        loading={loading}
                    >
                        Save
                    </Button>
                </Box>
            }
        >
            <form>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Alert severity="info">
                            Leave <strong>Max Amount</strong> empty for unlimited range.
                            Example: <strong>100000 - Max</strong>
                        </Alert>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Min Amount"
                            type="number"
                            fullWidth
                            error={!!errors.minAmount}
                            helperText={errors.minAmount?.message}
                            {...register('minAmount', {
                                required: 'Min amount is required',
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: 'Min amount cannot be negative',
                                },
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Max Amount"
                            type="number"
                            fullWidth
                            placeholder="Leave empty for Max / Unlimited"
                            error={!!errors.maxAmount}
                            helperText={
                                errors.maxAmount?.message ||
                                'Example: keep empty for 100000 - Max'
                            }
                            {...register('maxAmount', {
                                setValueAs: (value) =>
                                    value === '' || value === null || value === undefined
                                        ? null
                                        : Number(value),
                                validate: (value, formValues) => {
                                    if (value === null || value === undefined) {
                                        return true;
                                    }

                                    return (
                                        Number(value) > Number(formValues.minAmount) ||
                                        'Max amount must be greater than min amount'
                                    );
                                },
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Risk Points"
                            type="number"
                            fullWidth
                            error={!!errors.riskPoints}
                            helperText={errors.riskPoints?.message}
                            {...register('riskPoints', {
                                required: 'Risk points is required',
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: 'Risk points cannot be negative',
                                },
                            })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            Boundary rule used by system:{' '}
                            <strong>Min Amount ≤ Total Amount &lt; Max Amount</strong>.
                            If Max Amount is empty, the rule applies to all higher amounts.
                        </Typography>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};