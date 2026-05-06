import { useEffect, useState } from "react";
import { apiClient } from "../../Services/apiClient";
import { Spinner } from "../../Components/UI/Index";
import "./StylesLogin/LoginPage.css";

// ─── ÍCONOS SVG ───────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/api/auth/login", {
        username: username.trim(),
        password,
      });
      const { token, nombre, grupos } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ nombre, grupos: grupos ?? [] }));
      
      // Forzar recarga completa para que el contexto se reinicie con los nuevos datos
      window.location.href = "/";
    } catch (err: any) {
      const msg = err.response?.data?.title || err.response?.data?.detail || "Credenciales inválidas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page">
      <div className="lp-grid-bg" aria-hidden="true" />
      <div className="lp-light-accent" aria-hidden="true" />

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

      <main className="lp-main">
        <div
          className="lp-content"
          style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="lp-card">
            <div className="lp-card-accent-line" aria-hidden="true" />
            <div className="lp-shield-wrap">
              <div className="lp-shield-icon">
                <ShieldIcon />
              </div>
            </div>

            <div className="lp-card-heading">
              <h1 className="lp-card-title">Acceso al Sistema</h1>
              <p className="lp-card-subtitle">
                Ingresa tus credenciales corporativas (usuario y contraseña)
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="lp-input-group">
                <div className="lp-input-icon">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="lp-input"
                  disabled={loading}
                />
              </div>

              <div className="lp-input-group">
                <div className="lp-input-icon">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="lp-input"
                  disabled={loading}
                />
              </div>

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

              <button
                type="submit"
                className="lp-ms-btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Validando credenciales…
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </div>

          <p className="lp-note">
            ¿Problemas para acceder? Contacta al administrador del sistema
            <br />o al equipo de TI corporativo.
          </p>
        </div>
      </main>

      <footer className="lp-footer">
        <p className="lp-footer-text">CUMPLIMIENTO RES. 2674/2013 — INVIMA</p>
        <p className="lp-footer-text">v1.0.0</p>
      </footer>
    </div>
  );
}