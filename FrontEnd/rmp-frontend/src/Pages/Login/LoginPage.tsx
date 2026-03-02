import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { Spinner, Badge } from "../../Components/UI/Index";
import "./StylesPages/LoginPage.css";

// ─── ÍCONOS SVG ───────────────────────────────────────────────────────────────

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="48" height="48" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FactoryIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 20V10l6-6v6l6-6v6l6-3v13H2z" strokeLinejoin="round" />
      <rect x="6"  y="14" width="3" height="6" />
      <rect x="11" y="14" width="3" height="6" />
    </svg>
  );
}

// ─── PERFILES DE ACCESO ───────────────────────────────────────────────────────

const SYSTEM_ROLES = ["Recepción", "Calidad", "Compras", "Auditoría", "Admin"];

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

/**
 * Página de autenticación con Microsoft Entra ID (SSO).
 * Solo visible en modo producción — en dev se usa MockLoginPage.
 */
export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [signingIn, setSigningIn] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [mounted,   setMounted]   = useState(false);

  // Animación de entrada — delay mínimo para disparar la transición CSS
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Redirigir si ya está autenticado
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

  // ── Estado de carga inicial (verificando sesión MSAL) ──────────────────────
  if (isLoading) {
    return (
      <div className="lp-loading">
        <div className="lp-loading-inner">
          <Spinner size="lg" />
          <p className="lp-loading-text">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="lp-page">

      {/* Fondo grid decorativo */}
      <div className="lp-grid-bg" aria-hidden="true" />

      {/* Acento de luz superior */}
      <div className="lp-light-accent" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-header-brand">
          <div className="lp-header-logo-wrap">
            <FactoryIcon />
          </div>
          <div>
            <p className="lp-header-label">Sistema de Control</p>
            <p className="lp-header-title">Recepción Materia Prima</p>
          </div>
        </div>

        <div className="lp-header-status" aria-label="Estado del sistema: en línea">
          <div className="lp-status-dot" aria-hidden="true" />
          SISTEMA EN LÍNEA
        </div>
      </header>

      {/* ── Contenido central ── */}
      <main className="lp-main">
        <div
          className="lp-content"
          style={{
            transform:  mounted ? "translateY(0)" : "translateY(20px)",
            opacity:    mounted ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Tarjeta */}
          <div className="lp-card">

            {/* Línea de acento amber */}
            <div className="lp-card-accent-line" aria-hidden="true" />

            {/* Ícono escudo */}
            <div className="lp-shield-wrap">
              <div className="lp-shield-icon">
                <ShieldIcon />
              </div>
            </div>

            {/* Título */}
            <div className="lp-card-heading">
              <h1 className="lp-card-title">Acceso al Sistema</h1>
              <p className="lp-card-subtitle">
                Inicia sesión con tu cuenta corporativa para acceder
                a la plataforma de recepción de materia prima.
              </p>
            </div>

            {/* Disclaimer normativo */}
            <div className="lp-disclaimer">
              <div className="lp-disclaimer-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <p className="lp-disclaimer-text">
                Sistema regulado bajo{" "}
                <span className="lp-disclaimer-highlight">Res. 2674/2013</span>{" "}
                (BPM) e INVIMA. Todos los accesos quedan registrados
                en bitácora de auditoría.
              </p>
            </div>

            {/* Error de autenticación */}
            {error && (
              <div className="lp-error" role="alert">
                <div className="lp-error-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <p className="lp-error-text">{error}</p>
              </div>
            )}

            {/* Botón Microsoft */}
            <button
              className="lp-ms-btn"
              onClick={handleLogin}
              disabled={signingIn}
              data-signing={signingIn || undefined}
              aria-busy={signingIn}
            >
              {signingIn ? (
                <>
                  <Spinner size="sm" />
                  Conectando con Microsoft…
                </>
              ) : (
                <>
                  <MicrosoftIcon />
                  Iniciar sesión con Microsoft
                </>
              )}
            </button>

            {/* Perfiles de acceso */}
            <div className="lp-roles">
              <p className="lp-roles-label">Perfiles de acceso</p>
              <div className="lp-roles-list">
                {SYSTEM_ROLES.map(role => (
                  <Badge key={role} color="slate" size="sm">{role}</Badge>
                ))}
              </div>
            </div>

          </div>

          {/* Nota debajo de la tarjeta */}
          <p className="lp-note">
            ¿Problemas para acceder? Contacta al administrador del sistema
            <br />o al equipo de TI corporativo.
          </p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <p className="lp-footer-text">CUMPLIMIENTO RES. 2674/2013 — INVIMA</p>
        <p className="lp-footer-text">v1.0.0</p>
      </footer>

    </div>
  );
}