import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js'; 
import '../assets/DetallesViaje.css'; 

export default function DetalleViaje() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinos, setDestinos] = useState([]);
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [categoria, setCategoria] = useState('Turismo');
  const [fotoDestino, setFotoDestino] = useState(''); 
  const [checklist, setChecklist] = useState([]);
  const [nuevoItemMaleta, setNuevoItemMaleta] = useState('');

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

    // 3. Cargar CHECKLIST en tiempo real (Subcolección nueva)
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

  const agregarDestino = async (e) => {
    e.preventDefault();
    if (!nuevoDestino.trim()) return;
    try {
      await addDoc(collection(db, 'viajes', id, 'destinos'), {
        nombre: nuevoDestino,
        categoria: categoria,
        foto: fotoDestino,
        visitado: false,
        createAt: Timestamp.now()
      });
      setNuevoDestino('');
      setFotoDestino('');
    } catch (error) { 
        console.error("Error al añadir destino:", error); 
        alert("Error al añadir destino"); 
    }
  };
  const borrarDestino = async (idDestino) => {
    if (window.confirm("¿Borrar este destino?")) {
      await deleteDoc(doc(db, 'viajes', id, 'destinos', idDestino));
    }
  };
  const toggleVisitado = async (destino) => {
    await updateDoc(doc(db, 'viajes', id, 'destinos', destino.id), {
      visitado: !destino.visitado
    });
  };

  const agregarItemMaleta = async (e) => {
    e.preventDefault();
    if (!nuevoItemMaleta.trim()) return;
    try {
        await addDoc(collection(db, 'viajes', id, 'checklist'), {
            nombre: nuevoItemMaleta,
            preparado: false,
            createAt: Timestamp.now()
        });
        setNuevoItemMaleta('');
    } catch (error) { 
        console.error("Error al añadir a la maleta:", error); 
        alert("Error al añadir a la maleta"); 
    }
  };
  const borrarItemMaleta = async (idItem) => {
    await deleteDoc(doc(db, 'viajes', id, 'checklist', idItem));
  };
  const togglePreparado = async (item) => {
    await updateDoc(doc(db, 'viajes', id, 'checklist', item.id), {
        preparado: !item.preparado
    });
  };

  if (loading) return <div className="paginacentrada">Cargando...</div>;
  if (!viaje) return <div className="paginacentrada">Viaje no encontrado</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';

  return (
    <div className="paginadetalle">
      {/* PORTADA (HERO) */}
      <div className="seccionportada" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'})` }}>
        <div className="capahero"></div>
        <div className="contenidohero">
            <h1 className="titulohero">{viaje.name}</h1>
            <p className="subtitulohero">📍 {viaje.destinoPrincipal}</p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="contenedorprincipal">
        <Link to="/viajes" className="botonvolver"> &larr; Volver </Link>
        
        <div className="rejillainfo">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="columnaizquierda">
            <div className="tarjeta">
              <div className="titulotarjeta"><span className="iconotarjeta">📅</span> Plan</div>
              <div className="filafecha">
                  <div><p className="etiquetafecha">Ida</p><p className="valorfecha">{inicio}</p></div>
                  <div className="flecha">➔</div>
                  <div><p className="etiquetafecha">Vuelta</p><p className="valorfecha">{fin}</p></div>
              </div>
              <div className="cajadescripcion">"{viaje.descripcion || "Sin descripción."}"</div>
            </div>

            <div className="tarjeta">
              <div className="titulotarjeta">
                <span className="iconotarjeta">🏙️</span> Destinos ({destinos.length})
              </div> 
              <div className="contenedordestinos">
                {destinos.length === 0 && <p className="textovacio">No has añadido destinos aún.</p>}
                {destinos.map(dest => (
                  <div key={dest.id} className={`elementodestino ${dest.visitado ? 'visitado' : ''}`}>
                    <div className="infodestino">
                      <input 
                        type="checkbox" 
                        checked={dest.visitado} 
                        onChange={() => toggleVisitado(dest)}
                        className="checkboxdestino"/>
                      {dest.foto && <img src={dest.foto} alt="mini" style={{width:'40px', height:'40px', borderRadius:'4px', objectFit:'cover'}} />}
                      <div>
                        <p className="nombredestino">{dest.nombre}</p>
                        <span className="etiquetadestino">{dest.categoria}</span>
                      </div>
                    </div>
                    <button onClick={() => borrarDestino(dest.id)} className="botonbasura">🗑️</button>
                  </div>
                ))} 
              </div>
              
              <form onSubmit={agregarDestino} className="formulariodestino" style={{flexDirection: 'column'}}>
                <div style={{display:'flex', gap:'10px'}}>
                   <input type="text" placeholder="Nombre del sitio..." value={nuevoDestino} onChange={e => setNuevoDestino(e.target.value)} className="inputdestino" required />
                   <select value={categoria} onChange={e => setCategoria(e.target.value)} className="selectdestino">
                      <option value="Turismo">Turismo</option>
                      <option value="Comida">Comida</option>
                      <option value="Ocio">Ocio</option>
                      <option value="Hotel">Hotel</option>
                   </select>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <input type="url" placeholder="URL Foto (Opcional)" value={fotoDestino} onChange={e => setFotoDestino(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none', fontSize:'0.9rem'}} />
                    <button type="submit" className="botonagregar" style={{width: '100px', fontSize: '1rem'}}>Añadir</button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
    <div className="columnaderecha">
          <div className="tarjeta tarjetaclima">
           <div className="titulotarjeta"><span className="iconotarjeta">🌤️</span> Clima</div>
            <div style={{fontSize:'2rem', fontWeight:'bold'}}>--°C</div>
    </div>
    <div className="tarjeta">
     <div className="titulotarjeta">
      <span className="iconotarjeta">🎒</span> Maleta ({checklist.filter(i => i.preparado).length}/{checklist.length})
    </div>
    <div className="contenedormaleta" style={{display:'flex', flexDirection:'column', gap:'8px', maxHeight:'300px', overflowY:'auto', marginBottom:'15px'}}>
    {checklist.length === 0 && <p className="textovacio">Añade cosas a tu maleta.</p>}
    {checklist.map(item => (
      <div key={item.id} className="elementomaleta" style={{display:'flex', justifyContent:'space-between', alignItems:'center', opacity: item.preparado ? 0.5 : 1}}>
      <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', flex:1}}>
      <input type="checkbox" 
         checked={item.preparado} 
          onChange={() => togglePreparado(item)}
          style={{width:'18px', height:'18px', accentColor:'#0d9488'}}/>
             <span style={{textDecoration: item.preparado ? 'line-through' : 'none'}}>{item.nombre}</span>
             </label>
             <button onClick={() => borrarItemMaleta(item.id)} style={{border:'none', background:'transparent', color:'#ef4444', cursor:'pointer'}}>✕</button>
            </div> ))}
          </div>
          <form onSubmit={agregarItemMaleta} style={{display:'flex', gap:'5px'}}>
          <input type="text" 
          placeholder="Ej: Pasaporte..." 
        value={nuevoItemMaleta}
       onChange={e => setNuevoItemMaleta(e.target.value)}
         style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none'}}
          required/>
        <button type="submit" style={{backgroundColor:'#0d9488', color:'white', border:'none', borderRadius:'6px', padding:'0 15px', fontWeight:'bold', cursor:'pointer'}}>+</button>
            </form>
        </div> 
      </div>
      </div>
     </div>
  </div>
  );
}