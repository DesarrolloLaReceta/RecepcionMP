import { useState, useEffect, useCallback } from "react";
import {
  recepcionesService,
  type RecepcionResumen,
  type RecepcionesFilter,
} from "../Services/recepciones.service";

export function useRecepciones(filter?: RecepcionesFilter) {
  const [recepciones, setRecepciones] = useState<RecepcionResumen[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recepcionesService.getAll(filter);
      setRecepciones(data);
    } catch {
      setError("No se pudo cargar la lista de recepciones.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filter)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { recepciones, loading, error, refresh: fetch };
}