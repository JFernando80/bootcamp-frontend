import { useState, useEffect } from "react";
import { Check, Loader2, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { userCourseService } from "~/api/services";
import { useAuthStore } from "~/stores/authStore";
import type { UserCourseDTO, CourseDTO } from "~/api/types";
import { useNotification } from "~/components/NotificationProvider";

interface EnrollButtonProps {
  course: CourseDTO;
  onEnrolled?: () => void;
}

export function EnrollButton({ course, onEnrolled }: EnrollButtonProps) {
  const authState = useAuthStore();
  const { userName, isAuthenticated, userId } = authState;
  const { notify } = useNotification();

  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<UserCourseDTO | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkEnrollment();
  }, [course.id, course.slug, userId]);

  const checkEnrollment = async () => {
    const courseIdentifier = course.id || course.slug;
    if (!isAuthenticated || !courseIdentifier || !userId) {
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      // Buscar todos os cursos do usuário com classes: "user"
      const response = await userCourseService.list(1, [
        { key: "id", operation: "EQUAL", value: userId, classes: "user" },
      ]);

      // Filtrar pelo courseId client-side (comparar com id ou slug)
      const enrollmentData = response.body?.lista?.find(
        (uc) => uc.courseId === course.id || uc.courseId === course.slug,
      );

      if (enrollmentData) {
        setEnrolled(true);
        setEnrollment(enrollmentData);
      }
    } catch (err) {
      console.error("Erro ao verificar inscrição:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      notify({
        type: "info",
        message: "Você precisa estar logado para se inscrever em um curso",
      });
      return;
    }

    const courseIdentifier = course.id || course.slug;
    if (!courseIdentifier) {
      notify({ type: "error", message: "ID do curso não encontrado" });
      return;
    }

    if (!userId) {
      console.error("❌ userId não disponível no estado de autenticação");
      console.log("Estado atual:", authState);
      notify({
        type: "error",
        message:
          "Sessão incompleta detectada.\n\n" +
          "Por favor, faça logout e login novamente para continuar.\n\n" +
          "Se o problema persistir, limpe o cache do navegador (Ctrl+Shift+Delete) e tente novamente.",
      });
      return;
    }

    try {
      setLoading(true);

      const enrollmentData: UserCourseDTO = {
        userId: userId,
        userName: userName || "Usuário",
        courseId: courseIdentifier,
        courseDescription: course.description,
        progressPercent: 0,
        status: "EM_ANDAMENTO",
      };

      const response = await userCourseService.create(enrollmentData);

      if (response.statusCode === 200 || response.statusCode === 201) {
        setEnrolled(true);
        setEnrollment(response.body);
        notify({
          type: "success",
          message: "Inscrição realizada com sucesso!",
        });
        onEnrolled?.();
      }
    } catch (err: any) {
      console.error("Erro ao se inscrever:", err);
      notify({
        type: "error",
        message:
          err.response?.body?.message ||
          "Erro ao se inscrever no curso. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        <BookOpen className="h-5 w-5" />
        Faça login para se inscrever
      </a>
    );
  }

  if (checking) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        Verificando...
      </button>
    );
  }

  if (enrolled) {
    return (
      <div className="inline-flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-lg">
          <Check className="h-5 w-5" />
          Você já está inscrito
        </div>
        <div className="flex gap-2">
          <Link
            to={`/courseDetails/${enrollment?.courseId || course.id || course.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Acessar Curso
          </Link>
        </div>
        {enrollment && enrollment.progressPercent !== undefined && (
          <div className="text-sm text-gray-600">
            Progresso: {enrollment.progressPercent}%
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Inscrevendo...
        </>
      ) : (
        <>
          <BookOpen className="h-5 w-5" />
          Inscrever-se no Curso
        </>
      )}
    </button>
  );
}
