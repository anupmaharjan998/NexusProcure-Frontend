import { Box, Grid, MenuItem, InputAdornment, Stack, Paper, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Modal } from '../UI/Modal.tsx';
import type { Department, DepartmentFormData } from '../../types/Department.ts';
import { User } from '../../types/User.ts';
import { useEffect, useState } from 'react';
import { checkDepartmentNameExists } from '../../services/departmentService.ts';

const schema = yup.object({
    departmentName: yup
        .string()
        .trim()
        .required('Department name is required')
        .matches(/.*\S.*/, 'Department name cannot be empty or spaces only')
        .max(100, 'Department name cannot exceed 100 characters'),

    description: yup
        .string()
        .max(250, 'Description cannot exceed 250 characters'),

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

    const [checkingDepartmentName, setCheckingDepartmentName] = useState(false);
    const [departmentNameAvailable, setDepartmentNameAvailable] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        clearErrors,
        formState: { errors, isValid },
    } = useForm<DepartmentFormData>({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            departmentName: '',
            description: '',
            headId: '',
        },
    });

    const watchedDepartmentName = watch('departmentName');
    const watchedDescription = watch('description');

    useEffect(() => {
        if (!open) return;

        if (department) {
            reset({
                departmentName: department.departmentName || '',
                description: department.description || '',
                headId: department.headId || '',
            });
        } else {
            reset({
                departmentName: '',
                description: '',
                headId: '',
            });
        }

        setDepartmentNameAvailable(null);
    }, [open, department, reset]);

    useEffect(() => {
        const departmentName = watchedDepartmentName?.trim();

        if (!open) return;

        if (!departmentName || departmentName.length < 2) {
            setDepartmentNameAvailable(null);
            return;
        }

        if (
            isEdit &&
            departmentName.toLowerCase() === department?.departmentName?.trim().toLowerCase()
        ) {
            clearErrors('departmentName');
            setDepartmentNameAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setCheckingDepartmentName(true);

                const exists = await checkDepartmentNameExists(
                    departmentName,
                    department?.id
                );

                if (exists) {
                    setDepartmentNameAvailable(false);
                    setError('departmentName', {
                        type: 'manual',
                        message: 'Department name already exists',
                    });
                } else {
                    setDepartmentNameAvailable(true);
                    clearErrors('departmentName');
                }
            } catch {
                setDepartmentNameAvailable(null);
                setError('departmentName', {
                    type: 'manual',
                    message: 'Could not verify department name availability',
                });
            } finally {
                setCheckingDepartmentName(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [
        watchedDepartmentName,
        open,
        isEdit,
        department?.id,
        department?.departmentName,
        setError,
        clearErrors,
    ]);

    const handleFormSubmit = async (data: DepartmentFormData) => {
        if (departmentNameAvailable === false) {
            setError('departmentName', {
                type: 'manual',
                message: 'Department name already exists',
            });
            return;
        }

        await onSubmit({
            ...data,
            departmentName: data.departmentName.trim(),
            description: data.description?.trim() || '',
            headId: data.headId || '',
        });

        reset();
        setDepartmentNameAvailable(null);
    };

    const handleClose = () => {
        reset();
        setDepartmentNameAvailable(null);
        onClose();
    };

    const departmentNameHelperText =
        errors.departmentName?.message ||
        (checkingDepartmentName
            ? 'Checking department name availability...'
            : departmentNameAvailable === true
                ? 'Department name is available'
                : 'Department name must be unique');

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
                        disabled={
                            !isValid ||
                            loading ||
                            checkingDepartmentName ||
                            departmentNameAvailable === false
                        }
                        sx={{
                            minWidth: 130,
                            background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                        }}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </>
            }
        >
            <form>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: '#F8FAFC',
                            borderColor: '#E2E8F0',
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 800,
                                color: '#1E293B',
                                mb: 0.5,
                            }}
                        >
                            Department Details
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#64748B',
                                fontFamily: 'Poppins, sans-serif',
                            }}
                        >
                            {isEdit
                                ? 'Update department information and assigned department head.'
                                : 'Create a department and optionally assign a department head.'}
                        </Typography>
                    </Paper>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Input
                                label="Department Name"
                                placeholder="Example: Procurement Department"
                                {...register('departmentName')}
                                error={!!errors.departmentName}
                                helperText={departmentNameHelperText}
                                disabled={loading}
                                FormHelperTextProps={{
                                    sx: {
                                        color:
                                            errors.departmentName
                                                ? '#D32F2F'
                                                : departmentNameAvailable === true
                                                    ? '#2E7D32'
                                                    : undefined,
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessOutlinedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Input
                                label="Description"
                                placeholder="Describe what this department is responsible for"
                                multiline
                                rows={3}
                                {...register('description')}
                                error={!!errors.description}
                                helperText={
                                    errors.description?.message ||
                                    `${watchedDescription?.length || 0}/250 characters`
                                }
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionOutlinedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
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
                                        helperText={
                                            errors.headId?.message ||
                                            'Select a user responsible for this department'
                                        }
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SupervisorAccountOutlinedIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>

                                        {users.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.fullName} - {user.roleName}
                                            </MenuItem>
                                        ))}
                                    </Input>
                                )}
                            />
                        </Grid>
                    </Grid>

                    {!!watchedDepartmentName?.trim() && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: '#F8FAFC',
                                borderColor: '#E2E8F0',
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 800,
                                    color: '#334155',
                                    mb: 1,
                                }}
                            >
                                Preview
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>
                                    {watchedDepartmentName.trim()}
                                </Typography>

                                <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    {departmentNameAvailable === true
                                        ? 'This department name is available.'
                                        : departmentNameAvailable === false
                                            ? 'This department name is already used.'
                                            : 'Department name will be checked for uniqueness.'}
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                </Stack>
            </form>
        </Modal>
    );
};