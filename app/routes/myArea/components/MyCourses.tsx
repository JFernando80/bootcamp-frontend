import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlayCircle, Award } from "lucide-react";
import { userCourseService, courseService } from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import type { UserCourseDTO, CourseDTO } from "~/api/types";

interface CourseWithDetails extends UserCourseDTO {
  courseDetails?: CourseDTO;
}

const MyCourses = () => {
  const { userId, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyCourses() {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar todos os cursos do usuário logado
        const response = await userCourseService.list(1, [
          { key: "id", operation: "EQUAL", value: userId, classes: "user" },
        ]);

        console.log("📚 UserCourses carregados:", response);

        if (!response.body?.lista) {
          setCourses([]);
          return;
        }

        const userCourses = response.body.lista;

        // Buscar detalhes de cada curso
        const coursesWithDetails: CourseWithDetails[] = await Promise.all(
          userCourses.map(async (userCourse) => {
            try {
              // Buscar o curso pelo ID ou slug
              const courseResponse = await courseService.list(1, [
                {
                  key: "id",
                  operation: "EQUAL",
                  value: userCourse.courseId,
                },
              ]);

              console.log(
                `📖 Detalhes do curso ${userCourse.courseId}:`,
                courseResponse,
              );

              const courseDetails =
                courseResponse.body?.lista?.[0] || undefined;

              return {
                ...userCourse,
                courseDetails,
              };
            } catch (err) {
              console.error(
                `Erro ao buscar detalhes do curso ${userCourse.courseId}:`,
                err,
              );
              return {
                ...userCourse,
                courseDetails: undefined,
              };
            }
          }),
        );

        console.log("✅ Cursos com detalhes:", coursesWithDetails);
        setCourses(coursesWithDetails);
      } catch (err) {
        console.error("Erro ao carregar cursos do usuário:", err);
        setError("Não foi possível carregar seus cursos");
      } finally {
        setLoading(false);
      }
    }

    loadMyCourses();
  }, [userId, isAuthenticated]);

  if (loading) {
    return (
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
        <p className="text-gray-600 mb-6">
          Acompanhe seu progresso e continue aprendendo
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white h-full flex flex-col gap-6 rounded-xl py-6 shadow-sm animate-pulse"
            >
              <div className="grid auto-rows-min items-start gap-1.5 px-6 pb-2">
                {/* Icon placeholder */}
                <div className="aspect-video bg-gray-200 rounded-lg mb-3" />
                {/* Title placeholder */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
              </div>

              <div className="px-6 space-y-3 mt-auto">
                {/* Progress bar placeholder */}
                <div className="bg-gray-200 relative w-full overflow-hidden rounded-full h-2" />
                {/* Progress text placeholder */}
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
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
              to={`/courseDetails/${userCourse.courseId}`}
              key={userCourse.id}
              className="bg-white text-card-foreground h-full flex flex-col gap-6 rounded-xl py-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="grid auto-rows-min items-start gap-1.5 px-6 pb-2">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                  {userCourse.status === "FINALIZADO" ? (
                    <Award className="h-8 w-8 text-white" />
                  ) : (
                    <PlayCircle className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="font-semibold text-lg">
                  {userCourse.courseDetails?.title ||
                    userCourse.courseDescription ||
                    "Curso"}
                </div>
                {userCourse.courseDetails?.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {userCourse.courseDetails.description}
                  </p>
                )}
              </div>

              <div className="px-6 space-y-3 mt-auto">
                <div className="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
                  <div
                    className="bg-green-600 h-full transition-all"
                    style={{
                      width: `${userCourse.progressPercent || 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {userCourse.progressPercent || 0}% concluído
                </p>
                {userCourse.status === "FINALIZADO" && (
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
