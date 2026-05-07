import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./Auth/AuthContext";
import { AD_GROUPS } from "./Auth/adGroups";
import { ROUTES } from "./Constants/routes";
import { AppShell } from "./Components/Layout/AppShell";
import { ProtectedRoute } from "./Components/ProtectedRoute";

// ── Lazy pages ───────────────────────────────────────────────────────────────
const LoginPage         = lazy(() => import("./Pages/Login/LoginPage"));
const DashboardPage     = lazy(() => import("./Pages/Dashboard/DashboardPage"));
const RecepcionesPage   = lazy(() => import("./Pages/Recepciones/RecepcionesPage"));
const NuevaRecepcionPage = lazy(() => import("./Pages/Recepciones/NuevaRecepcionPage"));
const DetalleRecepcionPage = lazy(() => import("./Pages/Recepciones/DetalleRecepcionPage"));
const LiberacionPage    = lazy(() => import("./Pages/Liberacion/LiberacionLotesPage"));
const CalidadDashboard = lazy(() => import('./Pages/Calidad/CalidadDashboard'));
const VerificacionInstalacionesPage = lazy(() => import("./Pages/Calidad/VerificacionInstalaciones"));
const LavadoBotasManosPage = lazy(() => import("./Pages/Calidad/LavadoBotasManosPage"));
const LiberacionCocinaPage = lazy(() => import("./Pages/Calidad/LiberacionCocinaPage"));
const NoConformPage     = lazy(() => import("./Pages/NoConformidades/NoConformidadesPage"));
const DetalleNoConformPage = lazy(() => import("./Pages/NoConformidades/DetalleNoConformidadPage"));
const ProveedoresPage   = lazy(() => import("./Pages/Maestros/ProveedoresPage"));
const ItemsPage         = lazy(() => import("./Pages/Maestros/ItemsPage"));
const ChecklistsPage    = lazy(() => import("./Pages/Maestros/ChecklistsPage"));
const OrdenesCompraPage = lazy(() => import("./Pages/OrdenesCompra/OrdenesCompraPage"));
const DetalleOCPage     = lazy(() => import("./Pages/OrdenesCompra/DetalleOCPage"));
const LotesPage         = lazy(() => import("./Pages/Lotes/LotesPage"));
const DetalleLotePage   = lazy(() => import("./Pages/Lotes/DetalleLotePage"));
const NotFoundPage      = lazy(() => import("./Pages/Errors/NotFoundPage"));
const SinAccesoPage     = lazy(() => import("./Pages/Errors/SinAccesoPage"));

// ── Indicador de carga ───────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        {/* Usamos la variable --brand-orange directamente */}
        <div className="w-8 h-8 border-2 border-[var(--brand-orange)] border-t-transparent rounded-full animate-spin" />
        {/* Cambiamos el verde #5c6652 por el naranja sutil o texto muted */}
        <p className="text-[var(--brand-orange)] opacity-80 text-xs font-medium" style={{ fontFamily: "var(--font-sans)" }}>
          Cargando módulo…
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const DASHBOARD_ROLES = [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.CALIDAD, AD_GROUPS.RECIBO];
  const CALIDAD_ADMIN_ROLES = [AD_GROUPS.CALIDAD, AD_GROUPS.ADMINISTRATIVO];

  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Página de login (única, sin mock) ── */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path="/sin-acceso" element={<SinAccesoPage />} />

          {/* ── Rutas protegidas: envueltas en AppShell ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>

              <Route element={<ProtectedRoute requiredRoles={DASHBOARD_ROLES} />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path={ROUTES.RECEPCIONES} element={<RecepcionesPage />} />
                <Route path={ROUTES.NUEVA_RECEPCION} element={<NuevaRecepcionPage />} />
                <Route path="/recepciones/:id" element={<DetalleRecepcionPage />} />
              </Route>

              {/* Lotes — acceso a todos los roles */}
              <Route path={ROUTES.LOTES}        element={<LotesPage />} />
              <Route path="/lotes/:id"          element={<DetalleLotePage />} />

              {/* Calidad + Admin */}
              <Route element={<ProtectedRoute requiredRoles={CALIDAD_ADMIN_ROLES} />}>
                <Route path={ROUTES.LIBERACION} element={<LiberacionPage />} />
                <Route path="/calidad" element={<CalidadDashboard />} />
                <Route path="/calidad/verificacion-instalaciones" element={<VerificacionInstalacionesPage />} />
                <Route path="/calidad/lavado-botas-manos" element={<LavadoBotasManosPage />} />
                <Route path={ROUTES.LIBERACION_COCINA} element={<LiberacionCocinaPage />} />
              </Route>

              {/* Calidad + Admin + Auditor */}
              <Route element={<ProtectedRoute requiredRoles={CALIDAD_ADMIN_ROLES} />}>
                <Route path={ROUTES.NO_CONFORMIDADES} element={<NoConformPage />} />
                <Route path="/no-conformidades/:id"   element={<DetalleNoConformPage />} />
                <Route path={ROUTES.ORDENES_COMPRA}   element={<OrdenesCompraPage />} />
                <Route path="/ordenes-compra/:id"     element={<DetalleOCPage />} />
              </Route>

              {/* Maestros: Admin + Compras */}
              <Route element={<ProtectedRoute requiredRoles={[AD_GROUPS.ADMINISTRATIVO]} />}>
                <Route path={ROUTES.PROVEEDORES} element={<ProveedoresPage />} />
              </Route>

              {/* Maestros: solo Admin */}
              <Route element={<ProtectedRoute requiredRoles={[AD_GROUPS.ADMINISTRATIVO]} />}>
                <Route path={ROUTES.ITEMS}      element={<ItemsPage />} />
                <Route path={ROUTES.CHECKLISTS} element={<ChecklistsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}