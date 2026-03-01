import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import {
  BookOpen,
  Plus,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { courseService } from "~/api/services/courseService";
import type { CourseDTO, SearchCriteriaDTO } from "~/api/types";
import { useAuthStore } from "~/stores/authStore";

export default function ManageCourses() {
  const { userId, isAdmin } = useAuthStore();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / Math.max(pageSize, 1)),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadCourses();
  }, [userId, currentPage, searchTerm]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: SearchCriteriaDTO[] = [];
      if (searchTerm.trim()) {
        filters.push({
          key: "title",
          operation: "MATCH",
          value: searchTerm.trim(),
        });
      }
      const response = await courseService.list(currentPage, filters);
      const body = response?.body;
      const coursesList = body?.lista || [];
      setCourses(coursesList);
      setTotalItems(body?.total ?? 0);
      setPageSize((prev) =>
        coursesList.length > 0 && coursesList.length >= prev
          ? coursesList.length
          : prev,
      );
    } catch (err: unknown) {
      console.error("Erro ao carregar cursos:", err);
      setError(
        (err as { response?: { body?: { message?: string } } })?.response
          ?.body?.message || "Erro ao carregar cursos. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gerenciar Cursos
                  </h1>
                  <p className="text-gray-600">
                    Visualize e gerencie seus cursos
                  </p>
                </div>
              </div>

              {isAdmin && (
                <Link
                  to="/createCourse"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  <Plus className="h-5 w-5" />
                  Novo Curso
                </Link>
              )}
            </div>
          </div>

          {/* Busca */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando cursos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && courses.length === 0 && !error && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm.trim()
                  ? "Nenhum curso encontrado com esse critério de busca."
                  : "Nenhum curso cadastrado ainda."}
              </p>
              {!searchTerm.trim() && (
                <Link
                  to="/createCourse"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  <Plus className="h-5 w-5" />
                  Criar Primeiro Curso
                </Link>
              )}
            </div>
          )}

          {/* Courses List */}
          {!loading && courses.length > 0 && (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criado em
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.slug} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                            {course.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.createdAtS || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {(isAdmin || course.ownerUser?.id === userId) && (
                              <Link
                                to={`/manageCourses/${course.slug}`}
                                className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                              >
                                <Settings className="h-4 w-4" />
                                Gerenciar
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Course Count */}
              <div className="mt-4 text-sm text-gray-600 text-center">
                Exibindo {courses.length} de {totalItems} curso(s)
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
