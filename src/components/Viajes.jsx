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

  // BUSCAR NOTIFICACIONES
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
        } catch (error) { console.error("Error buscando notificaciones", error); }
    };
    if (miUid) setTimeout(buscarNotificaciones, 1500);
  }, [miUid]);

  const borrarViaje = async (idViaje) => {
    if (window.confirm("¿Seguro que quieres eliminar este viaje permanentemente?")) {
      await deleteDoc(doc(db, "viajes", idViaje));
    }
  };

  // SPINNER DE CARGA SVG
  if (loading) return (
    <div className="viajes-page cargando-contenedor" role="status">
        <div className="spinner-container">
            <svg className="spinner-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <p>Cargando tus aventuras...</p>
        </div>
    </div>
  );
  
  // ESTADO VACÍO
  if (viajes.length === 0) {
    return (
      <div className="viajes-page">
        <div className="estado-vacio">
            <div className="icono-vacio">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25a3 3 0 00-3-3 3 3 0 00-3 3v.248m6 0c.965.059 1.915.148 2.85.265 1.086.143 1.905 1.096 1.905 2.195v3.25" />
                </svg>
            </div>
            <h2 className="estado-titulo">¡Maletas Vacías!</h2>
            <p className="estado-texto">Aún no tienes viajes planificados.</p>
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
        <h1 className="viajes-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Mis Viajes
        </h1>
      </div>
      <div className="viajes-grid" role="list">
        {viajes.map((viaje) => (
          <article key={viaje.id} className="viaje-card" role="listitem">
            {/* FOTO */}
            <div className="contenedorimg">
                {viaje.foto ? (
                    <img 
                        src={viaje.foto} 
                        alt={`Portada de ${viaje.name}`} 
                        className="campoimg"
                        onError={(e) => {e.target.style.display='none'; e.target.parentElement.classList.add('no-img-fallback');}} />
                ) : (
                    <div className="noimg" role="img" aria-label="Sin imagen disponible">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                         </svg>
                    </div>
                )}
            </div>
            <div className="cuerpo">
              <h2 className="titulo" title={viaje.name}>{viaje.name}</h2> 
              
              <div className="info-grupo">
                  <div className="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{viaje.destinoPrincipal}</span>
                  </div>
                  <div className="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>{viaje.fechalnicial} - {viaje.fechaFinal}</span>
                  </div>
              </div>
              <p className="desc">
                {viaje.descripcion ? viaje.descripcion : <span className="text-muted">Sin descripción disponible.</span>}
              </p>
            </div>
            {/* BOTONES */}
            <div className="acciones">
              <button 
                onClick={() => borrarViaje(viaje.id)} 
                className="btn-borrar"
                aria-label={`Eliminar viaje a ${viaje.name}`} 
                title="Eliminar viaje">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button> 
              <Link 
                to={`/viajes/${viaje.id}`} 
                className="btn-ver"
                aria-label={`Ver detalles de ${viaje.name}`} >
                Ver Detalles 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
export default Viajes;