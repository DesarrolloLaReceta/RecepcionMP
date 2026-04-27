import { useNavigate } from 'react-router-dom';
import './StylesCalidad/CalidadDashboard.css';

const CalidadDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Verificación de Instalaciones',
      subtitle: 'CAL-FORMU-139-01',
      description: 'Inspección de infraestructura, aseo y áreas de planta.',
      icon: '🏢', 
      path: '/calidad/verificacion-instalaciones',
      color: '#e67e22'
    },
    {
      title: 'Lavado de Botas y Manos',
      subtitle: 'CAL-FORMU-143-01',
      description: 'Control de ingreso de personal y cumplimiento de BPM.',
      icon: '🧼',
      path: '/calidad/lavado-botas-manos',
      color: '#3498db'
    },
    {
      title: 'Próximos Formularios',
      subtitle: 'Calidad La Receta',
      description: 'Nuevos módulos de auditoría en desarrollo.',
      icon: '📝',
      path: '#',
      color: '#95a5a6',
      disabled: true
    }
  ];

  return (
    <div className="dashboard-calidad-container">
      <header className="dashboard-header">
        <span className="breadcrumb">Calidad / Gestión</span>
        <h1>Panel de Control Calidad</h1>
        <p>Selecciona el proceso que deseas inspeccionar hoy</p>
      </header>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`card-item ${card.disabled ? 'disabled' : ''}`}
            onClick={() => !card.disabled && navigate(card.path)}
          >
            <div className="card-icon-container" style={{ backgroundColor: card.color + '22' }}>
              <span className="card-emoji" style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="card-info">
              <span className="card-subtitle">{card.subtitle}</span>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
            {!card.disabled && <div className="card-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalidadDashboard;