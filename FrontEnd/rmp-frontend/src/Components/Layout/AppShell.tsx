import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header }  from "./Header";
import "./StylesLayout/Layout.css";

const OPEN_KEY = "sidebar_open";

export function AppShell() {
  const [open, setOpen] = useState(() =>
    window.innerWidth >= 768
      ? localStorage.getItem(OPEN_KEY) !== "false"
      : false
  );

  const toggle = () =>
    setOpen(prev => {
      localStorage.setItem(OPEN_KEY, String(!prev));
      return !prev;
    });

  const close = () => setOpen(false);

  // Cierra el sidebar automáticamente al reducir la ventana a móvil
  useEffect(() => {
    const mq      = window.matchMedia("(max-width: 768px)");
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