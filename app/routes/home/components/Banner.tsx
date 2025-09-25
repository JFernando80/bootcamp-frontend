import { Search } from "lucide-react";

export function Banner() {
  return (
    <section className="flex flex-col items-center justify-center text-center h-[480px] bg-gradient-to-r from-blue-800 to-green-800 text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
        EDUCAÇÃO GRATUITA <br />E CERTIFICADA PARA TODOS
      </h1>

      <p className="text-base md:text-lg max-w-2xl mb-6">
        Conectamos ONGs e pessoas interessadas em aprender através de cursos
        gratuitos e certificados
      </p>

      <div className="flex w-full max-w-[520px] gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar Cursos..."
            className="w-full h-12 pl-10 pr-4 rounded-lg text-black border border-gray-300 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <button className="h-12 bg-green-600 hover:bg-green-800 text-white px-6 rounded-lg transition">
          Buscar
        </button>
      </div>
    </section>
  );
}
