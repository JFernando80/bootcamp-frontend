// Agora usamos contexto para evitar flicker
import React from "react";
import { useAuth } from "~/context/AuthProvider";
import { useNavigate } from "react-router";

function HeaderInner() {
  const { isAuthenticated, logout, ready } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redireciona para home
    navigate("/");
  };

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
          {!ready ? null : isAuthenticated ? (
            <li>
              <a href="/myArea">Minha Área</a>
            </li>
          ) : (
            <li className="relative group">
              <span
                role="link"
                aria-disabled="true"
                tabIndex={0}
                className="text-gray-400 cursor-not-allowed select-none"
                onClick={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                  }
                }}
              >
                Minha Área
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block group-focus-within:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                Faça login para acessar
              </div>
            </li>
          )}
        </ul>
      </nav>

      <nav className="flex gap-4 text-sm justify-self-end">
        {!ready ? null : !isAuthenticated ? (
          <>
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
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="border border-gray-300 px-4 py-[6px] rounded-md hover:bg-gray-200 transition"
          >
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}

// Memo evita re-render em trocas de rota quando contexto não muda
export const Header = React.memo(HeaderInner);
