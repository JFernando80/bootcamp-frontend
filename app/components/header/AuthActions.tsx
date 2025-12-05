import React from "react";

type Props = {
  ready: boolean;
  isAuthenticated: boolean;
  onLogout: () => void;
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AuthActions({
  ready,
  isAuthenticated,
  onLogout,
  layout = "desktop",
  onNavigate,
}: Props) {
  const wrapperClass =
    layout === "desktop"
      ? "flex gap-3 lg:gap-4 text-sm"
      : "mt-4 flex flex-col gap-2 text-sm";
  const linkCommon = "px-4 py-[6px] rounded-md transition";

  return (
    <nav className={wrapperClass}>
      {!isAuthenticated ? (
        <>
          <a
            href="/login"
            className={`border border-gray-300 hover:bg-gray-200 ${linkCommon} ${layout === "desktop" ? "text-left" : "text-center"}`}
            onClick={onNavigate}
          >
            Login
          </a>
          <a
            href="/register"
            className={`bg-green-600 text-white hover:bg-green-700 ${linkCommon} ${layout === "desktop" ? "text-left" : "text-center"}`}
            onClick={onNavigate}
          >
            Cadastro
          </a>
        </>
      ) : (
        <button
          onClick={onLogout}
          className={`border border-gray-300 hover:bg-gray-200 ${linkCommon}`}
        >
          Sair
        </button>
      )}
    </nav>
  );
}
