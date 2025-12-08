import React, { useState } from "react";
// Importando os ícones da biblioteca lucide-react que já está instalada no seu projeto
import { Download, X, Award } from "lucide-react"; 

// Definindo o tipo de dados que um certificado tem
interface CertificateData {
  nome: string;
  emissor: string;
  dataEmissao: string;
  cargaHoraria: string;
  hashAutenticacao: string;
}

// Dados simulados dos certificados (aqui você pode adicionar mais se quiser)
const certificados: CertificateData[] = [
  {
    nome: "Voluntariado e Ação Social",
    emissor: "Rede Solidária",
    dataEmissao: "15 de Outubro de 2025",
    cargaHoraria: "40 horas",
    hashAutenticacao: "NGO-VOLUN-123456",
  },
  {
    nome: "Captação de Recursos",
    emissor: "ONG Capacitação",
    dataEmissao: "20 de Novembro de 2025",
    cargaHoraria: "60 horas",
    hashAutenticacao: "NGO-CAPT-789012",
  },
];

// --- Componente do Modal (A janela que abre) ---
const CertificateModal: React.FC<{
  certificate: CertificateData;
  onClose: () => void;
}> = ({ certificate, onClose }) => {
  
  // Função que simula o clique no botão de baixar
  const handleDownload = () => {
    alert(`Iniciando download do certificado: ${certificate.nome}. (Simulação)`);
  };

  return (
    // Fundo escuro atrás do modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      
      {/* A caixa branca do modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Botão de Fechar (X) no canto superior */}
        <div className="p-4 md:p-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Conteúdo do Modal */}
        <div className="p-8 md:px-12 md:pb-12 pt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Visualização do Certificado
          </h2>

          {/* --- DESENHO DO CERTIFICADO --- */}
          <div className="border-4 border-green-600 p-8 lg:p-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-inner select-none">
            <div className="text-center space-y-4">
              <Award className="h-16 w-16 text-green-600 mx-auto" strokeWidth={1.5} />
              <p className="text-xl font-light text-gray-700 uppercase">Certificado de Conclusão</p>
              
              <p className="text-lg text-gray-600">Conferimos a</p>

              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight">
                SEU NOME
              </h1>
              
              <p className="text-lg text-gray-600 pt-2">
                Pela conclusão do curso de <strong>{certificate.nome}</strong>, emitido por <strong>{certificate.emissor}</strong>.
              </p>
              
              <p className="text-sm text-gray-500 italic">
                Carga Horária: {certificate.cargaHoraria} | Emitido em: {certificate.dataEmissao}
              </p>
              
              <div className="pt-6 border-t mt-8 border-gray-300">
                <p className="text-xs text-gray-400">
                    Código de Autenticação: <span className="font-mono text-gray-600">{certificate.hashAutenticacao}</span>
                </p>
              </div>
            </div>
          </div>
          {/* --- FIM DO DESENHO --- */}

          {/* Botão de Download dentro do Modal */}
          <div className="text-center mt-8">
             <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-md text-base font-medium transition-all h-12 px-8 bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-60"
              >
                <Download className="h-5 w-5" />
                Baixar Certificado
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Lista ---
const Certificates = () => {
  // Estado para saber qual certificado está aberto (null = nenhum)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);

  // Função para abrir o modal
  const handleViewCertificate = (cert: CertificateData) => {
    setSelectedCertificate(cert);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

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

              {/* Botão que agora abre o Modal */}
              <button 
                onClick={() => handleViewCertificate(cert)}
                className="text-sm font-medium border border-blue-600 text-blue-600 rounded-md px-3 h-8 hover:bg-blue-600 hover:text-white transition-all"
              >
                Visualizar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Só mostra o Modal se houver um certificado selecionado */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default Certificates;
