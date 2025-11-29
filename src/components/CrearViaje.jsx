// src/components/CrearViaje.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Necesitas la autenticación para el ID y la DB

function CrearViaje() {
  // Estados para los campos de la colección Viaje
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();

  const manejarCreacion = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // 1. Verificar usuario logueado
    const user = auth.currentUser;
    if (!user) {
      setError("Debes iniciar sesión para crear un viaje.");
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
      // 3. Crear el nuevo documento de Viaje
      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: new Date(fechalnicial), // Convertir string a objeto Date (Firestore lo manejará como Timestamp)
        fechaFinal: new Date(fechaFinal),
        descripcion: descripcion,
        userId: user.uid, // Clave foránea al usuario
        createAt: new Date().toISOString()
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

  return (
    <div className="page-center">
      <div className="login-container"> {/* Reutilizamos la caja bonita del login */}
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

          <button type="submit" className="btn btn-primary btn-full-width" disabled={cargando}>
             {cargando ? 'Guardando...' : 'Crear Viaje'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearViaje;