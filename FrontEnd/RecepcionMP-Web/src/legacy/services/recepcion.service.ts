import api from "./api";
import type { Recepcion } from "../models/Recepcion";

export async function crearRecepcion(
  recepcion: Recepcion
): Promise<void> {
  try {
    await api.post("/recepciones", recepcion);
  } catch (error: any) {
    // Aquí NO mostramos alertas ni UI
    // Solo propagamos el error al flujo
    console.error("Error creando recepción", error);
    throw error;
  }
}
