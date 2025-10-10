export interface User {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  role?: string;
  departmentId: string;
  departmentName?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  role: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  roleId: string;
  departmentId: string;
  status: 'Active' | 'Inactive';
}


