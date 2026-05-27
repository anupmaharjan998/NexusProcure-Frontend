import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    MenuItem,
    Button
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useEffect} from 'react';

export default function ApprovalLevelForm({
                                              open,
                                              onClose,
                                              onSubmit,
                                              roles,
                                              defaultValues
                                          }: any) {
    const {
        control,
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            levelName: '',
            minAmount: '',
            maxAmount: '',
            roleId: ''
        }
    });

    //Preload data on edit
    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        } else {
            reset({
                levelName: '',
                minAmount: '',
                maxAmount: '',
                roleId: ''
            });
        }
    }, [defaultValues, reset]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {defaultValues ? 'Edit Approval Level' : 'Add Approval Level'}
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={2} mt={1}>
                    <Grid item xs={12}>
                        <Controller
                            name="levelName"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Level Name"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <Controller
                            name="minAmount"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Min Amount"
                                    type="number"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <Controller
                            name="maxAmount"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    label="Max Amount"
                                    type="number"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="roleId"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    select
                                    {...field}
                                    label="Approval Role"
                                    fullWidth
                                >
                                    {roles.map((r: any) => (
                                        <MenuItem key={r.id} value={r.id}>
                                            {r.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
