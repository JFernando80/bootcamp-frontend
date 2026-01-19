import React from "react";
import { Download, X, Award } from "lucide-react";

export type CertificateData = {
  nome: string;
  emissor: string;
  dataEmissao: string;
  cargaHoraria: string;
  hashAutenticacao: string;
};

type Props = {
  certificate: CertificateData;
  onClose: () => void;
};

export const CertificateModal: React.FC<Props> = ({ certificate, onClose }) => {
  const handleDownload = () => {
    alert(
      `Iniciando download do certificado: ${certificate.nome}. (Simulação)`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-4 md:p-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-8 md:px-12 md:pb-12 pt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Visualização do Certificado
          </h2>
          <div className="border-4 border-green-600 p-8 lg:p-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-inner select-none">
            <div className="text-center space-y-4">
              <Award
                className="h-16 w-16 text-green-600 mx-auto"
                strokeWidth={1.5}
              />
              <p className="text-xl font-light text-gray-700 uppercase">
                Certificado de Conclusão
              </p>
              <p className="text-lg text-gray-600">Conferimos a</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight">
                SEU NOME
              </h1>
              <p className="text-lg text-gray-600 pt-2">
                Pela conclusão do curso de <strong>{certificate.nome}</strong>,
                emitido por <strong>{certificate.emissor}</strong>.
              </p>
              <p className="text-sm text-gray-500 italic">
                Carga Horária: {certificate.cargaHoraria} | Emitido em:{" "}
                {certificate.dataEmissao}
              </p>
              <div className="pt-6 border-t mt-8 border-gray-300">
                <p className="text-xs text-gray-400">
                  Código de Autenticação:{" "}
                  <span className="font-mono text-gray-600">
                    {certificate.hashAutenticacao}
                  </span>
                </p>
              </div>
            </div>
          </div>
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
