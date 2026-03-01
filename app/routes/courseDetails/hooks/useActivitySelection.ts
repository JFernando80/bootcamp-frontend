import { useState, useEffect } from "react";
import type { ModuleDTO, ActivityDTO } from "~/api/types";

interface UseActivitySelectionParams {
  modules: ModuleDTO[];
  activitiesByModule: Record<string, ActivityDTO[]>;
  userActivities: Record<string, { status?: string }>;
  progressLoading: boolean;
}

export function useActivitySelection({
  modules,
  activitiesByModule,
  userActivities,
  progressLoading,
}: UseActivitySelectionParams) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedActivityId || progressLoading) return;
    if (modules.length === 0) return;

    for (const mod of modules) {
      const list = activitiesByModule[mod.id!] || [];
      if (list.length === 0) continue;
      const idx = list.findIndex(
        (a) => userActivities[a.id!]?.status !== "FINALIZADO",
      );
      if (idx >= 0) {
        setSelectedActivityId(list[idx].id || null);
        setSelectedModuleId(mod.id || null);
        return;
      }
    }

    const lastModule = modules[modules.length - 1];
    const lastList = activitiesByModule[lastModule?.id!] || [];
    if (lastList.length > 0) {
      const lastActivity = lastList[lastList.length - 1];
      setSelectedActivityId(lastActivity.id || null);
      setSelectedModuleId(lastModule?.id || null);
    }
  }, [
    modules,
    activitiesByModule,
    userActivities,
    selectedActivityId,
    progressLoading,
  ]);

  const selectActivity = (activityId: string, moduleId: string) => {
    setSelectedActivityId(activityId);
    setSelectedModuleId(moduleId);
  };

  return {
    selectedActivityId,
    selectedModuleId,
    setSelectedActivityId,
    setSelectedModuleId,
    selectActivity,
  };
}
