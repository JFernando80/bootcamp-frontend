export function CallToAction() {
  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Junte-se à nossa comunidade e faça parte da transformação social
          através da educação
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all shadow-xs h-10 rounded-md px-6 bg-white text-green-600 hover:bg-gray-100"
          >
            Cadastre-se Gratuitamente
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all shadow-xs h-10 rounded-md px-6 border border-white text-white hover:bg-white hover:text-green-600"
          >
            Explorar Cursos
          </a>
        </div>
      </div>
    </section>
  );
}
