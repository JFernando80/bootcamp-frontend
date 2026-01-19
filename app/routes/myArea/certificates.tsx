import React, { useState } from "react";
import {
  CertificateModal,
  type CertificateData,
} from "./components/CertificateModal";

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

export default function CertificatesRoute() {
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateData | null>(null);

  const handleViewCertificate = (cert: CertificateData) => {
    setSelectedCertificate(cert);
  };

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
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
