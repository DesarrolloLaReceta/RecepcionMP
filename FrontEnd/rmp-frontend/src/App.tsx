import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./Auth/AuthContext";
import { ROUTES } from "./Constants/routes";
import { AppShell } from "./Components/Layout/AppShell";
import { ProtectedRoute } from "./Components/ProtectedRoute";

// ── Definición local de roles (coincide con PerfilUsuario en backend) ────────────
const AppRoles = {
  Administrador: "Administrador",
  Calidad: "Calidad",
  Auditor: "Auditor",
  Compras: "Compras",
  RecepcionAlmacen: "RecepcionAlmacen",
} as const;

// ── Lazy pages ───────────────────────────────────────────────────────────────
const LoginPage         = lazy(() => import("./Pages/Login/LoginPage"));
const DashboardPage     = lazy(() => import("./Pages/Dashboard/DashboardPage"));
const RecepcionesPage   = lazy(() => import("./Pages/Recepciones/RecepcionesPage"));
const NuevaRecepcionPage = lazy(() => import("./Pages/Recepciones/NuevaRecepcionPage"));
const DetalleRecepcionPage = lazy(() => import("./Pages/Recepciones/DetalleRecepcionPage"));
const LiberacionPage    = lazy(() => import("./Pages/Liberacion/LiberacionLotesPage"));
const VerificacionInstalacionesPage = lazy(() => import("./Pages/Calidad/VerificacionInstalaciones"));
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
        <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#475569] text-xs font-mono">Cargando módulo…</p>
      </div>
    </div>
  );
}

export default function App() {
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

              {/* Acceso para todos los roles */}
              <Route path={ROUTES.DASHBOARD}    element={<DashboardPage />} />
              <Route path={ROUTES.RECEPCIONES}  element={<RecepcionesPage />} />
              <Route path={ROUTES.NUEVA_RECEPCION} element={<NuevaRecepcionPage />} />
              <Route path="/recepciones/:id"    element={<DetalleRecepcionPage />} />

              {/* Lotes — acceso a todos los roles */}
              <Route path={ROUTES.LOTES}        element={<LotesPage />} />
              <Route path="/lotes/:id"          element={<DetalleLotePage />} />

              {/* Calidad + Admin */}
              <Route element={<ProtectedRoute requiredRoles={[AppRoles.Calidad, AppRoles.Administrador]} />}>
                <Route path={ROUTES.LIBERACION} element={<LiberacionPage />} />
                <Route path={ROUTES.VERIFICACION_INSTALACIONES} element={<VerificacionInstalacionesPage />} />
              </Route>

              {/* Calidad + Admin + Auditor */}
              <Route element={<ProtectedRoute requiredRoles={[AppRoles.Calidad, AppRoles.Administrador, AppRoles.Auditor]} />}>
                <Route path={ROUTES.NO_CONFORMIDADES} element={<NoConformPage />} />
                <Route path="/no-conformidades/:id"   element={<DetalleNoConformPage />} />
                <Route path={ROUTES.ORDENES_COMPRA}   element={<OrdenesCompraPage />} />
                <Route path="/ordenes-compra/:id"     element={<DetalleOCPage />} />
              </Route>

              {/* Maestros: Admin + Compras */}
              <Route element={<ProtectedRoute requiredRoles={[AppRoles.Administrador, AppRoles.Compras]} />}>
                <Route path={ROUTES.PROVEEDORES} element={<ProveedoresPage />} />
              </Route>

              {/* Maestros: solo Admin */}
              <Route element={<ProtectedRoute requiredRoles={[AppRoles.Administrador]} />}>
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