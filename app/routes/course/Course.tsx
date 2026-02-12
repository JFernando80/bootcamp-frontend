import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { courseService } from "~/api/services";
import type { CourseDTO } from "~/api/types";

export default function Course() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const courseData = await courseService.getById(id);

        if (!courseData) {
          setError("Curso não encontrado");
          return;
        }

        setCourse(courseData);
      } catch (err) {
        console.error("Erro ao carregar curso:", err);
        setError("Erro ao carregar dados do curso");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Carregando curso...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || "Curso não encontrado"}
          </h1>
          <p className="text-gray-600 mb-6">
            O curso que você está procurando não existe ou não está disponível.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Voltar para o catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para o catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5" />
                <span className="text-lg font-medium">Bootcamp</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title || "-"}
              </h1>

              <p className="text-lg text-white/90 mb-6">
                {course.description || "-"}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    Publicado em:{" "}
                    {course.publishedAtS
                      ? new Date(course.publishedAtS).toLocaleDateString(
                          "pt-BR",
                        )
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>
                    Criado em:{" "}
                    {course.createdAtS
                      ? new Date(course.createdAtS).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card de Ação */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-6">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>

                <div className="text-3xl font-bold mb-6 text-green-600">
                  Grátis
                </div>

                <button className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition mb-4">
                  <PlayCircle className="h-5 w-5" />
                  Iniciar Curso
                </button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Acesso vitalício</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>Certificado de conclusão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Material completo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sobre o Curso */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Sobre o curso
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {course.description || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Informações do Curso
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">ID</div>
                      <div className="text-gray-600">{course.id || "-"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Slug</div>
                      <div className="text-gray-600">{course.slug || "-"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Publicado em
                      </div>
                      <div className="text-gray-600">
                        {course.publishedAtS
                          ? new Date(course.publishedAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Criado em</div>
                      <div className="text-gray-600">
                        {course.createdAtS
                          ? new Date(course.createdAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Atualizado em
                      </div>
                      <div className="text-gray-600">
                        {course.updatedAtS
                          ? new Date(course.updatedAtS).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
