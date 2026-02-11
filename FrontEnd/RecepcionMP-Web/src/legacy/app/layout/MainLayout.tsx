import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div>
      <header style={{ padding: '1rem', background: '#1e293b', color: '#fff' }}>
        <h2>Recepción Materia Prima</h2>
      </header>

      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
