import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase.js"; 
import { onAuthStateChanged } from 'firebase/auth'; // Necesario para gestionar el estado de sesión

function CrearViaje() {
  // Estados para los campos de la colección Viaje
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState('');

  // Estados de control
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [userId, setUserId] = useState(null); //  Guarda el UID de forma segura
  const navegar = useNavigate();

  //  Escuchamos el estado de autenticación de forma asíncrona
  useEffect(() => {
    // onAuthStateChanged garantiza que obtenemos el UID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Sesión cargada, guardamos el ID
      } else {
        setUserId(null); // Sesión terminada
      }
    });

    return () => unsubscribe(); // Limpiamos el listener al desmontar
  }, []); // Se ejecuta solo una vez al inicio

  const manejarCreacion = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!userId) {
      setError("Error: No estás autenticado.");
      setCargando(false);
      return;
    }
    // Validación básica de campos vacíos
    if (!name || !destinoPrincipal || !fechalnicial || !fechaFinal) {
      setError('Por favor, rellena todos los campos obligatorios.');
      setCargando(false);
      return;
    }

    // Convertimos las fechas de texto a objetos Date para compararlas
    const inicio = new Date(fechalnicial);
    const fin = new Date(fechaFinal);

    if (inicio > fin) {
      setError('¡La fecha de vuelta no puede ser antes de la ida! Revisa el calendario.');
      setCargando(false);
      return; // Cortamos aquí para que no guarde nada
    }
    try {
      const startTimestamp = Timestamp.fromDate(inicio);
      const endTimestamp = Timestamp.fromDate(fin);
      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: startTimestamp, 
        fechaFinal: endTimestamp,
        descripcion: descripcion,
        foto: foto, 
        userId: userId, 
        createAt: Timestamp.now() 
      });

      navegar('/viajes'); 
    } catch (err) {
      console.error(err);
      setError("Error al guardar: " + err.message);
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
            <label htmlFor="foto">Foto de Portada (URL Opcional):</label>
            <input 
              type="url" 
              id="foto" 
              value={foto} 
              onChange={e => setFoto(e.target.value)} 
              placeholder="https://ejemplo.com/foto.jpg"
              className="form-input" 
            />
            <small style={{color: '#666'}}>Pega aquí el enlace de una imagen de Google.</small>
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