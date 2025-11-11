import React from "react";

const certificados = [
  {
    nome: "Voluntariado e Ação Social",
    emissor: "Rede Solidária",
  },
];

const Certificates = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificados.map((cert, index) => (
          <div
            key={index}
            className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm"
          >
            <div className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
                  className="lucide lucide-award h-6 w-6 text-green-600"
                >
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                  <circle cx="12" cy="8" r="6"></circle>
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{cert.nome}</h3>
                <p className="text-sm text-gray-600">
                  Emitido por {cert.emissor}
                </p>
              </div>

              <button className="text-sm font-medium border rounded-md px-3 h-8 hover:bg-accent hover:text-accent-foreground transition-all">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certificates;
