import {
    Box,
    Grid,
    MenuItem,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
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
    name: yup.string().trim().required('Name is required').matches(/.*\S.*/, 'Please enter a name'),
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().trim().required('Username is required').matches(/.*\S.*/, 'Please enter a username'),
    roleId: yup.string().required('Role is required'),
    departmentId: yup.string().required('Department is required'),
    isActive: yup.boolean().required('Status is required'),
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
        formState: { errors, isValid },
    } = useForm<UserFormData>({
        resolver: yupResolver(schema),
        context: { isEdit },
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            username: '',
            roleId: '',
            departmentId: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.fullName,
                email: user.email,
                username: user.username || '',
                roleId: user.roleId,
                departmentId: user.departmentId,
                isActive: user.isActive,
            });
        } else {
            reset({
                name: '',
                email: '',
                username: '',
                roleId: '',
                departmentId: '',
                isActive: true,
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
                        disabled={!isValid || loading}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </>
            }
        >
            <form>
                <Grid container spacing={2} marginTop={2}>
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
                            label="Username"
                            {...register('username')}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            disabled={loading}
                        />
                    </Grid>

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
                                            {dept.departmentName}
                                        </MenuItem>
                                    ))}
                                </Input>
                            )}
                        />
                    </Grid>

                    {/* ✅ FIXED isActive Controller */}
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <FormControl component="fieldset" disabled={loading}>
                                    <FormLabel>Status</FormLabel>

                                    <RadioGroup
                                        row
                                        {...field} // IMPORTANT FIX
                                        value={field.value ? "true" : "false"}
                                        onChange={(e) => field.onChange(e.target.value === "true")}
                                    >
                                        <FormControlLabel value="true" control={<Radio />} label="Active" />
                                        <FormControlLabel value="false" control={<Radio />} label="Inactive" />
                                    </RadioGroup>

                                    {errors.isActive && (
                                        <Box sx={{ color: "error.main", fontSize: 12, mt: 0.5 }}>
                                            {errors.isActive.message}
                                        </Box>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    {/* END isActive */}
                </Grid>
            </form>
        </Modal>
    );
};
