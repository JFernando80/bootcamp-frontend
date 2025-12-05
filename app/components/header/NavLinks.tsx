import React from "react";

type Props = {
  ready: boolean;
  isAuthenticated: boolean;
  onNavigate?: () => void;
  layout?: "desktop" | "mobile";
};

export function NavLinks({
  ready,
  isAuthenticated,
  onNavigate,
  layout = "desktop",
}: Props) {
  const itemClass =
    layout === "desktop" ? "hover:text-green-700" : "py-1 hover:text-green-700";
  const listClass =
    layout === "desktop"
      ? "flex gap-6 lg:gap-14 text-sm"
      : "flex flex-col gap-3 text-sm";

  return (
    <ul className={listClass}>
      <li>
        <a href="/" className={itemClass} onClick={onNavigate}>
          Cursos
        </a>
      </li>
      <li>
        <a href="/about" className={itemClass} onClick={onNavigate}>
          Sobre
        </a>
      </li>
      {isAuthenticated ? (
        <li>
          <a href="/myArea" className={itemClass} onClick={onNavigate}>
            Minha Área
          </a>
        </li>
      ) : (
        <li className={layout === "desktop" ? "relative group" : "relative"}>
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
          {layout === "desktop" ? (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block group-focus-within:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              Faça login para acessar
            </div>
          ) : (
            <div className="mt-2 bg-black text-white text-xs rounded px-2 py-1 inline-block">
              Faça login para acessar
            </div>
          )}
        </li>
      )}
    </ul>
  );
}
