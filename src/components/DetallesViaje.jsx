import React, { useState, useEffect } from 'react';
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
  const [categoria, setCategoria] = useState('Turismo'); // Valor por defecto

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
    const q = query(destinosRef, orderBy('createAt', 'desc')); // Los nuevos arriba

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
      await addDoc(collection(db, 'viajes', id, 'destinos'), {
        nombre: nuevoDestino,
        categoria: categoria,
        visitado: false, // Empieza sin visitar
        createAt: Timestamp.now()
      });
      setNuevoDestino(''); // Limpiar campo
    } catch (error) {
      console.error("Error al guardar destino:", error);
      alert("Error al añadir destino");
    }
  };
  const borrarDestino = async (idDestino) => {
    if (window.confirm("¿Borrar este destino?")) {
      try {
        await deleteDoc(doc(db, 'viajes', id, 'destinos', idDestino));
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  };
  const toggleVisitado = async (destino) => {
    try {
      // Cambiar de true a false o viceversa
      await updateDoc(doc(db, 'viajes', id, 'destinos', destino.id), {
        visitado: !destino.visitado
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };
  if (loading) return <div className="page-center text-center">Cargando...</div>;
  if (!viaje) return <div className="page-center text-center">Viaje no encontrado</div>;
  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';
  return (
    <div className="detalle-page">
      <div className="hero-section" style={{ backgroundImage: `url(${viaje.foto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">{viaje.name}</h1>
            <p className="hero-subtitle">📍 {viaje.destinoPrincipal}</p>
        </div>
      </div>
      {/* 2. CONTENEDOR */}
      <div className="main-container">
        <Link to="/viajes" className="btn-volver"> &larr; Volver </Link>
        <div className="info-grid">
            {/* COLUMNA IZQUIERDA */}
            <div className="col-left">
                {/* TARJETA DE FECHAS */}
                <div className="card">
                    <div className="card-title"><span className="card-icon">📅</span> Plan</div>
                    <div className="fechas-row">
                        <div><p className="fecha-label">Ida</p><p className="fecha-valor">{inicio}</p></div>
                        <div className="flecha">➔</div>
                        <div><p className="fecha-label">Vuelta</p><p className="fecha-valor">{fin}</p></div>
                    </div>
                    <div className="desc-box">"{viaje.descripcion || "Sin descripción."}"</div>
                </div>

                {/* --- TARJETA DESTINOS (FUNCIONAL) --- */}
                <div className="card">
                    <div className="card-title"><span className="card-icon">🏙️</span> Destinos ({destinos.length})</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {destinos.length === 0 && <p style={{color:'#aaa', fontStyle:'italic'}}>Añade sitios que quieres visitar.</p>}
                        {destinos.map(dest => (
                            <div key={dest.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px', borderRadius: '8px',
                                backgroundColor: dest.visitado ? '#ecfdf5' : '#f9fafb', // Verde si visitado
                                border: '1px solid #e5e7eb',
                                opacity: dest.visitado ? 0.7 : 1
                            }}>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={dest.visitado} 
                                        onChange={() => toggleVisitado(dest)}
                                        style={{cursor: 'pointer', width:'18px', height:'18px'}}/>
                                    <div>
                                        <p style={{
                                            margin:0, fontWeight:'bold', 
                                            textDecoration: dest.visitado ? 'line-through' : 'none'
                                        }}>{dest.nombre}</p>
                                        <small style={{color:'#6b7280'}}>{dest.categoria}</small>
                                    </div>
                                </div>
                                <button onClick={() => borrarDestino(dest.id)} style={{border:'none', background:'none', cursor:'pointer'}}>🗑️</button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={agregarDestino} style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="Ej: Museo del Prado" 
                            value={nuevoDestino}
                            onChange={e => setNuevoDestino(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            required/>
                        <select 
                            value={categoria} 
                            onChange={e => setCategoria(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            <option value="Turismo">Turismo</option>
                            <option value="Comida">Comida</option>
                            <option value="Ocio">Ocio</option>
                        </select>
                        <button type="submit" className="btn-gestion" style={{width:'auto', padding:'0 15px'}}>+</button>
                    </form>
                </div>
            </div>
            <div className="col-right">
                <div className="card card-clima">
                    <div className="card-title"><span className="card-icon">🌤️</span> Clima</div>
                    <div style={{fontSize:'2rem', fontWeight:'bold'}}>--°C</div>
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