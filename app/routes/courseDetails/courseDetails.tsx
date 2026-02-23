import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  courseService,
  // moduleService,
  // activityService,
  userCourseService,
  // userActivityService,
  // userModuleService,
} from "~/api/services";
import {
  useModulesQuery,
  useActivitiesForModules,
  useUserProgressQuery,
  useToggleActivityMutation,
  useToggleModuleMutation,
} from "~/api/hooks";
import { useNotification } from "~/components/NotificationProvider";
import { useAuthStore } from "~/stores/authStore";
import type {
  CourseDTO,
  ModuleDTO,
  ActivityDTO,
  UserCourseDTO,
  UserActivityDTO,
  UserModuleDTO,
} from "~/api/types";
import Video from "../course/components/Video";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { isAuthenticated, userName, userId } = useAuthStore();
  const navigate = useNavigate();
  const [processingActivity, setProcessingActivity] = useState<string | null>(
    null,
  );
  const [processingModule, setProcessingModule] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [userCourse, setUserCourse] = useState<UserCourseDTO | null>(null);
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
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const modulesQuery = useModulesQuery(courseId as string | undefined);
  useEffect(() => {
    if (modulesQuery.data) setModules(modulesQuery.data);
  }, [modulesQuery.data]);

  const activitiesQuery = useActivitiesForModules(modules);
  useEffect(() => {
    if (activitiesQuery.data) setActivities(activitiesQuery.data);
  }, [activitiesQuery.data]);

  // Auto-select the first activity when data loads
  useEffect(() => {
    if (selectedActivityId) return;
    for (const m of modules) {
      const list = activities[m.id!] || [];
      if (list.length > 0) {
        setSelectedActivityId(list[0].id || null);
        setSelectedModuleId(m.id || null);
        break;
      }
    }
  }, [modules, activities]);

  // Reset quiz answer when switching activities
  useEffect(() => {
    setQuizAnswer(null);
  }, [selectedActivityId]);

  const moduleIds = modules.map((m) => m.id!).filter(Boolean);
  const activityIds = Object.values(activities)
    .flat()
    .map((a) => a.id!)
    .filter(Boolean);
  const userProgressQuery = useUserProgressQuery(
    userId,
    moduleIds,
    activityIds,
  );
  useEffect(() => {
    if (userProgressQuery.data) {
      setUserActivities(userProgressQuery.data.userActivities || {});
      setUserModules(userProgressQuery.data.userModules || {});
    }
  }, [userProgressQuery.data]);

  const toggleActivity = useToggleActivityMutation();
  const toggleModule = useToggleModuleMutation();
  const { notify } = useNotification();

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  async function loadCourseData() {
    if (!courseId) return;

    // Verificar autenticação
    if (!isAuthenticated || !userId) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar curso
      const courseData = await courseService.getById(courseId);
      if (!courseData) {
        setError("Curso não encontrado");
        return;
      }
      setCourse(courseData);

      // Verificar se o usuário está inscrito no curso
      const userCourseResponse = await userCourseService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);

      const enrollmentData = userCourseResponse.body?.lista?.find(
        (uc) => uc.courseId === courseId,
      );

      if (!enrollmentData) {
        // Usuário não está inscrito, redirecionar para página de preview
        navigate(`/courses/${courseId}`);
        return;
      }
      setUserCourse(enrollmentData);

      // modules and activities are loaded via react-query hooks
    } catch (err) {
      console.error("Erro ao carregar curso:", err);
      setError("Erro ao carregar dados do curso");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProgress(
    moduleIdsParam?: string[],
    activityIdsParam?: string[],
  ) {
    if (!userId) return;

    try {
      // IDs dos módulos e atividades do curso (usando params quando fornecidos)
      const moduleIds = moduleIdsParam ?? modules.map((m) => m.id!);
      const activityIds =
        activityIdsParam ??
        Object.values(activities)
          .flat()
          .map((a) => a.id!);

      // Buscar atividades do usuário
      const activitiesResponse = await userActivityService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const userActivitiesList = activitiesResponse.body?.lista || [];

      // Filtrar apenas as atividades do curso atual
      const userActivitiesMap: Record<string, UserActivityDTO> = {};
      userActivitiesList.forEach((ua) => {
        if (ua.activityId && activityIds.includes(ua.activityId)) {
          userActivitiesMap[ua.activityId] = ua;
        }
      });
      setUserActivities(userActivitiesMap);

      console.log("📊 Atividades carregadas:", {
        total: userActivitiesList.length,
        doCurso: Object.keys(userActivitiesMap).length,
        activityIds,
      });

      // Buscar módulos do usuário
      const modulesResponse = await userModuleService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const userModulesList = modulesResponse.body?.lista || [];

      // Filtrar apenas os módulos do curso atual
      const userModulesMap: Record<string, UserModuleDTO> = {};
      userModulesList.forEach((um) => {
        if (um.moduleId && moduleIds.includes(um.moduleId)) {
          userModulesMap[um.moduleId] = um;
        }
      });
      setUserModules(userModulesMap);

      console.log("📚 Módulos carregados:", {
        total: userModulesList.length,
        doCurso: Object.keys(userModulesMap).length,
        moduleIds,
      });
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
    }
  }

  async function handleToggleActivity(
    activityId: string,
    moduleId?: string,
    answerJson?: string | null,
  ) {
    if (!userId) return;
    const activity = moduleId
      ? activities[moduleId]?.find((a) => a.id === activityId)
      : Object.values(activities)
          .flat()
          .find((a) => a.id === activityId);
    if (!activity) return;

    const userActivityId = userActivities[activityId]?.id;
    setProcessingActivity(activityId);

    console.log({ activityId, userActivityId, activity });

    toggleActivity.mutate(
      {
        userId: userId!,
        userName: userName || undefined,
        activity,
        answerJson: answerJson ?? null,
      },
      {
        onSuccess: () => {
          notify({
            type: "success",
            message: "Atividade marcada como concluída!",
          });
        },
        onError: (err: any) => {
          notify({
            type: "error",
            message:
              err?.response?.data?.message ||
              err?.message ||
              "Erro ao marcar atividade como concluída.",
          });
        },
        onSettled: () => {
          setProcessingActivity(null);
          userProgressQuery.refetch?.();
        },
      },
    );
  }

  function handleToggleModule(moduleId: string) {
    if (!userId) return;
    const moduleObj = modules.find((m) => m.id === moduleId);
    const existing = userModules[moduleId];
    const successMessage = "Módulo marcado como concluído";

    setProcessingModule(moduleId);
    toggleModule.mutate(
      { userId: userId!, moduleId, moduleObj, existing },
      {
        onSuccess: () => {
          notify({ type: "success", message: successMessage });
        },
        onError: (err: any) => {
          console.error("toggleModule error", err);
          notify({
            type: "error",
            message:
              err?.response?.body?.message ||
              err?.message ||
              "Erro ao atualizar módulo.",
          });
        },
        onSettled: () => {
          setProcessingModule(null);
          userProgressQuery.refetch?.();
        },
      },
    );
  }

  function getActivityCategory(
    type: string,
  ): "VIDEO" | "QUIZ" | "READING" | "OTHER" {
    const t = (type || "").toUpperCase();
    if (t.includes("VIDEO")) return "VIDEO";
    if (t.includes("QUIZ")) return "QUIZ";
    if (t.includes("READING") || t.includes("LEITURA")) return "READING";
    return "OTHER";
  }

  function getActivityLabel(type: string): string {
    const cat = getActivityCategory(type);
    if (cat === "VIDEO") return "Vídeo";
    if (cat === "QUIZ") return "Quiz";
    if (cat === "READING") return "Leitura";
    return type;
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
            O curso que você está procurando não existe ou você não tem acesso.
          </p>
          <Link
            to="/myArea"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Voltar para Minha Área
          </Link>
        </div>
      </div>
    );
  }

  // Derived values for the selected activity
  const selectedActivity = selectedActivityId
    ? Object.values(activities)
        .flat()
        .find((a) => a.id === selectedActivityId) || null
    : null;
  const selectedUserActivity = selectedActivityId
    ? userActivities[selectedActivityId]
    : undefined;
  const isSelectedCompleted = selectedUserActivity?.status === "FINALIZADO";
  const isSelectedProcessing = processingActivity === selectedActivityId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/myArea"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para Minha Área
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Conteúdo da Atividade Selecionada */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Content Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {selectedActivity ? (
                (() => {
                  const cat = getActivityCategory(selectedActivity.type || "");

                  if (cat === "VIDEO") {
                    return (
                      <>
                        <Video configJson={selectedActivity.configJson} />
                        <div className="p-6">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <h2 className="text-xl font-bold text-gray-900">
                                Aula em Vídeo
                              </h2>
                            </div>
                            {isSelectedCompleted ? (
                              <div className="inline-flex items-center gap-2 text-green-600 font-medium flex-shrink-0">
                                <CheckCircle className="h-5 w-5" />
                                Concluído
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleToggleActivity(
                                    selectedActivityId!,
                                    selectedModuleId || undefined,
                                  )
                                }
                                disabled={isSelectedProcessing}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition flex-shrink-0"
                              >
                                {isSelectedProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                Marcar como concluído
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  }

                  if (cat === "QUIZ") {
                    let quizData: {
                      q: string;
                      o: string[];
                      c: number;
                    } | null = null;
                    try {
                      const cfg = JSON.parse(
                        selectedActivity.configJson || "{}",
                      );
                      if (cfg.q) {
                        quizData = cfg;
                      } else if (cfg.questions?.[0]) {
                        const q0 = cfg.questions[0];
                        quizData = {
                          q: q0.question,
                          o: q0.options,
                          c: q0.correctAnswer,
                        };
                      }
                    } catch {}

                    return (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <HelpCircle className="h-6 w-6 text-blue-600" />
                          <h2 className="text-xl font-bold text-gray-900">
                            Quiz Avaliativo
                          </h2>
                        </div>
                        {quizData ? (
                          <>
                            <p className="text-lg text-gray-900 font-medium mb-6 leading-relaxed">
                              {quizData.q}
                            </p>
                            <div className="space-y-3 mb-6">
                              {(() => {
                                // Recover previously submitted answer when quiz is already completed
                                let previousAnswer: number | null = null;
                                if (
                                  isSelectedCompleted &&
                                  selectedUserActivity?.answerJson
                                ) {
                                  try {
                                    const parsed = JSON.parse(
                                      selectedUserActivity.answerJson,
                                    );
                                    if (typeof parsed?.selected === "number") {
                                      previousAnswer = parsed.selected;
                                    }
                                  } catch {}
                                }
                                const activeAnswer = isSelectedCompleted
                                  ? previousAnswer
                                  : quizAnswer;
                                return quizData!.o.map((opt, i) => {
                                  const isSelected = activeAnswer === i;
                                  const isCorrect =
                                    isSelectedCompleted && i === quizData!.c;
                                  const isWrong =
                                    isSelectedCompleted &&
                                    isSelected &&
                                    i !== quizData!.c;
                                  return (
                                    <label
                                      key={i}
                                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                                        isCorrect
                                          ? "border-green-500 bg-green-50"
                                          : isWrong
                                            ? "border-red-400 bg-red-50"
                                            : isSelected
                                              ? "border-blue-500 bg-blue-50"
                                              : "border-gray-200 hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="quiz-option"
                                        checked={isSelected}
                                        onChange={() =>
                                          !isSelectedCompleted &&
                                          setQuizAnswer(i)
                                        }
                                        disabled={isSelectedCompleted}
                                        className="text-blue-600"
                                      />
                                      <span className="text-gray-800 flex-1">
                                        {opt}
                                      </span>
                                      {isCorrect && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                      )}
                                    </label>
                                  );
                                });
                              })()}
                            </div>
                            {isSelectedCompleted ? (
                              <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <CheckCircle className="h-5 w-5" />
                                Quiz concluído! A resposta correta está
                                destacada.
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleToggleActivity(
                                    selectedActivityId!,
                                    selectedModuleId || undefined,
                                    quizAnswer !== null
                                      ? JSON.stringify({ selected: quizAnswer })
                                      : null,
                                  )
                                }
                                disabled={
                                  quizAnswer === null || isSelectedProcessing
                                }
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50 transition"
                              >
                                {isSelectedProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                Submeter resposta
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500">
                            Dados do quiz indisponíveis.
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (cat === "READING") {
                    let readingData: {
                      readingUrl?: string;
                      content?: string;
                      estimatedMinutes?: number;
                    } = {};
                    try {
                      readingData = JSON.parse(
                        selectedActivity.configJson || "{}",
                      );
                    } catch {}

                    return (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                              Material de Leitura
                            </h2>
                          </div>
                          {readingData.estimatedMinutes && (
                            <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />~
                              {readingData.estimatedMinutes} min
                            </span>
                          )}
                        </div>
                        {readingData.content && (
                          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                            {readingData.content}
                          </p>
                        )}
                        {readingData.readingUrl && (
                          <a
                            href={readingData.readingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition mb-6"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Abrir material de leitura
                          </a>
                        )}
                        <div className="mt-4">
                          {isSelectedCompleted ? (
                            <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
                              <CheckCircle className="h-5 w-5" />
                              Leitura concluída!
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleActivity(
                                  selectedActivityId!,
                                  selectedModuleId || undefined,
                                )
                              }
                              disabled={isSelectedProcessing}
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                            >
                              {isSelectedProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Marcar como concluído
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // OTHER / fallback
                  return (
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedActivity.type}
                        </h2>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">
                        Conteúdo indisponível para este tipo de atividade.
                      </p>
                      {isSelectedCompleted ? (
                        <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="h-5 w-5" />
                          Concluído!
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleActivity(
                              selectedActivityId!,
                              selectedModuleId || undefined,
                            )
                          }
                          disabled={isSelectedProcessing}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                        >
                          {isSelectedProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Marcar como concluído
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">
                    Selecione uma atividade para começar
                  </p>
                </div>
              )}
            </div>

            {/* Progresso do Curso */}
            {userCourse && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Seu Progresso
                </h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Conclusão do curso
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {userCourse.progressPercent || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${userCourse.progressPercent || 0}%` }}
                  ></div>
                </div>
                {userCourse.status === "FINALIZADO" && (
                  <div className="mt-4 flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Curso concluído! Parabéns!
                  </div>
                )}
              </div>
            )}

            {/* Sobre o Curso */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sobre o Curso
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Lista de Módulos e Atividades */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Conteúdo do Curso
              </h2>
              <div className="space-y-4">
                {modules.map((module) => {
                  const userModule = userModules[module.id!];
                  const moduleActivities = activities[module.id!] || [];

                  return (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">
                          {module.index}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {module.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Activities list - clickable to select */}
                      {moduleActivities.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {moduleActivities.map((activity, idx) => {
                            const userActivity = userActivities[activity.id!];
                            const isCompleted =
                              userActivity?.status === "FINALIZADO";
                            const isSelected =
                              selectedActivityId === activity.id;
                            const cat = getActivityCategory(
                              activity.type || "",
                            );
                            const icon =
                              cat === "VIDEO" ? (
                                <PlayCircle className="h-4 w-4 flex-shrink-0" />
                              ) : cat === "QUIZ" ? (
                                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                              ) : cat === "READING" ? (
                                <BookOpen className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 flex-shrink-0" />
                              );

                            return (
                              <button
                                key={activity.id}
                                onClick={() => {
                                  setSelectedActivityId(activity.id!);
                                  setSelectedModuleId(module.id!);
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition text-left border ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-200"
                                    : "border-transparent hover:bg-gray-50"
                                }`}
                              >
                                <span
                                  className={
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-400"
                                  }
                                >
                                  {icon}
                                </span>
                                <span
                                  className={`text-xs flex-1 truncate ${isSelected ? "text-blue-700 font-medium" : "text-gray-700"}`}
                                >
                                  {getActivityLabel(activity.type || "")}{" "}
                                  {moduleActivities.length > 1 ? idx + 1 : ""}
                                </span>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Module complete button */}
                      <div className="pt-2 border-t border-gray-100">
                        {userModule?.status === "COMPLETED" ? (
                          <div className="inline-flex items-center gap-2 text-green-600 font-medium text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Módulo concluído
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleModule(module.id!)}
                            disabled={processingModule === module.id}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1.5 px-3 rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            {processingModule === module.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Marcar módulo como concluído
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
