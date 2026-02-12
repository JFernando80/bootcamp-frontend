import { useState, useEffect } from "react";
import { Card } from "./Card";
import { courseService } from "~/api/services";
import type { CourseDTO } from "~/api/types";
import { CourseSkeletonGrid } from "~/components/CourseCardSkeleton";

export function Catalog() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const response = await courseService.getActive(1);

        if (response.statusCode === 200 && response.body) {
          setCourses(response.body.lista);
        }
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        setError(
          "Não foi possível carregar os cursos. Tente novamente mais tarde.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return (
      <section className="flex flex-col items-center text-center py-12 px-60 sm:px-10">
        <h2 className="text-3xl font-bold mb-14 mt-2">CATÁLOGO DE CURSOS</h2>
        <div className="w-full max-w-[1400px]">
          <CourseSkeletonGrid count={8} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center text-center py-12 px-60 sm:px-10">
        <h2 className="text-3xl font-bold mb-14 mt-2">CATÁLOGO DE CURSOS</h2>
        <div className="text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center text-center py-12 px-60 sm:px-10">
      <h2 className="text-3xl font-bold mb-14 mt-2">CATÁLOGO DE CURSOS</h2>

      {courses.length === 0 ? (
        <div className="text-gray-600">Nenhum curso disponível no momento.</div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-[1400px]">
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
      )}
    </section>
  );
}
