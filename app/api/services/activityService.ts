import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  ActivityDTO,
} from "../types";

const BASE_PATH = "/bootcamp/activity";

/**
 * Serviço para gerenciar atividades
 */
export const activityService = {
  /**
   * Criar uma nova atividade
   */
  async create(activity: ActivityDTO): Promise<JsonResponse<ActivityDTO>> {
    return apiPost<JsonResponse<ActivityDTO>, ActivityDTO>(BASE_PATH, activity);
  },

  /**
   * Atualizar uma atividade existente
   */
  async update(
    id: string,
    activity: ActivityDTO,
  ): Promise<JsonResponse<ActivityDTO>> {
    return apiPut<JsonResponse<ActivityDTO>, ActivityDTO>(
      `${BASE_PATH}/${id}`,
      activity,
    );
  },

  /**
   * Deletar uma atividade
   */
  async delete(id: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/${id}`);
  },

  /**
   * Listar atividades com filtro e paginação
   */
  async list(
    page: number = 0,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<ActivityDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<ActivityDTO>>,
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
   * Buscar todas as atividades sem filtro
   */
  async getAll(
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<ActivityDTO>>> {
    return this.list(page, []);
  },

  /**
   * Buscar atividade por ID
   */
  async getById(id: string): Promise<ActivityDTO | null> {
    try {
      const response = await this.list(0, [
        { key: "id", operation: "EQUALS", value: id },
      ]);

      if (response.data && response.data.content.length > 0) {
        return response.data.content[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar atividade por ID:", error);
      return null;
    }
  },

  /**
   * Buscar atividades por módulo
   */
  async getByModule(
    moduleId: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<ActivityDTO>>> {
    return this.list(page, [
      { key: "moduleId", operation: "EQUALS", value: moduleId },
    ]);
  },

  /**
   * Buscar atividades por tipo
   */
  async getByType(
    type: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<ActivityDTO>>> {
    return this.list(page, [{ key: "type", operation: "EQUALS", value: type }]);
  },

  /**
   * Buscar atividades por nome
   */
  async searchByName(
    name: string,
    page: number = 0,
  ): Promise<JsonResponse<PaginatedResponse<ActivityDTO>>> {
    return this.list(page, [{ key: "name", operation: "LIKE", value: name }]);
  },
};
