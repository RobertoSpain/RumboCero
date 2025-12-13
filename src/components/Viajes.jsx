import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
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
    const q = query(viajesRef, where('participantes', 'array-contains', miUid));
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
  // BUSCAR MULTAS / NOTIFICACIONES
  useEffect(() => {
    const buscarNotificaciones = async () => {
        if (!miUid) return;

        try {
            const q = query(
                collection(db, "notificaciones"),
                where("uidUsuario", "==", miUid),
                where("leido", "==", false)
            );

            const snapshot = await getDocs(q);

            snapshot.forEach(async (nota) => {
                const datos = nota.data();
                alert(`⚠️ AVISO DEL ADMINISTRADOR:\n\n${datos.mensaje}`);
                const notaRef = doc(db, "notificaciones", nota.id);
                await updateDoc(notaRef, { leido: true });
            });
        } catch (error) {
            console.error("Error buscando notificaciones", error);
        }
    };

    if (miUid) {
        setTimeout(buscarNotificaciones, 1500);
    }
  }, [miUid]);

  const borrarViaje = async (idViaje) => {
    if (window.confirm("🗑️ ¿Seguro que quieres eliminar este viaje?")) {
      await deleteDoc(doc(db, "viajes", idViaje));
    }
  };

  if (loading) return <div className="viajes-page cargando-contenedor" role="status">Cargando aventuras...</div>;
  
  if (viajes.length === 0) {
    return (
      <div className="viajes-page">
        <div className="estado">
            <h2 className="estado-titulo"><span aria-hidden="true">🧳</span> ¡Maletas Vacías!</h2>
            <p className="estado-texto">Aún no tienes viajes planificados (ni compartidos contigo).</p>
            <Link to="/crear-viaje" className="btn-ver btn-solido">
              + Crear Primer Viaje
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="viajes-page">
      <div className="viajes-header">
        <h1 className="viajes-titulo"><span aria-hidden="true">✈️</span> Mis Viajes</h1>
      </div>
            <div className="viajes-grid" role="list">
        {viajes.map((viaje) => (
          <div key={viaje.id} className="viaje-card" role="listitem">
            {/* FOTO */}
            <div className="contenedorimg">
                {viaje.foto ? (
                    <img 
                        src={viaje.foto} 
                        alt={`Foto de portada del viaje a ${viaje.name}`} 
                        className="campoimg"
                        onError={(e) => {e.target.style.display='none'; e.target.parentElement.classList.add('no-img-fallback');}} 
                    />
                ) : (
                    <div className="noimg" role="img" aria-label="Imagen por defecto: Avión">
                        <span aria-hidden="true">✈️</span>
                    </div>
                )}
            </div>
            {/* INFO */}
            <div className="cuerpo">
              <h2 className="titulo" title={viaje.name}>{viaje.name}</h2> 
              <div className="info">
                <span aria-hidden="true">📍</span> 
                <strong>Destino:</strong> {viaje.destinoPrincipal}
              </div>
              <div className="info">
                <span aria-hidden="true">📅</span> 
                <strong>Fechas:</strong> {viaje.fechalnicial} - {viaje.fechaFinal}
              </div>
              <div className="desc">
                {viaje.descripcion || 'Sin descripción adicional.'}
              </div>
            </div>
            {/* BOTONES */}
            <div className="acciones">
              <button 
                onClick={() => borrarViaje(viaje.id)} 
                className="btn-borrar"
                aria-label={`Borrar viaje a ${viaje.name}`} 
>
                <span aria-hidden="true">🗑️</span> Eliminar
              </button> 
              <Link 
                to={`/viajes/${viaje.id}`} 
                className="btn-ver"
                aria-label={`Ver detalles de ${viaje.name}`} 
              >
                Ver Detalles <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Viajes;