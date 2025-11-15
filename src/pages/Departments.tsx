import { Box, Typography, IconButton, Alert, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Table, Column } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { DepartmentForm } from '../components/Department/DepartmentForm';
import { Department, DepartmentFormData } from '../types/Department.ts';
import { User } from '../types/User.ts';
import { useEffect, useState } from 'react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/departmentService.ts';
import { getUsers } from '../services/userService.ts';

export const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | undefined>();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [departmentsData, usersData] = await Promise.all([
        getDepartments(),
        getUsers(),
      ]);
      setDepartments(departmentsData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedDepartment(undefined);
    setFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    setActionLoading(true);
    try {
      await deleteDepartment(departmentToDelete.id);
      setSuccess('Department deleted successfully');
      setDeleteDialogOpen(false);
      setDepartmentToDelete(undefined);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: DepartmentFormData) => {
    setActionLoading(true);
    setError('');
    try {
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment.id, data);
        setSuccess('Department updated successfully');
      } else {
        await createDepartment(data);
        setSuccess('Department created successfully');
      }
      setFormOpen(false);
      setSelectedDepartment(undefined);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Department>[] = [
    { id: 'name', label: 'Department Name', minWidth: 150 },
    { id: 'description', label: 'Description', minWidth: 250 },
    {
      id: 'headName',
      label: 'Department Head',
      minWidth: 150,
      format: (value) =>
        value ? (
          value
        ) : (
          <Typography variant="body2" color="textSecondary">
            Not Assigned
          </Typography>
        ),
    },
    {
      id: 'employeesCount',
      label: 'Employees',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value || 0}
          size="small"
          color="primary"
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      format: (_, department) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(department);
            }}
            sx={{ color: '#0056D2' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(department);
            }}
            sx={{ color: '#E63946' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.5,
              }}
            >
              Departments Management
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#64748B',
              }}
            >
              Organize and manage organizational departments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
            }}
          >
            Add Department
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Table columns={columns} data={departments} loading={loading} />

        <DepartmentForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedDepartment(undefined);
          }}
          onSubmit={handleFormSubmit}
          department={selectedDepartment}
          users={users}
          loading={actionLoading}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Department"
          message={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setDepartmentToDelete(undefined);
          }}
          confirmText="Delete"
          confirmColor="error"
          loading={actionLoading}
        />
      </Box>
    </DashboardLayout>
  );
};


