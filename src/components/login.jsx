// Componente de inicio de sesión para la aplicación
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase"; 

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate();

  // Función auxiliar para buscar el rol
  const obtenerRolYRedirigir = async (userResult) => {
    try {
      const docRef = doc(db, "usuarios", userResult.uid);
      const docSnap = await getDoc(docRef);

      let rolUsuario = 'usuario'; 
      if (docSnap.exists()) {
        rolUsuario = docSnap.data().rol;
      }

      onLogin(userResult.displayName || userResult.email, rolUsuario);
      navegar('/'); 
      
    } catch (err) {
      // Aquí ya lo estábamos usando, así que este no daba error
      console.error("Error al obtener rol:", err);
      onLogin(userResult.displayName || userResult.email, 'usuario');
      navegar('/');
    }
  };

  // Login con Usuario y Contraseña
  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (usuario && contrasena) {
      try {
        const result = await signInWithEmailAndPassword(auth, usuario, contrasena);
        await obtenerRolYRedirigir(result.user);
      } catch (err) {
        // CORREGIDO: Usamos 'err' en un console.log para que no salte el aviso
        console.log(err); 
        setError('Usuario o contraseña incorrectos');
      }
    } else {
      setError('Usuario y contraseña obligatorios');
    }
  };

  // Login con Google
  const manejarGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await obtenerRolYRedirigir(result.user);
    } catch (err) {
        // CORREGIDO: Usamos 'err' aquí también
        console.log(err);
        setError('Error al iniciar sesión con Google');
    }
  };

  return (
    <section style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Correo electrónico"
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
          Entrar con Google
        </button>
      </div>
      
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </section>
  );
}

export default Login;