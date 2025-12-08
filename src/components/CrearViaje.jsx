import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from "../firebase.js"; 
import '../assets/CrearViaje.css';

function CrearViaje() {
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
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
      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: Timestamp.fromDate(inicio), 
        fechaFinal: Timestamp.fromDate(fin),
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

  if (!userId) {
    return (
      <div className="paginacentrada">
        <p className="textocargando">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="paginacentrada">
      <div className="cajaformulario"> 
        <h2 className="titulocrear">✨ Nuevo Viaje</h2>
        <p className="subtitulocrear">Planifica tu próxima aventura.</p>

        <form onSubmit={manejarCreacion} className="formulario-viaje">
          
          <div className="campo">
            <label htmlFor="name">Título del Viaje:</label>
            <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="entradatexto" 
            />
          </div>

          <div className="campo">
            <label htmlFor="destinoPrincipal">Destino Principal:</label>
            <input 
                type="text" 
                id="destinoPrincipal" 
                value={destinoPrincipal} 
                onChange={e => setDestinoPrincipal(e.target.value)} 
                required 
                className="entradatexto" 
            />
          </div>

          <div className="campo">
            <label htmlFor="foto">Foto de Portada (URL):</label>
            <input 
              type="url" 
              id="foto" 
              value={foto} 
              onChange={(e) => setFoto(e.target.value)} 
              placeholder="https://..."
              className="entradatexto"
            />
            <small className="textoayuda">Copia y pega el enlace de una imagen de Google.</small>
          </div>

          <div className="filafechas">
              <div className="campo mitad">
                <label htmlFor="fechalnicial">Fecha Ida:</label>
                <input 
                    type="date" 
                    id="fechalnicial" 
                    value={fechalnicial} 
                    onChange={e => setFechalnicial(e.target.value)} 
                    required 
                    className="entradatexto" 
                />
              </div>
              <div className="campo mitad">
                <label htmlFor="fechaFinal">Fecha Vuelta:</label>
                <input 
                    type="date" 
                    id="fechaFinal" 
                    value={fechaFinal} 
                    onChange={e => setFechaFinal(e.target.value)} 
                    required 
                    className="entradatexto" 
                />
              </div>
          </div>

          <div className="campo">
            <label htmlFor="descripcion">Descripción:</label>
            <textarea 
                id="descripcion" 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                rows="3" 
                className="entradatexto areatexto"
            ></textarea>
          </div>

          {error && <div className="mensajeerror">{error}</div>}
          <button type="submit" className="botonguardar" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Crear Viaje'}
          </button>
          
        </form>
      </div>
    </div>
  );
}

export default CrearViaje;