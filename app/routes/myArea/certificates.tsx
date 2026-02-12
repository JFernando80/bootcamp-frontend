import React, { useState } from "react";
import { Award } from "lucide-react";
import {
  CertificateModal,
  type CertificateData,
} from "./components/CertificateModal";

export default function CertificatesRoute() {
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateData | null>(null);
  const certificados: CertificateData[] = [];

  const handleViewCertificate = (cert: CertificateData) => {
    setSelectedCertificate(cert);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificados</h2>

      {certificados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-semibold">
            Nenhum certificado disponível
          </p>
          <p className="text-gray-500 text-sm">
            Complete cursos para conquistar seus certificados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificados.map((cert, index) => (
            <div
              key={index}
              className="bg-white flex flex-col gap-6 rounded-xl py-6 shadow-sm"
            >
              <div className="p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
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
      )}

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
