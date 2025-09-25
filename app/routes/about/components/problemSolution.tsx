import { CircleCheckBig } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O Problema que Resolvemos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identificamos as principais barreiras no acesso à educação de
            qualidade e criamos soluções inovadoras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Principais Desafios:
            </h3>
            <ul className="space-y-4">
              {[
                "Falta de acesso à educação de qualidade",
                "Limitações financeiras para cursos pagos",
                "Falta de estrutura tecnológica nas ONGs",
                "Baixa inclusão digital",
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Nossas Soluções:
            </h3>
            <ul className="space-y-4">
              {[
                "Plataforma completa para gestão de cursos",
                "Modelo gratuito com recursos essenciais",
                "Interface responsiva e intuitiva",
                "Certificação digital válida e autenticada",
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CircleCheckBig className="w-6 h-6 text-green-500 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
