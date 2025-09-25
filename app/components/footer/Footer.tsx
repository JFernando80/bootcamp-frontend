import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 px-60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold">NGO Cursos</span>
            </div>
            <p className="text-gray-300">
              Democratizando o acesso à educação através de parcerias com ONGs
              comprometidas com o desenvolvimento social.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <p className="text-gray-300">
              Entre em contato conosco para mais informações sobre como sua ONG
              pode participar.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
