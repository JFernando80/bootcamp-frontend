import type { CertificateData } from "~/routes/myArea/components/CertificateModal";

export function buildCertificateHash(userId: string, courseId: string): string {
  const raw = `${userId}-${courseId}`;
  return raw
    .replace(/-/g, "")
    .slice(0, 24)
    .toUpperCase()
    .replace(/(.{6})/g, "$1-")
    .slice(0, -1);
}

export function buildCertificateData(params: {
  courseName: string;
  userName: string;
  courseId: string;
  userId: string;
  completedAt?: string | null;
}): CertificateData {
  const { courseName, userName, courseId, userId, completedAt } = params;
  return {
    nome: courseName,
    userName,
    emissor: "Bootcamp",
    dataEmissao: completedAt
      ? new Date(completedAt).toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR"),
    hashAutenticacao: buildCertificateHash(userId, courseId),
  };
}
