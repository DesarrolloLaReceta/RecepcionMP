import type { Recepcion } from '../models/Recepcion';

interface Props {
  recepciones: Recepcion[];
  onSelect?: (id: string) => void;
}

export default function RecepcionTable({ recepciones, onSelect }: Props) {
  return (
    <table border={1} width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Orden de Compra</th>
          <th>Fecha</th>
          <th>Estado</th>
        </tr>
      </thead>

      <tbody>
        {recepciones.length === 0 ? (
          <tr>
            <td colSpan={4} align="center">
              No hay recepciones registradas
            </td>
          </tr>
        ) : (
          recepciones.map((r) => (
            <tr
              key={r.id}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={() => onSelect?.(r.id)}
            >
              <td>{r.id}</td>
              <td>{r.numeroOrdenCompra}</td>
              <td>{new Date(r.fechaRecepcion).toLocaleDateString()}</td>
              <td>{r.estado}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
