import { Award, X } from "lucide-react";

interface CourseCompletionModalProps {
  courseTitle: string;
  onClose: () => void;
  onGetCertificate: () => void;
}

export function CourseCompletionModal({
  courseTitle,
  onClose,
  onGetCertificate,
}: CourseCompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-end -mt-2 -mr-2">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center -mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Award className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Parabéns!
          </h2>
          <p className="text-gray-600 mb-2">
            Você concluiu 100% do curso <strong>{courseTitle}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Sua dedicação e esforço foram essenciais para essa conquista
          </p>

          <button
            onClick={onGetCertificate}
            className="inline-flex items-center gap-2 w-full justify-center py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition cursor-pointer"
          >
            <Award className="h-5 w-5" />
            Obter Certificado
          </button>
        </div>
      </div>
    </div>
  );
}
