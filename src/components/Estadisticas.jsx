import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 
import '../assets/Estadisticas.css';

// 1. IMPORTS DE GRÁFICOS (Chart.js)
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

// 2. REGISTRO DE COMPONENTES
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function Estadisticas() {
  // 3. ESTADOS
  const [viajes, setViajes] = useState([]); 
  const [idViajeSeleccionado, setIdViajeSeleccionado] = useState(''); 
    const [firebaseStats, setFirebaseStats] = useState({
    checklistCompletado: 0,
    checklistTotal: 0,
    destinosVisitados: 0,
    destinosTotal: 0
  });

  // 4. CARGAR LISTA DE VIAJES DEL USUARIO
  useEffect(() => {
     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if(user) {
            const q = query(collection(db, 'viajes'), where('userId', '==', user.uid));
            onSnapshot(q, (snapshot) => {
                const lista = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                setViajes(lista);
            });
        }
     });
     return () => unsubscribeAuth();
  }, []);

  // 5. CÁLCULO DE DÍAS (SOLUCIÓN DEL ERROR)
  // Calculamos esto "al vuelo" en cada render, sin useEffect ni setState. 
  // Esto evita el bucle infinito.
  const diasRestantes = useMemo(() => {
    if (!idViajeSeleccionado) return 0;
    const viaje = viajes.find(v => v.id === idViajeSeleccionado);
    
    if (viaje && viaje.fechalnicial) {
        // Manejo seguro de fechas (Timestamp o String)
        const fechaInicio = viaje.fechalnicial.toDate ? viaje.fechalnicial.toDate() : new Date(viaje.fechalnicial);
        const hoy = new Date();
        const diferenciaMs = fechaInicio - hoy;
        const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
    }
    return 0;
  }, [idViajeSeleccionado, viajes]);
}