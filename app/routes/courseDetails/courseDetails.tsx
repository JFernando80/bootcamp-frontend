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
  Play,
} from "lucide-react";
import {
  courseService,
  moduleService,
  activityService,
  userCourseService,
  userModuleService,
  userActivityService,
} from "~/api/services";
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

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function CourseDetails() {
  const { courseId } = useParams();
  const { isAuthenticated, userId, userName } = useAuthStore();
  const navigate = useNavigate();
  const [processingActivity, setProcessingActivity] = useState<string | null>(
    null,
  );
  
  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [userCourse, setUserCourse] = useState<UserCourseDTO | null>(null);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityDTO[]>>(
    {},
  );
  const [userModules, setUserModules] = useState<Record<string, UserModuleDTO>>(
    {},
  );
  const [userActivities, setUserActivities] = useState<
    Record<string, UserActivityDTO>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Carrega dados do curso, módulos e atividades do backend
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1 — Recuperar dados do curso
        const courseData = await courseService.getById(courseId!);
        if (cancelled) return;
        if (!courseData) {
          setError("Curso não encontrado");
          return;
        }
        setCourse(courseData);

        // 2 — Recuperar módulos do curso
        const modulesResp = await moduleService.list(1, [
          {
            key: "id",
            operation: "EQUAL",
            value: courseId!,
            classes: "course",
          },
        ]);
        if (cancelled) return;
        const moduleList: ModuleDTO[] = modulesResp.body?.lista || [];
        moduleList.sort((a, b) => a.index - b.index);
        setModules(moduleList);

        // 3 — Recuperar atividades de cada módulo
        const activitiesMap: Record<string, ActivityDTO[]> = {};
        for (const mod of moduleList) {
          const actResp = await activityService.list(1, [
            {
              key: "id",
              operation: "EQUAL",
              value: mod.id!,
              classes: "module",
            },
            {
              key: "id",
              operation: "EQUAL",
              value: courseId!,
              classes: "course",
            },
          ]);
          if (cancelled) return;
          // Backend retorna em ordem inversa — reverter para FIFO
          activitiesMap[mod.id!] = (actResp.body?.lista || [])
            .slice()
            .reverse();
        }

        console.log({ activitiesMap });
        setActivities(activitiesMap);

        // 4 — Recuperar inscrição do usuário no curso
        if (userId) {
          const ucResp = await userCourseService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
          ]);
          if (cancelled) return;
          const enrollment = ucResp.body?.lista?.find(
            (uc) => uc.courseId === courseId,
          );
          setUserCourse(enrollment || null);

          // 5 — Recuperar módulos do usuário (filtrar também pelo curso atual)
          const umResp = await userModuleService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            { key: "id", operation: "EQUAL", value: courseId!, classes: "course" },
          ]);
          if (cancelled) return;
          const umMap: Record<string, UserModuleDTO> = {};
          const moduleSet = new Set(moduleList.map((m) => m.id!));
          (umResp.body?.lista || []).forEach((um) => {
            if (um.moduleId && moduleSet.has(um.moduleId))
              umMap[um.moduleId] = um;
          });
          setUserModules(umMap);

          // 6 — Recuperar atividades do usuário
          const uaResp = await userActivityService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            {
              key: "id",
              operation: "EQUAL",
              value: courseId!,
              classes: "course",
            },
          ]);
          if (cancelled) return;
          const uaMap: Record<string, UserActivityDTO> = {};
          const allActivityIds = Object.values(activitiesMap)
            .flat()
            .map((a) => a.id!)
            .filter(Boolean);
          const activitySet = new Set(allActivityIds);
          (uaResp.body?.lista || []).forEach((ua) => {
            if (ua.activityId && activitySet.has(ua.activityId))
              uaMap[ua.activityId] = ua;
          });
          setUserActivities(uaMap);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Erro ao carregar curso:", err);
          setError("Erro ao carregar dados do curso");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Auto-select: scan modules in order and pick the first activity not yet finalized
  useEffect(() => {
    if (selectedActivityId) return;
    // wait until all data is loaded so we have userActivities available
    if (loading) return;
    if (modules.length === 0) return;

    for (const mod of modules) {
      const list = activities[mod.id!] || [];
      if (list.length === 0) continue;
      // find first activity in this module that's NOT finalized
      const idx = list.findIndex((a) => userActivities[a.id!]?.status !== "FINALIZADO");
      if (idx >= 0) {
        setSelectedActivityId(list[idx].id || null);
        setSelectedModuleId(mod.id || null);
        return;
      }
      // if all activities in this module are finalized, continue to next module
    }

    // If all activities in all modules are finalized, default to the last activity
    const lastModule = modules[modules.length - 1];
    const lastList = activities[lastModule.id!] || [];
    if (lastList.length > 0) {
      const lastActivity = lastList[lastList.length - 1];
      setSelectedActivityId(lastActivity.id || null);
      setSelectedModuleId(lastModule.id || null);
    }
  }, [modules, activities, userActivities, selectedActivityId, loading]);

  // Reset quiz answer when switching activities
  useEffect(() => {
    setQuizAnswer(null);
  }, [selectedActivityId]);

  const activityIds = Object.values(activities)
    .flat()
    .map((a) => a.id!)
    .filter(Boolean);

  const { notify } = useNotification();

  const progressLoading = false;

  // Verifica se o usuário está inscrito no módulo selecionado
  const isModuleStarted = selectedModuleId
    ? !!userModules[selectedModuleId]
    : false;

  // Note: backend now auto-creates user-module and user-activity links on enrollment.

  async function handleToggleActivity(
    activityId: string,
    moduleId?: string,
    answerJson?: string | null,
  ) {
    if (!userId) {
      notify({
        type: "info",
        message: "Faça login para marcar atividades como concluídas",
      });
      return;
    }

    const activity = moduleId
      ? activities[moduleId]?.find((a) => a.id === activityId)
      : Object.values(activities)
          .flat()
          .find((a) => a.id === activityId);
    if (!activity) return;

    setProcessingActivity(activityId);
    try {
      // backend will guarantee user_module/user_activity links

      const existing = userActivities[activityId];
      const payload = {
        attemptNumber: existing?.attemptNumber ?? 1,
        answerJson: answerJson ?? existing?.answerJson ?? null,
        score: existing?.score || activity.maxScore || 0,
        submittedAtS: new Date().toLocaleDateString("pt-BR"),
        status: "FINALIZADO",
        userId,
        userName: userName || "Usuário",
        activityId,
        activityType: activity.type,
        moduleId: activity.moduleId,
        moduleDescription: activity.moduleDescription,
      };

      if (existing && existing.id) {
        // Já existe no estado local (foi buscado no carregamento) → PUT
        const newStatus =
          existing.status === "FINALIZADO" ? "EM_ANDAMENTO" : "FINALIZADO";
        await userActivityService.update(existing.id, {
          ...payload,
          status: newStatus,
          submittedAtS:
            newStatus === "FINALIZADO"
              ? new Date().toLocaleDateString("pt-BR")
              : null,
        });
        if (newStatus === "FINALIZADO") {
          setUserActivities((prev) => ({
            ...prev,
            [activityId]: { ...existing, status: "FINALIZADO" },
          }));
        } else {
          setUserActivities((prev) => {
            const updated = { ...prev };
            delete updated[activityId];
            return updated;
          });
        }
      } else {
        // Não existe no estado local → tentar POST, fallback para list + PUT
        try {
          const created = await userActivityService.create(payload);
          setUserActivities((prev) => ({
            ...prev,
            [activityId]: {
              ...payload,
              id: created.body?.id,
            } as UserActivityDTO,
          }));
        } catch (createErr: any) {
          // Já existe no backend → buscar e fazer PUT
          const fallback = await userActivityService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            {
              key: "id",
              operation: "EQUAL",
              value: activityId,
              classes: "activity",
            },
          ]);
          const found = fallback.body?.lista?.[0];
          if (found && found.id) {
            await userActivityService.update(found.id, payload);
            setUserActivities((prev) => ({
              ...prev,
              [activityId]: { ...found, ...payload },
            }));
          } else {
            throw createErr;
          }
        }
      }
      notify({ type: "success", message: "Atividade marcada como concluída!" });
    } catch (err: any) {
      console.error("Erro ao atualizar atividade:", err);
      notify({
        type: "error",
        message: err?.message || "Erro ao atualizar atividade.",
      });
    } finally {
      setProcessingActivity(null);
    }
  }

  async function submitQuiz(answerJson?: string | null) {
    if (!userId || !selectedActivityId) return;

    const activity = Object.values(activities)
      .flat()
      .find((a) => a.id === selectedActivityId);
    if (!activity) return;

    setProcessingActivity(selectedActivityId);
    try {
      // backend will guarantee user_module/user_activity links

      const existing = userActivities[selectedActivityId];
      const payload = {
        attemptNumber: existing?.attemptNumber ?? 1,
        answerJson: answerJson ?? existing?.answerJson ?? null,
        score: existing?.score ?? 0,
        submittedAtS: new Date().toLocaleDateString("pt-BR"),
        status: "FINALIZADO",
        userId,
        userName: userName || "Usuário",
        activityId: selectedActivityId,
        activityType: activity.type,
        moduleId: activity.moduleId,
        moduleDescription: activity.moduleDescription,
      };

      if (existing && existing.id) {
        // Já existe no estado local (buscado no carregamento) → PUT
        await userActivityService.update(existing.id, payload);
        setUserActivities((prev) => ({
          ...prev,
          [selectedActivityId]: {
            ...existing,
            ...payload,
          },
        }));
      } else {
        // Não existe no estado local → tentar POST, fallback para list + PUT
        try {
          const created = await userActivityService.create(payload);
          setUserActivities((prev) => ({
            ...prev,
            [selectedActivityId]: {
              ...payload,
              id: created.body?.id,
            } as UserActivityDTO,
          }));
        } catch (createErr: any) {
          // Já existe no backend → buscar e fazer PUT
          const fallback = await userActivityService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            {
              key: "id",
              operation: "EQUAL",
              value: selectedActivityId,
              classes: "activity",
            },
          ]);
          const found = fallback.body?.lista?.[0];
          if (found && found.id) {
            await userActivityService.update(found.id, payload);
            setUserActivities((prev) => ({
              ...prev,
              [selectedActivityId]: { ...found, ...payload },
            }));
          } else {
            throw createErr;
          }
        }
      }
      notify({ type: "success", message: "Resposta submetida com sucesso!" });
    } catch (err: any) {
      console.error("Erro ao submeter quiz:", err);
      notify({
        type: "error",
        message: err?.message || "Erro ao submeter quiz.",
      });
    } finally {
      setProcessingActivity(null);
    }
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

  // Determine if a module should be unlocked: the first module is unlocked,
  // Determine if a module should be unlocked: the first module is unlocked.
  // Otherwise, all earlier modules must have all their activities finalized.
  function isModuleUnlocked(module: ModuleDTO) {
    const idx = modules.findIndex((m) => m.id === module.id);
    if (idx <= 0) return true;

    for (let i = 0; i < idx; i++) {
      const prev = modules[i];
      const prevActs = activities[prev.id!] || [];
      // If a previous module has no activities, treat it as completed
      if (prevActs.length === 0) continue;
      const allDone = prevActs.every((a) => userActivities[a.id!]?.status === "FINALIZADO");
      if (!allDone) return false;
    }
    return true;
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
  // While progress is still loading, don't render as "not completed" — wait for real data
  const isSelectedCompleted =
    !progressLoading && selectedUserActivity?.status === "FINALIZADO";
  const isSelectedProcessing =
    processingActivity === selectedActivityId || progressLoading;

  // Compute progress locally so it updates immediately after each activity toggle
  const localProgressPercent =
    activityIds.length > 0 && !progressLoading
      ? Math.round(
          (activityIds.filter(
            (id) => userActivities[id]?.status === "FINALIZADO",
          ).length /
            activityIds.length) *
            100,
        )
      : (userCourse?.progressPercent ?? 0);
  const isCourseCompleted =
    !progressLoading && activityIds.length > 0 && localProgressPercent === 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="mb-8">
          <Link
            to="/myArea"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para Minha Área
          </Link>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-lg flex-shrink-0">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {course?.title || "Carregando..."}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
                                  submitQuiz(
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
                  {progressLoading ? (
                    <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
                  ) : (
                    <span className="text-sm font-bold text-blue-600">
                      {localProgressPercent}%
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: progressLoading
                        ? `${userCourse.progressPercent ?? 0}%`
                        : `${localProgressPercent}%`,
                    }}
                  ></div>
                </div>
                {isCourseCompleted && (
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
                  const moduleActivities = activities[module.id!] || [];
                  const userModule = userModules[module.id!];
                  const moduleStarted = !!userModule;
                  const locked = !isModuleUnlocked(module);

                  return (
                    <div
                      key={module.id}
                      title={locked ? "Para iniciar esse módulo você precisa concluir o anterior" : undefined}
                      className={`border border-gray-200 rounded-lg p-4 ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 font-bold rounded-full text-sm flex-shrink-0 ${
                            moduleStarted
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {module.index}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {module.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {module.description}
                          </p>
                          {/* Removed start module control — backend now creates user-module/activity links on enrollment */}
                          {/* removed 'Módulo iniciado' label per design */}
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
                                  if (locked) {
                                    notify({ type: "info", message: "Conclua o módulo anterior para acessar estas atividades." });
                                    return;
                                  }
                                  console.log("Selected activity:", activity);
                                  setSelectedActivityId(activity.id!);
                                  setSelectedModuleId(module.id!);
                                }}
                                disabled={locked}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition text-left border ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-200"
                                    : "border-transparent hover:bg-gray-50"
                                } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                {progressLoading ? (
                                  <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
