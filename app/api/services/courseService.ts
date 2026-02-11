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
    return apiPost<JsonResponse<CourseDTO>, CourseDTO>(
      `${BASE_PATH}/cadastro`,
      course,
    );
  },

  /**
   * Atualizar um curso existente
   */
  async update(
    slug: string,
    course: CourseDTO,
  ): Promise<JsonResponse<CourseDTO>> {
    return apiPut<JsonResponse<CourseDTO>, CourseDTO>(
      `${BASE_PATH}/atualizar`,
      course,
    );
  },

  /**
   * Deletar um curso
   */
  async delete(slug: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/deletar?slug=${slug}`);
  },

  /**
   * Listar cursos com filtro e paginação
   */
  async list(
    titulo?: string,
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    const url = titulo
      ? `${BASE_PATH}/listar?titulo=${encodeURIComponent(titulo)}`
      : `${BASE_PATH}/listar`;
    return apiGet<JsonResponse<PaginatedResponse<CourseDTO>>>(url);
  },

  /**
   * Buscar curso por slug
   */
  async getById(slug: string): Promise<CourseDTO | null> {
    try {
      const response = await this.list(slug);

      if (response.data && response.data.content.length > 0) {
        return response.data.content[0];
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
  async getAll(): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    return this.list();
  },

  /**
   * Buscar cursos por título
   */
  async searchByTitle(
    title: string,
  ): Promise<JsonResponse<PaginatedResponse<CourseDTO>>> {
    return this.list(title);
  },
};
