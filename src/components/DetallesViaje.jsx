import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import '../assets/DetallesViaje.css';

export default function DetalleViaje() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados

  const [destinos, setDestinos] = useState([]);
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [categoria, setCategoria] = useState('Turismo');
  const [fotoDestino, setFotoDestino] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [nuevoItemMaleta, setNuevoItemMaleta] = useState('');
  const [clima, setClima] = useState(null);

  // 1. CARGAR DATOS

  useEffect(() => {
    const obtenerViaje = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'viajes', id));
        if (docSnap.exists()) setViaje({ id: docSnap.id, ...docSnap.data() });
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };

    obtenerViaje();
    const destinosRef = collection(db, 'viajes', id, 'destinos');
    const qDestinos = query(destinosRef, orderBy('createAt', 'desc'));
    const unsubscribeDestinos = onSnapshot(qDestinos, (snapshot) => {
      setDestinos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const checklistRef = collection(db, 'viajes', id, 'checklist');
    const qChecklist = query(checklistRef, orderBy('createAt', 'asc'));
    const unsubscribeChecklist = onSnapshot(qChecklist, (snapshot) => {
      setChecklist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
        unsubscribeDestinos();
        unsubscribeChecklist();
    };
  }, [id]);

  // 2. CLIMA (Open-Meteo)
  useEffect(() => {
    if (!viaje || !viaje.destinoPrincipal) return;
    const consultarClima = async () => {

        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${viaje.destinoPrincipal}&count=1&language=es&format=json`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
                const { latitude, longitude } = geoData.results[0];
                const climaRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`);
                const climaData = await climaRes.json();
                setClima(climaData.current);
            }
        } catch (error) { 
            console.error("Error clima:", error);
        }
    };
    consultarClima();
  }, [viaje]);

  // --- FUNCIONES ---//
  const agregarDestino = async (e) => {
    e.preventDefault();
    if (!nuevoDestino.trim()) return;
    try {
      await addDoc(collection(db, 'viajes', id, 'destinos'), {
        nombre: nuevoDestino, categoria: categoria, foto: fotoDestino, visitado: false, createAt: Timestamp.now()
      });
      setNuevoDestino(''); setFotoDestino('');
    } catch (error) { console.error(error); alert("Error al añadir destino"); }
  };

  const borrarDestino = async (idDestino) => {
    if (window.confirm("¿Borrar este destino?")) {
      await deleteDoc(doc(db, 'viajes', id, 'destinos', idDestino));
    }
  };

  const toggleVisitado = async (destino) => {
    await updateDoc(doc(db, 'viajes', id, 'destinos', destino.id), { visitado: !destino.visitado });
  };

  const agregarItemMaleta = async (e) => {
    e.preventDefault();
    if (!nuevoItemMaleta.trim()) return;
    try {
        await addDoc(collection(db, 'viajes', id, 'checklist'), {
            nombre: nuevoItemMaleta, preparado: false, createAt: Timestamp.now()
        });
        setNuevoItemMaleta('');
    } catch (error) { console.error(error); alert("Error al añadir a la maleta"); }
  };

  const borrarItemMaleta = async (idItem) => await deleteDoc(doc(db, 'viajes', id, 'checklist', idItem));
  const togglePreparado = async (item) => {
    await updateDoc(doc(db, 'viajes', id, 'checklist', item.id), { preparado: !item.preparado });
  };

  const getIconoClima = (codigo) => {
      if (codigo === 0) return '☀️';
      if (codigo > 0 && codigo < 45) return '⛅';
      if (codigo >= 45 && codigo < 51) return '🌫️';
      if (codigo >= 51 && codigo < 80) return '🌧️';
      if (codigo >= 80 && codigo < 90) return '🌦️';
      if (codigo >= 95) return '⛈️';
      return '🌡️';
  };

  if (loading) return <div className="paginacentrada">Cargando...</div>;
  if (!viaje) return <div className="paginacentrada">Viaje no encontrado</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';
  return (
    <div className="paginadetalle">
      {/* PORTADA */}
      <div className="seccionportada" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'})` }}>
        <div className="capahero"></div>
        <div className="contenidohero">
            <h1 className="titulohero">{viaje.name}</h1>
            <p className="subtitulohero">📍 {viaje.destinoPrincipal}</p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="contenedorprincipal">
        <div className="rejillainfo">
          <div className="columnaizquierda">
            {/* Tarjeta Plan */}
            <div className="tarjeta">
              <div className="titulotarjeta"><span className="iconotarjeta">📅</span> Plan</div>
              <div className="filafecha">
                  <div><p className="etiquetafecha">Ida</p><p className="valorfecha">{inicio}</p></div>
                  <div className="flecha">➔</div>
                  <div><p className="etiquetafecha">Vuelta</p><p className="valorfecha">{fin}</p></div>
              </div>
              <div className="cajadescripcion">"{viaje.descripcion || "Sin descripción."}"</div>
            </div>

            {/* Tarjeta Destinos */}
            <div className="tarjeta">
              <div className="titulotarjeta">
                <span className="iconotarjeta">🏙️</span> Destinos ({destinos.length})
              </div>
              <div className="contenedordestinos">
                {destinos.length === 0 && <p className="textovacio">No has añadido destinos aún.</p>}
                {destinos.map(dest => (
                  <div key={dest.id} className={`elementodestino ${dest.visitado ? 'visitado' : ''}`}>
                    <div className="infodestino">
                      <input type="checkbox" checked={dest.visitado} onChange={() => toggleVisitado(dest)} className="checkboxdestino"/>
                      {dest.foto && <img src={dest.foto} alt="mini" className="imagendestino" />}
                      <div>
                        <p className="nombredestino">{dest.nombre}</p>
                        <span className="etiquetadestino">{dest.categoria}</span>
                      </div>
                    </div>
                    <button onClick={() => borrarDestino(dest.id)} className="botonbasura">🗑️</button>
                  </div>
                ))}
              </div>
      <form onSubmit={agregarDestino} className="formulariodestino">
        <div className="filaflex">
         <input type="text" placeholder="Nombre del sitio..." value={nuevoDestino} onChange={e => setNuevoDestino(e.target.value)} className="inputdestino" required />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="selectdestino">
            <option value="Turismo">Turismo</option>
            <option value="Comida">Comida</option>
            <option value="Ocio">Ocio</option>
            <option value="Hotel">Hotel</option>
            </select>
              </div>
          <div className="filaflex">
            <input type="url" placeholder="URL Foto (Opcional)" value={fotoDestino} onChange={e => setFotoDestino(e.target.value)} className="inputurl" />
            <button type="submit" className="botonagregar">Añadir</button>
                </div>
              </form>
            </div>
          </div>
          {/* COLUMNA DERECHA */}
          <div className="columnaderecha">
              {/* Tarjeta Clima */}
              <div className="tarjeta tarjetaclima">
                  <div className="titulotarjeta"><span className="iconotarjeta">🌤️</span> Clima Actual</div>
                  {clima ? (
                    <div className="cajaclima">
                        <div className="textoclima">{clima.temperature_2m}°C</div>
                        <div className="iconoclima">{getIconoClima(clima.weather_code)}</div>
                        <div className="textoviento">💨 Viento: {clima.wind_speed_10m} km/h</div>
                    </div>
                  ) : (
          <div className="cargandoclima">Consultando satélites...</div>
            )}
          </div>
              {/* Tarjeta Maleta */}
        <div className="tarjeta">
              <div className="titulotarjeta">
            <span className="iconotarjeta">🎒</span> Maleta ({checklist.filter(i => i.preparado).length}/{checklist.length})
          </div>
      <div className="listamaleta">
           {checklist.length === 0 && <p className="textovacio">Añade cosas a tu maleta.</p>}
           {checklist.map(item => (
        <div key={item.id} className="itemmaleta" style={{opacity: item.preparado ? 0.5 : 1}}>
               <label className="labelmaleta">
               <input type="checkbox" checked={item.preparado} onChange={() => togglePreparado(item)} className="checkboxmaleta"/>
              <span style={{textDecoration: item.preparado ? 'line-through' : 'none'}}>{item.nombre}</span>
            </label>
           <button onClick={() => borrarItemMaleta(item.id)} className="botonborraritem">✕</button>
       </div>
        ))}
         </div>
          <form onSubmit={agregarItemMaleta} className="formulariomaleta">
         <input type="text" placeholder="Ej: Pasaporte..." value={nuevoItemMaleta} onChange={e => setNuevoItemMaleta(e.target.value)} className="inputmaleta" required/>
         <button type="submit" className="botonmas">+</button>
       </form>
       </div>
     </div>
    </div>
   </div>
  </div>);
} 