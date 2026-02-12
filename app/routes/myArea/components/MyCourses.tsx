import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlayCircle, Award } from "lucide-react";
import { userCourseService, courseService } from "~/api/services";
import type { UserCourseDTO, CourseDTO } from "~/api/types";

interface CourseWithDetails extends UserCourseDTO {
  courseDetails?: CourseDTO;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyCourses() {
      try {
        setLoading(true);

        // TODO: Pegar o ID do usuário logado do contexto de autenticação
        // Por enquanto, vamos buscar todos os cursos do usuário
        // const userId = "user-id-aqui";
        // const response = await userCourseService.getByUser(userId, 0);

        // Como não temos o ID do usuário por enquanto, vamos mostrar uma lista vazia
        // ou buscar cursos de exemplo
        setCourses([]);
      } catch (err) {
        console.error("Erro ao carregar cursos do usuário:", err);
        setError("Não foi possível carregar seus cursos");
      } finally {
        setLoading(false);
      }
    }

    loadMyCourses();
  }, []);

  if (loading) {
    return (
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
        <p className="text-gray-600 mb-6">
          Acompanhe seu progresso e continue aprendendo
        </p>
        <div className="text-gray-600">Carregando seus cursos...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
        <p className="text-gray-600 mb-6">
          Acompanhe seu progresso e continue aprendendo
        </p>
        <div className="text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
      <p className="text-gray-600 mb-6">
        Acompanhe seu progresso e continue aprendendo
      </p>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            Você ainda não está inscrito em nenhum curso.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Explorar cursos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((userCourse) => (
            <Link
              to={`/courses/${userCourse.courseId}`}
              key={userCourse.id}
              className="bg-white text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="grid auto-rows-min items-start gap-1.5 px-6 pb-2">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                  {userCourse.status === "COMPLETED" ? (
                    <Award className="h-8 w-8 text-white" />
                  ) : (
                    <PlayCircle className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="font-semibold text-lg">
                  {userCourse.courseDetails?.name || "Carregando..."}
                </div>
              </div>

              <div className="px-6 space-y-3">
                <div className="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      transform: `translateX(-${100 - (userCourse.progress || 0)}%)`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {userCourse.progress || 0}% concluído
                </p>
                {userCourse.status === "COMPLETED" && (
                  <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Certificado disponível
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyCourses;
