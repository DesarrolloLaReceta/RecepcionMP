import { useState } from "react";
import type { Lote } from "../../../models/Lote";

interface LotesTableProps {
  lotes: Lote[];
  onAdd: (lote: Lote) => void;
  onUpdate: (lote: Lote) => void;
  onDelete: (id: string) => void;
}

const loteVacio: Lote = {
  id: "",
  itemId: 0,
  nombreItem: "",
  numeroLote: "",
  fechaVencimiento: "",
  cantidadRecibida: 0
};

export default function LotesTable({
  lotes,
  onAdd,
  onUpdate,
  onDelete
}: LotesTableProps) {
  const [nuevoLote, setNuevoLote] = useState<Lote>(loteVacio);

  function actualizarCampo<K extends keyof Lote>(
    campo: K,
    valor: Lote[K]
  ) {
    setNuevoLote({
      ...nuevoLote,
      [campo]: valor
    });
  }

  function agregar() {
    if (!nuevoLote.numeroLote || !nuevoLote.cantidadRecibida) return;

    onAdd({
      ...nuevoLote,
      id: crypto.randomUUID()
    });

    setNuevoLote(loteVacio);
  }

  return (
    <section>
      <h2>Lotes Recibidos</h2>

      {/* Formulario de nuevo lote */}
      <div>
        <input
          placeholder="Ítem"
          value={nuevoLote.nombreItem}
          onChange={(e) =>
            actualizarCampo("nombreItem", e.target.value)
          }
        />

        <input
          placeholder="Número de lote"
          value={nuevoLote.numeroLote}
          onChange={(e) =>
            actualizarCampo("numeroLote", e.target.value)
          }
        />

        <input
          type="date"
          value={nuevoLote.fechaVencimiento}
          onChange={(e) =>
            actualizarCampo("fechaVencimiento", e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Cantidad"
          value={nuevoLote.cantidadRecibida}
          onChange={(e) =>
            actualizarCampo(
              "cantidadRecibida",
              Number(e.target.value)
            )
          }
        />

        <button onClick={agregar}>Agregar</button>
      </div>

      {/* Tabla de lotes */}
      {lotes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Lote</th>
              <th>Vencimiento</th>
              <th>Cantidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(lote => (
              <tr key={lote.id}>
                <td>{lote.nombreItem}</td>
                <td>{lote.numeroLote}</td>
                <td>{lote.fechaVencimiento}</td>
                <td>{lote.cantidadRecibida}</td>
                <td>
                  <button onClick={() => onDelete(lote.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
