import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../Constants/routes";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 p-6"
      style={{ background: "#0A0F1A" }}
    >
      {/* Código de error */}
      <div className="relative select-none">
        <p
          className="text-[130px] font-black leading-none font-mono"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(245,158,11,0.15)",
            filter: "blur(0.5px)",
          }}
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mensaje */}
      <div className="text-center flex flex-col gap-2 max-w-md">
        <h1 className="text-xl font-bold text-white">Página no encontrada</h1>
        <p className="text-sm text-[#475569] leading-relaxed">
          La ruta que intentas acceder no existe o fue movida.
          Verifica la URL o regresa al inicio del sistema.
        </p>
        <p className="text-[10px] text-[#2D3748] font-mono mt-1">
          ERROR 404 · RUTA NO REGISTRADA
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748B",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.color = "#94A3B8";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "#64748B";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{
            background: "#F59E0B",
            border: "1px solid #F59E0B",
            color: "#000",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#D97706")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#F59E0B")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />
          </svg>
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}