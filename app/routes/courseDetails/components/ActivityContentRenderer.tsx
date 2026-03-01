import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Loader2,
  PlayCircle,
} from "lucide-react";
import Video from "../../course/components/Video";
import type { ActivityDTO } from "~/api/types";
import { getActivityCategory } from "../utils";

type ActivityCategory = "VIDEO" | "QUIZ" | "READING" | "OTHER";

interface ActivityContentRendererProps {
  activity: ActivityDTO;
  isCompleted: boolean;
  isProcessing: boolean;
  onToggle: () => void;
  onSubmitQuiz: (answerJson: string | null) => void;
  quizAnswer: number | null;
  setQuizAnswer: (v: number | null) => void;
  previousQuizAnswerJson?: string | null;
}

export function ActivityContentRenderer({
  activity,
  isCompleted,
  isProcessing,
  onToggle,
  onSubmitQuiz,
  quizAnswer,
  setQuizAnswer,
  previousQuizAnswerJson,
}: ActivityContentRendererProps) {
  const cat: ActivityCategory = getActivityCategory(activity.type || "");

  if (cat === "VIDEO") {
    return (
      <>
        <Video configJson={activity.configJson} />
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h2 className="text-xl font-bold text-gray-900">Aula em Vídeo</h2>
            </div>
            {isCompleted ? (
              <div className="inline-flex items-center gap-2 text-green-600 font-medium flex-shrink-0">
                <CheckCircle className="h-5 w-5" />
                Concluído
              </div>
            ) : (
              <button
                onClick={onToggle}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition flex-shrink-0 cursor-pointer"
              >
                {isProcessing ? (
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
    let quizData: { q: string; o: string[]; c: number } | null = null;
    try {
      const cfg = JSON.parse(activity.configJson || "{}");
      if (cfg.q) quizData = cfg;
      else if (cfg.questions?.[0]) {
        const q0 = cfg.questions[0];
        quizData = { q: q0.question, o: q0.options, c: q0.correctAnswer };
      }
    } catch {}

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Quiz Avaliativo</h2>
        </div>
        {quizData ? (
          <>
            <p className="text-lg text-gray-900 font-medium mb-6 leading-relaxed">
              {quizData.q}
            </p>
            <div className="space-y-3 mb-6">
              {(() => {
                let previousAnswer: number | null = null;
                if (isCompleted && previousQuizAnswerJson) {
                  try {
                    const parsed = JSON.parse(previousQuizAnswerJson);
                    if (typeof parsed?.selected === "number")
                      previousAnswer = parsed.selected;
                  } catch {}
                }
                const activeAnswer = isCompleted ? previousAnswer : quizAnswer;
                return quizData!.o.map((opt, i) => {
                  const isSelected = activeAnswer === i;
                  const isCorrect = isCompleted && i === quizData!.c;
                  const isWrong =
                    isCompleted && isSelected && i !== quizData!.c;
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
                        onChange={() => !isCompleted && setQuizAnswer(i)}
                        disabled={isCompleted}
                        className="text-blue-600"
                      />
                      <span className="text-gray-800 flex-1">{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </label>
                  );
                });
              })()}
            </div>
            {isCompleted ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="h-5 w-5" />
                Quiz concluído! A resposta correta está destacada.
              </div>
            ) : (
              <button
                onClick={() =>
                  onSubmitQuiz(
                    quizAnswer !== null
                      ? JSON.stringify({ selected: quizAnswer })
                      : null,
                  )
                }
                disabled={quizAnswer === null || isProcessing}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50 transition cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Submeter resposta
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500">Dados do quiz indisponíveis.</p>
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
      readingData = JSON.parse(activity.configJson || "{}");
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
              <Clock className="h-4 w-4" />~{readingData.estimatedMinutes} min
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
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition mb-6 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir material de leitura
          </a>
        )}
        <div className="mt-4">
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="h-5 w-5" />
              Leitura concluída!
            </div>
          ) : (
            <button
              onClick={onToggle}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
            >
              {isProcessing ? (
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
        <h2 className="text-xl font-bold text-gray-900">{activity.type}</h2>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Conteúdo indisponível para este tipo de atividade.
      </p>
      {isCompleted ? (
        <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
          <CheckCircle className="h-5 w-5" />
          Concluído!
        </div>
      ) : (
        <button
          onClick={onToggle}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Marcar como concluído
        </button>
      )}
    </div>
  );
}
