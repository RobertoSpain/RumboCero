import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from "../firebase.js"; 
import '../assets/CrearViaje.css';

function CrearViaje() {
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
    const [fotoUrl, setFotoUrl] = useState(''); 
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
        setError('Rellena los campos obligatorios.'); 
        setCargando(false); 
        return; 
    }

    const inicio = new Date(fechalnicial);
    const fin = new Date(fechaFinal);
    
    if (inicio > fin) { 
        setError('La vuelta no puede ser antes de la ida.'); 
        setCargando(false); 
        return; 
    }

    try {
      const urlFinal = fotoUrl.trim() !== '' 
        ? fotoUrl 
        : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80';

      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: Timestamp.fromDate(inicio), 
        fechaFinal: Timestamp.fromDate(fin),
        descripcion: descripcion,
        foto: urlFinal, 
        participantes: [userId], 
        owner: userId, 
        createdAt: serverTimestamp() 
      });
      navegar('/viajes');
    } catch (err) {
      console.error(err);
      setError("Error al guardar: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!userId) return <div className="paginacentrada">Cargando usuario...</div>;

  return (
    <div className="paginacentrada fondoviajes">
      <div className="cajaformulario efectocristal"> 
        <div className="cabeceraformulario">
            <h2 className="titulocrear">Nuevo Viaje</h2>
            <p className="subtitulocrear">Planifica tu próxima aventura.</p>
        </div>
        <form onSubmit={manejarCreacion} className="formularioviaje" role="form">
          <div className="filadoble">
              <div className="campo">
                <label htmlFor="name">Título del Viaje</label>
                <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="entradatexto" 
                    placeholder="Ej: Escapada a Roma..."
                />
              </div>
              <div className="campo">
                <label htmlFor="destinoPrincipal">Destino Principal</label>
                <input 
                    type="text" 
                    id="destinoPrincipal" 
                    value={destinoPrincipal} 
                    onChange={e => setDestinoPrincipal(e.target.value)} 
                    required 
                    className="entradatexto" 
                    placeholder="Ej: Italia"
                />
              </div>
          </div>
          <div className="campo">
            <label htmlFor="fotoUrl">URL de la Foto (Opcional)</label>
            <input 
                type="text" 
                id="fotoUrl" 
                value={fotoUrl} 
                onChange={e => setFotoUrl(e.target.value)} 
                className="entradatexto" 
                placeholder="Pega aquí el enlace de una imagen (https://...)"
            />
            <small style={{color: '#6b7280', marginTop: '5px', display: 'block'}}>
                Si lo dejas vacío, pondremos una imagen por defecto.
            </small>
          </div>
          <div className="filafechas">
              <div className="campo mitad">
                <label htmlFor="fechalnicial">Fecha Ida</label>
                <input 
                    type="date" 
                    id="fechalnicial" 
                    value={fechalnicial} 
                    onChange={e => setFechalnicial(e.target.value)} 
                    required 
                    className="entradatexto inputfecha" 
                />
              </div>
              <div className="campo mitad">
                <label htmlFor="fechaFinal">Fecha Vuelta</label>
                <input 
                    type="date" 
                    id="fechaFinal" 
                    value={fechaFinal} 
                    onChange={e => setFechaFinal(e.target.value)} 
                    required 
                    className="entradatexto inputfecha" 
                />
              </div>
          </div>
          <div className="campo">
            <label htmlFor="descripcion">Descripción</label>
            <textarea 
                id="descripcion" 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                rows="3" 
                className="entradatexto areatexto" 
                placeholder="Cuéntanos los planes..."
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