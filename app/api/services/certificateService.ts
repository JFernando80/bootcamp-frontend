import { apiGet } from "../httpClient";

const BASE_PATH = "/bootcamp/certificate";

/**
 * Obtém o token do certificado para um userCourse.
 * GET /bootcamp/certificate/token?user_course_id=xxx
 */
export async function getCertificateToken(
  userCourseId: string,
): Promise<string | null> {
  try {
    const url = `${BASE_PATH}/token?user_course_id=${encodeURIComponent(userCourseId)}`;
    const res = await apiGet<{
      body?: { certificateToken?: string; token?: string };
      certificateToken?: string;
      token?: string;
    }>(url);
    const body = res?.body;
    return (
      body?.certificateToken ??
      body?.token ??
      res?.certificateToken ??
      res?.token ??
      null
    );
  } catch {
    return null;
  }
}

/**
 * Converte uma string base64 em Blob.
 */
function base64ToBlob(base64: string, mimeType: string = "application/pdf"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Busca o certificado via GET /bootcamp/certificate?certificate_token=xxx
 * Requer autenticação.
 * O backend pode retornar:
 * - JSON com body.arquivo em base64 e body.tipo (ex: "pdf")
 * - ou blob binário direto (responseType: "blob")
 */
export async function getCertificateBlob(
  certificateToken: string,
): Promise<Blob> {
  const url = `${BASE_PATH}?certificate_token=${encodeURIComponent(certificateToken)}`;
  const res = await apiGet<
    | Blob
    | { statusCode?: number; message?: string; body?: { tipo?: string; arquivo?: string } }
  >(url);

  // Se o backend retornou JSON com base64 em body.arquivo
  if (res && typeof res === "object" && "body" in res && res.body?.arquivo) {
    const tipo = res.body.tipo || "pdf";
    const mimeType = tipo === "pdf" ? "application/pdf" : "text/html";
    return base64ToBlob(res.body.arquivo, mimeType);
  }

  // Fallback: resposta binária direta (blob)
  return res as Blob;
}

/**
 * Abre o certificado em nova aba.
 * Faz a requisição autenticada, cria object URL e abre.
 */
export async function openCertificate(certificateToken: string): Promise<void> {
  const blob = await getCertificateBlob(certificateToken);
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) setTimeout(() => URL.revokeObjectURL(url), 5000);
  else URL.revokeObjectURL(url);
}
