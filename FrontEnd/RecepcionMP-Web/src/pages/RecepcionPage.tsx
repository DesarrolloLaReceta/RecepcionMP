import { useRecepcion } from "../hooks/useRecepcion";

import OrdenCompraSearch from "../components/recepcion/OrdenCompraSearch";
import FacturaForm from "../components/recepcion/FacturaForm";
import LotesTable from "../components/recepcion/LotesTable";
import ResultadoRecepcionSelect from "../components/recepcion/ResultadoRecepcionSelect";
import RecepcionActions from "../components/recepcion/RecepcionActions";

export default function RecepcionPage() {
  const {
    ordenCompra,
    factura,
    lotes,
    resultado,
    loading,
    error,
    seleccionarOrdenCompra,
    actualizarFactura,
    agregarLote,
    actualizarLote,
    eliminarLote,
    definirResultado,
    guardarRecepcion
  } = useRecepcion();

  return (
    <div>
      <h1>Recepción de Materia Prima</h1>

      <OrdenCompraSearch
        ordenCompra={ordenCompra}
        onSelect={seleccionarOrdenCompra}
      />

      {ordenCompra && (
        <>
          <FacturaForm
            factura={factura}
            onChange={actualizarFactura}
          />

          <LotesTable
            lotes={lotes}
            onAdd={agregarLote}
            onUpdate={actualizarLote}
            onDelete={eliminarLote}
          />

          <ResultadoRecepcionSelect
            value={resultado}
            onChange={definirResultado}
          />

          <RecepcionActions
            loading={loading}
            onGuardar={guardarRecepcion}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  );
}
