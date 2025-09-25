import { Users, Award, BookOpen, Play, Target, Shield } from "lucide-react";

const featuresData = [
  {
    icon: Users,
    color: "text-blue-600",
    title: "Gestão de Turmas",
    description:
      "Sistema completo para organizar turmas, inscrições e controle de frequência dos alunos.",
  },
  {
    icon: Award,
    color: "text-green-600",
    title: "Certificados Digitais",
    description:
      "Emissão automática de certificados válidos com autenticação digital.",
  },
  {
    icon: BookOpen,
    color: "text-purple-600",
    title: "Catálogo de Cursos",
    description:
      "Portal público com busca por localização, área de interesse e modalidade.",
  },
  {
    icon: Play,
    color: "text-red-600",
    title: "Upload de Vídeos",
    description:
      "Sistema de upload com validação de conteúdo e duração máxima de 20 minutos.",
  },
  {
    icon: Target,
    color: "text-orange-600",
    title: "Controle de Progresso",
    description:
      "Acompanhamento detalhado do andamento dos cursos e desempenho dos alunos.",
  },
  {
    icon: Shield,
    color: "text-indigo-600",
    title: "Validação de Conteúdo",
    description:
      "Todos os vídeos passam por processo de validação para garantir qualidade.",
  },
];

export function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-gray-600">
            Recursos desenvolvidos para atender às necessidades de ONGs,
            professores e estudantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg  ring-1 ring-gray-200 shadow-sm"
              >
                <Icon className={`h-8 w-8 mb-4 ${feature.color}`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
