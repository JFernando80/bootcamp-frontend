import React from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  controlsId?: string;
};

export function MobileToggle({
  open,
  onToggle,
  controlsId = "primary-navigation",
}: Props) {
  return (
    <button
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      aria-controls={controlsId}
      className="md:hidden inline-flex items-center justify-center rounded-md p-2 border border-gray-300 hover:bg-gray-100"
      onClick={onToggle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        {open ? (
          <path
            fillRule="evenodd"
            d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </button>
  );
}
