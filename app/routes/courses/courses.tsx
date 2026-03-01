import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { courseService } from "~/api/services";
import type { CourseDTO, SearchCriteriaDTO } from "~/api/types";
import { Card } from "~/routes/home/components/Card";
import { CourseSkeletonGrid } from "~/components/CourseCardSkeleton";

export default function Courses() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SearchCriteriaDTO[]>([]);

  useEffect(() => {
    loadCourses();
  }, [currentPage, filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "Carregando cursos - Página:",
        currentPage,
        "Filtros:",
        filters,
      );
      const response = await courseService.list(currentPage, filters);

      if (response.statusCode === 200 && response.body) {
        const body = response.body as {
          lista?: CourseDTO[];
          total?: number;
          totalPages?: number;
        };
        setCourses(body.lista || []);
        const total = body.total ?? 0;
        const totalPagesFromApi = body.totalPages;
        const pages =
          totalPagesFromApi ??
          (total > 0 ? Math.max(1, total) : 1);
        setTotalPages(pages);
      }
    } catch (err: any) {
      console.error("Erro ao carregar cursos:", err);
      console.error("Response error:", err.response?.body);
      setError(
        err.response?.body?.message ||
          "Erro ao carregar cursos. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setFilters([{ key: "title", operation: "MATCH", value: searchTerm }]);
    } else {
      setFilters([]);
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilters([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Catálogo de Cursos</h1>
          <p className="text-lg text-white/90">
            Explore todos os cursos disponíveis e encontre o conhecimento que
            você busca
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cursos por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <CourseSkeletonGrid count={8} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600">
              Nenhum curso encontrado com os filtros aplicados.
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Exibindo {courses.length} curso(s) - Página {currentPage} de{" "}
              {totalPages}
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  id={course.slug || course.id!}
                  title={course.title}
                  organization="Bootcamp"
                  description={course.description}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>
                <span className="text-gray-600">
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
          </>
        )}
      </div>
    </div>
  );
}
