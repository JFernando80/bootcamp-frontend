import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "~/context/AuthProvider";
import {
  courseService,
  moduleService,
  userCourseService,
} from "~/api/services";
import type { CourseDTO, ModuleDTO } from "~/api/types";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseData() {
      if (!courseId) return;

      try {
        setLoading(true);

        // Buscar dados do curso
        const courseData = await courseService.getById(courseId);

        if (!courseData) {
          setError("Curso não encontrado");
          return;
        }

        setCourse(courseData);

        // Buscar módulos do curso
        const modulesResponse = await moduleService.getByCourse(courseId, 0);
        if (modulesResponse.statusCode === 200 && modulesResponse.body) {
          setModules(modulesResponse.body.lista);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do curso:", err);
        setError("Erro ao carregar dados do curso");
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (course?.id) {
      // Aqui você pode adicionar lógica para inscrever o usuário
      // Exemplo: await userCourseService.enroll(userId, course.id);
      navigate(`/courses/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Carregando...</div>
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
            to="/"
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
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Voltar para o catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5" />
                <span className="text-lg font-medium">Bootcamp</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-white/90 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration} horas</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Nível: {course.level}</span>
                  </div>
                )}
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

                <button
                  onClick={handleEnroll}
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition mb-4"
                >
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
                    <span>{modules.length} módulos</span>
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
            {/* Descrição do Curso */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Sobre o curso
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Conteúdo do Curso */}
            {modules.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Conteúdo do curso
                </h2>
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {module.name}
                            </h3>
                            {module.description && (
                              <p className="text-sm text-gray-500">
                                {module.description}
                              </p>
                            )}
                            {module.duration && (
                              <p className="text-sm text-gray-500">
                                {module.duration} horas
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Informações
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Status: {course.status}</span>
                </div>
                {course.level && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Nível: {course.level}</span>
                  </div>
                )}
                {modules.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{modules.length} módulos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
