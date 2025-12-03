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
  
  // Estados del formulario
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [categoria, setCategoria] = useState('Turismo');
  const [nuevaFoto, setNuevaFoto] = useState('');

  useEffect(() => {
    const obtenerViaje = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'viajes', id));
        if (docSnap.exists()) setViaje({ id: docSnap.id, ...docSnap.data() });
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    obtenerViaje();

    // 2. Obtener destinos en tiempo real
    const destinosRef = collection(db, 'viajes', id, 'Destinos');
    const q = query(destinosRef, orderBy('createAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDestinos(lista);
    });
    return () => unsubscribe();
  }, [id]);

  // --- FUNCIONES ---
  const agregarDestino = async (e) => {
    e.preventDefault();
    if (!nuevoDestino.trim()) return;
    try {
      await addDoc(collection(db, 'viajes', id, 'Destinos'), {
        nombre: nuevoDestino,
        categoria: categoria,
        visitado: false,
        foto: nuevaFoto,
        createAt: Timestamp.now()
      });
      setNuevoDestino('');
      setNuevaFoto(''); 
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const borrarDestino = async (idDestino) => {
    if (window.confirm("¿Borrar este destino?")) {
      try { await deleteDoc(doc(db, 'viajes', id, 'Destinos', idDestino)); } 
      catch (error) { console.error(error); }
    }
  };

  const toggleVisitado = async (destino) => {
    try {
      await updateDoc(doc(db, 'viajes', id, 'Destinos', destino.id), {
        visitado: !destino.visitado
      });
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="page-center text-center">Cargando...</div>;
  if (!viaje) return <div className="page-center text-center">Viaje no encontrado</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';
  return (
    <div className="detalle-page">
      <div className="hero-section" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">{viaje.name}</h1>
            <p className="hero-subtitle">📍 {viaje.destinoPrincipal}</p>
        </div>
      </div>
      <div className="main-container">
        <Link to="/viajes" className="btn-volver"> ⬅ Volver </Link>
        <div className="info-grid">
          <div className="col-left">
            {/* TARJETA PLAN */}
            <div className="card">
              <div className="card-title"><span className="card-icon">📅</span> Plan</div>
              <div className="fechas-row">
                <div><p className="fecha-label">Ida</p><p className="fecha-valor">{inicio}</p></div>
                <div className="flecha">➔</div>
                <div><p className="fecha-label">Vuelta</p><p className="fecha-valor">{fin}</p></div>
              </div>
              <div className="desc-box">"{viaje.descripcion || "Sin descripción."}"</div>
            </div>
            {/* TARJETA DESTINOS */}
            <div className="card">
              <div className="card-title"><span className="card-icon">🏙️</span> Destinos ({destinos.length})</div>  
              <div className="lista-destinos">
                {destinos.length === 0 && <p style={{color:'#aaa', fontStyle:'italic', textAlign:'center'}}>Añade sitios que quieres visitar.</p>}
                {destinos.map(dest => (
                  <div key={dest.id} className={`destino-item ${dest.visitado ? 'visitado' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={dest.visitado} 
                      onChange={() => toggleVisitado(dest)}
                      className="checkbox-custom"
                    />
                    {/* Contenedor de info + foto */}
                    <div className="destino-info-container">
                        {dest.foto && <img src={dest.foto} alt="mini" className="destino-img" />}
                        <div>
                            <p className="destino-nombre">{dest.nombre}</p>
                            <span className="destino-badge">{dest.categoria}</span>
                        </div>
                    </div>
                    <button onClick={() => borrarDestino(dest.id)} className="btn-borrar-dest">🗑️</button>
                  </div>
                ))}
              </div>
              <div className="form-wrapper">
                <h4 className="form-title">✨ Añadir nuevo sitio</h4>
                <form onSubmit={agregarDestino} className="form-add-dest">
                    <input 
                      type="text" 
                      placeholder="Nombre del sitio (Ej: Torre Eiffel)" 
                      value={nuevoDestino}
                      onChange={e => setNuevoDestino(e.target.value)}
                      className="input-modern"
                      required
                    />
            <input 
               type="text" 
              placeholder="Pegar URL de foto (Opcional)" 
              value={nuevaFoto}
              onChange={e => setNuevaFoto(e.target.value)}
              className="input-modern"/> 
                    <div className="form-footer">
                        <select 
                           value={categoria} 
                           onChange={e => setCategoria(e.target.value)}
                           className="select-modern">
                          <option value="Turismo">Turismo</option>
                          <option value="Comida">Comida</option>
                          <option value="Ocio">Ocio</option>
                          <option value="Hotel">Hotel</option>
                        </select>
                        <button type="submit" className="btn-add">Añadir +</button>
                    </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-right">
            <div className="card card-clima">
              <div className="card-title"><span className="card-icon">🌤️</span> Clima</div>
              <div style={{fontSize:'2.5rem', fontWeight:'bold'}}>--°C</div>
            </div>
            <div className="card">
              <div className="card-title"><span className="card-icon">🎒</span> Maleta</div>
              <div className="checklist-item"><input type="checkbox" disabled /> Pasaporte</div>
              <button className="btn-gestion" style={{marginTop:'10px'}}>+ Gestionar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}