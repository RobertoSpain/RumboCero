import  { useState, useEffect } from 'react';
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

  if (loading) return <div className="page-center text-center">Cargando...</div>;
  if (!viaje) return <div className="page-center text-center">Viaje no encontrado</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';

  return (
    <div className="detalle-page">
      
      {/* HERO SECTION */}
      <div className="hero-section" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">{viaje.name}</h1>
            <p className="hero-subtitle">📍 {viaje.destinoPrincipal}</p>
        </div>
      </div>
   {/* CONTENEDOR PRINCIPAL */}
    <div className="main-container">
      <Link to="/viajes" className="btn-volver"> &larr; Volver </Link>
      <div className="info-grid">
        <div className="col-left">
               <div className="card">
        <div className="card-title"><span className="card-icon">📅</span> Plan</div>
        <div className="fechas-row">
            <div><p className="fecha-label">Ida</p><p className="fecha-valor">{inicio}</p></div>
            <div className="flecha">➔</div>
            <div><p className="fecha-label">Vuelta</p><p className="fecha-valor">{fin}</p></div>
          </div>
        <div className="desc-box">"{viaje.descripcion || "Sin descripción."}"</div>
      </div>
      <div className="card">
        <div className="card-title">
        <span className="card-icon">🏙️</span> Destinos ({destinos.length})
        </div> 
      <div className="destinos-container">
     {destinos.length === 0 && <p className="text-vacio">No has añadido destinos aún.</p>}
       {destinos.map(dest => (
      <div key={dest.id} className={`destino-item ${dest.visitado ? 'visitado' : ''}`}>
      <div className="destino-info">
      <input 
        type="checkbox" 
        checked={dest.visitado} 
        onChange={() => toggleVisitado(dest)}
       className="checkbox-destino"/>
        {dest.foto && <img src={dest.foto} alt="mini" style={{width:'40px', height:'40px', borderRadius:'4px', objectFit:'cover'}} />}
      <div>
      <p className="destino-nombre">{dest.nombre}</p>
      <span className="destino-tag">{dest.categoria}</span></div>
      </div>
      <button onClick={() => borrarDestino(dest.id)} className="btn-basura">🗑️</button></div>))} </div>
      <form onSubmit={agregarDestino} className="form-destino" style={{flexDirection: 'column'}}>
      <div style={{display:'flex', gap:'10px'}}>
         <input type="text" placeholder="Nombre del sitio..." value={nuevoDestino} onChange={e => setNuevoDestino(e.target.value)} className="input-destino" required />
       <select value={categoria} onChange={e => setCategoria(e.target.value)} className="select-destino">
          <option value="Turismo">Turismo</option>
          <option value="Comida">Comida</option>
          <option value="Ocio">Ocio</option>
          <option value="Hotel">Hotel</option></select>
          </div>
        <div style={{display:'flex', gap:'10px'}}>
            <input type="url" placeholder="URL Foto (Opcional)" value={fotoDestino} onChange={e => setFotoDestino(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none', fontSize:'0.9rem'}} />
            <button type="submit" className="btn-add" style={{width: '100px', fontSize: '1rem'}}>Añadir</button>
            </div>
        </form>
        </div>
       </div>
            <div className="col-right">
                <div className="card card-clima">
                    <div className="card-title"><span className="card-icon">🌤️</span> Clima</div>
                    <div style={{fontSize:'2rem', fontWeight:'bold'}}>--°C</div>
                </div>
            <div className="card">
             <div className="card-title">
            <span className="card-icon">🎒</span> Maleta ({checklist.filter(i => i.preparado).length}/{checklist.length})
          </div>
        <div style={{display:'flex', flexDirection:'column', gap:'8px', maxHeight:'300px', overflowY:'auto', marginBottom:'15px'}}>
          {checklist.length === 0 && <p className="text-vacio">Añade cosas a tu maleta.</p>}
          {checklist.map(item => (
          <div key={item.id} className="checklist-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', opacity: item.preparado ? 0.5 : 1}}>
          <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', flex:1}}>
                <input 
                type="checkbox" 
                 checked={item.preparado} 
                    onChange={() => togglePreparado(item)}
                  style={{width:'18px', height:'18px', accentColor:'#0d9488'}}/>
                  <span style={{textDecoration: item.preparado ? 'line-through' : 'none'}}>{item.nombre}</span>
                     </label>
                       <button onClick={() => borrarItemMaleta(item.id)} style={{border:'none', background:'transparent', color:'#ef4444', cursor:'pointer'}}>✕</button>
                      </div>
                        ))}
                    </div>
                    <form onSubmit={agregarItemMaleta} style={{display:'flex', gap:'5px'}}>
                        <input 
                            type="text" 
                            placeholder="Ej: Pasaporte..." 
                            value={nuevoItemMaleta}
                            onChange={e => setNuevoItemMaleta(e.target.value)}
                            style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none'}}
                            required
                        />
                        <button type="submit" style={{backgroundColor:'#0d9488', color:'white', border:'none', borderRadius:'6px', padding:'0 15px', fontWeight:'bold', cursor:'pointer'}}>+</button>
                    </form>
                </div> 
            </div>
        </div>
      </div>
    </div>
  );
}