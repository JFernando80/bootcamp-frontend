import type { ActivityDTO, ModuleDTO } from "~/api/types";

export type ActivityCategory = "VIDEO" | "QUIZ" | "READING" | "OTHER";

export function getActivityCategory(type: string): ActivityCategory {
  const t = (type || "").toUpperCase();
  if (t.includes("VIDEO")) return "VIDEO";
  if (t.includes("QUIZ")) return "QUIZ";
  if (t.includes("READING") || t.includes("LEITURA")) return "READING";
  return "OTHER";
}

export function getActivityLabel(type: string): string {
  const cat = getActivityCategory(type);
  if (cat === "VIDEO") return "Vídeo";
  if (cat === "QUIZ") return "Quiz";
  if (cat === "READING") return "Leitura";
  return type;
}

/** Verifica se um módulo está desbloqueado (primeiro sempre; demais só se o anterior estiver todo concluído). */
export function isModuleUnlocked(
  module: ModuleDTO,
  modules: ModuleDTO[],
  activitiesByModule: Record<string, ActivityDTO[]>,
  userActivities: Record<string, { status?: string }>,
): boolean {
  const idx = modules.findIndex((m) => m.id === module.id);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    const prev = modules[i];
    const prevActs = activitiesByModule[prev.id!] || [];
    if (prevActs.length === 0) continue;
    const allDone = prevActs.every(
      (a) => userActivities[a.id!]?.status === "FINALIZADO",
    );
    if (!allDone) return false;
  }
  return true;
}
