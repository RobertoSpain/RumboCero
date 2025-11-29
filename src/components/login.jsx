// Componente de inicio de sesión para la aplicación
// Permite al usuario iniciar sesión con usuario/contraseña o Google
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Ajusta la ruta si tu archivo firebase está en otro lugar

// Cambiado: función llamada Login en lugar de IniciarSesion
function Login({ onLogin }) {
  // Estados locales para usuario, contraseña y errores
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate(); // Hook para navegación entre rutas

  // Maneja el envío del formulario de login tradicional
  const manejarEnvio = (e) => {
    e.preventDefault();
    if (usuario && contrasena) {
      signInWithEmailAndPassword(auth, usuario, contrasena)
        .then((result) => {
          onLogin(result.user.displayName || result.user.email || result.user.uid); // Llama a onLogin con el nombre, email o uid de Google
          navegar('/'); // Redirige al usuario a la página principal
        })
        .catch(() => {
          setError('Usuario o contraseña incorrectos'); // Muestra error si faltan datos
        });
    } else {
      setError('Usuario y contraseña obligatorios'); // Muestra error si faltan datos
    }
  };

  // Maneja el login con Google usando Firebase Auth y promesas
  const manejarGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        onLogin(result.user.displayName || result.user.email || result.user.uid); // Llama a onLogin con el nombre, email o uid de Google
        navegar('/'); // Redirige al usuario a la página principal
      })
      .catch(() => {
        setError('Error al iniciar sesión con Google'); // Muestra error si falla el login con Google
      });
  };

  // Renderiza el formulario de login y el botón social
  return (
    <section style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          style={{ padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={e => setContrasena(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: '15px' }}>
        <button onClick={manejarGoogle} style={{ padding: '8px 16px', backgroundColor: '#db4437', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Google
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </section>
  );
}

export default Login;