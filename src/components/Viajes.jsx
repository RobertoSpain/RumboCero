import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../assets/Viajes.css'; 

const Viajes = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miUid, setMiUid] = useState(null); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setMiUid(user.uid);
      else setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!miUid) return;

    const viajesRef = collection(db, 'viajes');
    const q = query(viajesRef, where('userId', '==', miUid));
    const unsubscribeDatos = onSnapshot(q, (snapshot) => {
      const listaViajes = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechalnicial: data.fechalnicial?.toDate ? data.fechalnicial.toDate().toLocaleDateString() : 'Pendiente',
          fechaFinal: data.fechaFinal?.toDate ? data.fechaFinal.toDate().toLocaleDateString() : 'Pendiente',
        };
      });
      setViajes(listaViajes);
      setLoading(false);
    });

    return () => unsubscribeDatos(); 
  }, [miUid]); 

  const borrarViaje = async (idViaje) => {
    if (window.confirm("🗑️ ¿Seguro que quieres eliminar este viaje?")) {
      await deleteDoc(doc(db, "viajes", idViaje));
    }
  };

  if (loading) return <div className="viajes-page" style={{textAlign:'center', paddingTop:'50px'}}>Cargando aventuras...</div>;

  if (viajes.length === 0) {
    return (
      <div className="viajes-page">
        <div className="estado">
            <h2 style={{fontSize:'2rem', marginBottom:'10px'}}>🧳 ¡Maletas Vacías!</h2>
            <p style={{color:'#666', marginBottom:'20px'}}>Aún no tienes viajes planificados.</p>
            <Link to="/crear-viaje" className="btn-ver" style={{background:'#0d9488', color:'white'}}>
              + Crear Primer Viaje
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="viajes-page">
      <div className="viajes-header">
        <h1 className="viajes-titulo">✈️ Mis Viajes</h1>
      </div>

      <div className="viajes-grid">
        {viajes.map((viaje) => (
          <div key={viaje.id} className="viaje-card">
            
            {/* FOTO */}
            <div className="contenedorimg">
                {viaje.foto ? (
                    <img 
                        src={viaje.foto} 
                        alt={viaje.name} 
                        className="campoimg"
                        onError={(e) => {e.target.style.display='none'; e.target.parentElement.classList.add('no-img-fallback');}} 
                    />
                ) : (
                    <div className="noimg">✈️</div>
                )}
            </div>
            
            {/* INFO */}
            <div className="cuerpo">
              <h2 className="titulo" title={viaje.name}>{viaje.name}</h2>
              <div className="info">
                <span>📍</span> <strong>Destino:</strong> {viaje.destinoPrincipal}
              </div>
              <div className="info">
                <span>📅</span> <strong>Fechas:</strong> {viaje.fechalnicial} - {viaje.fechaFinal}
              </div>
              <div className="desc">
                {viaje.descripcion || 'Sin descripción adicional.'}
              </div>
            </div>

            {/* BOTONES */}
            <div className="acciones">
              <button onClick={() => borrarViaje(viaje.id)} className="btn-borrar">
                🗑️ Eliminar
              </button>
              <Link to={`/viajes/${viaje.id}`} className="btn-ver">
                Ver Detalles &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Viajes;