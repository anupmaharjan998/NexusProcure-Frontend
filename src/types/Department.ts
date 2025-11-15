export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  headName?: string;
  employeesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  headId?: string;
}


