import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Header.css'; 

const TravelAirplaneIcon = () => (
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

export default function Header({ usuario, rol, onLogout }) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const closeMenu = () => setMenuAbierto(false);
  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/'); 
    closeMenu();
  };
  return (
    <header className="header">
      {/* --- LOGO Y HAMBURGUESA --- */}
      <div className="header-top-mobile">
        <Link to="/" className="brand" onClick={closeMenu}>
          <TravelAirplaneIcon /> Rumbo Cero
        </Link>
        <button className="hamburger-btn" onClick={toggleMenu}>
          {menuAbierto ? '✖' : '☰'}
        </button>
      </div>
      <div className={`header-content ${menuAbierto ? 'active' : ''}`}>
        {/* NAVEGACIÓN */}
        {usuario && (
          <nav className="nav">
            <Link to="/foro" className="nav-link" onClick={closeMenu}>Foro</Link>
            {rol === 'administrador' && (
               <Link to="/Admin-Panel" className="nav-link" style={{ color: 'red', fontWeight: 'bold' }} onClick={closeMenu}>
                 Panel Admin </Link>
                )}
            <Link to="/estadisticas" className="nav-link" onClick={closeMenu}>Estadísticas</Link>
            <Link to="/crear-viaje" className="btn btn-login" style={{ fontSize: '0.9rem', fontWeight: 'bold' }} onClick={closeMenu}>+ Crear Viaje
            </Link>
            <Link to="/viajes" className="nav-link" onClick={closeMenu}>Mis Viajes</Link>
          </nav>
        )}
        <div className="header-actions">
          {usuario ? (
            <>
              <Link to="/perfil" className="greeting" onClick={closeMenu}>
                Hola, <strong>{usuario}</strong>
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">Cerrar Sesión</button>
            </> ) : (
            <>
              <Link to="/" className="nav-link" onClick={closeMenu}>Inicio</Link> 
              <Link to="/login" className="btn btn-login" onClick={closeMenu}>Iniciar Sesión</Link>
              <Link to="/registro" className="btn btn-ghost" onClick={closeMenu}>Registro</Link>
            </>
          )}      
        </div>
      </div>
    </header>
  );
}