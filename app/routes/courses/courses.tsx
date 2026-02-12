import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { courseService } from "~/api/services";
import type { CourseDTO, SearchCriteriaDTO } from "~/api/types";
import { Card } from "~/routes/home/components/Card";
import { CourseSkeletonGrid } from "~/components/CourseCardSkeleton";

interface FilterField {
  id: number;
  variavel: string;
  tipo: string;
  header: string;
  status: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [availableFields, setAvailableFields] = useState<FilterField[]>([]);
  const [filters, setFilters] = useState<SearchCriteriaDTO[]>([]);

  useEffect(() => {
    loadAvailableFields();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [currentPage, filters]);

  const loadAvailableFields = async () => {
    try {
      const response = await courseService.getFields();
      if (response.statusCode === 200 && response.body) {
        // Filtrar apenas campos relevantes para filtros (não incluir "ordem" e campos duplicados)
        const fields = response.body.filter(
          (field: any) =>
            field.variavel !== "ordem" &&
            field.tipo !== "ordem" &&
            !field.variavel.includes("password") &&
            !field.variavel.includes("salt"),
        );
        setAvailableFields(fields);
      }
    } catch (err) {
      console.error("Erro ao carregar campos de filtro:", err);
    }
  };

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
        setCourses(response.body.lista);
        setTotalPages(response.body.total);
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
      const searchFilter: SearchCriteriaDTO = {
        key: "title",
        operation: "LIKE",
        value: searchTerm,
      };
      setFilters([searchFilter]);
      setCurrentPage(1);
    } else {
      setFilters([]);
      setCurrentPage(1);
    }
  };

  const handleAddFilter = (field: string, operation: string, value: string) => {
    if (!value.trim() || !field || !operation) {
      console.error("Tentativa de adicionar filtro inválido:", {
        field,
        operation,
        value,
      });
      return;
    }

    // Validar que a operação é uma das válidas
    const validOperations = [
      "EQUALS",
      "LIKE",
      "GREATER_THAN",
      "LESS_THAN",
      "GREATER_THAN_OR_EQUAL",
      "LESS_THAN_OR_EQUAL",
      "NOT_EQUALS",
    ];
    if (!validOperations.includes(operation)) {
      console.error("Operação inválida:", operation);
      alert("Operação inválida selecionada.");
      return;
    }

    const newFilter: SearchCriteriaDTO = {
      key: field,
      operation: operation as SearchCriteriaDTO["operation"],
      value: value,
    };

    console.log("Adicionando filtro:", newFilter);
    setFilters([...filters, newFilter]);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters([]);
    setSearchTerm("");
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

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cursos por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </form>

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {filters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>
                    {filter.key} {filter.operation.toLowerCase()} {filter.value}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="hover:text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Limpar todos
              </button>
            </div>
          )}

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Filtros Avançados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo
                  </label>
                  <select
                    id="filterField"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um campo</option>
                    {availableFields.map((field) => (
                      <option key={field.id} value={field.variavel}>
                        {field.header}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operação
                  </label>
                  <select
                    id="filterOperation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EQUALS">Igual a</option>
                    <option value="LIKE">Contém</option>
                    <option value="GREATER_THAN">Maior que</option>
                    <option value="LESS_THAN">Menor que</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="filterValue"
                      placeholder="Digite o valor"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const field = (
                          document.getElementById(
                            "filterField",
                          ) as HTMLSelectElement
                        ).value;
                        const operation = (
                          document.getElementById(
                            "filterOperation",
                          ) as HTMLSelectElement
                        ).value;
                        const value = (
                          document.getElementById(
                            "filterValue",
                          ) as HTMLInputElement
                        ).value;

                        if (!field || field === "") {
                          alert("Por favor, selecione um campo para filtrar.");
                          return;
                        }

                        if (!operation || operation === "") {
                          alert("Por favor, selecione uma operação.");
                          return;
                        }

                        if (!value || value.trim() === "") {
                          alert("Por favor, digite um valor para o filtro.");
                          return;
                        }

                        handleAddFilter(field, operation, value);
                        (
                          document.getElementById(
                            "filterValue",
                          ) as HTMLInputElement
                        ).value = "";
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  id={course.id!}
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
