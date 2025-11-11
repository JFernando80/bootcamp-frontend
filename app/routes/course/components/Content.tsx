const aulas = [
  { titulo: "1. Introdução ao Curso", duracao: "10:00" },
  { titulo: "2. Módulo 1: Conceitos Básicos", duracao: "15:30" },
  { titulo: "3. Módulo 2: Aplicações Práticas", duracao: "20:00" },
  { titulo: "4. Conclusão e Próximos Passos", duracao: "08:45" },
];

const Content = () => {
  return (
    <div className="bg-white text-gray-800 flex flex-col gap-6 rounded-xl py-6 shadow-sm">
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">Conteúdo do Curso</h2>
        <div className="space-y-2">
          {aulas.map((aula, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
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
                  className="lucide lucide-play h-5 w-5"
                  aria-hidden="true"
                >
                  <polygon points="6 3 20 12 6 21 6 3"></polygon>
                </svg>
                <span>{aula.titulo}</span>
              </div>
              <span className="text-sm text-gray-500">{aula.duracao}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Content;
