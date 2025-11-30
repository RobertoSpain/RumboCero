import { Link, useNavigate } from 'react-router-dom';
import '../assets/Header.css'; 

// Componente que dibuja el icono de Avión
function TravelAirplaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cuerpo del avión */}
      <path d="M10 14L21 3L14 14L3 21L10 14Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 14L18 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14L6 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="11" fill="#3b82f6" opacity="0.9" style={{ transformOrigin: 'center', transform: 'scale(1.05)' }} />
      <path d="M10 14L21 3L14 14L3 21L10 14Z" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 14L18 18" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14L6 10" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Componente principal del header de la aplicación
export default function Header({ usuario, rol, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof onLogout === 'function') onLogout();
    navigate('/'); // Redirige a la landing page
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="brand">
          <TravelAirplaneIcon /> Rumbo Cero
        </Link>
        
        {/* Navegación para usuarios logueados */}
        {usuario && (
          <nav className="nav">
            <Link to="/foro" className="nav-link">Foro</Link>

            {/* Botón Panel Admin */}
            {rol === 'administrador' && (
               <Link to="/Admin-Panel" className="nav-link" style={{ color: 'red', fontWeight: 'bold' }}>
                 Panel Admin
               </Link>
            )}
            
            <Link to="/estadisticas" className="nav-link">Estadísticas</Link>
            <Link to="/crear-viaje" className="btn btn-login" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>+ Crear Viaje</Link>
            <Link to="/viajes" className="nav-link">Mis Viajes</Link>
          </nav>
        )}
      </div>
      
      <div className="header-actions">
        {usuario ? (
          // Vista para usuario logueado
          <>
            <Link to="/perfil" className="greeting">Hola, <strong>{usuario}</strong></Link>
            <button onClick={handleLogout} className="btn btn-logout">Cerrar Sesión</button>
          </>
        ) : (
          // Vista para usuario no logueado
          <>
            <Link to="/" className="nav-link">Inicio</Link> 
            <Link to="/login" className="btn btn-login">Iniciar Sesión</Link>
            <Link to="/registro" className="btn btn-ghost">Registro</Link>
          </>
        )}
        <span className="logo-right-icon"> 
          <TravelAirplaneIcon />
        </span>
      </div>
    </header>
  );
}