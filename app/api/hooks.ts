import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activityService,
  userActivityService,
  userModuleService,
  moduleService,
} from "~/api/services";
import type {
  ActivityDTO,
  ModuleDTO,
  UserActivityDTO,
  UserModuleDTO,
} from "~/api/types";

export function useModulesQuery(courseId?: string) {
  return useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      if (!courseId) return [] as ModuleDTO[];
      const resp = await moduleService.list(1, [
        { key: "id", operation: "EQUAL", value: courseId, classes: "course" },
      ]);
      const list: ModuleDTO[] = resp.body?.lista || [];
      list.sort((a, b) => a.index - b.index);
      return list;
    },
    enabled: !!courseId,
  });
}

export function useActivitiesForModules(modules: ModuleDTO[] | undefined) {
  return useQuery({
    queryKey: ["activities", modules?.map((m) => m.id).join(",")],
    queryFn: async () => {
      const map: Record<string, ActivityDTO[]> = {};
      if (!modules || modules.length === 0) return map;
      for (const m of modules) {
        const resp = await activityService.list(1, [
          { key: "id", operation: "EQUAL", value: m.id!, classes: "module" },
        ]);
        const lista = resp.body?.lista || [];
        // Garantir FIFO na exibição: inverter a lista retornada pelo backend
        map[m.id!] = lista.slice().reverse();
      }
      return map;
    },
    enabled: !!modules && modules.length > 0,
  });
}

export function useUserProgressQuery(
  userId?: string,
  moduleIds?: string[],
  activityIds?: string[],
) {
  return useQuery({
    queryKey: [
      "userProgress",
      userId,
      moduleIds?.join(",") || "",
      activityIds?.join(",") || "",
    ],
    queryFn: async () => {
      const result: {
        userActivities: Record<string, UserActivityDTO>;
        userModules: Record<string, UserModuleDTO>;
      } = {
        userActivities: {},
        userModules: {},
      };

      if (!userId) return result;

      const activitiesResp = await userActivityService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const activitiesList: UserActivityDTO[] =
        activitiesResp.body?.lista || [];
      console.log(
        "[useUserProgressQuery] user_activity filtro result:",
        activitiesResp.body,
      );
      const activitySet = new Set(activityIds || []);
      activitiesList.forEach((ua) => {
        if (ua.activityId && activitySet.has(ua.activityId))
          result.userActivities[ua.activityId] = ua;
      });

      const modulesResp = await userModuleService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const modulesList: UserModuleDTO[] = modulesResp.body?.lista || [];
      const moduleSet = new Set(moduleIds || []);
      modulesList.forEach((um) => {
        if (um.moduleId && moduleSet.has(um.moduleId))
          result.userModules[um.moduleId] = um;
      });

      return result;
    },
    enabled:
      !!userId &&
      (!!(moduleIds && moduleIds.length) ||
        !!(activityIds && activityIds.length)),
    staleTime: 1000 * 30,
  });
}

export function useToggleActivityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      userName,
      activity,
      answerJson,
    }: {
      userId: string;
      userName?: string;
      activity: ActivityDTO;
      answerJson?: string | null;
    }) => {
      // Filtra por userId E activityId ao mesmo tempo — retorna no máximo 1 registro
      const resp = await userActivityService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
        {
          key: "id",
          operation: "EQUAL",
          value: activity.id!,
          classes: "activity",
        },
      ]);
      const record = (resp.body?.lista || [])[0] ?? null;

      const body = {
        attemptNumber: null as null,
        answerJson: answerJson ?? null,
        score: 0,
        submittedAtS: null as null,
        status: "FINALIZADO",
        userId,
        userName: userName || record?.userName || "Usuário",
        activityId: activity.id!,
        activityType: activity.type,
        moduleId: activity.moduleId,
        moduleDescription: activity.moduleDescription,
      };

      if (record?.id) {
        await userActivityService.update(record.id, body);
      } else {
        await userActivityService.create(body);
      }

      qc.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: (err) => console.error("toggleActivity failed", err),
  });
}

export function useToggleModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      moduleId,
      moduleObj,
      existing,
    }: {
      userId: string;
      moduleId: string;
      moduleObj?: ModuleDTO;
      existing?: UserModuleDTO;
    }) => {
      const buildBody = (base: any) => ({
        userId: base.userId,
        userName: base.userName || "Usuário",
        moduleId: base.moduleId || moduleId,
        moduleDescription:
          base.moduleDescription || moduleObj?.description || "",
        module_title: moduleObj?.title || base.moduleDescription || "",
        module_index: moduleObj?.index ?? base.module_index,
        course_id: moduleObj?.courseId || base.course_id,
        course_description:
          moduleObj?.courseDescription || base.course_description || "",
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date().toISOString(),
      });

      const tryUpdateOrCreate = async (id: string | undefined, base: any) => {
        const body = buildBody(base);
        if (id) {
          try {
            await userModuleService.update(id, body);
            return true;
          } catch (e: any) {
            const status = e?.response?.status;
            if (status === 404) {
              const created = await userModuleService.create(body);
              const createdId = created?.body?.id;
              if (createdId) {
                await userModuleService.complete(createdId);
                return true;
              }
            }
            throw e;
          }
        }
        const created = await userModuleService.create(body);
        const createdId = created?.body?.id;
        if (createdId) {
          await userModuleService.complete(createdId);
          return true;
        }
        return false;
      };

      if (existing && existing.id) {
        await tryUpdateOrCreate(existing.id, existing);
      } else {
        const backendCheck = await userModuleService.list(1, [
          { key: "userId", operation: "EQUAL", value: userId, classes: "user" },
          { key: "moduleId", operation: "EQUAL", value: moduleId },
        ]);
        const existingInBackend = backendCheck.body?.lista?.[0];
        if (existingInBackend) {
          await tryUpdateOrCreate(existingInBackend.id!, existingInBackend);
        } else {
          await tryUpdateOrCreate(undefined, {
            userId,
            userName: "Usuário",
            moduleId,
          });
        }
      }

      qc.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: (err) => console.error("toggleModule failed", err),
  });
}
