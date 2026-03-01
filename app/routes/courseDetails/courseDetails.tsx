import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCourseDetailsData,
  useActivitySelection,
  useActivityCompletion,
} from "./hooks";
import { CourseDetailsHeader } from "./components/CourseDetailsHeader";
import { CourseDetailsLoading } from "./components/CourseDetailsLoading";
import { CourseDetailsError } from "./components/CourseDetailsError";
import { ActivityContentCard } from "./components/ActivityContentCard";
import { ProgressCard } from "./components/ProgressCard";
import { CourseDetailsSidebar } from "./components/CourseDetailsSidebar";
import { AboutCourseCard } from "./components/AboutCourseCard";
import { CourseCompletionModal } from "./components/CourseCompletionModal";
import {
  CertificateModal,
  type CertificateData,
} from "~/routes/myArea/components/CertificateModal";
import { useNotification } from "~/components/NotificationProvider";
import { useAuthStore } from "~/stores/authStore";
import { userCourseService } from "~/api/services";
import { buildCertificateData } from "./utils/certificate";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { notify } = useNotification();
  const { userId, userName } = useAuthStore();
  const queryClient = useQueryClient();

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [certificateToShow, setCertificateToShow] =
    useState<CertificateData | null>(null);
  const hasShownCompletionModal = useRef(false);

  // Reset ao trocar de curso
  useEffect(() => {
    hasShownCompletionModal.current = false;
  }, [courseId]);

  const {
    course,
    modules,
    activitiesByModule,
    userActivities,
    userModules,
    userCourse,
    progressLoading,
    progressPercent,
    isCourseCompleted,
    isLoading,
    isError,
  } = useCourseDetailsData(courseId ?? undefined);

  const { selectedActivityId, selectedModuleId, selectActivity } =
    useActivitySelection({
      modules,
      activitiesByModule,
      userActivities,
      progressLoading,
    });

  const {
    processingActivity,
    quizAnswer,
    setQuizAnswer,
    toggleActivity,
    submitQuiz,
  } = useActivityCompletion({
    activitiesByModule,
    userActivities,
    selectedActivityId,
  });

  const selectedActivity = selectedActivityId
    ? Object.values(activitiesByModule)
        .flat()
        .find((a) => a.id === selectedActivityId) ?? null
    : null;
  const selectedUserActivity = selectedActivityId
    ? userActivities[selectedActivityId]
    : undefined;
  const isSelectedCompleted =
    !progressLoading && selectedUserActivity?.status === "FINALIZADO";
  const isSelectedProcessing =
    processingActivity === selectedActivityId || progressLoading;

  // Mostrar modal de conclusão quando o curso atingir 100% (apenas uma vez por sessão)
  useEffect(() => {
    if (
      isCourseCompleted &&
      userCourse?.id &&
      !hasShownCompletionModal.current
    ) {
      hasShownCompletionModal.current = true;
      setShowCompletionModal(true);
      // Marcar curso como concluído no backend (se ainda não estiver)
      if (userCourse.status !== "COMPLETED") {
        userCourseService
          .complete(userCourse.id)
          .then(() =>
            queryClient.invalidateQueries({ queryKey: ["enrollment"] }),
          )
          .catch(() => {});
      }
    }
  }, [isCourseCompleted, userCourse?.id, userCourse?.status, queryClient]);

  const handleGetCertificate = () => {
    setShowCompletionModal(false);
    if (course && courseId && userId && userName) {
      const certificate = buildCertificateData({
        courseName: course.title,
        userName,
        courseId,
        userId,
        completedAt: userCourse?.completedAt,
      });
      setCertificateToShow(certificate);
    }
  };

  if (isLoading) return <CourseDetailsLoading />;
  if (isError || !course) return <CourseDetailsError />;

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseDetailsHeader course={course} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ActivityContentCard
              activity={selectedActivity}
              isCompleted={!!isSelectedCompleted}
              isProcessing={!!isSelectedProcessing}
              onToggle={() =>
                toggleActivity(
                  selectedActivityId!,
                  selectedModuleId ?? undefined,
                )
              }
              onSubmitQuiz={(answerJson) =>
                selectedActivityId && submitQuiz(selectedActivityId, answerJson)
              }
              quizAnswer={quizAnswer}
              setQuizAnswer={setQuizAnswer}
              previousQuizAnswerJson={selectedUserActivity?.answerJson}
            />

            {userCourse && (
              <ProgressCard
                progressPercent={progressPercent}
                isLoading={progressLoading}
                isCourseCompleted={!!isCourseCompleted}
              />
            )}

            <AboutCourseCard course={course} />
          </div>

          <div className="lg:col-span-1">
            <CourseDetailsSidebar
              modules={modules}
              activitiesByModule={activitiesByModule}
              userModules={userModules}
              userActivities={userActivities}
              selectedActivityId={selectedActivityId}
              onSelectActivity={selectActivity}
              onLockedClick={() =>
                notify({
                  type: "info",
                  message:
                    "Conclua o módulo anterior para acessar estas atividades.",
                })
              }
              progressLoading={progressLoading}
            />
          </div>
        </div>
      </div>

      {showCompletionModal && course && (
        <CourseCompletionModal
          courseTitle={course.title}
          onClose={() => setShowCompletionModal(false)}
          onGetCertificate={handleGetCertificate}
        />
      )}

      {certificateToShow && (
        <CertificateModal
          certificate={certificateToShow}
          onClose={() => setCertificateToShow(null)}
        />
      )}
    </div>
  );
}
