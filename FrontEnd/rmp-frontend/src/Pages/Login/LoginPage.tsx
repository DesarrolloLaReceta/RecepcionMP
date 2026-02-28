import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";

// ─── ÍCONOS SVG INLINE ────────────────────────────────────────────────────────

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FactoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 20V10l6-6v6l6-6v6l6-3v13H2z" strokeLinejoin="round" />
      <rect x="6" y="14" width="3" height="6" />
      <rect x="11" y="14" width="3" height="6" />
    </svg>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await login();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (!msg.includes("user_cancelled")) {
        setError("No se pudo conectar con Microsoft. Verifica tu red e intenta nuevamente.");
      }
      setSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#94A3B8] text-sm font-mono">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1A] flex flex-col" style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>

      {/* — Fondo con grid industrial — */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* — Acento de luz superior — */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />

      {/* — Header — */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#F59E0B]/10 rounded border border-[#F59E0B]/20">
            <FactoryIcon />
          </div>
          <div>
            <p className="text-[10px] text-[#F59E0B] tracking-[0.3em] uppercase leading-none mb-0.5">
              Sistema de Control
            </p>
            <p className="text-white text-sm font-semibold tracking-wide leading-none">
              Recepción Materia Prima
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#475569] font-mono tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          SISTEMA EN LÍNEA
        </div>
      </header>

      {/* — Contenido central — */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div
          className="w-full max-w-sm"
          style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Tarjeta */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 0 1px rgba(245,158,11,0.05), 0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Línea de acento superior */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />

            {/* Ícono */}
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-xl text-[#F59E0B]"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <ShieldIcon />
              </div>
            </div>

            {/* Texto */}
            <div className="text-center mb-8">
              <h1 className="text-white text-xl font-bold tracking-tight mb-2">
                Acceso al Sistema
              </h1>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Inicia sesión con tu cuenta corporativa para acceder a la plataforma de recepción de materia prima.
              </p>
            </div>

            {/* Separador de info normativa */}
            <div
              className="rounded-lg px-4 py-3 mb-6 flex items-start gap-3"
              style={{
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.1)",
              }}
            >
              <div className="mt-0.5 text-[#F59E0B] shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed font-sans">
                Sistema regulado bajo <span className="text-[#F59E0B]">Res. 2674/2013</span> (BPM) e INVIMA. Todos los accesos quedan registrados en bitácora de auditoría.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 mb-4 flex items-start gap-3"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" className="mt-0.5 shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p className="text-[11px] text-red-300 leading-relaxed font-sans">{error}</p>
              </div>
            )}

            {/* Botón Microsoft */}
            <button
              onClick={handleLogin}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-5 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: signingIn
                  ? "rgba(245,158,11,0.15)"
                  : "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#F59E0B",
                boxShadow: signingIn ? "none" : "0 0 20px rgba(245,158,11,0.1)",
              }}
              onMouseEnter={(e) => {
                if (!signingIn) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.15) 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 30px rgba(245,158,11,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!signingIn) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px rgba(245,158,11,0.1)";
                }
              }}
            >
              {signingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
                  Conectando con Microsoft…
                </>
              ) : (
                <>
                  <MicrosoftIcon />
                  Iniciar sesión con Microsoft
                </>
              )}
            </button>

            {/* Roles del sistema */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-[10px] text-[#475569] text-center tracking-widest uppercase mb-3">
                Perfiles de acceso
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {["Recepción", "Calidad", "Compras", "Auditoría", "Admin"].map((role) => (
                  <span
                    key={role}
                    className="text-[10px] px-2 py-0.5 rounded font-mono"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#64748B",
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Nota debajo */}
          <p className="text-center text-[11px] text-[#334155] mt-5 leading-relaxed font-sans">
            ¿Problemas para acceder? Contacta al administrador del sistema
            <br />o al equipo de TI corporativo.
          </p>
        </div>
      </main>

      {/* — Footer — */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-4 border-t border-white/5">
        <p className="text-[10px] text-[#1E293B] font-mono tracking-widest">
          CUMPLIMIENTO RES. 2674/2013 — INVIMA
        </p>
        <p className="text-[10px] text-[#1E293B] font-mono">v1.0.0</p>
      </footer>
    </div>
  );
}