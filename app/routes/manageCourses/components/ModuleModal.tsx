import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { moduleService } from "~/api/services";
import type { ModuleDTO } from "~/api/types";

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
  courseDescription?: string;
  module?: ModuleDTO | null; // Se passar módulo, é edição
  modules?: ModuleDTO[]; // Para calcular ordem ao criar novo módulo
}

export function ModuleModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  courseDescription,
  module,
  modules = [],
}: ModuleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextIndex =
    modules.length === 0 ? 1 : Math.max(...modules.map((m) => m.index)) + 1;

  const [formData, setFormData] = useState({
    index: module?.index ?? nextIndex,
    title: module?.title || "",
    description: module?.description || "",
    requiredToCompleteCourse: module?.requiredToCompleteCourse ?? true,
  });

  useEffect(() => {
    if (module) {
      setFormData({
        index: module.index,
        title: module.title,
        description: module.description,
        requiredToCompleteCourse: module.requiredToCompleteCourse,
      });
    } else {
      setFormData({
        index: nextIndex,
        title: "",
        description: "",
        requiredToCompleteCourse: true,
      });
    }
  }, [module, nextIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.title.trim().length < 10) {
      setError("O título do módulo deve ter pelo menos 10 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const moduleData: ModuleDTO = {
        ...formData,
        courseId,
        courseDescription,
        createdAtS:
          module?.createdAtS || new Date().toLocaleDateString("pt-BR"),
      };

      if (module?.id) {
        await moduleService.update(module.id, moduleData);
        onSuccess();
        onClose();
      } else {
        // Criar
        await moduleService.create(moduleData);
        onSuccess();
        // fechar modal — usuário pode editar o módulo depois para adicionar atividades
        onClose();
      }
    } catch (err: any) {
      console.error("Erro ao salvar módulo:", err);
      setError(
        err.response?.body?.message ||
          "Erro ao salvar módulo. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {module ? "Editar Módulo" : "Criar Novo Módulo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Módulo *
            </label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={100}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.title.length > 0 && formData.title.length < 10
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Ex: Introdução ao tema"
              disabled={loading}
            />
            <div className="flex justify-between mt-1">
              {formData.title.length > 0 && formData.title.length < 10 ? (
                <p className="text-xs text-red-500">
                  Mínimo de 10 caracteres ({10 - formData.title.length}{" "}
                  restantes)
                </p>
              ) : (
                <p className="text-xs text-gray-500">Mínimo de 10 caracteres</p>
              )}
              <p
                className={`text-xs ${
                  formData.title.length < 10 ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formData.title.length}/100
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              required
              minLength={10}
              maxLength={500}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o conteúdo e objetivos deste módulo"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.requiredToCompleteCourse}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  requiredToCompleteCourse: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="required" className="text-sm text-gray-700">
              Obrigatório para conclusão do curso
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              disabled={loading || formData.title.trim().length < 10}
            >
              {loading ? "Salvando..." : module ? "Atualizar" : "Criar Módulo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
