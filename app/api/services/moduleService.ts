import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  ModuleDTO,
} from "../types";

const BASE_PATH = "/bootcamp/module";

/**
 * Serviço para gerenciar módulos
 */
export const moduleService = {
  /**
   * Criar um novo módulo
   */
  async create(module: ModuleDTO): Promise<JsonResponse<ModuleDTO>> {
    return apiPost<JsonResponse<ModuleDTO>, ModuleDTO>(BASE_PATH, module);
  },

  /**
   * Atualizar um módulo existente
   */
  async update(
    id: string,
    module: ModuleDTO,
  ): Promise<JsonResponse<ModuleDTO>> {
    return apiPut<JsonResponse<ModuleDTO>, ModuleDTO>(
      `${BASE_PATH}/${id}`,
      module,
    );
  },

  /**
   * Deletar um módulo
   */
  async delete(id: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/${id}`);
  },

  /**
   * Listar módulos com filtro e paginação
   */
  async list(
    page: number = 1,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<ModuleDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<ModuleDTO>>,
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
   * Buscar todos os módulos sem filtro
   */
  async getAll(
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<ModuleDTO>>> {
    return this.list(page, []);
  },

  /**
   * Buscar módulo por ID
   */
  async getById(id: string): Promise<ModuleDTO | null> {
    try {
      const response = await this.list(1, [
        { key: "id", operation: "EQUAL", value: id },
      ]);

      if (response.body && response.body.lista.length > 0) {
        return response.body.lista[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar módulo por ID:", error);
      return null;
    }
  },

  /**
   * Buscar módulos por curso
   */
  async getByCourse(
    courseId: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<ModuleDTO>>> {
    return this.list(page, [
      { key: "courseId", operation: "EQUAL", value: courseId },
    ]);
  },

  /**
   * Buscar módulos por nome
   */
  async searchByName(
    name: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<ModuleDTO>>> {
    return this.list(page, [{ key: "name", operation: "MATCH", value: name }]);
  },
};
