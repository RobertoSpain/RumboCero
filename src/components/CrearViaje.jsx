import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { auth, db, storage } from "../firebase.js"; 
import '../assets/CrearViaje.css';

function CrearViaje() {
  const [name, setName] = useState('');
  const [destinoPrincipal, setDestinoPrincipal] = useState('');
  const [fechalnicial, setFechalnicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
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

    if (!userId) { setError("Error: No estás autenticado."); setCargando(false); return; }
    if (!name || !destinoPrincipal || !fechalnicial || !fechaFinal) { setError('Rellena los campos obligatorios.'); setCargando(false); return; }
    const inicio = new Date(fechalnicial);
    const fin = new Date(fechaFinal);
    if (inicio > fin) { setError('La vuelta no puede ser antes de la ida.'); setCargando(false); return; }

    try {
      let urlFoto = '';
      if (archivo) {
        const storageRef = ref(storage, `viajes/${Date.now()}-${archivo.name}`);
        const snapshot = await uploadBytes(storageRef, archivo);
        urlFoto = await getDownloadURL(snapshot.ref);
      } else {
        urlFoto = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80';
      }

      await addDoc(collection(db, "viajes"), {
        name: name,
        destinoPrincipal: destinoPrincipal,
        fechalnicial: Timestamp.fromDate(inicio), 
        fechaFinal: Timestamp.fromDate(fin),
        descripcion: descripcion,
        foto: urlFoto, 
        participantes: [userId], 
        owner: userId, 
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
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="entradatexto" placeholder="Ej: Escapada a Roma..."/>
              </div>
              <div className="campo">
                <label htmlFor="destinoPrincipal">Destino Principal</label>
                <input type="text" id="destinoPrincipal" value={destinoPrincipal} onChange={e => setDestinoPrincipal(e.target.value)} required className="entradatexto" placeholder="Ej: Italia"/>
              </div>
          </div>
          <div className="campo">
            <span className="labeltitulo" id="label-foto">Foto de Portada</span>
                        <label htmlFor="ficheroupload" className={`zonasubida ${archivo ? 'archivoseleccionado' : ''}`} role="button" tabIndex="0">
                <div className="iconosvg">
                    {archivo ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    )}
                </div>
                <span className="textosubida">
                    {archivo ? `Archivo seleccionado: ${archivo.name}` : "Haz clic para subir imagen"}
                </span>
            </label>
            
            <input type="file" id="ficheroupload" onChange={(e) => setArchivo(e.target.files[0])} accept="image/*" className="inputoculto" />
          </div>
          <div className="filafechas">
              <div className="campo mitad">
                <label htmlFor="fechalnicial">Fecha Ida</label>
                <input type="date" id="fechalnicial" value={fechalnicial} onChange={e => setFechalnicial(e.target.value)} required className="entradatexto inputfecha" />
              </div>
              <div className="campo mitad">
                <label htmlFor="fechaFinal">Fecha Vuelta</label>
                <input type="date" id="fechaFinal" value={fechaFinal} onChange={e => setFechaFinal(e.target.value)} required className="entradatexto inputfecha" />
              </div>
          </div>
          <div className="campo">
            <label htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="3" className="entradatexto areatexto" placeholder="Cuéntanos los planes..."></textarea>
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