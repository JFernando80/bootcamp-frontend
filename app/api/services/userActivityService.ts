import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  UserActivityDTO,
} from "../types";

const BASE_PATH = "/bootcamp/user_activity";

/**
 * Serviço para gerenciar relações usuário-atividade
 */
export const userActivityService = {
  /**
   * Criar uma nova relação usuário-atividade
   */
  async create(
    userActivity: UserActivityDTO,
  ): Promise<JsonResponse<UserActivityDTO>> {
    return apiPost<JsonResponse<UserActivityDTO>, UserActivityDTO>(
      BASE_PATH,
      userActivity,
    );
  },

  /**
   * Atualizar uma relação usuário-atividade existente
   */
  async update(
    id: string,
    userActivity: UserActivityDTO,
  ): Promise<JsonResponse<UserActivityDTO>> {
    return apiPut<JsonResponse<UserActivityDTO>, UserActivityDTO>(
      `${BASE_PATH}/${id}`,
      userActivity,
    );
  },

  /**
   * Deletar uma relação usuário-atividade
   */
  async delete(id: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/${id}`);
  },

  /**
   * Listar relações com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<UserActivityDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<UserActivityDTO>>,
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
   * Buscar atividades de um usuário
   */
  async getByUser(
    userId: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<UserActivityDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
    ]);
  },

  /**
   * Buscar usuários de uma atividade
   */
  async getByActivity(
    activityId: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<UserActivityDTO>>> {
    return this.list(page, [
      { key: "activityId", operation: "EQUALS", value: activityId },
    ]);
  },

  /**
   * Buscar atividades de um usuário por status
   */
  async getByUserAndStatus(
    userId: string,
    status: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<UserActivityDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
      { key: "status", operation: "EQUALS", value: status },
    ]);
  },

  /**
   * Buscar atividades concluídas de um usuário
   */
  async getCompletedByUser(
    userId: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<UserActivityDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
      { key: "completed", operation: "EQUALS", value: true },
    ]);
  },

  /**
   * Iniciar uma atividade
   */
  async start(
    userId: string,
    activityId: string,
  ): Promise<JsonResponse<UserActivityDTO>> {
    return this.create({
      userId,
      activityId,
      status: "IN_PROGRESS",
      completed: false,
      attempts: 0,
      startedAt: new Date().toISOString(),
    });
  },

  /**
   * Marcar atividade como concluída
   */
  async complete(
    id: string,
    score?: number,
  ): Promise<JsonResponse<UserActivityDTO>> {
    return apiPut<JsonResponse<UserActivityDTO>, Partial<UserActivityDTO>>(
      `${BASE_PATH}/${id}`,
      {
        status: "COMPLETED",
        completed: true,
        score,
        completedAt: new Date().toISOString(),
      },
    );
  },

  /**
   * Registrar tentativa de atividade
   */
  async registerAttempt(
    id: string,
    score: number,
  ): Promise<JsonResponse<UserActivityDTO>> {
    const current = await this.list(0, [
      { key: "id", operation: "EQUALS", value: id },
    ]);

    if (current.data && current.data.content.length > 0) {
      const userActivity = current.data.content[0];
      const attempts = (userActivity.attempts || 0) + 1;

      return apiPut<JsonResponse<UserActivityDTO>, Partial<UserActivityDTO>>(
        `${BASE_PATH}/${id}`,
        {
          attempts,
          score,
        },
      );
    }

    throw new Error("Atividade não encontrada");
  },
};
