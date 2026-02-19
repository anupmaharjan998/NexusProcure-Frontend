import {useEffect, useState} from 'react';
import {Box, Typography, IconButton, Alert} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {DashboardLayout} from '../components/Layout/DashboardLayout';
import {Table, Column} from '../components/UI/Table';
import {Button} from '../components/UI/Button';
import {ConfirmDialog} from '../components/UI/ConfirmDialog';
import {CategoryForm} from '../components/Category/CategoryForm';
import {getAllCategories, createCategory, updateCategory, deleteCategory} from '../services/categoryService';
import {Category, CategoryRequest} from '../types/Category';

export const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>();
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setSelectedCategory(undefined);
        setFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setActionLoading(true);
        try {
            await deleteCategory(categoryToDelete.id);
            setSuccess('Category deleted successfully');
            setDeleteDialogOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (data: CategoryRequest) => {
        setActionLoading(true);
        setError('');
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, data);
                setSuccess('Category updated successfully');
            } else {
                await createCategory(data);
                setSuccess('Category created successfully');
            }
            setFormOpen(false);
            setSelectedCategory(undefined);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save category');
        } finally {
            setActionLoading(false);
        }
    };

    const columns: Column<Category>[] = [
        {id: 'name', label: 'Category Name', minWidth: 150},
        {id: 'description', label: 'Description', minWidth: 200},
        {id: 'riskWeight', label: 'Risk Weight', minWidth: 120},
        {id: 'type', label: 'Type', minWidth: 120},
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
            align: 'center',
            format: (_, category) => (
                <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                    <IconButton size="small" onClick={() => handleEdit(category)} sx={{color: '#0056D2'}}>
                        <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(category)} sx={{color: '#E63946'}}>
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                    <Box>
                        <Typography variant="h4" sx={{fontWeight: 700}}>Categories</Typography>
                        <Typography variant="body2" sx={{color: '#64748B'}}>Manage global categories</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={handleAdd}>Add Category</Button>
                </Box>

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

                <Table data={categories} columns={columns} loading={loading}/>

                <CategoryForm
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        setSelectedCategory(undefined);
                    }}
                    category={selectedCategory}
                    onSubmit={handleFormSubmit}
                    loading={actionLoading}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Category"
                    message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteDialogOpen(false)}
                    confirmText="Delete"
                    confirmColor="error"
                    loading={actionLoading}
                />
            </Box>
        </DashboardLayout>
    );
};
