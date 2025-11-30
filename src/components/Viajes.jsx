import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
/**

 * Componente principal para mostrar la lista de viajes creados por el usuario actual.

 * Filtra los viajes por el 'userId' del usuario logueado, sin importar el rol (admin/normal).

 */

const Viajes = () => {

  const [viajes, setViajes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

 

  // Obtiene el ID del usuario logueado

  // Aseguramos que solo se ejecuta cuando auth.currentUser está disponible

  const user = auth.currentUser;

  const userId = user ? user.uid : null;



  useEffect(() => {

    // Usamos una bandera para prevenir la actualización de estado en un componente desmontado.

    let isMounted = true;



    // 1. Referencia a la colección 'viajes'

    const viajesRef = collection(db, 'viajes');

   

    // 2. Crear la consulta:

    // FILTRO CRÍTICO: Muestra solo los documentos donde 'userId' sea igual al ID del usuario actual.

    const q = query(

      viajesRef,

      where('userId', '==', userId)

    );



    // 3. Establecer el listener en tiempo real (onSnapshot)

    const unsubscribe = onSnapshot(q, (snapshot) => {

      if (!isMounted) return;



      const viajesData = [];

      snapshot.forEach((doc) => {

        const data = doc.data();

       

        // Manejo robusto de fechas (conversión de Timestamp a string)

        const fechaInicioString = data.fechalnicial && data.fechalnicial.toDate ? data.fechalnicial.toDate().toLocaleDateString() : 'N/A';

        const fechaFinalString = data.fechaFinal && data.fechaFinal.toDate ? data.fechaFinal.toDate().toLocaleDateString() : 'N/A';



        viajesData.push({

            id: doc.id,

            ...data,

            fechalnicial: fechaInicioString,

            fechaFinal: fechaFinalString

        });

      });

     

      setViajes(viajesData);

      setLoading(false);

      setError(null);



    }, (err) => {

      // 💥 CHECK DE MONTAJE antes de actualizar el estado en caso de error

      if (!isMounted) return;

     

      console.error("Error al obtener viajes:", err);

      setError("Error al cargar los viajes. Revisa la consola y las reglas de Firestore.");

      setLoading(false);

    });



    // Función de limpieza para detener la escucha

    return () => {

      isMounted = false; // Se ejecuta al desmontar el componente

      unsubscribe();

    }

  }, [userId]);



  // --- Renderizado del Panel ---



  if (loading) {

    return (

      <div className="flex justify-center items-center h-full p-10">

        <p className="text-xl text-blue-500 font-semibold">Cargando tus aventuras...</p>

      </div>

    );

  }



  // Si hay error (incluyendo el error de que no hay userId), se muestra el error

  if (error) {

    return (

      <div className="p-6 text-center text-red-600 bg-red-100 rounded-lg max-w-lg mx-auto m-10">

        <p className="font-bold">Error de Acceso:</p>

        <p>{error}</p>

      </div>

    );

  }



  if (viajes.length === 0) {

    return (

      <div className="text-center p-8 bg-white rounded-xl shadow-lg m-10 max-w-lg mx-auto">

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">¡Aún no tienes viajes registrados!</h2>

        <p className="text-gray-500">Haz click en "Crear Viaje" para empezar a planificar.</p>

      </div>

    );

  }



  return (

    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 pb-2">📅 Tu Panel de Viajes</h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

        {viajes.map((viaje) => (

          <div

            key={viaje.id}

            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-teal-500"

          >

            <h2 className="text-xl font-bold text-teal-700 mb-2 truncate" title={viaje.name}>

              {viaje.name}

            </h2>

            <p className="text-sm text-gray-600 mb-1">

              <span className="font-semibold">Destino:</span> {viaje.destinoPrincipal}

            </p>

            <p className="text-sm text-gray-600 mb-1">

              <span className="font-semibold">Inicio:</span> {viaje.fechalnicial}

            </p>

            <p className="text-sm text-gray-600 mb-3">

              <span className="font-semibold">Fin:</span> {viaje.fechaFinal}

            </p>

            <p className="text-gray-500 text-sm italic">

              {viaje.descripcion || 'Sin descripción.'}

            </p>

            <div className="mt-4 flex justify-end">

              <button className="text-sm text-teal-500 hover:text-teal-700 font-medium">Gestionar &rarr;</button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};



export default Viajes;