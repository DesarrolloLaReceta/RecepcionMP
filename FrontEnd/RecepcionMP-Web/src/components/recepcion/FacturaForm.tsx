import type { Factura } from "../../models/Factura";

interface FacturaFormProps {
  factura: Factura;
  onChange: (factura: Factura) => void;
}

export default function FacturaForm({
  factura,
  onChange
}: FacturaFormProps) {

  function actualizarCampo<K extends keyof Factura>(
    campo: K,
    valor: Factura[K]
  ) {
    onChange({
      ...factura,
      [campo]: valor
    });
  }

  return (
    <section>
      <h2>Datos de la Factura</h2>

      <div>
        <label>Número de factura</label>
        <input
          type="text"
          value={factura.numero}
          onChange={(e) =>
            actualizarCampo("numero", e.target.value)
          }
        />
      </div>

      <div>
        <label>Fecha de factura</label>
        <input
          type="date"
          value={factura.fecha}
          onChange={(e) =>
            actualizarCampo("fecha", e.target.value)
          }
        />
      </div>

      <div>
        <label>Proveedor</label>
        <input
            type="number"
            value={factura.valorTotal}
            onChange={(e) =>
                actualizarCampo("valorTotal", Number(e.target.value))
            }
        />
      </div>
    </section>
  );
}
