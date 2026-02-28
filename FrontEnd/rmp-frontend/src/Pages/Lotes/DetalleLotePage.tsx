import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { lotesService, type LotePendiente } from "../../Services/lotes.service";
import { EstadoSensorialLabels, EstadoRotuladoLabels } from "../../Types/api";
import { ROUTES } from "../../Constants/routes";
import { StatusBadge } from "../../Components/UI/StatusBadge";
import { Badge } from "../../Components/UI/Badge";
import { Spinner } from "../../Components/UI/Spinner";
import { Card, CardHeader, CardSection } from "../../Components/UI/Card";
import {
  formatDate, formatDateTime, formatTemp, formatTempRange,
  formatQuantity, vencimientoColor,
} from "../../Utils/formatters";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_LOTE_DETALLE: LotePendiente = {
    id: "lote-001", numeroLoteInterno: "L-2026-0048-01", numeroLoteProveedor: "AVL-20260201",
    itemId: "i1", itemNombre: "Pechuga de pollo", itemCodigo: "CAR-001",
    categoriaNombre: "Cárnicos", proveedorNombre: "AviCol S.A.",
    recepcionId: "rec-001", numeroRecepcion: "REC-2026-0048",
    fechaRecepcion: "2026-02-24T09:15:00", fechaFabricacion: "2026-02-01",
    fechaVencimiento: "2026-03-01", diasParaVencer: 3,
    cantidadRecibida: 498, cantidadEsperada: 500, unidadMedida: "Kg",
    temperaturaMedida: 3.5, temperaturaMinima: 0, temperaturaMaxima: 4,
    estadoSensorial: 0, estadoRotulado: 0, ubicacionDestino: 0,
    estado: "PendienteCalidad", tieneDocumentosFaltantes: false, documentosFaltantes: [],
    observacionesRecepcion: "Llegó 10 min antes. Vehículo en buenas condiciones. Sin novedades en el sello del termoking.",
    requiereCadenaFrio: false
};

// ─── ITEM DETALLE ─────────────────────────────────────────────────────────────

