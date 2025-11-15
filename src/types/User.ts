export interface User {
  id?: string;
  fullName: string;
  email: string;
  username?: string;
  roleId: string;
  roleName?: string;
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
  roleName: string;
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


