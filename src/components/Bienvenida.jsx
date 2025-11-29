import { useNavigate } from 'react-router-dom';

function Bienvenida({ usuario, onLogout }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    if (typeof onLogout === 'function') onLogout();
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h1>¡Bienvenido!</h1>
      <p>Has iniciado sesión como: <strong>{usuario}</strong></p>
      <div style={{ marginTop: 20 }}>
        <button onClick={cerrarSesion} style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Bienvenida;
