import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../Constants/routes";
import { Button } from "../../Components/UI/Index";
import "./StylesErrors/Errors.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="ep-page">

      {/* Número 404 con ícono superpuesto */}
      <div className="ep-number-wrap">
        <p
          className="ep-number"
          style={{ WebkitTextStroke: "1px rgba(245,158,11,0.15)" }}
          aria-hidden="true"
        >
          404
        </p>
        <div className="ep-icon-overlay" aria-hidden="true">
          <div
            className="ep-icon-box"
            style={{
              background: "rgba(245,158,11,0.10)",
              border:     "1px solid rgba(245,158,11,0.20)",
            }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="#F59E0B"
              strokeWidth="1.5" strokeLinecap="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Texto */}
      <div className="ep-heading">
        <h1 className="ep-title">Página no encontrada</h1>
        <p className="ep-subtitle">
          La ruta que intentas acceder no existe o fue movida.
          Verifica la URL o regresa al inicio del sistema.
        </p>
        <p className="ep-code">ERROR 404 · RUTA NO REGISTRADA</p>
      </div>

      {/* Acciones */}
      <div className="ep-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          iconLeft="M15 18l-6-6 6-6"
        >
          Volver
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(ROUTES.DASHBOARD)}
          iconLeft="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"
        >
          Ir al Dashboard
        </Button>
      </div>

    </div>
  );
}