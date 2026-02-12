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
    | "EQUALS"
    | "LIKE"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "GREATER_THAN_OR_EQUAL"
    | "LESS_THAN_OR_EQUAL"
    | "NOT_EQUALS";
  value: string | number | boolean;
}

export interface EnumItem {
  key: string;
  value: string;
}
