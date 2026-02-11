import { apiGet } from "../httpClient";
import type { JsonResponse, EnumItem } from "../types";

/**
 * Serviço para buscar enums da API
 */
export const enumService = {
  /**
   * Buscar todos os status de curso disponíveis
   */
  async getCourseStatuses(): Promise<JsonResponse<EnumItem[]>> {
    return apiGet<JsonResponse<EnumItem[]>>(
      "/bootcamp/formacao_enums/status_course/all",
    );
  },

  /**
   * Buscar informações de segurança por tela
   */
  async getSecurity(screen: string): Promise<JsonResponse<any>> {
    return apiGet<JsonResponse<any>>(`/bootcamp/security/${screen}`);
  },
};
