import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
// CRÍTICO: Se ha corregido la ruta añadiendo la extensión .js para que el compilador lo encuentre.
import { auth, db } from "../firebase.js"; 
import { onAuthStateChanged } from 'firebase/auth'; // Necesario para gestionar el estado de sesión

function CrearViaje() {
// Estados para los campos de la colección Viaje
const [name, setName] = useState('');
const [destinoPrincipal, setDestinoPrincipal] = useState('');
const [fechalnicial, setFechalnicial] = useState('');
const [fechaFinal, setFechaFinal] = useState('');
const [descripcion, setDescripcion] = useState('');

  // Estados de control
const [error, setError] = useState('');
const [cargando, setCargando] = useState(false);
 const [userId, setUserId] = useState(null); // 💥 ESTADO CLAVE: Guarda el UID de forma segura
const navegar = useNavigate();


  // 💥 AJUSTE CRÍTICO: Escuchamos el estado de autenticación de forma asíncrona
  useEffect(() => {
    // onAuthStateChanged garantiza que obtenemos el UID real una vez que la sesión está lista.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Sesión cargada, guardamos el ID
      } else {
        setUserId(null); // Sesión terminada
        // En un entorno protegido por rutas, el Navigate ya nos enviaría a /login.
      }
    });

    return () => unsubscribe(); // Limpiamos el listener al desmontar
  }, []); // Se ejecuta solo una vez al inicio


const manejarCreacion = async (e) => {
  e.preventDefault();
   setError('');
   setCargando(true);

  // 1. Verificar si el UID ya está cargado en el estado
  if (!userId) {
    setError("Error: El usuario aún no está autenticado o la sesión no está lista.");
    setCargando(false);
    return;
  }

  // 2. Validación básica
 if (!name || !destinoPrincipal || !fechalnicial || !fechaFinal) {
  setError('Los campos de Nombre, Destino y Fechas son obligatorios.');
  setCargando(false);
  return;
  }

  try {
// Firestore usa Timestamp, no Date, para asegurar consistencia
const startTimestamp = Timestamp.fromDate(new Date(fechalnicial));
const endTimestamp = Timestamp.fromDate(new Date(fechaFinal));

  // 3. Crear el nuevo documento de Viaje - ¡Usando la ruta simple!
  await addDoc(collection(db, "viajes"), {
    name: name,
    destinoPrincipal: destinoPrincipal,
    fechalnicial: startTimestamp, 
    fechaFinal: endTimestamp,
    descripcion: descripcion,
    userId: userId, // Usamos el ID del estado, que sabemos que es válido
    createAt: Timestamp.now() 
  });

  // 4. Éxito: Navegar al panel de viajes
  navegar('/viajes'); 

} catch (err) {
  console.error("Error al crear el viaje:", err);
  setError("Error al guardar el viaje: " + err.message);
} finally {
  setCargando(false);
}
};

  // Muestra un estado de cargando mientras esperamos el ID
  if (!userId) {
    return (
      <div className="page-center h-screen flex justify-center items-center">
        <p className="text-xl text-gray-500">Cargando datos de usuario...</p>
      </div>
    );
  }

return (
<div className="page-center">
<div className="login-container"> 
<h2 className="login-title">✨ Planifica un Nuevo Viaje</h2>
<p className="login-subtitle">Introduce los detalles principales de tu aventura.</p>

<form onSubmit={manejarCreacion} className="login-form">

<div className="form-group">
<label htmlFor="name">Título del Viaje:</label>
<input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
</div>

<div className="form-group">
<label htmlFor="destinoPrincipal">Destino Principal:</label>
<input type="text" id="destinoPrincipal" value={destinoPrincipal} onChange={e => setDestinoPrincipal(e.target.value)} required className="form-input" />
</div>

<div className="form-group">
<label htmlFor="fechalnicial">Fecha de Inicio:</label>
<input type="date" id="fechalnicial" value={fechalnicial} onChange={e => setFechalnicial(e.target.value)} required className="form-input" />
</div>

<div className="form-group">
<label htmlFor="fechaFinal">Fecha de Finalización:</label>
<input type="date" id="fechaFinal" value={fechaFinal} onChange={e => setFechaFinal(e.target.value)} required className="form-input" />
</div>

<div className="form-group">
<label htmlFor="descripcion">Descripción Breve:</label>
<textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="3" className="form-input"></textarea>
</div>

{error && <div className="alert-error">{error}</div>}

<button type="submit" className="btn btn-primary btn-full-width" disabled={cargando || !userId}>
    {cargando ? 'Guardando...' : 'Crear Viaje'}
</button>
</form>
</div>
</div>
);
}
export default CrearViaje;