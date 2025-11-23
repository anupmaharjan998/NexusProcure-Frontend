import { Box, Grid, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import { Role, RoleFormData } from '../../types/Role.ts';
import { useEffect, useState } from 'react';

const schema = yup.object({
  name: yup
      .string()
      .trim()
      .required('Role name is required')
      .matches(/.*\S.*/, 'Please enter a role name'),
  description: yup.string(),
});

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  role?: Role;
  loading?: boolean;
}

export const RoleForm = ({
  open,
  onClose,
  onSubmit,
  role,
  loading = false,
}: RoleFormProps) => {
  const isEdit = !!role;
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || '',
      });
      setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    } else {
      reset({
        name: '',
        description: '',
      });
      setSelectedPermissions([]);
    }
  }, [role, reset]);

  const handleFormSubmit = async (data: RoleFormData) => {
    await onSubmit({
      ...data,
      permissionIds: selectedPermissions,
    });
    reset();
    setSelectedPermissions([]);
  };

  const handleClose = () => {
    reset();
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Role' : 'Add New Role'}
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
          <Grid item xs={12}>
            <Input
              label="Role Name"
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
        </Grid>
      </form>
    </Modal>
  );
};


