import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Header.css'; 

const IconoAvion = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14L21 3L14 14L3 21L10 14Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14L18 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L6 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="11" fill="#3b82f6" opacity="0.9" style={{ transformOrigin: 'center', transform: 'scale(1.05)' }} />
    <path d="M10 14L21 3L14 14L3 21L10 14Z" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14L18 18" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L6 10" stroke="#fff" fill="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Header({ usuario, rol, foto, onLogout }) {
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const alternarMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarSesion = () => {
    if (onLogout) onLogout();
    navegar('/'); 
    cerrarMenu();
  };

  return (
    <header className="cabecera">
      <div className="cabecera-movil">
        <Link to="/" className="logo-marca" onClick={cerrarMenu}>
          <IconoAvion /> Rumbo Cero
        </Link>
        <button className="boton-menu" onClick={alternarMenu}>
          {menuAbierto ? '✖' : '☰'}
        </button>
      </div>

      <div className={`contenido-cabecera ${menuAbierto ? 'activo' : ''}`}>
        {/* NAVEGACIÓN */}
        {usuario && (
          <nav className="navegacion">
            <Link to="/foro" className="enlace-nav" onClick={cerrarMenu}>Foro</Link>
            
            {rol === 'administrador' && (
               <Link to="/Admin-Panel" className="enlace-nav admin-link" onClick={cerrarMenu}>
                 Panel Admin
               </Link>
            )}
            <Link to="/estadisticas" className="enlace-nav" onClick={cerrarMenu}>Estadísticas</Link>
            <Link to="/crear-viaje" className="boton-crear" onClick={cerrarMenu}>
                + Crear Viaje
            </Link>
            <Link to="/viajes" className="enlace-nav" onClick={cerrarMenu}>Mis Viajes</Link>
          </nav>
        )}
        <div className="acciones-cabecera">
          {usuario ? (
            <>
              <Link to="/perfil" className="saludo-usuario" onClick={cerrarMenu}>
                <img 
                    src={foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                    alt="Avatar" 
                    className="imagen-avatar"
                    onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                />
                <span>Hola, <strong>{usuario}</strong></span>
              </Link>
              <button onClick={cerrarSesion} className="boton-salir">Cerrar Sesión</button>
            </> 
          ) : (
            <>
              <Link to="/" className="enlace-nav" onClick={cerrarMenu}>Inicio</Link> 
              <Link to="/login" className="boton-entrar" onClick={cerrarMenu}>Iniciar Sesión</Link>
              <Link to="/registro" className="boton-registro" onClick={cerrarMenu}>Registro</Link>
            </>
          )}      
        </div>
      </div>
    </header>
  );
}