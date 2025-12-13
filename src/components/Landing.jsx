import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Landing.css'; 

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      navigate('/viajes');
    }
  }, [navigate]);

  return (
    <div className="paginalanding">
      {/* El velo oscuro para que se lea */}
      <div className="filtrooscuro"></div>

      <div className="cajacentral">
        
        <h1 className="titulazo">
          Viaja mejor acompañado: planifica, organiza y comparte con <span className="resalteverde">Rumbo Cero</span>
        </h1>
        
        <p className="parrafolanding">
          Crea itinerarios colaborativos con tus amigos, gestiona listas de equipaje conjuntas y conecta con la comunidad en nuestro foro.
          <br />¡Vuestra próxima gran aventura comienza aquí!
        </p>

        <div className="zonabotones">
          <Link to="/login" className="botonlanding botonazul">
            Comienza a Planificar
          </Link>
          
          <Link to="/registro" className="botonlanding botontransparente">
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}