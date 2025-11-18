import React, { useState } from "react";
import { useAuthStore } from "~/stores/authStore";
import { useNavigate } from "react-router";

export default function RegisterCard() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateRegisterRequest = async (body: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: string;
    acceptTerms: boolean;
  }) => {
    await new Promise((r) => setTimeout(r, 900));

    if (!body.fullName || !body.email || !body.password) {
      throw new Error("Preencha todos os campos obrigatórios");
    }

    if (body.password !== body.confirmPassword) {
      throw new Error("As senhas não coincidem");
    }

    if (!body.acceptTerms) {
      throw new Error("É necessário aceitar os termos");
    }

    return { token: btoa(body.email + ":" + Date.now()) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await simulateRegisterRequest({
        fullName,
        email,
        password,
        confirmPassword,
        userType,
        acceptTerms,
      });
      login(token);
      navigate("/myArea");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crie sua conta</h2>
          <p className="mt-2 text-gray-600">
            Comece sua jornada de aprendizado gratuito
          </p>
        </div>

        <div className="bg-white text-card-foreground flex flex-col gap-6 rounded-2xl py-6 shadow-md border border-gray-200">
          <div className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="fullName"
                >
                  Nome completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                  disabled={loading}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="userType"
                >
                  Tipo de usuário
                </label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-base text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  disabled={loading}
                >
                  <option value="student">Estudante</option>
                  <option value="ngo">Representante de ONG</option>
                  <option value="teacher">Professor</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Aceito os{" "}
                  <a href="#" className="text-green-600 hover:text-green-500">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-green-600 hover:text-green-500">
                    política de privacidade
                  </a>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all h-10 w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
              >
                {loading ? "Registrando..." : "Criar conta"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <a
                  href="/login"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Faça login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
