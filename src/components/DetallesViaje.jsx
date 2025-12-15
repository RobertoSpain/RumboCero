import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <--- AÑADIDO useNavigate
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, updateDoc, arrayUnion, getDocs, where, serverTimestamp, arrayRemove } from 'firebase/firestore'; // <--- AÑADIDO arrayRemove
import { getAuth } from 'firebase/auth'; // <--- AÑADIDO para saber quién eres
import { db } from '../firebase.js'; 
import '../assets/DetallesViaje.css'; 

export default function DetalleViaje() {
  const { id } = useParams();
  const navigate = useNavigate(); // <--- AÑADIDO
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinos, setDestinos] = useState([]);
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [categoria, setCategoria] = useState('Turismo');
  const [nuevaUrlDestino, setNuevaUrlDestino] = useState(''); 
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

    const qDest = query(collection(db, 'viajes', id, 'destinos'), orderBy('createdAt', 'desc'));
    const unsubDest = onSnapshot(qDest, (s) => setDestinos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qCheck = query(collection(db, 'viajes', id, 'checklist'), orderBy('createdAt', 'asc')); 
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

  useEffect(() => {
    if (!viaje?.participantes) return; 
    const cargarAmigos = async () => {
        const listaTemp = [];
        for (const uid of viaje.participantes) {
            try {
                const docRef = doc(db, 'usuarios', uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) listaTemp.push(snap.data().email);
                else listaTemp.push('Desconocido');
            } catch (error) { console.error(error); }
        }
        setListaAmigos(listaTemp);
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
        const uidAmigo = querySnapshot.docs[0].id;
        await updateDoc(doc(db, 'viajes', id), { participantes: arrayUnion(uidAmigo) });
        setListaAmigos([...listaAmigos, emailAmigo]); 
        alert(`✅ ${emailAmigo} añadido.`);
    } catch (error) { console.error(error); alert("Error al invitar."); }
  };

  // --- NUEVA FUNCION SALIR ---
  const salirDelViaje = async () => {
      if(!confirm("¿Seguro que quieres salir de este viaje?")) return;
      try {
          const auth = getAuth();
          if(!auth.currentUser) return alert("Error: No estás logueado.");
          
          // Borramos tu ID del array 'participantes'
          await updateDoc(doc(db, 'viajes', id), {
              participantes: arrayRemove(auth.currentUser.uid)
          });
          alert("Has salido del viaje.");
          navigate('/'); // Te manda al home
      } catch (error) {
          console.error(error);
          alert("Error al salir.");
      }
  };
  // ---------------------------

  const agregarEvento = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) return;
    try {
        await addDoc(collection(db, 'viajes', id, 'eventos'), {
            titulo: nuevoEvento.titulo,
            fecha: Timestamp.fromDate(new Date(nuevoEvento.fecha)),
            createdAt: serverTimestamp()
        });
        setNuevoEvento({ titulo: '', fecha: '' });
    } catch (error) { console.error(error); }
  };
  const borrarEvento = async (idEv) => { if(confirm("¿Eliminar?")) await deleteDoc(doc(db, 'viajes', id, 'eventos', idEv)); };
  const agregarDestino = async (e) => { 
    e.preventDefault(); 
    if(!nuevoDestino) return; 
    try {
        const urlFinal = nuevaUrlDestino.trim() !== '' 
            ? nuevaUrlDestino 
            : 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
        await addDoc(collection(db,'viajes',id,'destinos'),{ 
            nombre: nuevoDestino, 
            categoria, 
            foto: urlFinal, 
            visitado: false, 
            createdAt: serverTimestamp() 
        }); 
        setNuevoDestino(''); 
        setNuevaUrlDestino(''); 
    } catch (error) { console.error(error); alert("Error al añadir sitio."); }
  };
  
  const borrarDestino = async (idD) => { if(confirm("¿Borrar?")) await deleteDoc(doc(db,'viajes',id,'destinos',idD)); };
  const toggleVisitado = async (d) => updateDoc(doc(db,'viajes',id,'destinos',d.id),{visitado:!d.visitado});
  const agregarItem = async (e) => { 
      e.preventDefault(); 
      if(!nuevoItemMaleta) return; 
      await addDoc(collection(db,'viajes',id,'checklist'),{
          nombre:nuevoItemMaleta,
          preparado:false,
          createdAt: serverTimestamp()
      }); 
      setNuevoItemMaleta(''); 
  };
  const borrarItem = async (idI) => deleteDoc(doc(db,'viajes',id,'checklist',idI));
  const togglePreparado = async (i) => updateDoc(doc(db,'viajes',id,'checklist',i.id),{preparado:!i.preparado});
  const getIconoClima = (c) => {
    if (c === 0) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:40, height:40}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>; 
    if (c < 45) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:40, height:40}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>; 
    if (c < 80) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:40, height:40}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L12 24.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5L8.25 24.75" /></svg>; 
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:40, height:40}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
  };

  if (loading || !viaje) return <div className="paginacentrada" role="status">Cargando detalles del viaje...</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';

  return (
    <div className="paginadetalle">
      <div className="seccionportada" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'})` }} role="img" aria-label={`Portada del viaje: ${viaje.name}`}>
        <div className="capahero"></div>
        <div className="contenidohero">
            <h1 className="titulohero">{viaje.name}</h1>
            <div className="ubicacion-hero" style={{display:'flex', alignItems:'center', gap:'5px', marginTop:'10px'}}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
               <p className="subtitulohero">{viaje.destinoPrincipal}</p>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                <button onClick={invitarAmigo} className="boton-invitar" aria-label="Invitar a un amigo al viaje">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'18px', marginRight:'5px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 15c0-1.678 4.5-1.53 4.5-1.53s.18.528.32 1.05a7.5 7.5 0 0113.844-3.17" /></svg>
                    Invitar
                </button>
                {/* --- BOTON SALIR --- */}
                <button onClick={salirDelViaje} style={{background:'rgba(255,0,0,0.7)', color:'white', border:'none', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', display:'flex', alignItems:'center'}}>
                    Salir
                </button>
            </div>
        </div>
      </div>
      <div className="contenedorprincipal">
        {/* GALERÍA */}
        {destinos.some(d => d.foto) && (
            <div className="seccion-galeria" aria-label="Galería de fotos de los sitios">
                <h3 className="titulo-galeria">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    Galería
                </h3>
                <div className="carrusel-fotos">
                    {destinos.filter(d => d.foto).map(dest => (
                        <a key={dest.id} href={dest.foto} target="_blank" rel="noopener noreferrer" className="tarjeta-foto" aria-label={`Ver foto de ${dest.nombre}`}>
                            <img src={dest.foto} alt={`Foto de ${dest.nombre}`} />
                            <div className="overlay-foto"><span>{dest.nombre} ↗</span></div>
                        </a>
                    ))}
                </div>
            </div>
        )}   
        <div className="rejillainfo">
          <div className="columnaizquierda">
            <div className="tarjeta">
                <div className="titulotarjeta">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    Fechas
                </div>
                <div className="filafecha">
                    <div><p className="etiquetafecha">Ida</p><p className="valorfecha">{inicio}</p></div>
                    <div className="flecha"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></div>
                    <div><p className="etiquetafecha">Vuelta</p><p className="valorfecha">{fin}</p></div>
                </div>
                <p className="cajadescripcion">"{viaje.descripcion || 'Sin notas.'}"</p>
            </div>
            {/* Agenda */}
            <div className="tarjeta">
                <div className="titulotarjeta">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Agenda
                </div>
                <div className="contenedordestinos">
                    {eventos.map(ev => (
                        <div key={ev.id} className="item-agenda">
                            <div className="fecha-caja">
                                <div className="dia-mes">{ev.fechaJs.getDate()}/{ev.fechaJs.getMonth()+1}</div>
                                <div className="hora-evento">{ev.fechaJs.getHours()}:{ev.fechaJs.getMinutes().toString().padStart(2,'0')}</div>
                            </div>
                            <div className="titulo-evento">{ev.titulo}</div>
                            <button onClick={() => borrarEvento(ev.id)} className="botonbasura" aria-label={`Borrar evento ${ev.titulo}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
                <form onSubmit={agregarEvento} className="form-agenda">
                    <div className="filaflex">
                        <input type="datetime-local" value={nuevoEvento.fecha} onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} className="inputdestino" required aria-label="Fecha y hora del evento" />
                    </div>
                    <div className="filaflex">
                        <input type="text" placeholder="Título..." value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} className="inputdestino" required aria-label="Título del evento" />
                        <button type="submit" className="botonagregar" aria-label="Añadir evento">OK</button>
                    </div>
                </form>
            </div>
            {/* SITIOS */}
            <div className="tarjeta">
              <div className="titulotarjeta">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                  Sitios
              </div> 
              <div className="contenedordestinos">
                {destinos.map(d => (
                  <div key={d.id} className={`elementodestino ${d.visitado ? 'visitado' : ''}`}>
                    <div className="infodestino">
                      <input type="checkbox" checked={d.visitado} onChange={() => toggleVisitado(d)} className="checkboxdestino" aria-label={`Marcar ${d.nombre} como visitado`} />
                      {d.foto && <img src={d.foto} alt="" className="imagendestino" />}
                      <div><p className="nombredestino">{d.nombre}</p><span className="etiquetadestino">{d.categoria}</span></div>
                    </div>
                    <button onClick={() => borrarDestino(d.id)} className="botonbasura" aria-label={`Borrar sitio ${d.nombre}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                ))} 
              </div>
              <form onSubmit={agregarDestino} className="formulariodestino">
                 <div className="filaflex">
                    <input type="text" placeholder="Sitio..." value={nuevoDestino} onChange={e => setNuevoDestino(e.target.value)} className="inputdestino" required aria-label="Nombre del sitio" />
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} className="selectdestino" aria-label="Categoría del sitio"><option>Turismo</option><option>Comida</option><option>Ocio</option></select>
                 </div>
                 <div className="filaflex" style={{marginTop:'10px'}}>
                    <input type="text" placeholder="Pegar URL de la foto..." value={nuevaUrlDestino} onChange={e => setNuevaUrlDestino(e.target.value)} className="inputurl" aria-label="URL de la foto del sitio (opcional)" />
                    <button type="submit" className="botonagregar" aria-label="Añadir sitio">Añadir</button>
                 </div>
              </form>
            </div>
          </div>
          <div className="columnaderecha">
              {listaAmigos.length > 0 && (
                <div className="tarjeta">
                    <div className="titulotarjeta">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                        Viajeros
                    </div>
                    <div className="lista-emails" style={{ marginTop: '15px' }}>
                        {listaAmigos.map((e, i) => (
                            <span key={i} className="badge-email" style={{background:'#f3f4f6', color:'#374151', border:'1px solid #e5e7eb'}}>
                                {e}
                            </span>
                        ))}
                    </div>
                </div>
              )}
              <div className="tarjeta tarjetaclima">
                  <div className="titulotarjeta">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12-6a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Clima
                  </div>
                  {clima ? (
                    <div className="cajaclima" aria-label={`Clima actual: ${clima.temperature_2m} grados`}>
                        <div className="textoclima">{clima.temperature_2m}°C</div>
                        <div className="iconoclima">{getIconoClima(clima.weather_code)}</div>
                        <div className="textoviento">💨 {clima.wind_speed_10m} km/h</div>
                    </div>
                  ) : <div className="cargandoclima">Cargando...</div>}
              </div>
              {/* Maleta */}
              <div className="tarjeta">
                <div className="titulotarjeta">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25a3 3 0 00-3-3 3 3 0 00-3 3v.248m6 0c.965.059 1.915.148 2.85.265 1.086.143 1.905 1.096 1.905 2.195v3.25" /></svg>
                  Maleta ({checklist.filter(i=>i.preparado).length}/{checklist.length})
                </div>
                <div className="listamaleta">
                  {checklist.map(i => (
                    <div key={i.id} className={`itemmaleta ${i.preparado ? 'completado' : ''}`}>
                      <label className="labelmaleta">
                          <input type="checkbox" checked={i.preparado} onChange={() => togglePreparado(i)} className="checkboxmaleta" aria-label={`Marcar ${i.nombre} como preparado`} />
                          <span>{i.nombre}</span>
                      </label>
                      <button onClick={() => borrarItem(i.id)} className="botonborraritem" aria-label={`Borrar item ${i.nombre}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={agregarItem} className="formulariomaleta">
                    <input type="text" placeholder="Item..." value={nuevoItemMaleta} onChange={e => setNuevoItemMaleta(e.target.value)} className="inputmaleta" required aria-label="Nombre del item para la maleta" />
                    <button type="submit" className="botonmas" aria-label="Añadir item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px'}} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                </form>
              </div> 
          </div>
        </div>
      </div>
    </div>
  );
}