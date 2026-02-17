import BuscarOC from "../components/BuscarOC/BuscarOC";
import type { OrdenCompra } from "../components/BuscarOC/BuscarOC.types";

const RecepcionPage = () => {
  return (
    <div>
      <h1>Recepción</h1>
      <BuscarOC onOCSeleccionada={function (_oc: OrdenCompra): void {
        throw new Error("Function not implemented.");
      } } />
    </div>
  );
};

export default RecepcionPage;
