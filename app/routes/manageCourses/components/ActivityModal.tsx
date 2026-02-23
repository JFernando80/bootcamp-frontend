import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { activityService } from "~/api/services";
import type { ActivityDTO } from "~/api/types";

// ---- Config shape per type ----
interface VideoConfig {
  videoUrl: string;
  duration?: number;
}
interface ReadingConfig {
  readingUrl?: string;
  content?: string;
  estimatedMinutes?: number;
}
// ---- Helpers ----

// Backend exige type com mais de 5 chars e configJson com menos de 150 chars
const BACKEND_TYPE: Record<string, string> = {
  VIDEO: "VIDEO_AULA",
  QUIZ: "QUIZ_AVALIACAO",
  READING: "MATERIAL_LEITURA",
};
const INTERNAL_TYPE: Record<string, string> = {
  VIDEO_AULA: "VIDEO",
  QUIZ_AVALIACAO: "QUIZ",
  MATERIAL_LEITURA: "READING",
};
function toInternalType(t: string): string {
  const up = (t || "").toUpperCase();
  return INTERNAL_TYPE[up] || up;
}
function safeParse(json: string): any {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

function buildInitialConfig(type: string, configJson: string): any {
  const cfg = safeParse(configJson);
  const t = toInternalType(type);
  if (t === "VIDEO") {
    return { videoUrl: cfg.videoUrl || "", duration: cfg.duration ?? "" };
  }
  if (t === "QUIZ") {
    // Suporta formato compacto {q, o, c} e formato completo {questions}
    let question = "";
    let options = ["", "", "", ""];
    let correctIndex = 0;
    if (cfg.q !== undefined) {
      question = cfg.q || "";
      options = cfg.o || ["", "", "", ""];
      correctIndex = cfg.c ?? 0;
    } else if (cfg.questions?.length) {
      const q = cfg.questions[0];
      question = q.question || "";
      options = q.options || ["", "", "", ""];
      correctIndex = q.correctIndex ?? 0;
    }
    return { question, options, correctIndex };
  }
  if (t === "READING") {
    return {
      readingUrl: cfg.readingUrl || "",
      content: cfg.content || "",
      estimatedMinutes: cfg.estimatedMinutes ?? "",
    };
  }
  return {};
}

function buildConfigJson(type: string, typeConfig: any): string {
  const t = toInternalType(type);
  if (t === "VIDEO") {
    const cfg: VideoConfig = { videoUrl: typeConfig.videoUrl || "" };
    if (typeConfig.duration !== "" && typeConfig.duration != null)
      cfg.duration = Number(typeConfig.duration);
    return JSON.stringify(cfg);
  }
  if (t === "QUIZ") {
    // Formato compacto para caber em < 150 chars: {q, o, c}
    return JSON.stringify({
      q: typeConfig.question || "",
      o: typeConfig.options || ["", "", "", ""],
      c: typeConfig.correctIndex ?? 0,
    });
  }
  if (t === "READING") {
    const cfg: ReadingConfig = {};
    if (typeConfig.readingUrl?.trim()) cfg.readingUrl = typeConfig.readingUrl;
    if (typeConfig.content?.trim()) cfg.content = typeConfig.content;
    if (
      typeConfig.estimatedMinutes !== "" &&
      typeConfig.estimatedMinutes != null
    )
      cfg.estimatedMinutes = Number(typeConfig.estimatedMinutes);
    return JSON.stringify(cfg);
  }
  return "{}";
}

// ---- Props & Component ----

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  moduleId: string;
  moduleDescription?: string;
  activity?: ActivityDTO | null;
}

