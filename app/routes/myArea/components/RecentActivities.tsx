import { useState, useEffect } from "react";
import { userActivityService } from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import type { UserActivityDTO } from "~/api/types";

const RecentActivities = () => {
  const { userId, isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState<UserActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar todas as atividades do usuário logado
        const response = await userActivityService.list(1, [
          { key: "id", operation: "EQUAL", value: userId, classes: "user" },
        ]);

        console.log("📋 UserActivities carregadas:", response);

        if (!response.body?.lista) {
          setActivities([]);
          return;
        }

        // Ordenar por data mais recente
        const sortedActivities = response.body.lista.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // Pegar apenas as 10 mais recentes
        setActivities(sortedActivities.slice(0, 10));
      } catch (err) {
        console.error("Erro ao carregar atividades:", err);
        setError("Não foi possível carregar suas atividades");
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [userId, isAuthenticated]);

  const getActivityColor = (status?: string) => {
    switch (status) {
      case "FINALIZADO":
        return "bg-green-500";
      case "EM_ANDAMENTO":
        return "bg-blue-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recente";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Atividade Recente
        </h2>
        <div className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 animate-pulse"
              >
                {/* Dot placeholder */}
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  {/* Text placeholder */}
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  {/* Date placeholder */}
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Atividade Recente
        </h2>
        <div className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm">
          <div className="p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Atividade Recente
      </h2>
      <div className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm">
        <div className="p-6 space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-600 text-center">
              Nenhuma atividade recente encontrada.
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div
                  className={`w-2 h-2 rounded-full ${getActivityColor(activity.status)}`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm">
                    {activity.status === "FINALIZADO"
                      ? "Concluiu"
                      : "Trabalhou em"}{" "}
                    uma atividade
                    {activity.moduleDescription &&
                      ` - ${activity.moduleDescription}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.completedAt || activity.startedAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentActivities;
