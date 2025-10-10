export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  headName?: string;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  headId?: string;
}


