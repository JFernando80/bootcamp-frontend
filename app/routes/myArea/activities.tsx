import React from "react";

export default function ActivitiesRoute() {
  const items = [
    {
      id: 1,
      type: "curso",
      title: "Assistiu aula 3 de Captação de Recursos",
      date: "2025-11-20",
    },
    {
      id: 2,
      type: "certificado",
      title: "Baixou certificado de Voluntariado e Ação Social",
      date: "2025-10-15",
    },
    {
      id: 3,
      type: "forum",
      title: "Comentou no fórum do curso Empreendedorismo Social",
      date: "2025-09-30",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Atividade Recente
      </h2>
      <div className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm">
        <div className="p-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <div className="flex-1">
                <p className="text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
