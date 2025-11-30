import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js'; 
import '../assets/DetallesViaje.css'; 

export default function DetalleViaje() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerViaje = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'viajes', id));
        if (docSnap.exists()) setViaje({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    obtenerViaje();
  }, [id]);

  if (loading) return <div className="page-center text-center">Cargando...</div>;
  if (!viaje) return <div className="page-center text-center">Viaje no encontrado</div>;

  const inicio = viaje.fechalnicial?.toDate ? viaje.fechalnicial.toDate().toLocaleDateString() : '--';
  const fin = viaje.fechaFinal?.toDate ? viaje.fechaFinal.toDate().toLocaleDateString() : '--';

  return (
    <div className="detalle-page">
      
      {/* 1. HERO (Fondo) - Usamos clases en vez de styles largos */}
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
                    <div className="card-title"><span className="card-icon">🏙️</span> Destinos</div>
                    <div style={{textAlign:'center', color:'#aaa', padding:'20px', border:'2px dashed #ddd', borderRadius:'10px'}}>
                        + Añadir Destino (Próximamente)
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA */}
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