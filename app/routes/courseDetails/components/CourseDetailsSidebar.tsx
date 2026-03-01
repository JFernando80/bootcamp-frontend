import {
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import type { ActivityDTO, ModuleDTO } from "~/api/types";
import {
  getActivityCategory,
  getActivityLabel,
  isModuleUnlocked,
} from "../utils";

interface CourseDetailsSidebarProps {
  modules: ModuleDTO[];
  activitiesByModule: Record<string, ActivityDTO[]>;
  userModules: Record<string, { id?: string }>;
  userActivities: Record<string, { status?: string }>;
  selectedActivityId: string | null;
  onSelectActivity: (activityId: string, moduleId: string) => void;
  onLockedClick: () => void;
  progressLoading?: boolean;
}

export function CourseDetailsSidebar({
  modules,
  activitiesByModule,
  userModules,
  userActivities,
  selectedActivityId,
  onSelectActivity,
  onLockedClick,
  progressLoading,
}: CourseDetailsSidebarProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Conteúdo do Curso
      </h2>
      <div className="space-y-4">
        {modules.map((module) => {
          const moduleActivities = activitiesByModule[module.id!] || [];
          const userModule = userModules[module.id!];
          const moduleStarted = !!userModule;
          const locked = !isModuleUnlocked(
            module,
            modules,
            activitiesByModule,
            userActivities,
          );

          return (
            <div
              key={module.id}
              title={
                locked
                  ? "Para iniciar esse módulo você precisa concluir o anterior"
                  : undefined
              }
              className={`border border-gray-200 rounded-lg p-4 ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
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
                </div>
              </div>

              {moduleActivities.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {moduleActivities.map((activity, idx) => {
                    const userActivity = userActivities[activity.id!];
                    const isCompleted = userActivity?.status === "FINALIZADO";
                    const isSelected = selectedActivityId === activity.id;
                    const cat = getActivityCategory(activity.type || "");
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
                            onLockedClick();
                            return;
                          }
                          onSelectActivity(activity.id!, module.id!);
                        }}
                        disabled={locked}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition text-left border ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "border-transparent hover:bg-gray-50"
                        } ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={
                            isSelected ? "text-blue-600" : "text-gray-400"
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
  );
}
