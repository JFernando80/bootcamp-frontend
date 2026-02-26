import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPublicGet,
} from "../httpClient";
import type {
  JsonResponse,
  PaginatedResponse,
  SearchCriteriaDTO,
  CourseDTO,
  FilterField,
} from "../types";

const BASE_PATH = "/bootcamp/course";

/**
 * Campos sensíveis ou irrelevantes que devem ser removidos dos filtros
 */
const BLOCKED_FIELDS = [
  "passwordHash",
  "salt",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "administrador",
  "ownerUser.id", // UUID não é útil para usuário final
];

/**
 * Mapeamento de campos técnicos para labels amigáveis
 */
const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  slug: "Identificador",
  title: "Título",
  description: "Descrição",
  status: "Status",
  publishedAt: "Data de Publicação",
  "ownerUser.name": "Nome do Autor",
  "ownerUser.email": "Email do Autor",
  "ownerUser.sobrenome": "Sobrenome do Autor",
};

/**
 * Simplifica campos da API para formato amigável
 */
function simplifyFilterFields(apiFields: any[]): FilterField[] {
  const uniqueFields = new Map<string, FilterField>();

  for (const field of apiFields) {
    // Pular campos inválidos
    if (!field.variavel || field.variavel === "ordem") continue;

    // Pular campos bloqueados (sensíveis ou irrelevantes)
    if (BLOCKED_FIELDS.some((blocked) => field.variavel.includes(blocked))) {
      continue;
    }

    const key = field.variavel;

    // Se já existe, pular (evitar duplicatas)
    if (uniqueFields.has(key)) continue;

    uniqueFields.set(key, {
      id: field.id,
      key,
      label: FIELD_LABELS[key] || key,
      type: field.tipo,
    });
  }

  return Array.from(uniqueFields.values());
}

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
    return apiPost<
      JsonResponse<PaginatedResponse<CourseDTO>>,
      SearchCriteriaDTO[]
    >(`${BASE_PATH}/filtro/${page}`, filters || []);
  },

  /**
   * Buscar curso por ID (UUID) ou slug
   */
  async getById(id: string): Promise<CourseDTO | null> {
    try {
      // Verificar se é UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        );

      // Buscar sempre usando o endpoint de listagem com filtro.
      // Se o backend não aplicar corretamente o filtro, fazemos um fallback
      // local procurando pelo `id` ou `slug` no resultado e iterando páginas.
      const filters = isUUID
        ? [{ key: "id", operation: "EQUAL", value: id }]
        : [{ key: "slug", operation: "EQUAL", value: id }];

      const response = await this.list(1, filters);
      if (response.body && Array.isArray(response.body.lista)) {
        // Tentar encontrar exato no primeiro pacote
        const found = response.body.lista.find((c: any) =>
          isUUID ? c.id === id : c.slug === id,
        );
        if (found) return found;

        // Se não encontrou e existe paginação, varrer páginas procurando
        const pageSize = response.body.lista.length || 0;
        const total = response.body.total || 0;
        if (pageSize > 0 && total > pageSize) {
          const totalPages = Math.ceil(total / pageSize);
          for (let page = 2; page <= totalPages; page++) {
            const pageResp = await this.list(page, filters);
            const pageFound = pageResp.body?.lista?.find((c: any) =>
              isUUID ? c.id === id : c.slug === id,
            );
            if (pageFound) return pageFound;
          }
        }

        // Se não encontrou nada correspondente, mas recebeu algum resultado,
        // retornar o primeiro item como fallback (comportamento anterior simplificado)
        if (response.body.lista.length > 0) return response.body.lista[0];
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao buscar curso:", error);
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
    return this.list(page, [
      { key: "title", operation: "MATCH", value: title },
    ]);
  },

  /**
   * Buscar campos disponíveis para filtros (versão simplificada)
   */
  async getFields(): Promise<JsonResponse<FilterField[]>> {
    // Use public GET so filter metadata is available without auth
    const response = await apiPublicGet<JsonResponse<any>>(
      `${BASE_PATH}/consulta`,
    );

    if (response.body && Array.isArray(response.body)) {
      const simplifiedFields = simplifyFilterFields(response.body);
      return {
        statusCode: response.statusCode,
        message: response.message,
        body: simplifiedFields,
      };
    }

    return {
      statusCode: response.statusCode,
      message: response.message,
      body: [],
    };
  },

  /**
   * Buscar campos brutos da API (sem simplificação)
   * Use apenas se precisar dos dados originais
   */
  async getRawFields(): Promise<JsonResponse<any>> {
    return apiPublicGet<JsonResponse<any>>(`${BASE_PATH}/consulta`);
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
