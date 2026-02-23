import React from "react";
import { Download, X, Award } from "lucide-react";

export type CertificateData = {
  nome: string; // course name
  userName: string; // recipient name
  emissor: string;
  dataEmissao: string;
  cargaHoraria?: string;
  hashAutenticacao: string;
};

type Props = {
  certificate: CertificateData;
  onClose: () => void;
};

export const CertificateModal: React.FC<Props> = ({ certificate, onClose }) => {
  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Certificado – ${certificate.nome}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; }
    .page {
      width: 297mm; min-height: 210mm;
      padding: 20mm 24mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cert {
      width: 100%;
      border: 6px solid #16a34a;
      border-radius: 16px;
      background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
      padding: 48px 64px;
      text-align: center;
    }
    .badge { font-size: 72px; margin-bottom: 12px; }
    .label { font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .title { font-size: 32px; font-weight: 900; color: #1d4ed8; letter-spacing: -1px; margin-bottom: 12px; }
    .body { font-size: 17px; color: #374151; margin-bottom: 4px; }
    .course { font-size: 20px; font-weight: 700; color: #111827; }
    .meta { font-size: 13px; color: #6b7280; font-style: italic; margin-top: 16px; }
    .divider { border: none; border-top: 1px solid #d1d5db; margin: 28px auto; width: 60%; }
    .hash { font-size: 11px; color: #9ca3af; font-family: monospace; }
    @media print {
      @page { size: A4 landscape; margin: 0; }
      .page { width: 100%; min-height: 100vh; padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="cert">
      <div class="badge">🏅</div>
      <p class="label">Certificado de Conclusão</p>
      <p class="body" style="font-size:15px;margin-bottom:6px;">Certificamos que</p>
      <h1 class="title">${certificate.userName}</h1>
      <p class="body">concluiu com êxito o curso</p>
      <p class="course">${certificate.nome}</p>
      <p class="body" style="margin-top:8px;">oferecido por <strong>${certificate.emissor}</strong></p>
      <p class="meta">
        ${certificate.cargaHoraria ? `Carga Horária: ${certificate.cargaHoraria} &nbsp;|&nbsp; ` : ""}
        Emitido em: ${certificate.dataEmissao}
      </p>
      <hr class="divider"/>
      <p class="hash">Código de Autenticação: ${certificate.hashAutenticacao}</p>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
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

          {/* Certificate preview */}
          <div className="border-4 border-green-600 p-8 lg:p-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-inner select-none">
            <div className="text-center space-y-3">
              <Award
                className="h-16 w-16 text-green-600 mx-auto"
                strokeWidth={1.5}
              />
              <p className="text-sm font-light uppercase tracking-widest text-gray-500">
                Certificado de Conclusão
              </p>
              <p className="text-base text-gray-600">Certificamos que</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight">
                {certificate.userName}
              </h1>
              <p className="text-base text-gray-600 pt-1">
                concluiu com êxito o curso
              </p>
              <p className="text-xl font-bold text-gray-900">
                {certificate.nome}
              </p>
              <p className="text-base text-gray-600">
                oferecido por <strong>{certificate.emissor}</strong>
              </p>
              <p className="text-sm text-gray-500 italic">
                {certificate.cargaHoraria &&
                  `Carga Horária: ${certificate.cargaHoraria} | `}
                Emitido em: {certificate.dataEmissao}
              </p>
              <div className="pt-6 border-t mt-6 border-gray-300">
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
              className="inline-flex items-center justify-center gap-2 rounded-md text-base font-medium h-12 px-8 bg-green-600 hover:bg-green-700 text-white shadow-md transition"
            >
              <Download className="h-5 w-5" />
              Baixar Certificado (PDF)
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Será aberta uma janela de impressão — selecione "Salvar como PDF"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
