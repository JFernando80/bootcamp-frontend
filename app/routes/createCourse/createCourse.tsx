import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [modules, setModules] = useState([
    { id: 1, title: "", lessons: "", duration: "" },
  ]);

  const addModule = () => {
    const newId =
      modules.length > 0 ? Math.max(...modules.map((m) => m.id)) + 1 : 1;
    setModules([
      ...modules,
      { id: newId, title: "", lessons: "", duration: "" },
    ]);
  };

  const removeModule = (id: number) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== id));
    }
  };

  const updateModule = (id: number, field: string, value: string) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simula salvamento (em produção, enviaria para API)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);

    // Redireciona após 2 segundos
    setTimeout(() => {
      navigate("/myArea");
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/myArea"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para Minha Área
            </Link>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Criar Novo Curso
                </h1>
                <p className="text-gray-600 mt-1">
                  Compartilhe seu conhecimento com a comunidade
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-semibold">
                  Curso criado com sucesso!
                </p>
                <p className="text-green-700 text-sm">Redirecionando...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Informações Básicas
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Título do Curso *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Gestão de Projetos Sociais"
                    disabled={loading || success}
                  />
                </div>

                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nome da ONG *
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Instituto Social"
                    disabled={loading || success}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descrição Curta *
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    required
                    maxLength={120}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição breve que aparecerá no catálogo (máx. 120 caracteres)"
                    disabled={loading || success}
                  />
                </div>

                <div>
                  <label
                    htmlFor="longDescription"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descrição Detalhada *
                  </label>
                  <textarea
                    id="longDescription"
                    name="longDescription"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o que os alunos aprenderão neste curso..."
                    disabled={loading || success}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Duração Total *
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 10 horas"
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="level"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nível *
                    </label>
                    <select
                      id="level"
                      name="level"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || success}
                    >
                      <option value="">Selecione...</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Imagem de Capa e Vídeo */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Mídia do Curso
              </h2>

              <div className="space-y-6">
                {/* Upload de Imagem */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Imagem de Capa *
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Arraste uma imagem ou clique para selecionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Recomendado: 1280x720px (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      disabled={loading || success}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block mt-4 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                    >
                      Selecionar Imagem
                    </label>
                  </div>
                </div>

                {/* Upload de Vídeo */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Vídeo do Curso *
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Arraste um vídeo ou clique para selecionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos aceitos: MP4, MOV, AVI (máx. 500MB)
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="video-upload"
                      disabled={loading || success}
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-block mt-4 px-6 py-2 bg-green-50 text-green-600 rounded-lg cursor-pointer hover:bg-green-100 transition"
                    >
                      Selecionar Vídeo
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Dica: Certifique-se de que o vídeo tem boa qualidade de
                    áudio e vídeo
                  </p>
                </div>
              </div>
            </div>

            {/* Módulos do Curso */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Módulos do Curso
                </h2>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                  disabled={loading || success}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Módulo
                </button>
              </div>

              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Módulo {index + 1}
                      </h3>
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(module.id)}
                          className="text-red-500 hover:text-red-700 transition cursor-pointer"
                          disabled={loading || success}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título do Módulo *
                        </label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) =>
                            updateModule(module.id, "title", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Ex: Introdução à Gestão Social"
                          disabled={loading || success}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nº de Aulas *
                          </label>
                          <input
                            type="number"
                            value={module.lessons}
                            onChange={(e) =>
                              updateModule(module.id, "lessons", e.target.value)
                            }
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Ex: 5"
                            disabled={loading || success}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração *
                          </label>
                          <input
                            type="text"
                            value={module.duration}
                            onChange={(e) =>
                              updateModule(
                                module.id,
                                "duration",
                                e.target.value,
                              )
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Ex: 2h"
                            disabled={loading || success}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* O que os alunos aprenderão */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                O que os alunos aprenderão
              </h2>

              <div className="space-y-3">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aprendizado {num} {num <= 3 && "*"}
                    </label>
                    <input
                      type="text"
                      required={num <= 3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Fundamentos de gestão de projetos"
                      disabled={loading || success}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Requisitos
              </h2>

              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requisito {num} {num === 1 && "*"}
                    </label>
                    <input
                      type="text"
                      required={num === 1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Nenhum conhecimento prévio necessário"
                      disabled={loading || success}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate("/myArea")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                disabled={loading || success}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-60 inline-flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Criado!
                  </>
                ) : (
                  "Criar Curso"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
