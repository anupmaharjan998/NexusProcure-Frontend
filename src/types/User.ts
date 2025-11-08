export interface User {
  id?: string;
  fullName: string;
  email: string;
  username?: string;
  roleId: string;
  role?: string;
  departmentId: string;
  departmentName?: string;
  isActive: boolean;
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
  username?: string;
  password?: string;
  roleId: string;
  departmentId: string;
  isActive: boolean;
}


