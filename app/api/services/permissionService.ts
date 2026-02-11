import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  PermissionDTO,
  PermissionGroupDTO,
  PermissionTypeDTO,
  UserPermissionTypeDTO,
  PerfilPermissionTypeDTO,
} from "../types";

/**
 * Serviço para gerenciar permissões
 */
export const permissionService = {
  /**
   * Criar uma nova permissão
   */
  async create(
    permission: PermissionDTO,
  ): Promise<JsonResponse<PermissionDTO>> {
    return apiPost<JsonResponse<PermissionDTO>, PermissionDTO>(
      "/bootcamp/permission",
      permission,
    );
  },

  /**
   * Atualizar uma permissão existente
   */
  async update(
    id: number,
    permission: PermissionDTO,
  ): Promise<JsonResponse<PermissionDTO>> {
    return apiPut<JsonResponse<PermissionDTO>, PermissionDTO>(
      `/bootcamp/permission/${id}`,
      permission,
    );
  },

  /**
   * Deletar uma permissão
   */
  async delete(id: number): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`/bootcamp/permission/${id}`);
  },

  /**
   * Listar permissões com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<PermissionDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<PermissionDTO>>,
      SearchCriteriaDTO[]
    >(`/bootcamp/permission/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>("/bootcamp/permission/consulta");
  },
};

/**
 * Serviço para gerenciar grupos de permissão
 */
export const permissionGroupService = {
  /**
   * Criar um novo grupo de permissão
   */
  async create(
    group: PermissionGroupDTO,
  ): Promise<JsonResponse<PermissionGroupDTO>> {
    return apiPost<JsonResponse<PermissionGroupDTO>, PermissionGroupDTO>(
      "/bootcamp/permission_group",
      group,
    );
  },

  /**
   * Atualizar um grupo de permissão existente
   */
  async update(
    id: number,
    group: PermissionGroupDTO,
  ): Promise<JsonResponse<PermissionGroupDTO>> {
    return apiPut<JsonResponse<PermissionGroupDTO>, PermissionGroupDTO>(
      `/bootcamp/permission_group/${id}`,
      group,
    );
  },

  /**
   * Deletar um grupo de permissão
   */
  async delete(id: number): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`/bootcamp/permission_group/${id}`);
  },

  /**
   * Listar grupos com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<PermissionGroupDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<PermissionGroupDTO>>,
      SearchCriteriaDTO[]
    >(`/bootcamp/permission_group/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>("/bootcamp/permission_group/consulta");
  },
};

/**
 * Serviço para gerenciar tipos de permissão
 */
export const permissionTypeService = {
  /**
   * Criar um novo tipo de permissão
   */
  async create(
    type: PermissionTypeDTO,
  ): Promise<JsonResponse<PermissionTypeDTO>> {
    return apiPost<JsonResponse<PermissionTypeDTO>, PermissionTypeDTO>(
      "/bootcamp/permission_type",
      type,
    );
  },

  /**
   * Atualizar um tipo de permissão existente
   */
  async update(
    id: number,
    type: PermissionTypeDTO,
  ): Promise<JsonResponse<PermissionTypeDTO>> {
    return apiPut<JsonResponse<PermissionTypeDTO>, PermissionTypeDTO>(
      `/bootcamp/permission_type/${id}`,
      type,
    );
  },

  /**
   * Deletar um tipo de permissão
   */
  async delete(id: number): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`/bootcamp/permission_type/${id}`);
  },

  /**
   * Listar tipos com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<PermissionTypeDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<PermissionTypeDTO>>,
      SearchCriteriaDTO[]
    >(`/bootcamp/permission_type/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>("/bootcamp/permission_type/consulta");
  },
};

/**
 * Serviço para gerenciar permissões de usuário
 */
export const userPermissionTypeService = {
  /**
   * Criar uma nova permissão de usuário
   */
  async create(
    userPermission: UserPermissionTypeDTO,
  ): Promise<JsonResponse<UserPermissionTypeDTO>> {
    return apiPost<JsonResponse<UserPermissionTypeDTO>, UserPermissionTypeDTO>(
      "/bootcamp/user_permission_type",
      userPermission,
    );
  },

  /**
   * Atualizar uma permissão de usuário existente
   */
  async update(
    id: number,
    userPermission: UserPermissionTypeDTO,
  ): Promise<JsonResponse<UserPermissionTypeDTO>> {
    return apiPut<JsonResponse<UserPermissionTypeDTO>, UserPermissionTypeDTO>(
      `/bootcamp/user_permission_type/${id}`,
      userPermission,
    );
  },

  /**
   * Deletar uma permissão de usuário
   */
  async delete(id: number): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(
      `/bootcamp/user_permission_type/${id}`,
    );
  },

  /**
   * Listar permissões com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<UserPermissionTypeDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<UserPermissionTypeDTO>>,
      SearchCriteriaDTO[]
    >(`/bootcamp/user_permission_type/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>("/bootcamp/user_permission_type/consulta");
  },

  /**
   * Buscar permissões de um usuário
   */
  async getByUser(
    userId: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<UserPermissionTypeDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
    ]);
  },
};

/**
 * Serviço para gerenciar permissões de perfil
 */
export const perfilPermissionTypeService = {
  /**
   * Criar uma nova permissão de perfil
   */
  async create(
    perfilPermission: PerfilPermissionTypeDTO,
  ): Promise<JsonResponse<PerfilPermissionTypeDTO>> {
    return apiPost<
      JsonResponse<PerfilPermissionTypeDTO>,
      PerfilPermissionTypeDTO
    >("/bootcamp/perfil_permission_type", perfilPermission);
  },

  /**
   * Atualizar uma permissão de perfil existente
   */
  async update(
    id: number,
    perfilPermission: PerfilPermissionTypeDTO,
  ): Promise<JsonResponse<PerfilPermissionTypeDTO>> {
    return apiPut<
      JsonResponse<PerfilPermissionTypeDTO>,
      PerfilPermissionTypeDTO
    >(`/bootcamp/perfil_permission_type/${id}`, perfilPermission);
  },

  /**
   * Deletar uma permissão de perfil
   */
  async delete(id: number): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(
      `/bootcamp/perfil_permission_type/${id}`,
    );
  },

  /**
   * Listar permissões com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<PerfilPermissionTypeDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<PerfilPermissionTypeDTO>>,
      SearchCriteriaDTO[]
    >(`/bootcamp/perfil_permission_type/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>(
      "/bootcamp/perfil_permission_type/consulta",
    );
  },

  /**
   * Buscar permissões de um perfil
   */
  async getByPerfil(
    perfilId: number,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<PerfilPermissionTypeDTO>>> {
    return this.list(page, [
      { key: "perfilId", operation: "EQUALS", value: perfilId },
    ]);
  },
};
