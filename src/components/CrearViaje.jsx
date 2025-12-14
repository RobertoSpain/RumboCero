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
        urlFoto = 'https://cdn-icons-png.flaticon.com/512/2037/2037061.png';
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
            <h2 className="titulocrear">✨ Nuevo Rumbo</h2>
            <p className="subtitulocrear">Diseña tu próxima gran aventura.</p>
        </div>
        <form onSubmit={manejarCreacion} className="formularioviaje" role="form" aria-label="Formulario para crear viaje">
          <div className="filadoble">
              <div className="campo">
                <label htmlFor="name">🏷️ Título</label>
                <input 
                    type="text" id="name" value={name} onChange={e => setName(e.target.value)} 
                    required className="entradatexto" placeholder="Ej: Escapada a Roma..."
                    aria-required="true"/>
              </div>
              <div className="campo">
                <label htmlFor="destinoPrincipal">📍 Destino</label>
                <input 
                    type="text" id="destinoPrincipal" value={destinoPrincipal} onChange={e => setDestinoPrincipal(e.target.value)} 
                    required className="entradatexto" placeholder="Ej: Italia"
                    aria-required="true"/>
              </div>
          </div>
          <div className="campo">
            <span className="labeltitulo" id="label-foto">📸 Foto de Portada</span>
            <label htmlFor="ficheroupload" className={`zonasubida ${archivo ? 'archivoseleccionado' : ''}`} role="button" tabIndex="0">
                <span className="icononube">{archivo ? '✅' : '☁️'}</span>
                <span className="textosubida">
                    {archivo ? `Listo: ${archivo.name}` : "Pulsa para subir una fotaza"}
                </span>
            </label>
            
            <input 
                type="file" 
                id="ficheroupload" 
                onChange={(e) => setArchivo(e.target.files[0])} 
                accept="image/*" 
                className="inputoculto"
                aria-labelledby="label-foto"
            />
          </div>
          <div className="filafechas">
              <div className="campo mitad">
                <label htmlFor="fechalnicial">🛫 Ida</label>
                <input 
                    type="date" id="fechalnicial" value={fechalnicial} onChange={e => setFechalnicial(e.target.value)} 
                    required className="entradatexto inputfecha" 
                    aria-required="true"/>
              </div>
              <div className="campo mitad">
                <label htmlFor="fechaFinal">🛬 Vuelta</label>
                <input 
                    type="date" id="fechaFinal" value={fechaFinal} onChange={e => setFechaFinal(e.target.value)} 
                    required className="entradatexto inputfecha" 
                    aria-required="true"/>
              </div>
          </div>
          <div className="campo">
            <label htmlFor="descripcion">📝 Descripción</label>
            <textarea 
                id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} 
                rows="3" className="entradatexto areatexto" placeholder="Cuéntanos los planes..."
            ></textarea>
          </div>
          {error && (
            <div className="mensajeerror" role="alert" aria-live="assertive">
                ⚠️ {error}
            </div>
          )}
          
          <button type="submit" className="botonguardar" disabled={cargando} aria-busy={cargando}>
            {cargando ? '🚀 Subiendo...' : 'Crear Aventura'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearViaje;