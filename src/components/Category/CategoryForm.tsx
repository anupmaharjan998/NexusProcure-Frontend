// src/components/Category/CategoryForm.tsx
import { Box, Grid, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import {Category, CategoryRequest} from '../../types/Category';
import {useEffect} from "react";

interface CategoryFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryRequest) => Promise<void>;
    category?: Category;
    loading?: boolean;
}

export const CategoryForm = ({ open, onClose, onSubmit, category, loading = false }: CategoryFormProps) => {
    const { register, handleSubmit, control, reset } = useForm<CategoryRequest>({
        defaultValues: category || { name: '', description: '', type: 'vendor' },
    });

    // Reset form when category changes
    useEffect(() => {
        reset(category || { name: '', description: '', type: 'vendor' });
    }, [category, reset]);

    const handleFormSubmit = async (data: CategoryRequest) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={category ? 'Edit Category' : 'Add Category'}
            maxWidth="sm"
            actions={
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit(handleFormSubmit)} loading={loading}>
                        {category ? 'Update' : 'Create'}
                    </Button>
                </Box>
            }
        >
            <form>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Category Name"
                            fullWidth
                            {...register('name', { required: true })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            {...register('description')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Risk Weight"
                            fullWidth
                            {...register('riskWeight')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    select
                                    fullWidth
                                    label="Type"
                                    {...field}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="vendor">Vendor</option>
                                    <option value="inventory">Inventory</option>
                                </TextField>
                            )}
                        />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};
