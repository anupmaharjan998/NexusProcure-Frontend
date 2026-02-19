export interface Department {
    id: string;
    departmentName: string;
    description?: string;
    headId?: string;
    headName?: string;
    employeesCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DepartmentFormData {
    departmentName: string;
    description?: string;
    headId?: string;
}


