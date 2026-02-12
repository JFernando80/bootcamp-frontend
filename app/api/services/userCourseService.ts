import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  UserCourseDTO,
} from "../types";

const BASE_PATH = "/bootcamp/user_course";

/**
 * Serviço para gerenciar relações usuário-curso
 */
export const userCourseService = {
  /**
   * Criar uma nova relação usuário-curso (inscrever usuário em curso)
   */
  async create(
    userCourse: UserCourseDTO,
  ): Promise<JsonResponse<UserCourseDTO>> {
    return apiPost<JsonResponse<UserCourseDTO>, UserCourseDTO>(
      BASE_PATH,
      userCourse,
    );
  },

  /**
   * Atualizar uma relação usuário-curso existente
   */
  async update(
    id: string,
    userCourse: UserCourseDTO,
  ): Promise<JsonResponse<UserCourseDTO>> {
    return apiPut<JsonResponse<UserCourseDTO>, UserCourseDTO>(
      `${BASE_PATH}/${id}`,
      userCourse,
    );
  },

  /**
   * Deletar uma relação usuário-curso
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
  ): Promise<JsonResponse<PaginatedResponse<UserCourseDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<UserCourseDTO>>,
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
   * Buscar cursos de um usuário
   */
  async getByUser(
    userId: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserCourseDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
    ]);
  },

  /**
   * Buscar usuários inscritos em um curso
   */
  async getByCourse(
    courseId: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserCourseDTO>>> {
    return this.list(page, [
      { key: "courseId", operation: "EQUALS", value: courseId },
    ]);
  },

  /**
   * Buscar cursos de um usuário por status
   */
  async getByUserAndStatus(
    userId: string,
    status: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserCourseDTO>>> {
    return this.list(page, [
      { key: "userId", operation: "EQUALS", value: userId },
      { key: "status", operation: "EQUALS", value: status },
    ]);
  },

  /**
   * Inscrever usuário em um curso
   */
  async enroll(
    userId: string,
    courseId: string,
  ): Promise<JsonResponse<UserCourseDTO>> {
    return this.create({
      userId,
      courseId,
      status: "ACTIVE",
      progress: 0,
    });
  },

  /**
   * Atualizar progresso do usuário no curso
   */
  async updateProgress(
    id: string,
    progress: number,
  ): Promise<JsonResponse<UserCourseDTO>> {
    return apiPut<JsonResponse<UserCourseDTO>, Partial<UserCourseDTO>>(
      `${BASE_PATH}/${id}`,
      { progress },
    );
  },

  /**
   * Marcar curso como concluído
   */
  async complete(id: string): Promise<JsonResponse<UserCourseDTO>> {
    return apiPut<JsonResponse<UserCourseDTO>, Partial<UserCourseDTO>>(
      `${BASE_PATH}/${id}`,
      {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date().toISOString(),
      },
    );
  },
};
