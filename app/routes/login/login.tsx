import React from "react";

export default function LoginCard() {
  return (
    <div
      style={{ minHeight: "calc(100vh - 64px)" }}
      className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
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
              className="lucide lucide-leaf h-12 w-12 text-green-600"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-gray-600">
            Acesse seus cursos e certificados
          </p>
        </div>

        <div className="bg-white text-card-foreground flex flex-col gap-6 rounded-2xl py-6 shadow-md border border-gray-200">
          <div className="p-6">
            <form className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="password"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-600">
                    Lembrar de mim
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all h-10 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Entrar
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button className="text-green-600 hover:text-green-500 font-medium">
                  Cadastre-se gratuitamente
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
