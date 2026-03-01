import React from "react";
import { Download, X } from "lucide-react";

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
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Source Sans 3', sans-serif; background: #fff; }
    .page {
      width: 297mm; min-height: 210mm;
      padding: 18mm 22mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cert {
      width: 100%;
      height: 100%;
      border: 3px double #b8860b;
      border-radius: 2px;
      background: #fefefe;
      padding: 0;
      text-align: center;
      position: relative;
      box-shadow: inset 0 0 0 1px rgba(184, 134, 11, 0.2);
    }
    .cert::before, .cert::after {
      content: '';
      position: absolute;
      width: 40px; height: 40px;
      border: 2px solid #b8860b;
      border-radius: 2px;
      top: 12mm; left: 12mm;
    }
    .cert::after {
      left: auto; right: 12mm;
    }
    .cert-inner {
      padding: 36px 48px 32px;
    }
    .header-line { width: 80px; height: 2px; background: #b8860b; margin: 0 auto 16px; }
    .label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11px;
      letter-spacing: 6px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 24px;
      font-weight: 600;
    }
    .body { font-size: 15px; color: #4b5563; margin-bottom: 6px; line-height: 1.6; }
    .title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.5px;
      margin: 12px 0 16px;
      line-height: 1.2;
    }
    .course {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #111827;
      margin: 8px 0 12px;
      font-style: italic;
    }
    .emissor {
      font-size: 14px;
      color: #6b7280;
      margin-top: 20px;
    }
    .emissor strong { color: #374151; font-weight: 600; }
    .meta {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 28px;
      letter-spacing: 0.5px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px auto;
      width: 50%;
    }
    .hash {
      font-size: 10px;
      color: #9ca3af;
      font-family: 'Consolas', 'Monaco', monospace;
      letter-spacing: 0.5px;
    }
    @media print {
      @page { size: A4 landscape; margin: 0; }
      .page { width: 100%; min-height: 100vh; padding: 10mm; }
      .cert { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="cert">
      <div class="cert-inner">
        <div class="header-line"></div>
        <p class="label">Certificado de Conclusão</p>
        <p class="body">Certificamos que</p>
        <h1 class="title">${certificate.userName}</h1>
        <p class="body">concluiu com êxito o curso</p>
        <p class="course">${certificate.nome}</p>
        <p class="body emissor" style="margin-top:12px;">oferecido por <strong>${certificate.emissor}</strong></p>
        <p class="meta">
          ${certificate.cargaHoraria ? `Carga Horária: ${certificate.cargaHoraria} &nbsp;·&nbsp; ` : ""}
          Emitido em: ${certificate.dataEmissao}
        </p>
        <hr class="divider"/>
        <p class="hash">Código de Autenticação: ${certificate.hashAutenticacao}</p>
      </div>
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
          <div className="border-2 border-amber-700/40 bg-[#fefefe] rounded-sm shadow-inner select-none overflow-hidden">
            <div className="p-8 lg:p-12 text-center relative">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-amber-700/50 rounded-sm" />
              <div className="absolute top-4 right-4 w-8 h-8 border-2 border-amber-700/50 rounded-sm" />

              <div className="w-16 h-0.5 bg-amber-700/60 mx-auto mb-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 mb-6">
                Certificado de Conclusão
              </p>
              <p className="text-sm text-gray-600">Certificamos que</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-3 mb-4 tracking-tight">
                {certificate.userName}
              </h1>
              <p className="text-sm text-gray-600">concluiu com êxito o curso</p>
              <p className="text-lg md:text-xl font-semibold text-gray-900 mt-2 italic">
                {certificate.nome}
              </p>
              <p className="text-sm text-gray-600 mt-3">
                oferecido por <strong className="text-gray-700 font-semibold">{certificate.emissor}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-6">
                {certificate.cargaHoraria &&
                  `Carga Horária: ${certificate.cargaHoraria} · `}
                Emitido em: {certificate.dataEmissao}
              </p>
              <div className="border-t border-gray-200 mt-6 pt-6 max-w-xs mx-auto">
                <p className="text-[10px] text-gray-400 font-mono">
                  Código de Autenticação: {certificate.hashAutenticacao}
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
