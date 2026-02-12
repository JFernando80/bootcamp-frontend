import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  UserModuleDTO,
} from "../types";

const BASE_PATH = "/bootcamp/user_module";

/**
 * Serviço para gerenciar relações usuário-módulo
 */
export const userModuleService = {
  /**
   * Criar uma nova relação usuário-módulo
   */
  async create(
    userModule: UserModuleDTO,
  ): Promise<JsonResponse<UserModuleDTO>> {
    return apiPost<JsonResponse<UserModuleDTO>, UserModuleDTO>(
      BASE_PATH,
      userModule,
    );
  },

  /**
   * Atualizar uma relação usuário-módulo existente
   */
  async update(
    id: string,
    userModule: UserModuleDTO,
  ): Promise<JsonResponse<UserModuleDTO>> {
    return apiPut<JsonResponse<UserModuleDTO>, UserModuleDTO>(
      `${BASE_PATH}/${id}`,
      userModule,
    );
  },

  /**
   * Deletar uma relação usuário-módulo
   */
  async delete(id: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/${id}`);
  },

  /**
   * Listar relações com filtro e paginação
   */
  async list(
    page: number = 1,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<UserModuleDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<UserModuleDTO>>,
      SearchCriteriaDTO[]
    >(`${BASE_PATH}/filtro/${page}`, filters || []);
  },

  /**
   * Buscar campos disponíveis para consulta
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>(`${BASE_PATH}/consulta`);
  },

  /**
   * Buscar módulos de um usuário
   */
  async getByUser(
    userId: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserModuleDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUAL", value: userId },
    ]);
  },

  /**
   * Buscar usuários de um módulo
   */
  async getByModule(
    moduleId: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserModuleDTO>>> {
    return this.list(page, [
      { key: "moduleId", operation: "EQUAL", value: moduleId },
    ]);
  },

  /**
   * Buscar módulos de um usuário por status
   */
  async getByUserAndStatus(
    userId: string,
    status: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserModuleDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUAL", value: userId },
      { key: "status", operation: "EQUAL", value: status },
    ]);
  },

  /**
   * Iniciar um módulo
   */
  async start(
    userId: string,
    moduleId: string,
  ): Promise<JsonResponse<UserModuleDTO>> {
    return this.create({
      userId,
      moduleId,
      status: "IN_PROGRESS",
      progress: 0,
      startedAt: new Date().toISOString(),
    });
  },

  /**
   * Atualizar progresso do usuário no módulo
   */
  async updateProgress(
    id: string,
    progress: number,
  ): Promise<JsonResponse<UserModuleDTO>> {
    return apiPut<JsonResponse<UserModuleDTO>, Partial<UserModuleDTO>>(
      `${BASE_PATH}/${id}`,
      { progress },
    );
  },

  /**
   * Marcar módulo como concluído
   */
  async complete(id: string): Promise<JsonResponse<UserModuleDTO>> {
    return apiPut<JsonResponse<UserModuleDTO>, Partial<UserModuleDTO>>(
      `${BASE_PATH}/${id}`,
      {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date().toISOString(),
      },
    );
  },
};
