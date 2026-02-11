import { useState } from "react";
import type { OrdenCompra } from "../../models/OrdenCompra";
import { buscarOrdenCompra } from "../../services/ordenCompra.service";

interface OrdenCompraSearchProps {
  ordenCompra: OrdenCompra | null;
  onSelect: (oc: OrdenCompra) => void;
}

export default function OrdenCompraSearch({
  ordenCompra,
  onSelect
}: OrdenCompraSearchProps) {
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buscar() {
    if (!numero) return;

    try {
      setLoading(true);
      setError(null);

      const data = await buscarOrdenCompra(numero);
      setResultados(data);
    } catch (e) {
      setError("Error al buscar órdenes de compra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Orden de Compra</h2>

      <div>
        <input
          type="text"
          placeholder="Número de orden de compra"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <button onClick={buscar} disabled={loading}>
          Buscar
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultados.length > 0 && (
        <ul>
          {resultados.map((oc) => (
            <li key={oc.id}>
              <span>
                {oc.numero} – {oc.proveedor.nombre}
              </span>
              <button onClick={() => onSelect(oc)}>
                Seleccionar
              </button>
            </li>
          ))}
        </ul>
      )}

      {ordenCompra && (
        <p>
          Orden seleccionada: <strong>{ordenCompra.numero}</strong>
        </p>
      )}
    </section>
  );
}
