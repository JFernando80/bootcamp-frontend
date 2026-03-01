import { Link } from "react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { CourseDTO } from "~/api/types";

interface CourseDetailsHeaderProps {
  course: CourseDTO;
}

export function CourseDetailsHeader({ course }: CourseDetailsHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
      <div className="mb-8">
        <Link
          to="/myArea"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para Minha Área
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-lg flex-shrink-0">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course?.title || "Carregando..."}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
