import { Target, Heart, Shield } from "lucide-react";

export function Values() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-card bg-white text-card-foreground flex flex-col gap-6 rounded-xl ring-1 ring-gray-200 text-center p-6">
            <div className="grid auto-rows-min items-start gap-1.5">
              <div className="flex justify-center mb-4">
                <Target className="h-12 w-12 text-green-600" />
              </div>
              <div className="font-semibold text-2xl">Nossa Missão</div>
            </div>
            <div>
              <p className="text-gray-600">
                Conectar ONGs e pessoas interessadas em aprender, oferecendo uma
                plataforma completa para educação gratuita e certificada,
                promovendo o desenvolvimento social e a inclusão digital.
              </p>
            </div>
          </div>

          <div className="bg-card bg-white text-card-foreground flex flex-col gap-6 rounded-xl ring-1 ring-gray-200 text-center p-6">
            <div className="grid auto-rows-min items-start gap-1.5">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-red-500" />
              </div>
              <div className="font-semibold text-2xl">Nossos Valores</div>
            </div>
            <div>
              <p className="text-gray-600">
                Acreditamos na educação como direito fundamental, na
                transparência das organizações sociais e no poder da tecnologia
                para criar oportunidades iguais para todos.
              </p>
            </div>
          </div>

          <div className="bg-card bg-white text-card-foreground flex flex-col gap-6 rounded-xl ring-1 ring-gray-200 text-center p-6">
            <div className="grid auto-rows-min items-start gap-1.5">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <div className="font-semibold text-2xl">Nosso Compromisso</div>
            </div>
            <div>
              <p className="text-gray-600">
                Garantimos a qualidade dos cursos através de validação de
                conteúdo, certificação digital autêntica e suporte contínuo para
                ONGs e estudantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
