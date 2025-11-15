import { Box, Grid, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import { Role, RoleFormData } from '../../types/Role.ts';
import { useEffect, useState } from 'react';
import {Permission} from "@/types/Permission.ts";

const schema = yup.object({
  name: yup.string().required('Role name is required'),
  description: yup.string(),
});

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  role?: Role;
  permissions: Permission[];
  loading?: boolean;
}

export const RoleForm = ({
  open,
  onClose,
  onSubmit,
  role,
  permissions,
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

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

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

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.group || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

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
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#1E293B',
                mb: 1,
                mt: 2,
              }}
            >
              Permissions
            </Typography>
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <Box key={module} sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#0056D2',
                    mb: 1,
                  }}
                >
                  {module}
                </Typography>
                <FormGroup>
                  {perms.map((permission) => (
                    <FormControlLabel
                      key={permission.id}
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            {permission.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'Poppins, sans-serif', color: '#64748B' }}
                          >
                            {permission.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 1 }}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};


