import { useNavigate } from "react-router-dom";
import { MOCK_USERS, type MockUser, useMockAuth } from "../../Auth/mockAuth";
import { AppRoles } from "../../Auth/msalConfig";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  [AppRoles.Administrador]: { bg: "rgba(239,68,68,0.1)",  text: "#FCA5A5", label: "Administrador" },
  [AppRoles.Calidad]:       { bg: "rgba(59,130,246,0.1)", text: "#93C5FD", label: "Calidad"        },
  [AppRoles.Recepcion]:     { bg: "rgba(34,197,94,0.1)",  text: "#86EFAC", label: "Recepción"      },
  [AppRoles.Compras]:       { bg: "rgba(168,85,247,0.1)", text: "#C4B5FD", label: "Compras"        },
  [AppRoles.Auditor]:       { bg: "rgba(245,158,11,0.1)", text: "#FCD34D", label: "Auditor"        },
};

function UserCard({ user, onSelect }: { user: MockUser; onSelect: (u: MockUser) => void }) {
  const role  = user.roles[0];
  const color = ROLE_COLORS[role] ?? { bg: "rgba(255,255,255,0.05)", text: "#94A3B8", label: role };

  return (
    <button onClick={() => onSelect(user)} className="w-full text-left group transition-all duration-200">
      <div
        className="rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
        style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.3)";
          (e.currentTarget as HTMLElement).style.background  = "rgba(245,158,11,0.04)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLElement).style.background  = "rgba(15,23,42,0.6)";
        }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: color.bg, color: color.text }}
        >
          {user.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{user.displayName}</p>
          <p className="text-[#475569] text-xs truncate font-mono">{user.email}</p>
        </div>

        {/* Rol */}
        <span
          className="text-[10px] px-2 py-1 rounded-md font-semibold shrink-0"
          style={{ background: color.bg, color: color.text }}
        >
          {color.label}
        </span>

        {/* Flecha */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#475569" strokeWidth="2"
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

export default function MockLoginPage() {
  const { setMockUser } = useMockAuth();
  const navigate = useNavigate();

  const handleSelect = (user: MockUser) => {
    setMockUser(user);
    navigate("/", { replace: true });
  };

  return (
    <div
      className="min-h-screen bg-[#0A0F1A] flex flex-col items-center justify-center p-4"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Fondo grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Badge DEV */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(239,68,68,0.1)",
              border:     "1px solid rgba(239,68,68,0.2)",
              color:      "#FCA5A5",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            MODO DESARROLLO — Mock Auth
          </div>
        </div>

        {/* Tarjeta */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:    "rgba(15,23,42,0.85)",
            border:        "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            boxShadow:     "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h1 className="text-white font-bold text-lg tracking-tight">
              Selecciona un usuario de prueba
            </h1>
            <p className="text-[#475569] text-xs mt-1">
              Cada usuario tiene permisos distintos según su rol en el sistema.
            </p>
          </div>

          {/* Lista */}
          <div className="p-4 flex flex-col gap-2">
            {MOCK_USERS.map(user => (
              <UserCard key={user.id} user={user} onSelect={handleSelect} />
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4"
            style={{
              borderTop:  "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <p className="text-[#334155] text-[10px] leading-relaxed">
              ⚠️ Esta pantalla solo aparece cuando{" "}
              <code className="text-[#F59E0B]/60">VITE_USE_MOCK_AUTH=true</code>.
              En producción se usa Microsoft Entra ID (SSO).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}