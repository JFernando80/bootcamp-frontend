import type { CourseDTO } from "~/api/types";

interface AboutCourseCardProps {
  course: CourseDTO;
}

export function AboutCourseCard({ course }: AboutCourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre o Curso</h2>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {course.description}
      </p>
    </div>
  );
}
