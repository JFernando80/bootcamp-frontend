import { useState, useEffect } from "react";
import { userActivityService } from "~/api/services";
import type { UserActivityDTO } from "~/api/types";

const RecentActivities = () => {
  const [activities, setActivities] = useState<UserActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);

        // TODO: Pegar o ID do usuário logado do contexto de autenticação
        // Por enquanto, vamos mostrar uma lista vazia
        // const userId = "user-id-aqui";
        // const response = await userActivityService.getByUser(userId, 0);

        setActivities([]);
      } catch (err) {
        console.error("Erro ao carregar atividades:", err);
        setError("Não foi possível carregar suas atividades");
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  const getActivityColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
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
          <div className="p-6">
            <p className="text-gray-600">Carregando atividades...</p>
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
                    {activity.completed ? "Concluiu" : "Iniciou"} a atividade
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
