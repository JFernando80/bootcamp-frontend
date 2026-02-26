import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import {
  courseService,
  moduleService,
  activityService,
  userActivityService,
  userModuleService,
} from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import { useNotification } from "~/components/NotificationProvider";
import type {
  CourseDTO,
  ModuleDTO,
  ActivityDTO,
  UserActivityDTO,
  UserModuleDTO,
} from "~/api/types";
import { EnrollButton } from "~/components/EnrollButton";

export default function Course() {
  const { id } = useParams();
  const { isAuthenticated, userName, userId } = useAuthStore();
  const { notify } = useNotification();

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityDTO[]>>(
    {},
  );
  const [userActivities, setUserActivities] = useState<
    Record<string, UserActivityDTO>
  >({});
  const [userModules, setUserModules] = useState<Record<string, UserModuleDTO>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingActivity, setProcessingActivity] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadCourseData();
  }, [id]);

  async function loadCourseData() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Carregar curso
      const courseData = await courseService.getById(id);
      if (!courseData) {
        setError("Curso não encontrado");
        return;
      }
      setCourse(courseData);

      // Usar id ou slug como identificador
      const courseIdentifier = courseData.id || courseData.slug;
      if (!courseIdentifier) {
        setError("Identificador do curso não encontrado");
        return;
      }

      // Carregar módulos
      const modulesResponse = await moduleService.list(1, [
        {
          key: "id",
          operation: "EQUAL",
          value: courseIdentifier,
          classes: "course",
        },
      ]);
      const modulesList = modulesResponse.body?.lista || [];
      setModules(modulesList.sort((a, b) => a.index - b.index));

      // Carregar atividades de cada módulo
      const activitiesMap: Record<string, ActivityDTO[]> = {};
      for (const module of modulesList) {
        const activitiesResponse = await activityService.list(1, [
          {
            key: "id",
            operation: "EQUAL",
            value: module.id!,
            classes: "module",
          },
        ]);
        const lista: ActivityDTO[] = activitiesResponse.body?.lista || [];
        // Backend retorna lista em ordem do mais novo para o mais antigo.
        // O frontend deve exibir FIFO (mais antigo primeiro), então sempre inverter para exibição.
        activitiesMap[module.id!] = lista.slice().reverse();
      }
      setActivities(activitiesMap);

      // Carregar progresso do usuário (se autenticado)
      if (isAuthenticated) {
        await loadUserProgress();
      }
    } catch (err) {
      console.error("Erro ao carregar curso:", err);
      setError("Erro ao carregar dados do curso");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProgress() {
    if (!userId) {
      console.log("UserId não disponível");
      return;
    }

    try {
      // Buscar atividades do usuário logado
      const activitiesResponse = await userActivityService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const userActivitiesList = activitiesResponse.body?.lista || [];

      const userActivitiesMap: Record<string, UserActivityDTO> = {};
      userActivitiesList.forEach((ua) => {
        if (ua.activityId) {
          userActivitiesMap[ua.activityId] = ua;
        }
      });
      setUserActivities(userActivitiesMap);

      // Buscar módulos do usuário logado
      const modulesResponse = await userModuleService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const userModulesList = modulesResponse.body?.lista || [];

      const userModulesMap: Record<string, UserModuleDTO> = {};
      userModulesList.forEach((um) => {
        if (um.moduleId) {
          userModulesMap[um.moduleId] = um;
        }
      });
      setUserModules(userModulesMap);

      console.log("📊 Progresso do usuário carregado:", {
        atividades: userActivitiesList.length,
        módulos: userModulesList.length,
      });
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
    }
  }

  // Note: backend now auto-creates user-module links on enrollment; no client-side creation needed.

  async function handleToggleActivity(activityId: string) {
    if (!isAuthenticated) {
      notify({
        type: "info",
        message: "Faça login para marcar atividades como concluídas",
      });
      return;
    }

    if (!userId) {
      console.error("❌ userId não disponível no estado de autenticação");
      notify({
        type: "error",
        message:
          "Sessão incompleta detectada.\n\n" +
          "Por favor, faça logout e login novamente para continuar.\n\n" +
          "Se o problema persistir, limpe o cache do navegador (Ctrl+Shift+Delete) e tente novamente.",
      });
      return;
    }

    try {
      setProcessingActivity(activityId);

      const existing = userActivities[activityId];

      if (existing) {
        // Atualizar status com body completo
        const newStatus =
          existing.status === "FINALIZADO" ? "EM_ANDAMENTO" : "FINALIZADO";
        await userActivityService.update(existing.id!, {
          attemptNumber: existing.attemptNumber,
          answerJson: existing.answerJson,
          score: existing.score || 0,
          submittedAtS:
            newStatus === "FINALIZADO"
              ? new Date().toLocaleDateString("pt-BR")
              : null,
          status: newStatus,
          userId: existing.userId,
          userName: existing.userName,
          activityId: existing.activityId,
          activityType: existing.activityType,
          moduleId: existing.moduleId,
          moduleDescription: existing.moduleDescription,
        });
      } else {
        // Verificar se já existe no backend (pode não estar no state local)
        const activity = Object.values(activities)
          .flat()
          .find((a) => a.id === activityId);

        if (!activity) return;

        // Buscar no backend se já existe - buscar especificamente por userId E activityId
        const backendCheck = await userActivityService.list(1, [
          { key: "userId", operation: "EQUAL", value: userId },
          { key: "activityId", operation: "EQUAL", value: activityId },
        ]);

        // Backend will ensure user-module/user-activity relations; no client-side creation needed

        const existingInBackend = backendCheck.body?.lista?.[0];

        if (existingInBackend) {
          // Já existe no backend, fazer PUT com body completo
          await userActivityService.update(existingInBackend.id!, {
            attemptNumber: existingInBackend.attemptNumber,
            answerJson: existingInBackend.answerJson,
            score: activity.maxScore || 0,
            submittedAtS: new Date().toLocaleDateString("pt-BR"),
            status: "FINALIZADO",
            userId: userId,
            userName: userName || "Usuário",
            activityId: activityId,
            activityType: activity.type,
            moduleId: activity.moduleId,
            moduleDescription: activity.moduleDescription,
          });
        } else {
          // Não existe, criar novo
          await userActivityService.create({
            attemptNumber: 1,
            answerJson: null,
            score: activity.maxScore || 0,
            submittedAtS: new Date().toLocaleDateString("pt-BR"),
            status: "FINALIZADO",
            userId: userId,
            userName: userName || "Usuário",
            activityId: activityId,
            activityType: activity.type,
            moduleId: activity.moduleId,
            moduleDescription: activity.moduleDescription,
          });
        }
      }

      // Recarregar progresso
      await loadUserProgress();
    } catch (err: any) {
      console.error("Erro ao atualizar atividade:", err);
      notify({
        type: "error",
        message:
          "Erro ao atualizar atividade: " +
          (err.response?.body?.message || err.message),
      });
    } finally {
      setProcessingActivity(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Carregando curso...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || "Curso não encontrado"}
          </h1>
          <p className="text-gray-600 mb-6">
            O curso que você está procurando não existe ou não está disponível.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Voltar para o catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para o catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5" />
                <span className="text-lg font-medium">Bootcamp</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title || "-"}
              </h1>

              <p className="text-lg text-white/90 mb-6">
                {course.description || "-"}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    Publicado em:{" "}
                    {course.publishedAtS
                      ? new Date(course.publishedAtS).toLocaleDateString(
                          "pt-BR",
                        )
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>
                    Criado em:{" "}
                    {course.createdAtS
                      ? new Date(course.createdAtS).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card de Ação */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>

                <div className="w-full mb-4">
                  <EnrollButton course={course} />
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Acesso vitalício</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>Certificado de conclusão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>{modules.length} módulos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sobre o Curso */}
            {/* Módulos e Atividades */}
            {modules.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Conteúdo do Curso
                </h2>

                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const moduleActivities = activities[module.id!] || [];
                    const completedCount = moduleActivities.filter(
                      (a) => userActivities[a.id!]?.status === "FINALIZADO",
                    ).length;
                    const moduleProgress =
                      moduleActivities.length > 0
                        ? Math.round(
                            (completedCount / moduleActivities.length) * 100,
                          )
                        : 0;
                    const isModuleCompleted =
                      moduleActivities.length > 0 &&
                      completedCount === moduleActivities.length;

                    return (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                            {module.index}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            {module.title}
                          </h3>
                          {module.requiredToCompleteCourse && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Obrigatório
                            </span>
                          )}
                          {isAuthenticated && isModuleCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Concluído
                            </span>
                          )}
                        </div>

                        {/* Barra de progresso do módulo */}
                        {isAuthenticated && moduleActivities.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                Seu progresso neste módulo
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {moduleProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${moduleProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <p className="text-gray-600 text-sm mb-4">
                          {module.description}
                        </p>

                        {/* Atividades do Módulo */}
                        {activities[module.id!] &&
                          activities[module.id!].length > 0 && (
                            <div className="ml-8 mt-3 space-y-2">
                              {activities[module.id!].map((activity) => {
                                const userActivity =
                                  userActivities[activity.id!];
                                const isCompleted =
                                  userActivity?.status === "FINALIZADO";
                                const isProcessing =
                                  processingActivity === activity.id;

                                return (
                                  <div
                                    key={activity.id}
                                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <span className="flex-shrink-0">
                                        {isProcessing ? (
                                          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                        ) : isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-gray-300" />
                                        )}
                                      </span>

                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                            {activity.type}
                                          </span>
                                          <span className="text-sm text-gray-600">
                                            Máx: {activity.maxScore} pts | Mín:{" "}
                                            {activity.passingScore} pts
                                          </span>
                                        </div>
                                        {userActivity?.score !== undefined && (
                                          <span className="text-xs text-gray-500 mt-1 block">
                                            Pontuação: {userActivity.score} pts
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Informações do Curso
                </h3>
                <div className="space-y-3 text-sm">
                  {/* ID removed from public course info per request */}

                  {/* Slug intentionally hidden from public course view */}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Publicado em
                      </div>
                      <div className="text-gray-600">
                        {course.publishedAtS
                          ? new Date(course.publishedAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Criado em</div>
                      <div className="text-gray-600">
                        {course.createdAtS
                          ? new Date(course.createdAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Atualizado em
                      </div>
                      <div className="text-gray-600">
                        {course.updatedAtS
                          ? new Date(course.updatedAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
