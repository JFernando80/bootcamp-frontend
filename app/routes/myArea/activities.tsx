import { useState, useEffect } from "react";
import {
  Activity,
  Video,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { userActivityService } from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import type { UserActivityDTO } from "~/api/types";

function getTypeIcon(type?: string) {
  const t = (type ?? "").toUpperCase();
  if (t.includes("VIDEO")) return <Video className="w-4 h-4" />;
  if (t.includes("QUIZ")) return <HelpCircle className="w-4 h-4" />;
  if (t.includes("READ") || t.includes("LEITURA"))
    return <BookOpen className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
}

function getTypeLabel(type?: string) {
  const t = (type ?? "").toUpperCase();
  if (t.includes("VIDEO")) return "Vídeo";
  if (t.includes("QUIZ")) return "Quiz";
  if (t.includes("READ") || t.includes("LEITURA")) return "Leitura";
  return type || "Atividade";
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "FINALIZADO") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        Concluída
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      <Clock className="w-3 h-3" />
      Em andamento
    </span>
  );
}

const PAGE_SIZE = 10;

export default function ActivitiesRoute() {
  const { userId } = useAuthStore();
  const [activities, setActivities] = useState<UserActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!userId) return;
    fetchActivities(page);
  }, [userId, page]);

  async function fetchActivities(p: number) {
    try {
      setLoading(true);
      setError(null);
      const resp = await userActivityService.list(p, [
        { key: "id", operation: "EQUAL", value: userId!, classes: "user" },
      ]);
      const lista = resp.body?.lista ?? [];
      const total = resp.body?.total ?? 0;
      setActivities(lista);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("Erro ao carregar atividades:", err);
      setError("Não foi possível carregar as atividades.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Atividades Concluídas
      </h2>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-semibold">
            Nenhuma atividade registrada
          </p>
          <p className="text-gray-500 text-sm">
            Suas atividades aparecerão aqui quando você começar a interagir com
            os cursos.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-600">
                    Tipo
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-600">
                    Módulo
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-600">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        {getTypeIcon(act.activityType)}
                        <span>{getTypeLabel(act.activityType)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {act.moduleDescription || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={act.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {act.submittedAtS
                        ? act.submittedAtS
                        : act.updatedAt
                          ? new Date(act.updatedAt).toLocaleDateString("pt-BR")
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
