export function Banner() {
  return (
    <section className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sobre a NGO Cursos
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Democratizando o acesso à educação através de parcerias com ONGs
            comprometidas com o desenvolvimento social
          </p>
        </div>
      </div>
    </section>
  );
}
