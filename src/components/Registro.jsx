import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../assets/Estiloslogin.css'; 

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !email || !password) {
        setError('Por favor, rellena todos los campos');
        return;}
    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // 2. Guardar ficha en Firestore 
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre: nombre,
        email: email,
        rol: 'usuario', 
        createAt: Timestamp.now()
      });
      navigate('/viajes'); 
    } catch (error) {
      console.error("Error en registro:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Error al registrarse. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="paginalogin">
      <div className="cajalogin">
        <h2 className="titulologin">Crear Cuenta</h2>
        <form onSubmit={manejarRegistro} className="formulariologin">
          <input 
            type="text" 
            className="campotexto" 
            placeholder="Nombre de usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input 
            type="email" 
            className="campotexto" 
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            className="campotexto" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="botonentrar">
            Registrarse
          </button>
        </form>
        {error && <div className="mensajeerror">{error}</div>}
        <div className="separador">
            <p className="texto-registro">
                ¿Ya tienes cuenta? 
                <Link to="/login" className="enlace-registro">Inicia sesión aquí</Link>
            </p>
        </div>
      </div>
    </div>
  );
};
export default Registro;