import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 
import '../assets/Estadisticas.css';

// IMPORTS DE GRÁFICOS
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
  
  // Estado para los contadores que vienen de Firebase
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
            const q = query(collection(db, 'viajes'), where('userId', '==', user.uid));
            onSnapshot(q, (snapshot) => {
                const lista = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                setViajes(lista);
            });
        }
     });
     return () => unsubscribe();
  }, []);

  // 2. Calcular Días (Variable calculada)
  const diasRestantes = useMemo(() => {
    if (!idViajeSeleccionado) return 0;
    const viaje = viajes.find(v => v.id === idViajeSeleccionado);
    
    if (viaje && viaje.fechalnicial) {
        const fechaInicio = viaje.fechalnicial.toDate ? viaje.fechalnicial.toDate() : new Date(viaje.fechalnicial);
        const hoy = new Date();
        const diff = fechaInicio - hoy;
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
    }
    return 0;
  }, [idViajeSeleccionado, viajes]);

  // 3. Listeners de Firebase (Destinos y Checklist)
  useEffect(() => {
    if (!idViajeSeleccionado) return;

    // Destinos
    const unsubDestinos = onSnapshot(collection(db, 'viajes', idViajeSeleccionado, 'destinos'), (snap) => {
        const total = snap.size;
        const visitados = snap.docs.filter(d => d.data().visitado === true).length;
        
        setDatosFirebase(prev => ({ 
            ...prev, 
            destinosTotal: total, 
            destinosVisitados: visitados 
        }));
    });

    // Checklist
    const unsubChecklist = onSnapshot(collection(db, 'viajes', idViajeSeleccionado, 'checklist'), (snap) => {
        const total = snap.size;
        const completados = snap.docs.filter(d => d.data().preparado === true).length;
        
        setDatosFirebase(prev => ({ 
            ...prev, 
            checklistTotal: total, 
            checklistCompletado: completados 
        }));
    });

    return () => {
        unsubDestinos();
        unsubChecklist();
    };
  }, [idViajeSeleccionado]); 

  // Configuración Datos Gráficos
  const dataQuesito = {
    labels: ['Listo', 'Pendiente'],
    datasets: [{
      data: [datosFirebase.checklistCompletado, datosFirebase.checklistTotal - datosFirebase.checklistCompletado],
      backgroundColor: ['#10b981', '#e5e7eb'], 
      borderWidth: 0,
    }]
  };

  const dataBarras = {
    labels: ['Estado Destinos'],
    datasets: [
      {
        label: 'Visitados',
        data: [datosFirebase.destinosVisitados],
        backgroundColor: '#3b82f6', 
      },
      {
        label: 'Total',
        data: [datosFirebase.destinosTotal],
        backgroundColor: '#93c5fd', 
      }
    ]
  };

  return (
    <div className="estadisticas">
        <h1 className="tituloprincipal">📊 Resumen de mis Viajes</h1>
        
        <div className="zonafiltro">
            <select 
                value={idViajeSeleccionado} 
                onChange={(e) => setIdViajeSeleccionado(e.target.value)}
                className="miselect"
            >
                <option value="">-- Elige un viaje --</option>
                {viajes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
        </div>

        {idViajeSeleccionado ? (
            <div className="rejilla-dat">
                
                {/* Caja 1: Días */}
                <div className="bloquedatos">
                    <h3 className="cajatitulo">⏳ Cuenta Atrás</h3>
                    <div className="numero">
                        {diasRestantes}
                    </div>
                    <p className="texto">Días que faltan</p>
                </div>

                {/* Caja 2: Maleta */}
                <div className="bloquedatos">
                    <h3 className="cajatitulo">🎒 Maleta</h3>
                    <div className="contenedor-grafico">
                        <Doughnut data={dataQuesito} />
                    </div>
                    <p className="info-extra">
                        <strong>{datosFirebase.checklistTotal > 0 ? Math.round((datosFirebase.checklistCompletado / datosFirebase.checklistTotal) * 100) : 0}%</strong> preparado
                    </p>
                </div>

                {/* Caja 3: Destinos */}
                 <div className="bloquedatos">
                    <h3 className="cajatitulo">📍 Sitios</h3>
                    <div className="contenedor-barras">
                        <Bar 
                            data={dataBarras} 
                            options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                    </div>
                    <p className="info-extra">{datosFirebase.destinosVisitados} de {datosFirebase.destinosTotal} visitados</p>
                </div>

            </div>
        ) : (
            <div className="aviso-vacio">
                <h3>👆 Selecciona un viaje arriba</h3>
                <p>Elige una de tus aventuras para ver las gráficas.</p>
            </div>
        )}
    </div>
  );
}