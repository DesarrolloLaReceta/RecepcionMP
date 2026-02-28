import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="h-screen overflow-hidden" style={{ background: "var(--bg-app)" }}>

      {/* ── Header fijo — siempre visible encima de todo ── */}
      <Header onToggleSidebar={toggle} sidebarOpen={open} />

      {/* ── Área bajo el header ── */}
      <div
        className="flex relative"
        style={{ height: "calc(100vh - var(--header-height))", marginTop: "var(--header-height)" }}
      >
        {/* ── Sidebar drawer ── */}
        <Sidebar open={open} onClose={close} />

        {/* ── Backdrop móvil ── */}
        {open && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: "var(--bg-overlay)", top: "var(--header-height)" }}
            onClick={close}
          />
        )}

        {/* ── Contenido principal — se desplaza junto al sidebar ── */}
        <main
          className="flex-1 overflow-y-auto min-w-0 transition-all duration-300 ease-out"
          style={{ background: "var(--bg-app)" }}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}