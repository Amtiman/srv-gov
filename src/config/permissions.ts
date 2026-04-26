export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export const permissions: Permission[] = [
  {
    id: 'services.view',
    name: 'View Services',
    description: 'Can view available government services',
  },
  {
    id: 'services.create',
    name: 'Create Services',
    description: 'Can create new government services',
  },
  {
    id: 'services.edit',
    name: 'Edit Services',
    description: 'Can edit existing services',
  },
  {
    id: 'services.delete',
    name: 'Delete Services',
    description: 'Can delete services',
  },
  {
    id: 'requests.view',
    name: 'View Requests',
    description: 'Can view service requests',
  },
  {
    id: 'requests.create',
    name: 'Create Requests',
    description: 'Can create new service requests',
  },
  {
    id: 'requests.edit',
    name: 'Edit Requests',
    description: 'Can edit service requests',
  },
  {
    id: 'requests.delete',
    name: 'Delete Requests',
    description: 'Can delete service requests',
  },
  {
    id: 'requests.approve',
    name: 'Approve Requests',
    description: 'Can approve or reject service requests',
  },
  {
    id: 'documents.view',
    name: 'View Documents',
    description: 'Can view uploaded documents',
  },
  {
    id: 'documents.upload',
    name: 'Upload Documents',
    description: 'Can upload documents',
  },
  {
    id: 'documents.delete',
    name: 'Delete Documents',
    description: 'Can delete documents',
  },
  {
    id: 'payments.view',
    name: 'View Payments',
    description: 'Can view payment information',
  },
  {
    id: 'payments.process',
    name: 'Process Payments',
    description: 'Can process payments',
  },
  {
    id: 'admin.access',
    name: 'Admin Access',
    description: 'Can access admin panel',
  },
  {
    id: 'users.manage',
    name: 'Manage Users',
    description: 'Can manage user accounts',
  },
];

export const roles: Role[] = [
  {
    id: 'CITIZEN',
    name: 'Citizen',
    permissions: [
      'services.view',
      'requests.view',
      'requests.create',
      'documents.view',
      'documents.upload',
      'payments.view',
      'payments.process',
    ],
  },
  {
    id: 'ADMIN',
    name: 'Administrator',
    permissions: [
      'services.view',
      'services.create',
      'services.edit',
      'services.delete',
      'requests.view',
      'requests.create',
      'requests.edit',
      'requests.delete',
      'requests.approve',
      'documents.view',
      'documents.upload',
      'documents.delete',
      'payments.view',
      'payments.process',
      'admin.access',
      'users.manage',
    ],
  },
];

export const getAvailablePermissions = (t: (key: string) => string) => {
  return permissions.map((permission) => ({
    ...permission,
    name: t(`permissions.${permission.id}`),
  }));
};

export const getRolePermissions = (roleId: string): string[] => {
  const role = roles.find((r) => r.id === roleId);
  return role?.permissions || [];
};

export const isPermissionValid = (permissionId: string): boolean => {
  return permissions.some((p) => p.id === permissionId);
};
