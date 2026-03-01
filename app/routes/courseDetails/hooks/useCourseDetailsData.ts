import { useMemo } from "react";
import {
  useCourseWithStructure,
  useUserProgressQuery,
  useEnrollmentQuery,
} from "~/api/hooks";
import { useAuthStore } from "~/stores/authStore";
import type {
  UserCourseDTO,
  UserActivityDTO,
  UserModuleDTO,
} from "~/api/types";

export function useCourseDetailsData(courseId: string | undefined) {
  const userId = useAuthStore((s) => s.userId);
  const { course, modules, activitiesByModule, isLoading, isError } =
    useCourseWithStructure(courseId);

  const activityIds = useMemo(
    () =>
      Object.values(activitiesByModule)
        .flat()
        .map((a) => a.id!)
        .filter(Boolean),
    [activitiesByModule],
  );
  const moduleIds = useMemo(
    () => modules.map((m) => m.id!).filter(Boolean),
    [modules],
  );

  const progressQuery = useUserProgressQuery(
    userId ?? undefined,
    moduleIds,
    activityIds,
  );
  const enrollmentQuery = useEnrollmentQuery(userId ?? undefined, courseId);

  const userActivities = (progressQuery.data?.userActivities ?? {}) as Record<
    string,
    UserActivityDTO
  >;
  const userCourse = (enrollmentQuery.data ?? null) as UserCourseDTO | null;
  const progressLoading = progressQuery.isLoading;

  const progressPercent = useMemo(
    () =>
      activityIds.length > 0 && !progressLoading
        ? Math.round(
            (activityIds.filter(
              (id) => userActivities[id]?.status === "FINALIZADO",
            ).length /
              activityIds.length) *
              100,
          )
        : userCourse?.progressPercent ?? 0,
    [activityIds, userActivities, progressLoading, userCourse],
  );
  const isCourseCompleted =
    !progressLoading &&
    activityIds.length > 0 &&
    progressPercent === 100;

  return {
    course,
    modules,
    activitiesByModule,
    activityIds,
    userActivities,
    userModules: (progressQuery.data?.userModules ?? {}) as Record<
      string,
      UserModuleDTO
    >,
    userCourse,
    progressLoading,
    progressPercent,
    isCourseCompleted,
    isLoading,
    isError,
  };
}
