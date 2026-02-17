import { buscarOrdenesCompra } from "../services/Recepcion.mock";
import type { OrdenCompra } from "../components/BuscarOC/BuscarOC.types";

export const buscarOrdenCompra = async (
  numero: string
): Promise<OrdenCompra | null> => {
  
  await new Promise((resolve) => setTimeout(resolve, 500));

  const oc = buscarOrdenesCompra.find(o => o.numero === numero);

  return oc || null;
};
