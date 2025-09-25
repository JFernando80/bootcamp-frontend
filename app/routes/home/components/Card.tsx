import { BookOpen, Leaf } from "lucide-react";

export function Card() {
  return (
    <div
      data-slot="card"
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 pt-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-white" />
        </div>
      </div>

      <section
        data-slot="card-header"
        className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pb-2"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Verde Vida</span>
        </div>
        <h3 data-slot="card-title" className="font-semibold text-lg text-left">
          Educação Ambiental
        </h3>
        <p
          data-slot="card-description"
          className="text-muted-foreground text-sm text-left text-gray-500"
        >
          Aprenda sobre sustentabilidade e preservação do meio ambiente
        </p>
      </section>

      <div data-slot="card-content" className="px-6">
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-10 w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
          Ver Curso
        </button>
      </div>
    </div>
  );
}
