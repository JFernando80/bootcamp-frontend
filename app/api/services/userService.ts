import { apiGet, apiPost, apiPut, apiDelete } from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  UserDTO,
} from "../types";

const BASE_PATH = "/bootcamp/user";

/**
 * Serviço para gerenciar usuários
 */
export const userService = {
  /**
   * Criar um novo usuário
   */
  async create(user: UserDTO): Promise<JsonResponse<UserDTO>> {
    return apiPost<JsonResponse<UserDTO>, UserDTO>(`${BASE_PATH}/new`, user);
  },

  /**
   * Atualizar um usuário existente
   */
  async update(id: string, user: UserDTO): Promise<JsonResponse<UserDTO>> {
    return apiPut<JsonResponse<UserDTO>, UserDTO>(`${BASE_PATH}/${id}`, user);
  },

  /**
   * Deletar um usuário
   */
  async delete(id: string): Promise<JsonResponse<void>> {
    return apiDelete<JsonResponse<void>>(`${BASE_PATH}/${id}`);
  },

  /**
   * Listar usuários com filtro e paginação
   */
  async list(
    page: number = 1,
    filters?: SearchCriteriaDTO[],
  ): Promise<JsonResponse<PaginatedResponse<UserDTO>>> {
    return apiPost<
      JsonResponse<PaginatedResponse<UserDTO>>,
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
   * Buscar usuário por ID
   */
  async getById(id: string): Promise<UserDTO | null> {
    try {
      const response = await this.list(1, [
        { key: "id", operation: "EQUALS", value: id },
      ]);

      if (response.body && response.body.lista.length > 0) {
        return response.body.lista[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  },

  /**
   * Buscar usuário por email
   */
  async getByEmail(email: string): Promise<UserDTO | null> {
    try {
      const response = await this.list(1, [
        { key: "email", operation: "EQUALS", value: email },
      ]);

      if (response.body && response.body.lista.length > 0) {
        return response.body.lista[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return null;
    }
  },

  /**
   * Buscar usuários por nome
   */
  async searchByName(
    name: string,
    page: number = 1,
  ): Promise<JsonResponse<PaginatedResponse<UserDTO>>> {
    return this.list(page, [{ key: "name", operation: "LIKE", value: name }]);
  },
};
