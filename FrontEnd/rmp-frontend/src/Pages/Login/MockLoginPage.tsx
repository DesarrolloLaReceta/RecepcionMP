import { useNavigate } from "react-router-dom";
import { AD_GROUPS } from "../../Auth/adGroups";
import { Badge, type BadgeColor } from "../../Components/UI/Index";
import "./StylesLogin/MockLoginPage.css";

// ─── COLORES POR ROL ──────────────────────────────────────────────────────────

const ROLE_TO_BADGE_COLOR: Record<string, BadgeColor> = {
  [AD_GROUPS.ADMINISTRATIVO]: "red",
  [AD_GROUPS.CALIDAD]: "blue",
  [AD_GROUPS.RECIBO]: "green",
};

// Colores para el avatar (cuando el rol no está mapeado)
const FALLBACK_AVATAR_COLOR = {
  bg: "rgba(255,255,255,0.05)",
  text: "#94A3B8",
};

interface MockUser {
  id: string;
  displayName: string;
  email: string;
  initials: string;
  roles: string[];
}

const MOCK_USERS: MockUser[] = [
  {
    id: "u-admin",
    displayName: "Usuario Administrativo",
    email: "administrativo@empresa.local",
    initials: "UA",
    roles: [AD_GROUPS.ADMINISTRATIVO],
  },
  {
    id: "u-calidad",
    displayName: "Inspector Calidad",
    email: "calidad@empresa.local",
    initials: "IC",
    roles: [AD_GROUPS.CALIDAD],
  },
  {
    id: "u-recibo",
    displayName: "Operador Recibo",
    email: "recibo@empresa.local",
    initials: "OR",
    roles: [AD_GROUPS.RECIBO],
  },
];

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
      case AD_GROUPS.ADMINISTRATIVO:
        return { bg: "rgba(239,68,68,0.1)", text: "#FCA5A5" };
      case AD_GROUPS.CALIDAD:
        return { bg: "rgba(59,130,246,0.1)", text: "#93C5FD" };
      case AD_GROUPS.RECIBO:
        return { bg: "rgba(34,197,94,0.1)", text: "#86EFAC" };
      default:
        return FALLBACK_AVATAR_COLOR;
    }
  })();

  // Label para mostrar en el Badge y ARIA label
  const roleLabel = (() => {
    switch(role) {
      case AD_GROUPS.ADMINISTRATIVO: return "Administrativo";
      case AD_GROUPS.CALIDAD: return "Calidad";
      case AD_GROUPS.RECIBO: return "Recibo";
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
  const navigate        = useNavigate();

  const handleSelect = (user: MockUser) => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify({ nombre: user.displayName, grupos: user.roles }));
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