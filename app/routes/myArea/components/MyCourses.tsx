import React from "react";

const courses = [
  { nome: "Gestão de ONGs", progresso: 30 },
  { nome: "Captação de Recursos", progresso: 70 },
  { nome: "Voluntariado e Ação Social", progresso: 100, certificado: true },
];

const MyCourses = () => {
  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
      <p className="text-gray-600 mb-6">
        Acompanhe seu progresso e continue aprendendo
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <a
            href={`/courses/${index + 1}`}
            key={index}
            className="bg-white text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="grid auto-rows-min items-start gap-1.5 px-6 pb-2">
              <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                {course.certificado ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-award h-8 w-8 text-white"
                  >
                    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                    <circle cx="12" cy="8" r="6"></circle>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-play h-8 w-8 text-white"
                  >
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                )}
              </div>
              <div className="font-semibold text-lg">{course.nome}</div>
            </div>

            <div className="px-6 space-y-3">
              <div className="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
                <div
                  className="bg-primary h-full transition-all"
                  style={{
                    transform: `translateX(-${100 - course.progresso}%)`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {course.progresso}% concluído
              </p>
              {course.certificado && (
                <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  Certificado disponível
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default MyCourses;
