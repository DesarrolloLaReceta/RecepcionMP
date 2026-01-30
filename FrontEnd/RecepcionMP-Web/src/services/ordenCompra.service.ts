import api from "./api";
import type { OrdenCompra } from "../models/OrdenCompra";

export async function buscarOrdenCompra(
  numero: string
): Promise<OrdenCompra[]> {
  const response = await api.get<OrdenCompra[]>("/ordenes-compra", {
    params: { numero }
  });

  return response.data;
}
