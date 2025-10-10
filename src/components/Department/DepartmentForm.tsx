import { Box, Grid, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import type { Department, DepartmentFormData } from '../../types/Department.ts';
import { User } from '../../types/User.ts';
import { useEffect } from 'react';

const schema = yup.object({
  name: yup.string().required('Department name is required'),
  description: yup.string(),
  headId: yup.string(),
});

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  department?: Department;
  users: User[];
  loading?: boolean;
}

export const DepartmentForm = ({
  open,
  onClose,
  onSubmit,
  department,
  users,
  loading = false,
}: DepartmentFormProps) => {
  const isEdit = !!department;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      headId: '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description || '',
        headId: department.headId || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        headId: '',
      });
    }
  }, [department, reset]);

  const handleFormSubmit = async (data: DepartmentFormData) => {
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
      title={isEdit ? 'Edit Department' : 'Add New Department'}
      maxWidth="sm"
      actions={
        <>
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Input
              label="Department Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Input
              label="Description"
              multiline
              rows={3}
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="headId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  select
                  label="Department Head (Optional)"
                  error={!!errors.headId}
                  helperText={errors.headId?.message}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullName} - {user.role}
                    </MenuItem>
                  ))}
                </Input>
              )}
            />
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};


