import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header }  from "./Header";
import "./StylesLayout/Layout.css";

const OPEN_KEY = "sidebar_open";

export function AppShell() {
  const [open, setOpen] = useState(() => {
    // En escritorio (>= 1024), respetamos el localStorage. En móvil, siempre inicia cerrado.
    if (window.innerWidth >= 1024) {
      return localStorage.getItem(OPEN_KEY) !== "false";
    }
    return false;
  });

  const toggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Evita que el clic "atraviese" hacia el backdrop
    
    setOpen(prev => {
      const newState = !prev;
      // Solo persistimos el estado si estamos en modo escritorio
      if (window.innerWidth >= 1024) {
        localStorage.setItem(OPEN_KEY, String(newState));
      }
      return newState;
    });
  };

  const close = () => setOpen(false);

  // Cierra el sidebar automáticamente al reducir la ventana a móvil
  useEffect(() => {
    const mq      = window.matchMedia("(max-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="app-shell">

      {/* Header fijo — siempre visible */}
      <Header onToggleSidebar={toggle} sidebarOpen={open} />

      {/* Área bajo el header */}
      <div className="app-body">

        {/* Sidebar drawer */}
        <Sidebar open={open} onClose={close} />

        {/* Backdrop móvil — solo visible cuando el sidebar está abierto en móvil */}
        {open && (
          <div
            className="app-backdrop"
            onClick={close}
            aria-hidden="true"
          />
        )}

        {/* Contenido principal */}
        <main className="app-main">
          <div className="app-main-inner">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}