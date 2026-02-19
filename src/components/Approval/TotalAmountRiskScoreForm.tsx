import {Grid, TextField, Box} from '@mui/material';
import {useForm} from 'react-hook-form';
import {Modal} from '../UI/Modal';
import {Button} from '../UI/Button';
import {TotalAmountRiskScore, TotalAmountRiskScoreRequest} from '../../types/TotalAmountRiskScore';
import {useEffect} from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TotalAmountRiskScoreRequest) => Promise<void>;
    riskScore?: TotalAmountRiskScore;
    loading?: boolean;
}

export const TotalAmountRiskScoreForm = ({
                                             open, onClose, onSubmit, riskScore, loading
                                         }: Props) => {

    const {register, handleSubmit, reset} = useForm<TotalAmountRiskScoreRequest>({
        defaultValues: riskScore || {minAmount: 0, maxAmount: 0, riskPoints: 0}
    });

    useEffect(() => {
        reset(riskScore || {minAmount: 0, maxAmount: 0, riskPoints: 0});
    }, [riskScore, reset]);

    const submit = async (data: TotalAmountRiskScoreRequest) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={riskScore ? 'Edit Risk Score' : 'Add Risk Score'}
            maxWidth="sm"
            actions={
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit(submit)} loading={loading}>
                        Save
                    </Button>
                </Box>
            }
        >
            <form>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="Min Amount" type="number"
                                   fullWidth {...register('minAmount', {required: true})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Max Amount" type="number"
                                   fullWidth {...register('maxAmount', {required: true})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Risk Points" type="number"
                                   fullWidth {...register('riskPoints', {required: true})} />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};
