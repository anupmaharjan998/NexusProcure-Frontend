import { Box, Grid, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import { User, UserFormData } from '../../types/User.ts';
import { Role } from '../../types/Role.ts';
import { Department } from '../../types/Department.ts';
import { useEffect } from 'react';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: (schema) => schema,
  }),
  roleId: yup.string().required('Role is required'),
  departmentId: yup.string().required('Department is required'),
  status: yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
});

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User;
  roles: Role[];
  departments: Department[];
  loading?: boolean;
}

export const UserForm = ({
  open,
  onClose,
  onSubmit,
  user,
  roles,
  departments,
  loading = false,
}: UserFormProps) => {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(schema),
    context: { isEdit },
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      roleId: '',
      departmentId: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.fullName,
        email: user.email,
        phone: user.phone || '',
        roleId: user.roleId,
        departmentId: user.departmentId,
        status: user.status,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        departmentId: '',
        status: 'Active',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
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
      title={isEdit ? 'Edit User' : 'Add New User'}
      maxWidth="md"
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
          <Grid item xs={12} sm={6}>
            <Input
              label="Full Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading || isEdit}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input
              label="Phone"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={loading}
            />
          </Grid>
          {!isEdit && (
            <Grid item xs={12} sm={6}>
              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  select
                  label="Role"
                  error={!!errors.roleId}
                  helperText={errors.roleId?.message}
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Input>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  select
                  label="Department"
                  error={!!errors.departmentId}
                  helperText={errors.departmentId?.message}
                  disabled={loading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Input>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  select
                  label="Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                  disabled={loading}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Input>
              )}
            />
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};


