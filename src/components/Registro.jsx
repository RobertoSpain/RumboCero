import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import '../assets/Registro.css';

function Registro() {
  // Estados para los campos
  const [nombre, setNombre] = useState(''); 
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault(); 

    if (nombre && email && pass) {
      try {
        // 1. Crear cuenta en Firebase Auth
        const credencial = await createUserWithEmailAndPassword(auth, email, pass);
        
        // 2. Guardar datos en Firestore 
        await setDoc(doc(db, "usuarios", credencial.user.uid), {
           userID: credencial.user.uid,
           nombre: nombre,
           email: email,
           rol: "usuario", // Rol por defecto
           createAt: new Date()
        });

        navegar('/viajes'); // Redirige tras éxito
      } catch (err) {
        console.error(err);
        setError('Error al registrar: ' + err.message);
      }
    } else {
      setError('Todos los campos son obligatorios');
    }
  };

  return (
    <div className="page-center"> 
      <div className="login-container">
        <h2>Registro</h2>
        <form onSubmit={manejarEnvio} className="login-form">
          <input 
            type="text" placeholder="Nombre" className="form-input"
            value={nombre} onChange={e => setNombre(e.target.value)} 
          />
          <input 
            type="email" placeholder="Correo" className="form-input"
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Contraseña" className="form-input"
            value={pass} onChange={e => setPass(e.target.value)} 
          />
          
          <button type="submit" className="btn btn-primary">Registrarse</button>
          
          {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        </form>
        <Link to="/login" style={{display:'block', marginTop:'15px'}}>Ir a Login</Link>
      </div>
    </div>
  );
}

export default Registro;