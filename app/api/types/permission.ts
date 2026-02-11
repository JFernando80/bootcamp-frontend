// Tipos relacionados a permissões e controle de acesso

export interface PermissionDTO {
  id?: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionGroupDTO {
  id?: number;
  name: string;
  description: string;
  permissions?: PermissionDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionTypeDTO {
  id?: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPermissionTypeDTO {
  id?: number;
  userId: string;
  permissionTypeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerfilPermissionTypeDTO {
  id?: number;
  perfilId: number;
  permissionTypeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenEntityDTO {
  id?: number;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}
