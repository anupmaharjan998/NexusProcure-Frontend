import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import {
    createApprovalPolicy
} from '../../services/approvalPolicyService';
import {
    getAllCategories
} from '../../services/vendorService';
import {Role} from "../../types/Role.ts";
import { getRoles } from '../../services/roleService.ts';
import {getUsers} from "@/services/userService.ts";
import {getDepartments} from "@/services/departmentService.ts";

interface CategoryDto {
    id: string;
    name: string;
}

export const ApprovalPolicyForm = ({ open, onClose, defaultValues, onSaved }: any) => {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: defaultValues || {
            categoryId: '',
            riskLevel: 'Low',
            sequenceOrder: 1,
            escalationHours: 24,
            isActive: true
        }
    });


    const [levels, setLevels] = useState([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);


    const fetchRoleData = async () => {
        try {
            const [rolesData] = await Promise.all([
                getRoles()

            ]);
            setRoles(rolesData);
        } catch (err: any) {

        }
    };

    useEffect(() => {
        fetchRoleData();
    }, []);

    useEffect(() => {
        const loadCategoryData = async () => {
            const [cats] = await Promise.all([
                getAllCategories()
            ]);
            setCategories(cats);
        };
        loadCategoryData();
    }, []);

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues]);

    const submit = async (data: any) => {
        await createApprovalPolicy(data);

        onSaved();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {defaultValues ? 'Edit Policy' : 'Add Policy'}
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Controller
                            name="categoryId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField {...field} select label="Category" fullWidth>
                                    {categories.map((c: any) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="roleId"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select label="Assign to Role" fullWidth>
                                    {roles.map((l: any) => (
                                        <MenuItem key={l.id} value={l.id}>
                                            {l.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <Controller
                            name="riskLevel"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select label="Risk Level" fullWidth>
                                    {['Low', 'Medium', 'High'].map(r => (
                                        <MenuItem key={r} value={r}>{r}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Controller
                            name="sequenceOrder"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} type="number" label="Order" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Controller
                            name="escalationHours"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} type="number" label="Escalation Hrs" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} />}
                                    label="Active"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(submit)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
