import { useNavigate } from "react-router-dom";
import { MOCK_USERS, type MockUser, useMockAuth } from "../../Auth/mockAuth";
import { AppRoles } from "../../Auth/msalConfig";
import { Badge, type BadgeColor } from "../../Components/UI/Index";
import "./StylesPages/MockLoginPage.css";

// ─── COLORES POR ROL ──────────────────────────────────────────────────────────

const ROLE_TO_BADGE_COLOR: Record<string, BadgeColor> = {
  [AppRoles.Administrador]: "red",
  [AppRoles.Calidad]: "blue",
  [AppRoles.Recepcion]: "green",
  [AppRoles.Compras]: "purple",
  [AppRoles.Auditor]: "yellow",
};

// Colores para el avatar (cuando el rol no está mapeado)
const FALLBACK_AVATAR_COLOR = {
  bg: "rgba(255,255,255,0.05)",
  text: "#94A3B8",
};

// ─── USER CARD ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  onSelect,
}: {
  user:     MockUser;
  onSelect: (u: MockUser) => void;
}) {
  const role = user.roles[0];
  const badgeColor = ROLE_TO_BADGE_COLOR[role] ?? "slate";
  
  // Para el avatar, necesitamos colores específicos
  const avatarColors = (() => {
    // Si el rol está mapeado, usamos colores específicos para el avatar
    switch(role) {
      case AppRoles.Administrador:
        return { bg: "rgba(239,68,68,0.1)", text: "#FCA5A5" };
      case AppRoles.Calidad:
        return { bg: "rgba(59,130,246,0.1)", text: "#93C5FD" };
      case AppRoles.Recepcion:
        return { bg: "rgba(34,197,94,0.1)", text: "#86EFAC" };
      case AppRoles.Compras:
        return { bg: "rgba(168,85,247,0.1)", text: "#C4B5FD" };
      case AppRoles.Auditor:
        return { bg: "rgba(245,158,11,0.1)", text: "#FCD34D" };
      default:
        return FALLBACK_AVATAR_COLOR;
    }
  })();

  // Label para mostrar en el Badge y ARIA label
  const roleLabel = (() => {
    switch(role) {
      case AppRoles.Administrador: return "Administrador";
      case AppRoles.Calidad: return "Calidad";
      case AppRoles.Recepcion: return "Recepción";
      case AppRoles.Compras: return "Compras";
      case AppRoles.Auditor: return "Auditor";
      default: return role;
    }
  })();

  return (
    <button
      className="user-card"
      onClick={() => onSelect(user)}
      aria-label={`Iniciar sesión como ${user.displayName} — ${roleLabel}`}
    >
      <div className="user-card-inner">

        {/* Avatar con iniciales */}
        <div
          className="user-card-avatar"
          style={{ background: avatarColors.bg, color: avatarColors.text }}
          aria-hidden="true"
        >
          {user.initials}
        </div>

        {/* Nombre + email */}
        <div className="user-card-info">
          <p className="user-card-name">{user.displayName}</p>
          <p className="user-card-email">{user.email}</p>
        </div>

        {/* Badge de rol */}
        <Badge size="sm" color={badgeColor}>
          {roleLabel}
        </Badge>

        {/* Flecha */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className="user-card-arrow"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>

      </div>
    </button>
  );
}

// ─── MOCK LOGIN PAGE ──────────────────────────────────────────────────────────

export default function MockLoginPage() {
  const { setMockUser } = useMockAuth();
  const navigate        = useNavigate();

  const handleSelect = (user: MockUser) => {
    setMockUser(user);
    navigate("/", { replace: true });
  };

  return (
    <div className="ml-page">
      <div className="ml-grid-bg" aria-hidden="true" />
      <div className="ml-content">
        <div className="ml-dev-badge-wrap">
          <div className="ml-dev-badge">
            <div className="ml-dev-dot" aria-hidden="true" />
            MODO DESARROLLO — Mock Auth
          </div>
        </div>

        <div className="ml-card">
          <div className="ml-card-header">
            <h1 className="ml-card-title">
              Selecciona un usuario de prueba
            </h1>
            <p className="ml-card-subtitle">
              Cada usuario tiene permisos distintos según su rol en el sistema.
            </p>
          </div>

          <div className="ml-card-body">
            {MOCK_USERS.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}