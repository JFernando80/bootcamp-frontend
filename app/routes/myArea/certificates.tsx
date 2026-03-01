import { useState, useEffect } from "react";
import { Award, Loader2 } from "lucide-react";
import {
  CertificateModal,
  type CertificateData,
} from "./components/CertificateModal";
import {
  userCourseService,
  courseService,
  userActivityService,
  moduleService,
  activityService,
} from "~/api/services";
import { useAuthStore } from "~/stores/authStore";

function buildHash(userId: string, courseId: string): string {
  // Deterministic readable code from IDs — no crypto needed
  const raw = `${userId}-${courseId}`;
  return raw
    .replace(/-/g, "")
    .slice(0, 24)
    .toUpperCase()
    .replace(/(.{6})/g, "$1-")
    .slice(0, -1);
}

export default function CertificatesRoute() {
  const { userId, userName } = useAuthStore();
  const [certificados, setCertificados] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateData | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadCertificates();
  }, [userId]);

  async function loadCertificates() {
    try {
      setLoading(true);
      const resp = await userCourseService.list(1, [
        { key: "id", operation: "EQUAL", value: userId!, classes: "user" },
      ]);
      const userCourses = resp.body?.lista ?? [];

      // Carregar userActivities do usuário para calcular progresso local
      const uaResp = await userActivityService.list(1, [
        { key: "id", operation: "EQUAL", value: userId!, classes: "user" },
      ]);
      const uaMap: Record<string, string> = {};
      (uaResp.body?.lista ?? []).forEach((ua) => {
        if (ua.activityId) uaMap[ua.activityId] = ua.status || "";
      });

      // Calcular progresso local por curso e manter só os 100%
      const coursesWithProgress = await Promise.all(
        userCourses.map(async (uc) => {
          let localProgress = 0;
          try {
            const courseResp = await courseService.list(1, [
              { key: "id", operation: "EQUAL", value: uc.courseId },
            ]);
            const courseId = courseResp.body?.lista?.[0]?.id || uc.courseId;
            const modResp = await moduleService.list(1, [
              {
                key: "id",
                operation: "EQUAL",
                value: courseId,
                classes: "course",
              },
            ]);
            const mods = modResp.body?.lista ?? [];
            let total = 0;
            let done = 0;
            for (const mod of mods) {
              const actResp = await activityService.list(1, [
                {
                  key: "id",
                  operation: "EQUAL",
                  value: mod.id!,
                  classes: "module",
                },
              ]);
              const acts = actResp.body?.lista ?? [];
              total += acts.length;
              done += acts.filter((a) => uaMap[a.id!] === "FINALIZADO").length;
            }
            if (total > 0) localProgress = Math.round((done / total) * 100);
          } catch (_) {}
          return { uc, localProgress };
        }),
      );

      // Keep only courses with 100% local progress
      const completed = coursesWithProgress
        .filter((x) => x.localProgress === 100)
        .map((x) => x.uc);

      const certs: CertificateData[] = await Promise.all(
        completed.map(async (uc) => {
          let courseName = uc.courseDescription || uc.courseId;
          try {
            const courseResp = await courseService.list(1, [
              { key: "id", operation: "EQUAL", value: uc.courseId },
            ]);
            const detail = courseResp.body?.lista?.[0];
            if (detail?.title) courseName = detail.title;
          } catch (_) {}

          const date = uc.completedAt
            ? new Date(uc.completedAt).toLocaleDateString("pt-BR")
            : new Date().toLocaleDateString("pt-BR");

          return {
            nome: courseName,
            userName: userName || "Usuário",
            emissor: "Bootcamp",
            dataEmissao: date,
            hashAutenticacao: buildHash(userId!, uc.courseId),
          } satisfies CertificateData;
        }),
      );

      setCertificados(certs);
    } catch (err) {
      console.error("Erro ao carregar certificados:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificados</h2>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : certificados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-semibold">
            Nenhum certificado disponível
          </p>
          <p className="text-gray-500 text-sm">
            Complete 100% de um curso para conquistar seu certificado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificados.map((cert, index) => (
            <div
              key={index}
              className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm"
            >
              <div className="p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cert.nome}</h3>
                  <p className="text-sm text-gray-600">
                    Emitido em {cert.dataEmissao} · {cert.emissor}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCertificate(cert)}
                  className="text-sm font-medium border border-blue-600 text-blue-600 rounded-md px-3 h-8 hover:bg-blue-600 hover:text-white transition-all flex-shrink-0"
                >
                  Visualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </section>
  );
}
