import { Link } from "react-router";

export function CourseDetailsError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Curso não encontrado
        </h1>
        <p className="text-gray-600 mb-6">
          O curso que você está procurando não existe ou você não tem acesso.
        </p>
        <Link
          to="/myArea"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
        >
          Voltar para Minha Área
        </Link>
      </div>
    </div>
  );
}
