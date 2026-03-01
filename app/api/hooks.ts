import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activityService,
  userActivityService,
  userModuleService,
  moduleService,
  courseService,
  userCourseService,
} from "~/api/services";
import type {
  ActivityDTO,
  ModuleDTO,
  UserActivityDTO,
  UserModuleDTO,
  CourseDTO,
  UserCourseDTO,
} from "~/api/types";
import { sortActivitiesByType } from "~/routes/courseDetails/utils";

/** Busca um curso por ID ou slug. */
export function useCourseQuery(courseId?: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      return courseService.getById(courseId);
    },
    enabled: !!courseId,
  });
}

/** Busca a inscrição do usuário em um curso. */
export function useEnrollmentQuery(userId?: string, courseId?: string) {
  return useQuery({
    queryKey: ["enrollment", userId, courseId],
    queryFn: async (): Promise<UserCourseDTO | null> => {
      if (!userId || !courseId) return null;
      const resp = await userCourseService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);
      const enrollment = resp.body?.lista?.find((uc) => uc.courseId === courseId);
      return enrollment ?? null;
    },
    enabled: !!userId && !!courseId,
  });
}

/** Curso + módulos + atividades por módulo em uma única camada de dados (com cache). */
export function useCourseWithStructure(courseId?: string) {
  const courseQuery = useCourseQuery(courseId);
  const course = courseQuery.data ?? null;
  const courseIdentifier = course?.id ?? course?.slug ?? courseId;

  const modulesQuery = useModulesQuery(courseIdentifier ?? undefined);
  const modules = modulesQuery.data ?? [];

  const activitiesQuery = useActivitiesForModules(modules);
  const activitiesByModule = activitiesQuery.data ?? {};

  const isLoading =
    courseQuery.isLoading || modulesQuery.isLoading || activitiesQuery.isLoading;
  const error =
    courseQuery.error ?? modulesQuery.error ?? activitiesQuery.error;
  const isError = courseQuery.isError || modulesQuery.isError || activitiesQuery.isError;

  return {
    course,
    modules,
    activitiesByModule,
    isLoading,
    error,
    isError,
    refetch: () => {
      courseQuery.refetch();
      modulesQuery.refetch();
      activitiesQuery.refetch();
    },
  };
}

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
        map[m.id!] = sortActivitiesByType(lista);
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

      // Garantir que exista user_module para este usuário e módulo antes de manipular user_activity
      try {
        const moduleId = activity.moduleId;
        if (moduleId) {
          console.debug(
            "useToggleActivityMutation: checking user_module for user",
            userId,
            "module",
            moduleId,
          );
          const umCheck = await userModuleService.list(1, [
            {
              key: "userId",
              operation: "EQUAL",
              value: userId,
              classes: "user",
            },
            { key: "moduleId", operation: "EQUAL", value: moduleId },
          ]);
          const existingUM = umCheck.body?.lista?.[0];
          if (!existingUM) {
            // Prefer a human-readable module title when available
            const moduleTitle =
              (activity as any)?.moduleDescription || moduleId;
            console.debug(
              "useToggleActivityMutation: creating user_module for user",
              userId,
              "module",
              moduleId,
            );
            await userModuleService.start(
              userId,
              moduleId,
              moduleTitle,
              userName,
            );
          }
        }
      } catch (e) {
        console.error(
          "Erro ao garantir user_module antes de toggleActivity:",
          e,
        );
      }

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

      console.debug(
        "useToggleActivityMutation: creating/updating user_activity for",
        userId,
        "activity",
        activity.id,
      );
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
