import { Card } from "./Card";
import { mockCourses } from "~/data/mockCourses";

export function Catalog() {
  return (
    <section className="flex flex-col items-center text-center py-12 px-60 sm:px-10">
      <h2 className="text-3xl font-bold mb-14 mt-2">CATÁLOGO DE CURSOS</h2>

      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-[1400px]">
        {mockCourses.map((course) => (
          <Card
            key={course.id}
            id={course.id}
            title={course.title}
            organization={course.organization}
            description={course.description}
            icon={course.icon}
          />
        ))}
      </div>
    </section>
  );
}
