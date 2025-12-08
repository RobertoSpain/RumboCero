import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import '../assets/Registro.css';

function Registro() {
  const [nombre, setNombre] = useState(''); 
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate();
  const manejarEnvio = async (e) => {
    e.preventDefault(); 
    if (nombre && email && pass) {
      try {
        const credencial = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "usuarios", credencial.user.uid), {
           userID: credencial.user.uid,
           nombre: nombre,
           email: email,
           rol: "usuario",
           createAt: new Date()
        });
        navegar('/viajes');
      } catch (err) {
        console.error(err);
        setError('Error al registrar: ' + err.message);
      }
    } else {
      setError('Todos los campos son obligatorios');
    }
  };

  return (
    <div className="paginacentral"> 
      <div className="cajaregistro">
        <h2 className="tituloregistro">Registro</h2>
        <form onSubmit={manejarEnvio} className="formularioregistro">
          <input 
            type="text" 
            placeholder="Nombre" 
            className="campotexto"
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
          />
          <input 
            type="email" 
            placeholder="Correo" 
            className="campotexto"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="campotexto"
            value={pass} 
            onChange={e => setPass(e.target.value)} 
          />
          
          <button type="submit" className="botonregistro">Registrarse</button>
          {error && <p className="mensajeerror">{error}</p>}
        </form>
        <Link to="/login" className="enlacelogin">Ir a Login</Link>
      </div>
    </div>
  );
}

export default Registro;