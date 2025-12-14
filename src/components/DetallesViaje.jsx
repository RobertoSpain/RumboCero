import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, updateDoc, arrayUnion, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { db, storage } from '../firebase.js'; 
import '../assets/DetallesViaje.css'; 

export default function DetalleViaje() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinos, setDestinos] = useState([]);
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [categoria, setCategoria] = useState('Turismo');
    const [archivoDestino, setArchivoDestino] = useState(null);
  const [subiendo, setSubiendo] = useState(false); 
  const [resetKey, setResetKey] = useState(0); 
  const [checklist, setChecklist] = useState([]);
  const [nuevoItemMaleta, setNuevoItemMaleta] = useState('');
  const [clima, setClima] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', fecha: '' });
  const [listaAmigos, setListaAmigos] = useState([]); 
  // --- CARGA DE DATOS ---
  useEffect(() => {
    const obtenerViaje = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'viajes', id));
        if (docSnap.exists()) setViaje({ id: docSnap.id, ...docSnap.data() });
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    obtenerViaje();
    const qDest = query(collection(db, 'viajes', id, 'destinos'), orderBy('createAt', 'desc'));
    const unsubDest = onSnapshot(qDest, (s) => setDestinos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qCheck = query(collection(db, 'viajes', id, 'checklist'), orderBy('createAt', 'asc')); 
    const unsubCheck = onSnapshot(qCheck, (s) => setChecklist(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qEventos = query(collection(db, 'viajes', id, 'eventos'), orderBy('fecha', 'asc'));
    const unsubEventos = onSnapshot(qEventos, (s) => {
        setEventos(s.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            fechaJs: d.data().fecha?.toDate ? d.data().fecha.toDate() : new Date() 
        })));
    });
    return () => { unsubDest(); unsubCheck(); unsubEventos(); };
  }, [id]);

  // --- AMIGOS Y CLIMA ---
  useEffect(() => {
    if (!viaje?.participantes) return; 
    const cargarAmigos = async () => {
        try {
            const promesas = viaje.participantes.map(uid => getDoc(doc(db, 'usuarios', uid)));
            const snapshots = await Promise.all(promesas);
            setListaAmigos(snapshots.map(snap => snap.exists() ? snap.data().email : 'Desconocido'));
        } catch (error) { console.error(error); }
    };
    cargarAmigos();
  }, [viaje]);
  useEffect(() => {
    if (!viaje?.destinoPrincipal) return;
    const cargarClima = async () => {
        try {
            const geo = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${viaje.destinoPrincipal}&count=1&language=es&format=json`)).json();
            if (geo.results?.[0]) {
                const { latitude, longitude } = geo.results[0];
                const datos = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`)).json();
                setClima(datos.current);
            }
        } catch (error) { console.error(error); }
    };
    cargarClima();
  }, [viaje]);
  // --- FUNCIONES ---
  const invitarAmigo = async () => {
    const emailAmigo = prompt("Introduce el email de tu amigo:");
    if (!emailAmigo) return;
    try {
        const q = query(collection(db, 'usuarios'), where('email', '==', emailAmigo));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return alert("❌ Usuario no encontrado.");
        await updateDoc(doc(db, 'viajes', id), { participantes: arrayUnion(querySnapshot.docs[0].id) });
        alert(`✅ ${emailAmigo} añadido.`);
    } catch (error) { console.error("Error al invitar:", error); alert("Error al invitar."); }
  };
  const agregarEvento = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) return;
    try {
        await addDoc(collection(db, 'viajes', id, 'eventos'), {
            titulo: nuevoEvento.titulo,
            fecha: Timestamp.fromDate(new Date(nuevoEvento.fecha)),
            createAt: Timestamp.now()
        });
        setNuevoEvento({ titulo: '', fecha: '' });
    } catch (error) { console.error(error); }
  };
  
  const borrarEvento = async (idEv) => { if(confirm("¿Eliminar?")) await deleteDoc(doc(db, 'viajes', id, 'eventos', idEv)); };
  const agregarDestino = async (e) => { 
    e.preventDefault(); 
    if(!nuevoDestino) return; 
    setSubiendo(true); 

    try {
        let urlFoto = '';
        if (archivoDestino) {
            const storageRef = ref(storage, `destinos/${Date.now()}-${archivoDestino.name}`);
            const snapshot = await uploadBytes(storageRef, archivoDestino);
            urlFoto = await getDownloadURL(snapshot.ref);
        }
        await addDoc(collection(db,'viajes',id,'destinos'),{
            nombre: nuevoDestino,
            categoria,
            foto: urlFoto, 
            visitado: false,
            createAt: Timestamp.now()
        }); 
        setNuevoDestino(''); 
        setArchivoDestino(null);
        setResetKey(prev => prev + 1); 
    } catch (error) {
        console.error("Error:", error);
        alert("Error al subir el destino.");
    } finally {
        setSubiendo(false);
    }
  };

  const borrarDestino = async (idD) => { if(confirm("¿Borrar?")) await deleteDoc(doc(db,'viajes',id,'destinos',idD)); };
  const toggleVisitado = async (d) => updateDoc(doc(db,'viajes',id,'destinos',d.id),{visitado:!d.visitado});
  const agregarItem = async (e) => { e.preventDefault(); if(!nuevoItemMaleta) return; await addDoc(collection(db,'viajes',id,'checklist'),{nombre:nuevoItemMaleta,preparado:false,createAt:Timestamp.now()}); setNuevoItemMaleta(''); };
  const borrarItem = async (idI) => deleteDoc(doc(db,'viajes',id,'checklist',idI));
  const togglePreparado = async (i) => updateDoc(doc(db,'viajes',id,'checklist',i.id),{preparado:!i.preparado});
  const getIconoClima = (c) => c===0?'☀️':c<45?'⛅':c<80?'🌧️':'⛈️';
  if (loading || !viaje) return <div className="paginacentrada">Cargando...</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';

  return (
    <div className="paginadetalle">
      <div className="seccionportada" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'})` }}>
        <div className="capahero"></div>
        <div className="contenidohero">
            <h1 className="titulohero">{viaje.name}</h1>
            <p className="subtitulohero">📍 {viaje.destinoPrincipal}</p>
            <button onClick={invitarAmigo} className="boton-invitar">➕ Invitar Amigos</button>
            {listaAmigos.length > 0 && (
                <div className="caja-viajeros">
                    <p className="titulo-viajeros">👥 Viajeros:</p>
                    <div className="lista-emails">{listaAmigos.map((e, i) => <span key={i} className="badge-email">{e}</span>)}</div>
                </div>
            )}
        </div>
      </div>
      <div className="contenedorprincipal">
        {/* CARRUSEL */}
        {destinos.some(d => d.foto) && (
            <div className="seccion-galeria">
                <h3 className="titulo-galeria">📸 Galería del Viaje</h3>
                <div className="carrusel-fotos">
                    {destinos.filter(d => d.foto).map(dest => (
                        <a key={dest.id} href={dest.foto} target="_blank" rel="noopener noreferrer" className="tarjeta-foto">
                            <img src={dest.foto} alt={dest.nombre} />
                            <div className="overlay-foto"><span>{dest.nombre} ↗</span></div>
                        </a>
                    ))}
                </div>
            </div>
        )}
        
        <div className="rejillainfo">
          <div className="columnaizquierda">
            <div className="tarjeta">
              <div className="titulotarjeta"><span className="iconotarjeta">📅</span> Fechas</div>
              <div className="filafecha">
                  <div><p className="etiquetafecha">Ida</p><p className="valorfecha">{inicio}</p></div>
                  <div className="flecha">➔</div>
                  <div><p className="etiquetafecha">Vuelta</p><p className="valorfecha">{fin}</p></div>
              </div>
              <p className="cajadescripcion">"{viaje.descripcion || 'Sin notas.'}"</p>
            </div>
            <div className="tarjeta">
                <div className="titulotarjeta"><span className="iconotarjeta">📆</span> Agenda</div>
                <div className="contenedordestinos">
                    {eventos.map(ev => (
                        <div key={ev.id} className="item-agenda">
                            <div className="fecha-caja">
                                <div className="dia-mes">{ev.fechaJs.getDate()}/{ev.fechaJs.getMonth()+1}</div>
                                <div className="hora-evento">{ev.fechaJs.getHours()}:{ev.fechaJs.getMinutes().toString().padStart(2,'0')}</div>
                            </div>
                            <div className="titulo-evento">{ev.titulo}</div>
                            <button onClick={() => borrarEvento(ev.id)} className="botonbasura">×</button>
                        </div>
                    ))}
                </div>
                <form onSubmit={agregarEvento} className="form-agenda">
                   <div className="filaflex">
                       <input type="datetime-local" value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} className="inputdestino" required />
                   </div>
                   <div className="filaflex">
                       <input type="text" placeholder="Título..." value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} className="inputdestino" required />
                       <button type="submit" className="botonagregar">OK</button>
                   </div>
                </form>
            </div>
            {/* --- TARJETA DESTINOS --- */}
            <div className="tarjeta">
              <div className="titulotarjeta"><span className="iconotarjeta">🏙️</span> Sitios de interés</div> 
              <div className="contenedordestinos">
                {destinos.map(d => (
                  <div key={d.id} className={`elementodestino ${d.visitado ? 'visitado' : ''}`}>
                    <div className="infodestino">
                      <input type="checkbox" checked={d.visitado} onChange={() => toggleVisitado(d)} className="checkboxdestino"/>
                      {d.foto && <img src={d.foto} alt="mini" className="imagendestino" />}
                      <div>
                        <p className="nombredestino">{d.nombre}</p>
                        <span className="etiquetadestino">{d.categoria}</span>
                      </div>
                    </div>
                    <button onClick={() => borrarDestino(d.id)} className="botonbasura">🗑️</button>
                  </div>
                ))} 
              </div>
              <form onSubmit={agregarDestino} className="formulariodestino">
                 <div className="filaflex">
                    <input type="text" placeholder="Nombre del sitio..." value={nuevoDestino} onChange={e => setNuevoDestino(e.target.value)} className="inputdestino" required />
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} className="selectdestino">
                       <option>Turismo</option><option>Comida</option><option>Ocio</option>
                    </select>
                 </div>
                 {/* ZONA DE SUBIDA MEJORADA Y ACCESIBLE */}
                 <div className="cajafoto">
                     <label 
                        htmlFor="ficherodestino" 
                        className={`zonasubidadestino ${archivoDestino ? 'archivoseleccionado' : ''}`}
                        role="button" 
                        aria-label="Seleccionar fotografía para el destino"
                     >
                        <span className="icono">{archivoDestino ? '✅' : '📷'}</span>
                        <span className="texto">{archivoDestino ? archivoDestino.name : "Añadir foto"}</span>
                     </label>
                     <input 
                        key={resetKey} 
                        type="file" 
                        id="ficherodestino"
                        accept="image/*"
                        onChange={e => setArchivoDestino(e.target.files[0])} 
                        className="inputoculto" 
                     />
                 </div>
                 <button type="submit" className="botonagregar" disabled={subiendo} style={{ marginTop: '10px' }}>
                    {subiendo ? '⏳' : 'Añadir Sitio'}
                 </button>
              </form>
            </div>
          </div>
          <div className="columnaderecha">
              <div className="tarjeta tarjetaclima">
                  <div className="titulotarjeta"><span className="iconotarjeta">🌤️</span> Clima</div>
                  {clima ? (
                    <div className="cajaclima">
                        <div className="textoclima">{clima.temperature_2m}°C</div>
                        <div className="iconoclima">{getIconoClima(clima.weather_code)}</div>
                        <div className="textoviento">💨 {clima.wind_speed_10m} km/h</div>
                    </div>
                  ) : <div className="cargandoclima">Cargando...</div>}
              </div>
              <div className="tarjeta">
                <div className="titulotarjeta">
                  <span className="iconotarjeta">🎒</span> Maleta ({checklist.filter(i=>i.preparado).length}/{checklist.length})
                </div>
                <div className="listamaleta">
                  {checklist.map(i => (
                    <div key={i.id} className={`itemmaleta ${i.preparado ? 'completado' : ''}`}>
                      <label className="labelmaleta">
                          <input type="checkbox" checked={i.preparado} onChange={() => togglePreparado(i)} className="checkboxmaleta"/>
                          <span>{i.nombre}</span>
                      </label>
                      <button onClick={() => borrarItem(i.id)} className="botonborraritem">✕</button>
                    </div>
                  ))}
                </div>
                <form onSubmit={agregarItem} className="formulariomaleta">
                    <input type="text" placeholder="Item..." value={nuevoItemMaleta} onChange={e => setNuevoItemMaleta(e.target.value)} className="inputmaleta" required/>
                    <button type="submit" className="botonmas">+</button>
                </form>
              </div> 
          </div>
        </div>
      </div>
    </div>
  );
}