import { useParams, Link, useNavigate } from "react-router";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  Star,
} from "lucide-react";
import { useAuth } from "~/context/AuthProvider";
import { getCourseById } from "~/data/mockCourses";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Buscar dados do curso pelo ID
  const courseData = getCourseById(Number(courseId));

  // Se o curso não for encontrado, mostrar mensagem
  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Curso não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            O curso que você está procurando não existe.
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

  const Icon = courseData.icon;

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
                <Icon className="h-5 w-5" />
                <span className="text-lg font-medium">
                  {courseData.organization}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {courseData.title}
              </h1>

              <p className="text-lg text-white/90 mb-6">
                {courseData.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{courseData.rating}</span>
                  <span className="text-white/80">
                    ({courseData.reviews} avaliações)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{courseData.students.toLocaleString()} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{courseData.duration}</span>
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

                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/courses/${courseId}`);
                    } else {
                      navigate("/login");
                    }
                  }}
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
                    <span>{courseData.modules.length} módulos</span>
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
            {/* O que você vai aprender */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                O que você vai aprender
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseData.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Descrição do Curso */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Sobre o curso
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {courseData.longDescription}
              </p>
            </div>

            {/* Conteúdo do Curso */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Conteúdo do curso
              </h2>
              <div className="space-y-3">
                {courseData.modules.map((module) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                          {module.id}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {module.lessons} aulas • {module.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Requisitos
              </h2>
              <ul className="space-y-2">
                {courseData.requirements.map((req, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Instrutor
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {courseData.instructor.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {courseData.instructor.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {courseData.instructor.title}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{courseData.instructor.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseData.instructor.courses} cursos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
