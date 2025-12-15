import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // IMPORTANTE: Quitamos 'or'
import { onAuthStateChanged } from 'firebase/auth'; 
import '../assets/Estadisticas.css';

import {
  Chart as ChartJS,
  ArcElement,      
  BarElement,      
  CategoryScale,   
  LinearScale,     
  Tooltip,         
  Legend,          
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);
export default function Estadisticas() {
  const [viajes, setViajes] = useState([]); 
  const [idViajeSeleccionado, setIdViajeSeleccionado] = useState(''); 
  const [datosFirebase, setDatosFirebase] = useState({
    checklistCompletado: 0,
    checklistTotal: 0,
    destinosVisitados: 0,
    destinosTotal: 0
  });

  // 1. Cargar Viajes 
  useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            const q = query(
                collection(db, 'viajes'), 
                where('participantes', 'array-contains', user.uid)
            );

            onSnapshot(q, (snapshot) => {
                const lista = snapshot.docs.map(doc => ({
                    id: doc.id, 
                    ...doc.data()
                }));
                setViajes(lista);
                                if (idViajeSeleccionado && !lista.find(v => v.id === idViajeSeleccionado)) {
                    setIdViajeSeleccionado('');
                }
            });
        }
     });
     return () => unsubscribe();
  }, [idViajeSeleccionado]); 

  // 2. Función Simple para Calcular Días
  const calcularDiasRestantes = () => {
    if (!idViajeSeleccionado) return 0;
    const viaje = viajes.find(v => v.id === idViajeSeleccionado);
    if (!viaje || !viaje.fechalnicial) return 0; 
    let fechaInicioObj;

    if (viaje.fechalnicial.toDate) {
        fechaInicioObj = viaje.fechalnicial.toDate(); 
    } else {
        fechaInicioObj = new Date(viaje.fechalnicial); 
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaInicioObj.setHours(0, 0, 0, 0);
    const diferenciaMs = fechaInicioObj - hoy;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const diasRestantes = calcularDiasRestantes();
  useEffect(() => {
    if (!idViajeSeleccionado) return;
    const viajeExiste = viajes.find(v => v.id === idViajeSeleccionado);
    if (!viajeExiste) return;
    const unsubDestinos = onSnapshot(collection(db, 'viajes', idViajeSeleccionado, 'destinos'), (snap) => {
        const total = snap.size;
        const visitados = snap.docs.filter(d => d.data().visitado === true).length;
        setDatosFirebase(prev => ({ ...prev, destinosTotal: total, destinosVisitados: visitados }));
    });
    const unsubChecklist = onSnapshot(collection(db, 'viajes', idViajeSeleccionado, 'checklist'), (snap) => {
        const total = snap.size;
        const completados = snap.docs.filter(d => d.data().completado === true || d.data().preparado === true).length;
        setDatosFirebase(prev => ({ ...prev, checklistTotal: total, checklistCompletado: completados }));
    });

    return () => { unsubDestinos(); unsubChecklist(); };
  }, [idViajeSeleccionado, viajes]); 

  const dataQuesito = {
    labels: ['Listo', 'Pendiente'],
    datasets: [{
      data: [datosFirebase.checklistCompletado, datosFirebase.checklistTotal - datosFirebase.checklistCompletado],
      backgroundColor: ['#0d9488', '#e5e7eb'], 
      borderWidth: 0,
    }]
  };

  const dataBarras = {
    labels: ['Estado Destinos'],
    datasets: [
      {
        label: 'Visitados',
        data: [datosFirebase.destinosVisitados],
        backgroundColor: '#0d9488', 
        borderRadius: 4
      },
      {
        label: 'Total',
        data: [datosFirebase.destinosTotal],
        backgroundColor: '#99f6e4', 
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="estadisticas">
        <h1 className="tituloprincipal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Resumen de mis Viajes
        </h1>
        <div className="zonafiltro">
            <label htmlFor="selectorviaje" className="sr-only">Selecciona un viaje</label>
            <select 
                id="selectorviaje"
                value={idViajeSeleccionado} 
                onChange={(e) => setIdViajeSeleccionado(e.target.value)}
                className="miselect"
                aria-label="Selecciona un viaje para ver sus estadísticas" >
                <option value="">-- Selecciona una aventura --</option>
                {viajes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
        </div>
        {idViajeSeleccionado && viajes.some(v => v.id === idViajeSeleccionado) ? (
            <div className="rejilladatos" role="region" aria-label="Gráficas del viaje">
                <article className="bloquedatos">
                    <h3 className="cajatitulo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Cuenta Atrás
                    </h3>
                    <div className="numero">
                        {diasRestantes}
                    </div>
                    <p className="texto">Días para el despegue</p>
                </article>   
                <article className="bloquedatos">
                    <h3 className="cajatitulo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25a3 3 0 00-3-3 3 3 0 00-3 3v.248m6 0c.965.059 1.915.148 2.85.265 1.086.143 1.905 1.096 1.905 2.195v3.25" />
                        </svg>
                        Equipaje
                    </h3>
                    <div className="contenedorgrafico">
                        <Doughnut data={dataQuesito} options={{ cutout: '70%', maintainAspectRatio: false }} />
                    </div>
                    <div className="infoextra" style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'none', padding: '0', marginTop: '10px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0d9488', lineHeight: '1' }}>
                            {datosFirebase.checklistCompletado} <span style={{fontSize: '1rem', color: '#9ca3af', fontWeight: '400'}}>/ {datosFirebase.checklistTotal}</span>
                        </span>
                        
                        <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' }}>
                            items listos ({datosFirebase.checklistTotal > 0 ? Math.round((datosFirebase.checklistCompletado / datosFirebase.checklistTotal) * 100) : 0}%)
                        </span>
                    </div>
                </article>

                <article className="bloquedatos">
                    <h3 className="cajatitulo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        Itinerario
                    </h3>
                    <div className="contenedorbarras">
                        <Bar 
                            data={dataBarras} 
                            options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                    <p className="infoextra">{datosFirebase.destinosVisitados} de {datosFirebase.destinosTotal} sitios visitados</p>
                </article>
            </div>
        ) : (
            <div className="avisovacio">
                <div className="iconoaviso">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                </div>
                <h3>Selecciona un viaje arriba</h3>
                <p>Elige una de tus aventuras para ver las métricas.</p>
            </div>
        )}
    </div>
  );
}