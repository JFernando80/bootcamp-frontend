// Tipos comuns da API

export interface JsonResponse<T = any> {
  status: "success" | "error";
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
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
