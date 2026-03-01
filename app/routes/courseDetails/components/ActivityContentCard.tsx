import type { ActivityDTO } from "~/api/types";
import { ActivityContentRenderer } from "./ActivityContentRenderer";

interface ActivityContentCardProps {
  activity: ActivityDTO | null;
  isCompleted: boolean;
  isProcessing: boolean;
  onToggle: () => void;
  onSubmitQuiz: (answerJson: string | null) => void;
  quizAnswer: number | null;
  setQuizAnswer: (v: number | null) => void;
  previousQuizAnswerJson?: string | null;
}

export function ActivityContentCard({
  activity,
  isCompleted,
  isProcessing,
  onToggle,
  onSubmitQuiz,
  quizAnswer,
  setQuizAnswer,
  previousQuizAnswerJson,
}: ActivityContentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {activity ? (
        <ActivityContentRenderer
          activity={activity}
          isCompleted={isCompleted}
          isProcessing={isProcessing}
          onToggle={onToggle}
          onSubmitQuiz={onSubmitQuiz}
          quizAnswer={quizAnswer}
          setQuizAnswer={setQuizAnswer}
          previousQuizAnswerJson={previousQuizAnswerJson}
        />
      ) : (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Selecione uma atividade para começar</p>
        </div>
      )}
    </div>
  );
}
