import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

// Pages (por ahora placeholders)
import RecepcionPage from "../../modules/recepcion/pages/RecepcionPage";
// import CalidadPage ...
// import TrazabilidadPage ...

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<RecepcionPage />} />
          <Route path="/recepcion" element={<RecepcionPage />} />
          {/* Futuro */}
          {/* <Route path="/calidad" element={<CalidadPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
