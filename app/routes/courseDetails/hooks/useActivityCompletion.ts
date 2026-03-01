import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { userActivityService } from "~/api/services";
import { useNotification } from "~/components/NotificationProvider";
import { useAuthStore } from "~/stores/authStore";
import type { ActivityDTO, UserActivityDTO } from "~/api/types";

interface UseActivityCompletionParams {
  activitiesByModule: Record<string, ActivityDTO[]>;
  userActivities: Record<string, UserActivityDTO>;
  selectedActivityId: string | null;
}

export function useActivityCompletion({
  activitiesByModule,
  userActivities,
  selectedActivityId,
}: UseActivityCompletionParams) {
  const { userId, userName } = useAuthStore();
  const { notify } = useNotification();
  const queryClient = useQueryClient();
  const [processingActivity, setProcessingActivity] = useState<string | null>(
    null,
  );
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  useEffect(() => {
    setQuizAnswer(null);
  }, [selectedActivityId]);

  const findActivity = (activityId: string, moduleId?: string): ActivityDTO | null =>
    moduleId
      ? activitiesByModule[moduleId]?.find((a) => a.id === activityId) ?? null
      : Object.values(activitiesByModule)
          .flat()
          .find((a) => a.id === activityId) ?? null;

  const toggleActivity = async (
    activityId: string,
    moduleId?: string,
    answerJson?: string | null,
  ) => {
    if (!userId) {
      notify({
        type: "info",
        message: "Faça login para marcar atividades como concluídas",
      });
      return;
    }
    const activity = findActivity(activityId, moduleId);
    if (!activity) return;

    setProcessingActivity(activityId);
    try {
      const existing = userActivities[activityId];
      const payload = {
        attemptNumber: existing?.attemptNumber ?? 1,
        answerJson: answerJson ?? existing?.answerJson ?? null,
        score: existing?.score || activity.maxScore || 0,
        submittedAtS: new Date().toLocaleDateString("pt-BR"),
        status: "FINALIZADO" as const,
        userId,
        userName: userName || "Usuário",
        activityId,
        activityType: activity.type,
        moduleId: activity.moduleId,
        moduleDescription: activity.moduleDescription,
      };

      if (existing?.id) {
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
      } else {
        try {
          await userActivityService.create(payload);
        } catch (createErr: unknown) {
          const fallback = await userActivityService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            {
              key: "id",
              operation: "EQUAL",
              value: activityId,
              classes: "activity",
            },
          ]);
          const found = fallback.body?.lista?.[0] as UserActivityDTO | undefined;
          if (found?.id) await userActivityService.update(found.id, payload);
          else throw createErr;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      notify({ type: "success", message: "Atividade marcada como concluída!" });
    } catch (err: unknown) {
      console.error("Erro ao atualizar atividade:", err);
      notify({
        type: "error",
        message: (err as Error)?.message || "Erro ao atualizar atividade.",
      });
    } finally {
      setProcessingActivity(null);
    }
  };

  const submitQuiz = async (
    selectedActivityId: string,
    answerJson?: string | null,
  ) => {
    if (!userId || !selectedActivityId) return;
    const activity = findActivity(selectedActivityId);
    if (!activity) return;

    setProcessingActivity(selectedActivityId);
    try {
      const existing = userActivities[selectedActivityId];
      const payload = {
        attemptNumber: existing?.attemptNumber ?? 1,
        answerJson: answerJson ?? existing?.answerJson ?? null,
        score: existing?.score ?? 0,
        submittedAtS: new Date().toLocaleDateString("pt-BR"),
        status: "FINALIZADO" as const,
        userId,
        userName: userName || "Usuário",
        activityId: selectedActivityId,
        activityType: activity.type,
        moduleId: activity.moduleId,
        moduleDescription: activity.moduleDescription,
      };
      if (existing?.id) {
        await userActivityService.update(existing.id, payload);
      } else {
        try {
          await userActivityService.create(payload);
        } catch (createErr: unknown) {
          const fallback = await userActivityService.list(1, [
            { key: "id", operation: "EQUAL", value: userId, classes: "user" },
            {
              key: "id",
              operation: "EQUAL",
              value: selectedActivityId,
              classes: "activity",
            },
          ]);
          const found = fallback.body?.lista?.[0] as UserActivityDTO | undefined;
          if (found?.id) await userActivityService.update(found.id, payload);
          else throw createErr;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      notify({ type: "success", message: "Resposta submetida com sucesso!" });
    } catch (err: unknown) {
      console.error("Erro ao submeter quiz:", err);
      notify({
        type: "error",
        message: (err as Error)?.message || "Erro ao submeter quiz.",
      });
    } finally {
      setProcessingActivity(null);
    }
  };

  return {
    processingActivity,
    quizAnswer,
    setQuizAnswer,
    toggleActivity,
    submitQuiz,
  };
}
