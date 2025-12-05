import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import '../assets/Login.css'; 

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate();
  const obtenerRolYRedirigir = async (userResult) => {
    try {
      const docRef = doc(db, "usuarios", userResult.uid);
      const docSnap = await getDoc(docRef);
      let rolUsuario = 'usuario';
      let fotoUsuario = userResult.photoURL || ''; 

      if (docSnap.exists()) {
        rolUsuario = docSnap.data().rol;
        if (docSnap.data().foto) fotoUsuario = docSnap.data().foto;
      }
      // 2. ENVIAMOS LOS 3 DATOS: Nombre, Rol y Foto
      onLogin(userResult.displayName || userResult.email, rolUsuario, fotoUsuario);
      navegar('/');
    } catch (err) {
      console.error("Error al obtener rol:", err);
      // En caso de fallo, intentamos loguear con lo básico
      onLogin(userResult.displayName || userResult.email, 'usuario', userResult.photoURL);
      navegar('/');
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (usuario && contrasena) {
      try {
        const result = await signInWithEmailAndPassword(auth, usuario, contrasena);
        await obtenerRolYRedirigir(result.user);
      } catch (err) {
        console.log(err);
        setError('Usuario o contraseña incorrectos');
      }
    } else {
      setError('Usuario y contraseña obligatorios');
    }
  };

  const manejarGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await obtenerRolYRedirigir(result.user);
    } catch (err) {
        console.log(err);
        setError('Error al iniciar sesión con Google');
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={manejarEnvio}>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            className="login-input"/>
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            className="login-input"/>
          <button type="submit" className="btn-login-submit">
            Login
          </button>
        </form>
        <div className="login-divider">
          <button onClick={manejarGoogle} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.64 2 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.19 0 8.8-3.72 8.8-9.04c0-.79-.08-1.39-.08-1.39h.63z"/></svg>
            Entrar con Google
          </button>
        </div>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

export default Login;