import RecepcionTable from '../components/RecepcionTable';
import { useRecepciones } from '../hooks/useRecepciones';

export default function RecepcionPage() {
  //const { recepciones, loading, error } = useRecepciones();

  const recepcionesMock = [
    {
      id: '1',
      numeroOrdenCompra: 'OC-001',
      fechaRecepcion: '2026-01-15',
      estado: 'Pendiente',
    },
    {
      id: '2',
      numeroOrdenCompra: 'OC-002',
      fechaRecepcion: '2026-01-16',
      estado: 'Cuarentena',
    },
  ];


  //if (loading) return <p>Cargando recepciones...</p>;
  //if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Módulo Recepción</h3>

      <RecepcionTable
        recepciones={recepcionesMock}
        onSelect={(id) => console.log('Seleccionada:', id)}
      />
    </div>
  );
}
