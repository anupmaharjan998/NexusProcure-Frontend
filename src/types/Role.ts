export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
  isGranted?: boolean;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export const ROLE_TYPES = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
  DEPARTMENT_HEAD: 'Department Head',
  PROCUREMENT_OFFICER: 'Procurement Officer',
} as const;


