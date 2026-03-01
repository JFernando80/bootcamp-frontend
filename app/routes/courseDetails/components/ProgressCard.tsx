import { CheckCircle } from "lucide-react";

interface ProgressCardProps {
  progressPercent: number;
  isLoading?: boolean;
  isCourseCompleted: boolean;
}

export function ProgressCard({
  progressPercent,
  isLoading,
  isCourseCompleted,
}: ProgressCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Seu Progresso</h2>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Conclusão do curso
        </span>
        {isLoading ? (
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
        ) : (
          <span className="text-sm font-bold text-blue-600">
            {progressPercent}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {isCourseCompleted && (
        <div className="mt-4 flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle className="h-5 w-5" />
          Curso concluído! Parabéns!
        </div>
      )}
    </div>
  );
}
