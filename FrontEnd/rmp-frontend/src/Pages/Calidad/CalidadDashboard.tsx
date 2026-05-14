import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../Constants/routes";
import { Badge, Skeleton } from "../../Components/UI/Index";
import { calidadService, type DashboardCalidadDto } from "../../Services/calidad.service";
import "../Dashboard/DashboardPage.css";
import "./StylesCalidad/CalidadDashboard.css";

// ─── Sub-componentes (misma API visual que DashboardPage) ─────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent = false,
  delay = 0,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="db-kpi-card"
      data-accent={accent || undefined}
      style={{ animationDelay: `${delay}ms` }}
    >
      {accent && <div className="db-kpi-accent-line" aria-hidden="true" />}
      <p className="db-kpi-label">{label}</p>
      <p className="db-kpi-value" data-accent={accent || undefined}>
        {value}
      </p>
      {sub && <p className="db-kpi-sub">{sub}</p>}
    </div>
  );
}

function Panel({
  title,
  count,
  children,
  onMore,
  moreLabel = "Ver todo →",
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  onMore?: () => void;
  moreLabel?: string;
}) {
  return (
    <div className="db-panel">
      <div className="db-panel-header">
        <div className="db-panel-title-wrap">
          <span className="db-panel-title">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge color="red" size="sm">
              {count}
            </Badge>
          )}
        </div>
        {onMore && (
          <button type="button" className="db-panel-more" onClick={onMore}>
            {moreLabel}
          </button>
        )}
      </div>
      <div className="db-panel-body">{children}</div>
    </div>
  );
}

function Row({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="db-row"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CalidadDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardCalidadDto | null>(null);
  const [loading, setLoading] = useState(true);

  const cards = [
    {
      title: "Verificación de Instalaciones",
      subtitle: "CAL-FORMU-139-01",
      description: "Inspección de infraestructura, aseo y áreas de planta.",
      icon: "🏢",
      path: "/calidad/verificacion-instalaciones",
      tone: "orange" as const,
      alDia: true,
    },
    {
      title: "Lavado de Botas y Manos",
      subtitle: "CAL-FORMU-143-01",
      description: "Control de ingreso de personal y cumplimiento de BPM.",
      icon: "🧼",
      path: "/calidad/lavado-botas-manos",
      tone: "nav" as const,
      alDia: true,
    },
    {
      title: "Liberación de Cocina",
      subtitle: "CAL-FORMU-145-01",
      description:
        "Inspección diaria de áreas de preparación, equipos y personal.",
      icon: "🍳",
      path: ROUTES.LIBERACION_COCINA || "/calidad/liberacion-cocina",
      tone: "accent" as const,
      alDia: true,
    },
    {
      title: "Próximos Formularios",
      subtitle: "Calidad La Receta",
      description: "Nuevos módulos de auditoría en desarrollo.",
      icon: "📝",
      path: "#",
      tone: "muted" as const,
      disabled: true,
      alDia: false,
    },
  ];

  useEffect(() => {
    let active = true;
    setLoading(true);

    calidadService
      .getDashboardStats()
      .then((res) => {
        if (!active) return;
        setStats(res);
      })
      .catch(() => {
        if (!active) return;
        setStats(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const inspeccionesHoy = stats?.inspeccionesHoy ?? 0;
  const alertasCriticas = stats?.alertasCriticas ?? 0;
  const turnosPendientes = stats?.turnosPendientes ?? 0;
  const porcentajeCumplimiento = stats?.porcentajeCumplimiento ?? 0;
  const porcentajeTexto = `${porcentajeCumplimiento.toFixed(1)}%`;

  return (
    <div className="db-page dashboard-calidad-page">
      <header className="calidad-db-header">
        <span className="calidad-db-breadcrumb">Calidad / Gestión</span>
        <h1 className="calidad-db-title">Panel de Control Calidad</h1>
        <p className="calidad-db-sub">
          Selecciona el proceso que deseas inspeccionar hoy
        </p>
      </header>

      <section>
        <p className="db-section-label">Indicadores del día</p>
        <div className="db-kpi-grid cal-kpi-grid--4">
          <KpiCard
            label="Inspecciones Hoy"
            value={inspeccionesHoy}
            sub="realizadas"
            accent
            delay={0}
          />
          <KpiCard
            label="Cumplimiento"
            value={porcentajeTexto}
            sub="promedio general"
            delay={50}
          />
          <KpiCard
            label="Alertas Críticas"
            value={alertasCriticas}
            sub="hallazgos abiertos"
            delay={100}
          />
          <KpiCard
            label="Turnos Pendientes"
            value={turnosPendientes}
            sub="turno actual"
            delay={150}
          />
        </div>
      </section>

      <div
        className="cal-panel-section"
        style={{ animation: "fadeSlideUp 0.4s ease 0.15s both" }}
      >
        <Panel
          title="Historial Reciente de Novedades"
          count={stats?.historialNovedades?.length ?? 0}
          onMore={() => navigate(ROUTES.HISTORIAL_CALIDAD)}
          moreLabel="Ver Historial →"
        >
          {loading ? (
            <div style={{ padding: "0 1.25rem" }}>
              <Skeleton rows={3} variant="list" />
            </div>
          ) : (
            stats?.historialNovedades?.map((n) => (
              <Row key={`${n.tipoFormulario}-${n.titulo}-${n.fecha}`}>
                <span className="db-entity-badge">{n.tipoFormulario}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="db-row-name">{n.titulo}</p>
                  <p className="db-row-sub">{formatDate(n.fecha)}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="db-row-name cal-row-resp">{n.responsable}</p>
                  <p className="db-row-sub">Responsable</p>
                </div>
              </Row>
            ))
          )}
        </Panel>
      </div>

      <section>
        <p className="db-section-label">Formularios de calidad</p>
        <div className="cards-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card-item ${card.disabled ? "disabled" : ""}`}
              onClick={() => !card.disabled && navigate(card.path)}
            >
              {card.alDia && (
                <div className="cal-card-badge-wrap">
                  <Badge
                    color="green"
                    size="sm"
                    icon="M20 6L9 17l-5-5"
                    radius="md"
                  >
                    Al día
                  </Badge>
                </div>
              )}
              <div
                className={`card-icon-container card-icon-container--${card.tone}`}
              >
                <span className="card-emoji">{card.icon}</span>
              </div>
              <div className="card-info">
                <span className="card-subtitle">{card.subtitle}</span>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
              {!card.disabled && <div className="card-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CalidadDashboard;