function ItemDetalle({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-mono uppercase tracking-wider text-[#334155]">{label}</p>
      <p className={`text-[12px] text-[#CBD5E1] ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-[#334155]">—</span>}
      </p>
    </div>
  );
}

// ─── DETALLE LOTE PAGE ────────────────────────────────────────────────────────

export default function DetalleLotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lote,    setLote]    = useState<LotePendiente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (isMock) {
          await new Promise(r => setTimeout(r, 400));
          setLote(MOCK_LOTE_DETALLE);
        } else {
          // Cuando el backend exponga getById, usar: await lotesService.getById(id)
          // Por ahora reutilizamos getPendientes y buscamos por id
          const lotes = await lotesService.getPendientes();
          const found = lotes.find(l => l.id === id);
          if (!found) throw new Error("not_found");
          setLote(found);
        }
      } catch {
        setError("No se pudo cargar el detalle del lote.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return <Spinner size="lg" centered label="Cargando lote…" />;
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !lote) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
        </div>
        <p className="text-[#FCA5A5] text-sm font-medium">{error ?? "Lote no encontrado"}</p>
        <button onClick={() => navigate(ROUTES.LOTES)}
          className="text-[11px] font-mono text-[#475569] hover:text-[#94A3B8] transition-colors">
          ← Volver a lotes
        </button>
      </div>
    );
  }

  const urgencia = vencimientoColor(lote.diasParaVencer);
  const tempFuera =
    lote.temperaturaMedida !== undefined &&
    lote.temperaturaMinima !== undefined &&
    lote.temperaturaMaxima !== undefined &&
    (lote.temperaturaMedida < lote.temperaturaMinima ||
     lote.temperaturaMedida > lote.temperaturaMaxima);

  const variantCard = tempFuera || lote.tieneDocumentosFaltantes ? "warning" : "default";

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeSlideUp 0.3s ease both" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {/* Breadcrumb manual */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#334155]">
            <Link to={ROUTES.LOTES} className="hover:text-[#64748B] transition-colors">Lotes</Link>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            <span className="text-[#475569]">{lote.numeroLoteInterno}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-white font-mono">{lote.numeroLoteInterno}</h1>
            <StatusBadge domain="lote" value={lote.estado} />
            {lote.tieneDocumentosFaltantes && (
              <Badge color="red" size="xs" icon="M12 9v4M12 17h.01 M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0">
                Docs incompletos
              </Badge>
            )}
            {tempFuera && (
              <Badge color="red" size="xs">T° fuera de rango</Badge>
            )}
          </div>

          <p className="text-[13px] text-[#94A3B8]">
            {lote.itemNombre} · <span className="text-[#64748B]">{lote.itemCodigo}</span>
          </p>
        </div>

        {/* Acción: ir a la liberación si está pendiente */}
        {lote.estado === "PendienteCalidad" && (
          <button
            onClick={() => navigate(ROUTES.LIBERACION)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold shrink-0 transition-all"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.15)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 004.438 0 3.42 3.42 0 013.138 3.138 3.42 3.42 0 004.438 0 3.42 3.42 0 010 4.438 3.42 3.42 0 010 4.438 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 01-4.438 0 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 010-4.438 3.42 3.42 0 010-4.438 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Ir a liberación
          </button>
        )}
      </div>

      {/* ── Layout principal ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-4">

          {/* Info del lote */}
          <Card>
            <CardHeader
              title="Información del lote"
              icon="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
              iconColor="#F59E0B"
            />
            <CardSection>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <ItemDetalle label="N° Lote interno"    value={lote.numeroLoteInterno}           mono />
                <ItemDetalle label="N° Lote proveedor"  value={lote.numeroLoteProveedor}         mono />
                <ItemDetalle label="Fecha fabricación"  value={formatDate(lote.fechaFabricacion)} />
                <ItemDetalle label="Fecha recepción"    value={formatDate(lote.fechaRecepcion)}   />
                <div className="col-span-2">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#334155] mb-0.5">Vencimiento</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#CBD5E1]">{formatDate(lote.fechaVencimiento)}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: urgencia.dot }} />
                    <span className="text-[11px] font-mono" style={{ color: urgencia.text }}>
                      {lote.diasParaVencer < 0
                        ? `Vencido hace ${Math.abs(lote.diasParaVencer)}d`
                        : `${lote.diasParaVencer} días restantes`}
                    </span>
                  </div>
                </div>
                <ItemDetalle
                  label="Cantidad recibida"
                  value={formatQuantity(lote.cantidadRecibida, lote.unidadMedida)}
                  mono
                />
                <ItemDetalle
                  label="Cantidad esperada"
                  value={formatQuantity(lote.cantidadEsperada, lote.unidadMedida)}
                  mono
                />
              </div>
            </CardSection>
          </Card>

          {/* Recepción */}
          <Card variant="inset">
            <CardHeader
              title="Recepción origen"
              icon="M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
              iconColor="#93C5FD"
            />
            <CardSection>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <ItemDetalle label="N° Recepción" value={
                  <Link to={`/recepciones/${lote.recepcionId}`}
                    className="font-mono hover:text-[#F59E0B] transition-colors" style={{ color: "#93C5FD" }}>
                    {lote.numeroRecepcion}
                  </Link>
                } />
                <ItemDetalle label="Fecha"        value={formatDate(lote.fechaRecepcion)} />
                <ItemDetalle label="Proveedor"    value={lote.proveedorNombre} />
                <ItemDetalle label="Categoría"    value={lote.categoriaNombre} />
              </div>
            </CardSection>
          </Card>
        </div>

        {/* Columna derecha (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Inspección de calidad */}
          <Card variant={variantCard}>
            <CardHeader
              title="Inspección de calidad"
              icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 004.438 0 3.42 3.42 0 013.138 3.138 3.42 3.42 0 004.438 0 3.42 3.42 0 010 4.438 3.42 3.42 0 010 4.438 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 01-4.438 0 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 010-4.438 3.42 3.42 0 010-4.438 3.42 3.42 0 013.138-3.138z"
              iconColor={variantCard === "warning" ? "#FCD34D" : "#86EFAC"}
            />
            <CardSection>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Temperatura */}
                <div className="col-span-2 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${tempFuera ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#334155] mb-2">Cadena de frío</p>
                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-[10px] text-[#475569] mb-0.5">Medida</p>
                      <p className="text-xl font-mono font-bold" style={{ color: tempFuera ? "#FCA5A5" : "#86EFAC" }}>
                        {formatTemp(lote.temperaturaMedida)}
                      </p>
                    </div>
                    <div className="pb-1">
                      <p className="text-[10px] text-[#334155] font-mono">
                        Rango: {formatTempRange(lote.temperaturaMinima, lote.temperaturaMaxima)}
                      </p>
                      {tempFuera && (
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#FCA5A5" }}>
                          ⚠ Fuera del rango aceptable
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado sensorial */}
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#334155] mb-1">Estado sensorial</p>
                  <Badge
                    color={lote.estadoSensorial === 0 ? "green" : lote.estadoSensorial === 1 ? "yellow" : "red"}
                    size="xs"
                  >
                    {EstadoSensorialLabels[lote.estadoSensorial as 0 | 1 | 2] ?? lote.estadoSensorial}
                  </Badge>
                </div>

                {/* Estado rotulado */}
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#334155] mb-1">Rotulado</p>
                  <Badge
                    color={lote.estadoRotulado === 0 ? "green" : lote.estadoRotulado === 1 ? "yellow" : "red"}
                    size="xs"
                  >
                    {EstadoRotuladoLabels[lote.estadoRotulado as 0 | 1 | 2] ?? lote.estadoRotulado}
                  </Badge>
                </div>
              </div>
            </CardSection>
          </Card>

          {/* Documentos */}
          <Card variant={lote.tieneDocumentosFaltantes ? "danger" : "default"}>
            <CardHeader
              title="Documentos"
              icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              iconColor={lote.tieneDocumentosFaltantes ? "#FCA5A5" : "#F59E0B"}
              actions={
                lote.tieneDocumentosFaltantes
                  ? <Badge color="red" dot size="xs">{lote.documentosFaltantes.length} faltante{lote.documentosFaltantes.length > 1 ? "s" : ""}</Badge>
                  : <Badge color="green" dot size="xs">Completo</Badge>
              }
            />
            <CardSection>
              {lote.tieneDocumentosFaltantes ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-[#64748B]">Documentos requeridos faltantes:</p>
                  {lote.documentosFaltantes.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      <span className="text-[11px]" style={{ color: "#FCA5A5" }}>{doc}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#475569]">
                  Todos los documentos requeridos para esta categoría están adjuntos y verificados.
                </p>
              )}
            </CardSection>
          </Card>

          {/* Observaciones */}
          {lote.observacionesRecepcion && (
            <Card variant="inset">
              <CardHeader
                title="Observaciones de recepción"
                icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                iconColor="#64748B"
              />
              <CardSection>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                  {lote.observacionesRecepcion}
                </p>
                <p className="text-[10px] text-[#334155] font-mono mt-3">
                  Registrado: {formatDateTime(lote.fechaRecepcion)}
                </p>
              </CardSection>
            </Card>
          )}
        </div>
      </div>

      {/* ── Botón volver ─────────────────────────────────────────────────────── */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate(ROUTES.LOTES)}
          className="flex items-center gap-2 text-[11px] font-mono text-[#475569] hover:text-[#94A3B8] transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver a lotes
        </button>
      </div>
    </div>
  );
}