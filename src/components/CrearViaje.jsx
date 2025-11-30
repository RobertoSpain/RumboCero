import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from "../firebase.js"; 
// NOTA: Ya no importamos 'storage' porque no vamos a subir archivos

function CrearViaje() {
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  // 📸 CAMBIO: Volvemos a guardar un texto simple (URL)
  const [foto, setFoto] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [userId, setUserId] = useState(null);
  const navegar = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  const manejarCreacion = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!userId) {
      setError("Error: No estás autenticado.");
      setCargando(false);
      return;
    }

    if (!name || !destinoPrincipal || !fechalnicial || !fechaFinal) {
      setError('Por favor, rellena todos los campos obligatorios.');
      setCargando(false);
      return;
    }

    const inicio = new Date(fechalnicial);
    const fin = new Date(fechaFinal);

    if (inicio > fin) {
      setError('¡La fecha de vuelta no puede ser antes de la ida!');
      setCargando(false);
      return;
    }

    try {
      // 💾 GUARDAR DIRECTAMENTE EN BASE DE DATOS
      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: Timestamp.fromDate(inicio), 
        fechaFinal: Timestamp.fromDate(fin),
        descripcion: descripcion,
        foto: foto, // Guardamos la URL que el usuario pegó
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

  if (!userId) {
    return (
      <div className="page-center h-screen flex justify-center items-center">
        <p className="text-xl text-gray-500">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="login-container"> 
        <h2 className="login-title">✨ Nuevo Viaje</h2>
        <p className="login-subtitle">Planifica tu próxima aventura.</p>

        <form onSubmit={manejarCreacion} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Título del Viaje:</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
          </div>

          <div className="form-group">
            <label htmlFor="destinoPrincipal">Destino Principal:</label>
            <input type="text" id="destinoPrincipal" value={destinoPrincipal} onChange={e => setDestinoPrincipal(e.target.value)} required className="form-input" />
          </div>

          {/* 👇 VUELVE A SER UN CAMPO DE TEXTO PARA LA URL */}
          <div className="form-group">
            <label htmlFor="foto">Foto de Portada (URL):</label>
            <input 
              type="url" 
              id="foto" 
              value={foto} 
              onChange={(e) => setFoto(e.target.value)} 
              placeholder="https://ejemplo.com/imagen.jpg"
              className="form-input"
            />
            <small style={{ color: '#666' }}>Copia y pega el enlace de una imagen de Google.</small>
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
            <label htmlFor="descripcion">Descripción:</label>
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