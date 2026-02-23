// Tipos comuns da API

export interface JsonResponse<T = any> {
  statusCode: number;
  message: string;
  body: T | null;
}

export interface PaginatedResponse<T> {
  lista: T[];
  total: number;
  pagina: number;
}

export interface SearchCriteriaDTO {
  key: string;
  operation:
    | "EQUAL"
    | "NOT_EQUAL"
    | "MATCH"
    | "MATCH_START"
    | "MATCH_END"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "GREATER_THAN_EQUAL"
    | "LESS_THAN_EQUAL";
  value: string | number | boolean;
  classes?: string; // Para queries de relacionamento (ex: "course", "module", "user")
}

export interface EnumItem {
  key: string;
  value: string;
}

/**
 * Campo simplificado para filtros
 */
export interface FilterField {
  id: number;
  key: string; // Ex: "title", "ownerUser.name"
  label: string; // Ex: "Título", "Nome do Autor"
  type: "string" | "number" | "date" | "boolean" | "uuid";
}
