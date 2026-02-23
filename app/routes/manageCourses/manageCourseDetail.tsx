import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { courseService, moduleService, activityService } from "~/api/services";
import type { CourseDTO, ModuleDTO, ActivityDTO } from "~/api/types";
import { ModuleModal } from "./components/ModuleModal";
import { ActivityModal } from "./components/ActivityModal";
import { useNotification } from "~/components/NotificationProvider";
import { useAuthStore } from "~/stores/authStore";

export default function ManageCourseDetail() {
  const { notify } = useNotification();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityDTO[]>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleDTO | null>(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDTO | null>(
    null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  useEffect(() => {
    if (slug) {
      loadCourseData();
    }
  }, [slug]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar curso
      const courseData = await courseService.getById(slug!);
      if (!courseData) {
        setError("Curso não encontrado");
        return;
      }
      setCourse(courseData);

      // Usar id ou slug como identificador
      const courseIdentifier = courseData.id || courseData.slug;
      if (!courseIdentifier) {
        setError("Identificador do curso não encontrado");
        return;
      }

      // Carregar módulos do curso
      const modulesResponse = await moduleService.list(1, [
        {
          key: "id",
          operation: "EQUAL",
          value: courseIdentifier,
          classes: "course",
        },
      ]);

      const modulesList = modulesResponse.body?.lista || [];
      setModules(modulesList.sort((a, b) => a.index - b.index));

      // Carregar atividades de cada módulo
      const activitiesMap: Record<string, ActivityDTO[]> = {};
      for (const module of modulesList) {
        const activitiesResponse = await activityService.list(1, [
          {
            key: "id",
            operation: "EQUAL",
            value: module.id!,
            classes: "module",
          },
        ]);
        activitiesMap[module.id!] = activitiesResponse.body?.lista || [];
      }
      setActivities(activitiesMap);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar informações do curso");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo?")) return;

    try {
      await moduleService.delete(moduleId);
      await loadCourseData();
    } catch (err: any) {
      notify({
        type: "error",
        message:
          "Erro ao excluir módulo: " +
          (err.response?.body?.message || err.message),
      });
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;

    try {
      await activityService.delete(activityId);
      await loadCourseData();
    } catch (err: any) {
      notify({
        type: "error",
        message:
          "Erro ao excluir atividade: " +
          (err.response?.body?.message || err.message),
      });
    }
  };

  const openCreateModule = () => {
    setEditingModule(null);
    setShowModuleModal(true);
  };

  const openEditModule = (module: ModuleDTO) => {
    setEditingModule(module);
    setShowModuleModal(true);
  };

  const openCreateActivity = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const openEditActivity = (activity: ActivityDTO, moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-800 mb-4">
                {error || "Curso não encontrado"}
              </p>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para Gerenciar Cursos
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para Gerenciar Cursos
            </button>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h1>
                    <p className="text-gray-600">{course.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Slug:{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {course.slug}
                      </code>
                    </p>
                  </div>
                </div>
                <Link
                  to={`/editCourse/${course.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Edit className="h-4 w-4" />
                  Editar Curso
                </Link>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Módulos</h2>
              {isAdmin && (
                <button
                  onClick={openCreateModule}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-5 w-5" />
                  Adicionar Módulo
                </button>
              )}
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum módulo cadastrado ainda.</p>
                <p className="text-sm">
                  Clique em "Adicionar Módulo" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                            {module.index}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          {module.requiredToCompleteCourse && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {module.description}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModule(module)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Activities */}
                    <div className="mt-4 ml-8 pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Atividades
                        </h4>
                        {isAdmin && (
                          <button
                            onClick={() => openCreateActivity(module.id!)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar
                          </button>
                        )}
                      </div>

                      {!activities[module.id!] ||
                      activities[module.id!].length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          Nenhuma atividade cadastrada
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {activities[module.id!].map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                    {activity.type}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    Máx: {activity.maxScore} pts | Mín:{" "}
                                    {activity.passingScore} pts
                                  </span>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      openEditActivity(activity, module.id!)
                                    }
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteActivity(activity.id!)
                                    }
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModuleModal
        isOpen={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        onSuccess={loadCourseData}
        courseId={course.id || course.slug || ""}
        courseDescription={course.description}
        module={editingModule}
      />

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSuccess={loadCourseData}
        moduleId={selectedModuleId}
        moduleDescription={
          modules.find((m) => m.id === selectedModuleId)?.description
        }
        activity={editingActivity}
      />
    </ProtectedRoute>
  );
}
