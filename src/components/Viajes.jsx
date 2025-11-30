import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Viajes = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miUid, setMiUid] = useState(null); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMiUid(user.uid);
      } else {
        setLoading(false);
      }
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
    }, (error) => {
      console.error("Error leyendo viajes:", error);
      setLoading(false);
    });

    return () => unsubscribeDatos();

  }, [miUid]);

  const borrarViaje = async (idViaje) => {
    if (window.confirm("🗑️ ¿Seguro que quieres eliminar este viaje? No se puede recuperar.")) {
      try {
        await deleteDoc(doc(db, "viajes", idViaje));
      } catch (error) {
        console.error("Error al borrar:", error);
        alert("Hubo un fallo al borrar.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-blue-500 font-bold animate-pulse">Cargando tus aventuras...</p>
      </div>
    );
  }
  if (viajes.length === 0) {
    return (
      <div className="text-center p-10 mt-10 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">¡Maletas vacías! 🧳</h2>
        <p className="text-gray-500 mb-6">Aún no tienes viajes. ¿A qué esperas para planear el próximo?</p>
        <Link to="/crear-viaje" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
          + Crear Primer Viaje
        </Link>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b-4 border-teal-500 inline-block pb-1">
        ✈️ Mis Viajes
      </h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {viajes.map((viaje) => (
          <div key={viaje.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                        <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                {viaje.foto ? (
                    <img 
                        src={viaje.foto} 
                        alt={viaje.name} 
                        className="w-full h-full object-cover"
                        //  si la url falla, ponemos un color de fondo
                        onError={(e) => {e.target.style.display='none'; e.target.parentElement.style.backgroundColor='#ccfbf1'}} 
                    />
                ) : (
                    // Si no tiene foto, mostramos un fondo bonito con el icono
                    <div className="flex items-center justify-center h-full bg-teal-100 text-teal-500 text-4xl">
                        ✈️
                    </div>
                )}
            </div>
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-bold text-gray-800 mb-2 truncate" title={viaje.name}>
                {viaje.name}
              </h2>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-bold text-teal-600">📍 Destino:</span> {viaje.destinoPrincipal}</p>
                <p><span className="font-bold text-teal-600">📅 Fechas:</span> {viaje.fechalnicial} - {viaje.fechaFinal}</p>
              </div>

              <p className="text-gray-500 text-sm mt-4 italic line-clamp-3 bg-gray-50 p-2 rounded">
                {viaje.descripcion || 'Sin notas adicionales.'}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <button 
                onClick={() => borrarViaje(viaje.id)}
                className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"
              >
                🗑️ Eliminar
              </button>
              <Link 
                to={`/viajes/${viaje.id}`}
                className="text-teal-600 hover:text-teal-800 text-sm font-bold bg-white border border-teal-200 px-4 py-1 rounded-full shadow-sm hover:shadow transition"
              >
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