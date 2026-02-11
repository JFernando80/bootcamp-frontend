// Agora usamos contexto para evitar flicker
import React from "react";
import { useAuth } from "~/context/AuthProvider";
import { useNavigate } from "react-router";
import { MobileToggle } from "./MobileToggle";
import { NavLinks } from "./NavLinks";
import { AuthActions } from "./AuthActions";

function HeaderInner() {
  const { isAuthenticated, isAdmin, logout, ready } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const toggleMobile = React.useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <header className="text-black font-medium bg-white shadow-md sticky top-0 z-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileToggle open={mobileOpen} onToggle={toggleMobile} />
            <h1 className="text-base sm:text-lg md:text-xl">NGO Cursos</h1>
          </div>

          <nav id="primary-navigation" className="hidden md:block">
            <NavLinks
              ready={ready}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onNavigate={closeMobile}
              layout="desktop"
            />
          </nav>

          <div className="hidden md:block">
            <AuthActions
              ready={ready}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              layout="desktop"
              onNavigate={closeMobile}
            />
          </div>
        </div>

        <div
          className={`${mobileOpen ? "block" : "hidden"} md:hidden border-t border-gray-200 pb-4`}
        >
          <nav className="pt-3">
            <NavLinks
              ready={ready}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onNavigate={closeMobile}
              layout="mobile"
            />
          </nav>
          <AuthActions
            ready={ready}
            isAuthenticated={isAuthenticated}
            onLogout={() => {
              handleLogout();
              closeMobile();
            }}
            layout="mobile"
            onNavigate={closeMobile}
          />
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderInner);
