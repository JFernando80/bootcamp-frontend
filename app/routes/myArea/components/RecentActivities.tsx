import React from "react";

const atividades = [
  {
    cor: "bg-green-500",
    texto: 'Concluiu o curso "Voluntariado e Ação Social"',
    tempo: "2 dias atrás",
  },
  {
    cor: "bg-blue-500",
    texto: 'Assistiu à aula "Estratégias de Captação"',
    tempo: "1 semana atrás",
  },
  {
    cor: "bg-yellow-500",
    texto: 'Iniciou o curso "Gestão de ONGs"',
    tempo: "2 semanas atrás",
  },
];

const RecentActivities = () => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Atividade Recente
      </h2>
      <div className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm">
        <div className="p-6 space-y-4">
          {atividades.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${item.cor}`}></div>
              <div className="flex-1">
                <p className="text-sm">{item.texto}</p>
                <p className="text-xs text-gray-500">{item.tempo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentActivities;
