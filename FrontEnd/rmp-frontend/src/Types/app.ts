import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, SinAccesoPage } from "../Components/ProtectedRoute";
import LoginPage from "../Pages/Login/LoginPage";
import { AppRoles } from "../Auth/msalConfig";

// ── Lazy imports para los módulos que se crearán a futuro ────────────────────
// import { lazy, Suspense } from "react";
// const Dashboard        = lazy(() => import("./pages/Dashboard"));
// const Recepciones      = lazy(() => import("./pages/Recepciones"));
// const LiberacionLotes  = lazy(() => import("./pages/LiberacionLotes"));
// const Proveedores      = lazy(() => import("./pages/Proveedores"));
// const Items            = lazy(() => import("./pages/Items"));
// const NoConformidades  = lazy(() => import("./pages/NoConformidades"));

// Placeholder temporal
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center font-mono">
      <div className="text-center">
        <p className="text-[#F59E0B] text-xs tracking-widest uppercase mb-2">En construcción</p>
        <h1 className="text-white text-2xl font-bold">{title}</h1>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Pública ── */}
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />

      {/* ── Autenticado (cualquier rol) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/"             element={<ComingSoon title="Dashboard" />} />
        <Route path="/recepciones"  element={<ComingSoon title="Recepciones" />} />
      </Route>

      {/* ── Solo Calidad + Admin pueden liberar lotes ── */}
      <Route element={<ProtectedRoute requiredRoles={[AppRoles.Calidad, AppRoles.Administrador]} />}>
        <Route path="/liberacion"   element={<ComingSoon title="Liberación de Lotes" />} />
      </Route>

      {/* ── Solo Administrador ── */}
      <Route element={<ProtectedRoute requiredRoles={AppRoles.Administrador} />}>
        <Route path="/maestros/proveedores" element={<ComingSoon title="Proveedores" />} />
        <Route path="/maestros/items"       element={<ComingSoon title="Ítems" />} />
        <Route path="/maestros/checklists"  element={<ComingSoon title="Checklists BPM" />} />
      </Route>

      {/* ── Auditor + Admin pueden ver no conformidades ── */}
      <Route element={<ProtectedRoute requiredRoles={[AppRoles.Auditor, AppRoles.Administrador, AppRoles.Calidad]} />}>
        <Route path="/no-conformidades" element={<ComingSoon title="No Conformidades" />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}