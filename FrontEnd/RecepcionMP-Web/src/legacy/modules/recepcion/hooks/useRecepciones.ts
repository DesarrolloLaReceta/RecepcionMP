import { useEffect, useState } from 'react';
import { obtenerRecepciones } from '../services/recepcion.api';

export function useRecepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerRecepciones()
      .then(data => {
        setRecepciones(data);
      })
      .catch(() => {
        setError('No fue posible cargar las recepciones');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { recepciones, loading, error };
}
