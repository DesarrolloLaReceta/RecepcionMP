import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/HomePage";
import RecepcionPage from "../pages/RecepcionPage";
import CalidadPage from "../pages/CalidadPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home / Dashboard */}
        <Route path="/" element={<HomePage />} />

        {/* Recepción de Materia Prima */}
        <Route path="/recepcion" element={<RecepcionPage />} />

        {/* Calidad */}
        <Route path="/calidad" element={<CalidadPage />} />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
