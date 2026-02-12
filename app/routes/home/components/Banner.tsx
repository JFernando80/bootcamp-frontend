import { Search, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { courseService } from "~/api/services";
import type { CourseDTO } from "~/api/types";

export function Banner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<CourseDTO[]>([]);
  const [allCourses, setAllCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar todos os cursos ao montar o componente
    async function loadCourses() {
      try {
        const response = await courseService.getActive(1);
        if (response.statusCode === 200 && response.body) {
          setAllCourses(response.body.lista);
        }
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredCourses([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar cursos por título na API
      const response = await courseService.searchByTitle(value, 1);

      if (response.statusCode === 200 && response.body) {
        setFilteredCourses(response.body.lista);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      // Fallback para busca local
      const filtered = allCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(value.toLowerCase()) ||
          course.description.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCourses(filtered);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    navigate(`/courseDetails/${courseId}`);
    setSearchTerm("");
    setShowResults(false);
    setFilteredCourses([]);
  };

  return (
    <section className="flex flex-col items-center justify-center text-center h-[480px] bg-gradient-to-r from-blue-800 to-green-800 text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
        EDUCAÇÃO GRATUITA <br />E CERTIFICADA PARA TODOS
      </h1>

      <p className="text-base md:text-lg max-w-2xl mb-6">
        Conectamos ONGs e pessoas interessadas em aprender através de cursos
        gratuitos e certificados
      </p>

      <div className="flex w-full max-w-[520px] gap-2 relative" ref={searchRef}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Buscar Cursos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchTerm && setShowResults(true)}
            className="w-full h-12 pl-10 pr-4 rounded-lg text-white border border-white placeholder-white/70 bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20"
          />

          {/* Dropdown de Resultados */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 text-left">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">Buscando...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id!)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-b border-gray-100 last:border-b-0 cursor-pointer text-left"
                  >
                    <div className="bg-gradient-to-br from-green-400 to-blue-500 p-2 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-semibold text-gray-900 text-sm text-left">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5 text-left">
                        Bootcamp
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 text-left">
                        {course.description}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum curso encontrado</p>
                  <p className="text-xs mt-1">Tente outros termos de busca</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (searchTerm.trim() && filteredCourses.length > 0) {
              handleSelectCourse(filteredCourses[0].id!);
            }
          }}
          className="h-12 bg-green-600 hover:bg-green-800 text-white px-6 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !searchTerm.trim() || filteredCourses.length === 0 || loading
          }
        >
          Buscar
        </button>
      </div>
    </section>
  );
}
