import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { BookOpen, CheckCircle, ArrowLeft } from "lucide-react";
import { courseService } from "~/api/services/courseService";
import type { CourseDTO } from "~/api/types";
import { useAuthStore } from "~/stores/authStore";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const courseData: CourseDTO = {
      slug: (formData.get("slug") as string) || "",
      title: (formData.get("title") as string) || "",
      description: (formData.get("description") as string) || "",
      createdAtS: new Date().toLocaleDateString("pt-BR"), // formato dd/MM/yyyy
    };

    console.log("=== DEBUG: Criando curso ===");
    console.log("1. Dados do curso:", courseData);
    console.log("2. Token válido?:", !!useAuthStore.getState().token);
    console.log("3. SessionId válido?:", !!useAuthStore.getState().sessionId);
    console.log("4. Token length:", useAuthStore.getState().token?.length);
    console.log("5. SessionId:", useAuthStore.getState().sessionId);

    try {
      const response = await courseService.create(courseData);
      console.log("Curso criado com sucesso:", response);
      setSuccess(true);

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate("/myArea");
      }, 2000);
    } catch (err: any) {
      console.error("=== ERRO AO CRIAR CURSO ===");
      console.error("Erro completo:", err);
      console.error("Response body:", err.response?.body);
      console.error("Response status:", err.response?.status);
      console.error("Response headers:", err.response?.headers);
      console.error("Request headers:", err.config?.headers);

      const errorMessage =
        err.response?.body?.message ||
        err.response?.body?.title ||
        err.response?.body?.detail ||
        "Erro ao criar curso. Tente novamente.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Erro ao criar curso</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

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
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Slug do Curso * (identificador único)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    pattern="^[a-z0-9-]+$"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: gestao-projetos-sociais"
                    disabled={loading || success}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use apenas letras minúsculas, números e hífens
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Título do Curso * (10-100 caracteres)
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    minLength={10}
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Gestão de Projetos Sociais"
                    disabled={loading || success}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descrição do Curso * (10-300 caracteres)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={300}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o que os alunos aprenderão neste curso..."
                    disabled={loading || success}
                  />
                </div>
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
