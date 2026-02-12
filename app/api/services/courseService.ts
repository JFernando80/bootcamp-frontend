import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  CourseDTO,
} from "../types";

const BASE_PATH = "/bootcamp/course";

/**
 * Serviço para gerenciar cursos
 */
export const courseService = {
  /**
   * Criar um novo curso
   */
  async create(course: CourseDTO): Promise<JsonResponse<CourseDTO>> {
    return apiPost<JsonResponse<CourseDTO>, CourseDTO>(BASE_PATH, course);
  },

  /**
   * Atualizar um curso existente
   */
  async update(
    slug: string,
    course: CourseDTO,
  ): Promise<JsonResponse<CourseDTO>> {
    return apiPut<JsonResponse<CourseDTO>, CourseDTO>(BASE_PATH, course);
  },

  /**
   * Deletar um curso
   */
  async delete(slug: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}?slug=${slug}`);
  },

  /**
   * Listar cursos com filtro e paginação
   */
  async list(
    page: number = 1,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    console.log(
      "courseService.list - Página:",
      page,
      "Filtros:",
      JSON.stringify(filters, null, 2),
    );
    return apiPost<
      JsonResponse<PaginatedResponse<CourseDTO>>,
      SearchCriteriaDTO[]
    >(`${BASE_PATH}/filtro/${page}`, filters || []);
  },

  /**
   * Buscar curso por slug
   */
  async getById(slug: string): Promise<CourseDTO | null> {
    try {
      const response = await this.list(1, [
        { key: "slug", operation: "EQUALS", value: slug },
      ]);

      if (response.body && response.body.lista.length > 0) {
        return response.body.lista[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar curso por slug:", error);
      return null;
    }
  },

  /**
   * Buscar todos os cursos sem filtro
   */
  async getAll(
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    return this.list(page, []);
  },

  /**
   * Buscar cursos por título
   */
  async searchByTitle(
    title: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    return this.list(page, [{ key: "title", operation: "LIKE", value: title }]);
  },

  /**
   * Buscar campos disponíveis para filtros
   */
  async getFields(): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>(`${BASE_PATH}/consulta`);
  },

  /**
   * Buscar cursos ativos (publicados)
   */
  async getActive(
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    return this.getAll(page);
  },
};
