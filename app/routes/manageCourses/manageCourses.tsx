import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { BookOpen, Edit2, Trash2, Plus, Search } from "lucide-react";
import { courseService } from "~/api/services/courseService";
import type { CourseDTO } from "~/api/types";

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.list();
      console.log("Cursos carregados:", response);
      const coursesList = response?.body?.lista || [];
      setCourses(coursesList);
      setFilteredCourses(coursesList);
    } catch (err: any) {
      console.error("Erro ao carregar cursos:", err);
      setError(
        err.response?.body?.message ||
          "Erro ao carregar cursos. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await courseService.delete(slug);
      console.log(`Curso ${slug} deletado com sucesso`);
      setDeleteConfirm(null);
      // Recarrega a lista de cursos
      await loadCourses();
    } catch (err: any) {
      console.error("Erro ao deletar curso:", err);
      alert(
        err.response?.body?.message ||
          "Erro ao deletar curso. Tente novamente.",
      );
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
                    Visualize, edite e exclua cursos da plataforma
                  </p>
                </div>
              </div>

              <Link
                to="/createCourse"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus className="h-5 w-5" />
                Novo Curso
              </Link>
            </div>
          </div>

          {/* Busca */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou slug..."
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
          {!loading && filteredCourses.length === 0 && !error && (
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
          {!loading && filteredCourses.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
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
                  {filteredCourses.map((course) => (
                    <tr key={course.slug} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {course.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.createdAtS || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/editCourse/${course.slug}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </Link>

                          {deleteConfirm === course.slug ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(course.slug!)}
                                className="text-red-600 hover:text-red-900 font-semibold"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(course.slug!)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Deletar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Course Count */}
          {!loading && filteredCourses.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Exibindo {filteredCourses.length} de {courses.length} cursos
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