export function ActivityModal({
  isOpen,
  onClose,
  onSuccess,
  moduleId,
  moduleDescription,
  activity,
}: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState(activity?.type || "");
  const [maxScore, setMaxScore] = useState(activity?.maxScore ?? 100);
  const [passingScore, setPassingScore] = useState(
    activity?.passingScore ?? 70,
  );
  const [typeConfig, setTypeConfig] = useState<any>(() =>
    buildInitialConfig(activity?.type || "", activity?.configJson || ""),
  );

  useEffect(() => {
    if (activity) {
      setType(toInternalType(activity.type));
      setMaxScore(activity.maxScore);
      setPassingScore(activity.passingScore);
      setTypeConfig(buildInitialConfig(activity.type, activity.configJson));
    } else {
      setType("");
      setMaxScore(100);
      setPassingScore(70);
      setTypeConfig({});
    }
    setError(null);
  }, [activity, isOpen]);

  function handleTypeChange(newType: string) {
    setType(newType);
    const sameType = toInternalType(activity?.type || "") === newType;
    setTypeConfig(
      buildInitialConfig(newType, sameType ? activity?.configJson || "" : ""),
    );
    setError(null);
  }

  function validate(): string | null {
    const t = (type || "").toUpperCase();
    if (!type) return "Selecione o tipo da atividade.";
    if (t === "VIDEO" && !typeConfig.videoUrl?.trim())
      return "Informe a URL do vídeo.";
    if (t === "QUIZ") {
      if (!typeConfig.question?.trim())
        return "Informe o enunciado da questão.";
      if ((typeConfig.options || []).some((o: string) => !o.trim()))
        return "Preencha todas as opções da questão.";
      const cfgJson = buildConfigJson(type, typeConfig);
      if (cfgJson.length >= 150)
        return `O conteúdo do quiz excede o limite de 149 caracteres (atual: ${cfgJson.length}). Encurte o enunciado ou as opções.`;
    }
    if (
      t === "READING" &&
      !typeConfig.readingUrl?.trim() &&
      !typeConfig.content?.trim()
    )
      return "Informe a URL ou o conteúdo de leitura.";
    if (passingScore > maxScore)
      return "A pontuação mínima não pode ser maior que a máxima.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activityData: ActivityDTO = {
        type: BACKEND_TYPE[type] || type,
        configJson: buildConfigJson(type, typeConfig),
        maxScore,
        passingScore,
        moduleId,
        moduleDescription,
        createdAtS:
          activity?.createdAtS || new Date().toLocaleDateString("pt-BR"),
        updatedAtS: new Date().toLocaleDateString("pt-BR"),
      };
      if (activity?.id) {
        await activityService.update(activity.id, activityData);
      } else {
        await activityService.create(activityData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao salvar atividade. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50";

  // ---- Dynamic field renderers ----

  function renderVideoFields() {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do Vídeo *
          </label>
          <input
            type="url"
            value={typeConfig.videoUrl || ""}
            onChange={(e) =>
              setTypeConfig({ ...typeConfig, videoUrl: e.target.value })
            }
            className={inputCls}
            placeholder="https://youtube.com/embed/... ou link direto"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duração (segundos)
          </label>
          <input
            type="number"
            min="0"
            value={typeConfig.duration ?? ""}
            onChange={(e) =>
              setTypeConfig({ ...typeConfig, duration: e.target.value })
            }
            className={inputCls}
            placeholder="Ex: 600 (= 10 minutos)"
            disabled={loading}
          />
        </div>
      </>
    );
  }

  function renderQuizFields() {
    const options: string[] = typeConfig.options || ["", "", "", ""];
    const cfgJson = buildConfigJson(type, typeConfig);
    const charsUsed = cfgJson.length;
    const charsLeft = 149 - charsUsed;

    function updateOption(oIdx: number, value: string) {
      const updated = options.map((o, j) => (j === oIdx ? value : o));
      setTypeConfig({ ...typeConfig, options: updated });
    }

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enunciado *
          </label>
          <textarea
            rows={2}
            value={typeConfig.question || ""}
            onChange={(e) =>
              setTypeConfig({ ...typeConfig, question: e.target.value })
            }
            className={inputCls}
            placeholder="Digite a pergunta aqui..."
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            Opções — marque a correta:
          </p>
          {options.map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={(typeConfig.correctIndex ?? 0) === oIdx}
                onChange={() =>
                  setTypeConfig({ ...typeConfig, correctIndex: oIdx })
                }
                className="h-4 w-4 text-blue-600"
                disabled={loading}
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(oIdx, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder={`Opção ${oIdx + 1}`}
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <p
          className={`text-xs text-right ${charsLeft < 20 ? "text-red-500 font-medium" : "text-gray-400"}`}
        >
          {charsLeft >= 0
            ? `${charsLeft} chars restantes (limite: 149)`
            : `⚠️ Excedido em ${-charsLeft} chars — encurte o enunciado ou as opções`}
        </p>
      </div>
    );
  }

  function renderReadingFields() {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do Conteúdo
          </label>
          <input
            type="url"
            value={typeConfig.readingUrl || ""}
            onChange={(e) =>
              setTypeConfig({ ...typeConfig, readingUrl: e.target.value })
            }
            className={inputCls}
            placeholder="https://docs.example.com/..."
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo de Texto
          </label>
          <textarea
            rows={4}
            value={typeConfig.content || ""}
            onChange={(e) =>
              setTypeConfig({ ...typeConfig, content: e.target.value })
            }
            className={inputCls}
            placeholder="Texto de leitura, resumo ou material..."
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Informe a URL, o texto ou ambos.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo estimado (minutos)
          </label>
          <input
            type="number"
            min="1"
            value={typeConfig.estimatedMinutes ?? ""}
            onChange={(e) =>
              setTypeConfig({
                ...typeConfig,
                estimatedMinutes: e.target.value,
              })
            }
            className={inputCls}
            placeholder="Ex: 15"
            disabled={loading}
          />
        </div>
      </>
    );
  }

  function renderTypeFields() {
    const t = (type || "").toUpperCase();
    if (t === "VIDEO") return renderVideoFields();
    if (t === "QUIZ") return renderQuizFields();
    if (t === "READING") return renderReadingFields();
    return null;
  }

  const TYPE_OPTIONS = [
    { value: "VIDEO", label: "🎬 Vídeo" },
    { value: "QUIZ", label: "🧠 Quiz" },
    { value: "READING", label: "📖 Leitura" },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {activity ? "Editar Atividade" : "Criar Nova Atividade"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo — botões visuais */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo da Atividade *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition text-center ${
                    type === value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos dinâmicos por tipo */}
          {type && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              {renderTypeFields()}
            </div>
          )}

          {/* Pontuações */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pontuação Máxima *
              </label>
              <input
                type="number"
                min="1"
                required
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value))}
                className={inputCls}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pontuação Mínima *
              </label>
              <input
                type="number"
                min="1"
                required
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value))}
                className={`${inputCls} ${passingScore > maxScore ? "border-red-400" : ""}`}
                disabled={loading}
              />
              {passingScore > maxScore && (
                <p className="text-xs text-red-500 mt-1">
                  Não pode ser maior que a pontuação máxima.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading || !type}
            >
              {loading
                ? "Salvando..."
                : activity
                  ? "Atualizar"
                  : "Criar Atividade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
