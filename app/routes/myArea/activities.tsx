import React from "react";
import { Activity } from "lucide-react";

export default function ActivitiesRoute() {
  const items: any[] = [];

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Atividade Recente
      </h2>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-semibold">
            Nenhuma atividade recente
          </p>
          <p className="text-gray-500 text-sm">
            Suas atividades aparecerão aqui quando você começar a interagir com
            os cursos
          </p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
