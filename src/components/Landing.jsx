import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="page-center"> 
      <div className="landing-wrap"> 

        <h1 className="landing-title">
          Planifica tu próximo viaje con <span style={{ color: 'var(--accent)' }}>Rumbo Cero</span>
        </h1>
        <p className="landing-sub">
          Organiza destinos, gestiona tu equipaje con checklists y comparte tus experiencias en el mini-foro.
          ¡Tu aventura comienza aquí!
        </p>

        {/* Contenedor de acciones */}
        <div className="form-actions" style={{ marginTop: 'var(--gap)' }}>
          <Link to="/login" className="btn btn-primary">
            Comienza a Planificar
          </Link>
          
          {/* Opción de Registro */}
          <Link to="/registro" className="btn btn-ghost">
            Crear Cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}