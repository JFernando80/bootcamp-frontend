function Header() {
  return (
    <header className="h-16 text-black font-medium grid grid-cols-3 items-center bg-white px-60 shadow-md">
      <h1 className="justify-self-start">NGO Cursos</h1>

      <nav className="justify-self-center">
        <ul className="flex gap-14 text-sm">
          <li>
            <a href="/">Cursos</a>
          </li>
          <li>
            <a href="/about">Sobre</a>
          </li>
          <li>
            <a href="/">Minha Área</a>
          </li>
        </ul>
      </nav>

      <nav className="flex gap-4 text-sm justify-self-end">
        <a
          href="/login"
          className="border border-gray-300 px-4 py-[6px] rounded-md hover:bg-gray-200 transition"
        >
          Login
        </a>
        <a
          href="/register"
          className="bg-green-600 text-white px-4 py-[6px] rounded-md hover:bg-green-700 transition"
        >
          Cadastro
        </a>
      </nav>
    </header>
  );
}

export { Header };
