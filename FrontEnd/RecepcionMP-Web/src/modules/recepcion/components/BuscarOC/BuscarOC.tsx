import { useState } from "react";
import styles from "./BuscarOC.module.css";
import type { OrdenCompra } from "./BuscarOC.types";
import { buscarOrdenCompra } from "../../services/Recepcion.service";

interface Props {
  onOCSeleccionada: (oc: OrdenCompra) => void;
}

const BuscarOC = ({ onOCSeleccionada }: Props) => {
  const [numeroOC, setNumeroOC] = useState("");
  const [ocEncontrada, setOcEncontrada] = useState<OrdenCompra | null>(null);

  const handleBuscar = async () => {
    if (!numeroOC.trim()) return;

    const oc = await buscarOrdenCompra(numeroOC);
    setOcEncontrada(oc);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Número de Orden de Compra"
          value={numeroOC}
          onChange={(e) => setNumeroOC(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleBuscar} className={styles.button}>
          Buscar
        </button>
      </div>

      {ocEncontrada && (
        <div className={styles.resultCard}>
          <h3>Orden: {ocEncontrada.numero}</h3>
          <p>Proveedor: {ocEncontrada.proveedor}</p>
          <p>Fecha: {ocEncontrada.fecha}</p>
          <p>Estado: {ocEncontrada.estado}</p>

          <ul>
            {ocEncontrada.items.map((item) => (
              <li key={item.id}>
                {item.nombre} — {item.cantidadEsperada} {item.unidad}
              </li>
            ))}
          </ul>

          <button
            className={styles.continueButton}
            onClick={() => onOCSeleccionada(ocEncontrada)}
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};

export default BuscarOC;
