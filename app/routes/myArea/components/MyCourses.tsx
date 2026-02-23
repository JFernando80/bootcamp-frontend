import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlayCircle, Award } from "lucide-react";
import {
  userCourseService,
  courseService,
  userActivityService,
  moduleService,
  activityService,
} from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import type { UserCourseDTO, CourseDTO } from "~/api/types";

interface CourseWithDetails extends UserCourseDTO {
  courseDetails?: CourseDTO;
  localProgressPercent: number;
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

        // Carregar todas as atividades do usuário de uma vez
        const uaResp = await userActivityService.list(1, [
          { key: "id", operation: "EQUAL", value: userId, classes: "user" },
        ]);
        const uaMap: Record<string, string> = {};
        (uaResp.body?.lista ?? []).forEach((ua) => {
          if (ua.activityId) uaMap[ua.activityId] = ua.status || "";
        });

        // Buscar detalhes de cada curso + calcular progresso local
        const coursesWithDetails: CourseWithDetails[] = await Promise.all(
          userCourses.map(async (userCourse) => {
            let courseDetails: CourseDTO | undefined;
            try {
              const r = await courseService.list(1, [
                { key: "id", operation: "EQUAL", value: userCourse.courseId },
              ]);
              courseDetails = r.body?.lista?.[0];
            } catch (_) {}

            // Calcular progresso local contando atividades concluídas
            let localProgressPercent = 0;
            try {
              const modResp = await moduleService.list(1, [
                {
                  key: "id",
                  operation: "EQUAL",
                  value: courseDetails?.id || userCourse.courseId,
                  classes: "course",
                },
              ]);
              const mods = modResp.body?.lista ?? [];
              let total = 0;
              let done = 0;
              for (const mod of mods) {
                const actResp = await activityService.list(1, [
                  {
                    key: "id",
                    operation: "EQUAL",
                    value: mod.id!,
                    classes: "module",
                  },
                ]);
                const acts = actResp.body?.lista ?? [];
                total += acts.length;
                done += acts.filter(
                  (a) => uaMap[a.id!] === "FINALIZADO",
                ).length;
              }
              if (total > 0)
                localProgressPercent = Math.round((done / total) * 100);
            } catch (_) {}

            return { ...userCourse, courseDetails, localProgressPercent };
          }),
        );

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
                      width: `${userCourse.localProgressPercent}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {userCourse.localProgressPercent}% concluído
                </p>
                {userCourse.localProgressPercent === 100 && (
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
