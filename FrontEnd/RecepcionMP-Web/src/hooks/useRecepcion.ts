import { useState } from "react";
import type { Recepcion, ResultadoRecepcion } from "../models/Recepcion";
import type { OrdenCompra } from "../models/OrdenCompra";
import type { Lote } from "../models/Lote";
import { crearRecepcion } from "../services/recepcion.service";
import type { Factura } from "../models/Factura";

type EstadoProceso = "idle" | "editing" | "submitting" | "success" | "error";

export function useRecepcion() {
  const [ordenCompra, setOrdenCompra] = useState<OrdenCompra | null>(null);
  const [factura, setFactura] = useState <Factura | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [condicionesTransporte, setCondicionesTransporte] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [noConformidades, setNoConformidades] = useState<any[]>([]);
  const [resultado, setResultado] = useState<ResultadoRecepcion | null>(null);
  const [estadoProceso, setEstadoProceso] = useState<EstadoProceso>("idle");
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // Acciones del flujo
  // -------------------------------

  function seleccionarOrdenCompra(oc: OrdenCompra) {
    setOrdenCompra(oc);
    setEstadoProceso("editing");
  }

  function registrarFactura(data: Factura) {
    setFactura(data);
  }

  function agregarLote(lote: Lote) {
    setLotes(prev => [...prev, lote]);
  }

  function actualizarChecklist(items: any[]) {
    setChecklist(items);
  }

  function definirResultado(valor: ResultadoRecepcion) {
    setResultado(valor);
  }

  async function enviarRecepcion() {
    if (!ordenCompra || !factura || lotes.length === 0 || !resultado) {
      setError("La recepción no está completa");
      return;
    }

    try {
      setEstadoProceso("submitting");

      const recepcion: Recepcion = {
        ordenCompraId: ordenCompra.id,
        factura,
        lotes,
        condicionesTransporte,
        checklist,
        noConformidades,
        resultado
      };

      await crearRecepcion(recepcion);

      setEstadoProceso("success");
    } catch (e) {
      setEstadoProceso("error");
      setError("Error al registrar la recepción");
    }
  }

  return {
    // estado
    ordenCompra,
    factura,
    lotes,
    condicionesTransporte,
    checklist,
    noConformidades,
    resultado,
    estadoProceso,
    error,

    // acciones
    seleccionarOrdenCompra,
    registrarFactura,
    agregarLote,
    actualizarChecklist,
    definirResultado,
    enviarRecepcion
  };
}
