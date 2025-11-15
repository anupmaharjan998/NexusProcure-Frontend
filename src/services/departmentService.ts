import api from './api.ts';
import { Department, DepartmentFormData } from '../types/Department.ts';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  } catch (error) {
    return [
      { id: 'd-1', departmentName: 'IT', description: 'Information Technology', headId: 'u-1', headName: 'Alice Johnson', employeesCount: 12 },
      { id: 'd-2', departmentName: 'Finance', description: 'Finance Department', headId: 'u-2', headName: 'Bob Smith', employeesCount: 8 },
    ];
  }
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await api.get<Department>(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (data: DepartmentFormData): Promise<Department> => {
  const response = await api.post<Department>('/departments', data);
  return response.data;
};

export const updateDepartment = async (
  id: string,
  data: DepartmentFormData
): Promise<Department> => {
  const response = await api.put<Department>(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`/departments/${id}`);
};


