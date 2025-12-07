import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import '../assets/Estadisticas.css';

// 1. IMPORTS DE GRÁFICOS (Chart.js)
import {
  Chart as ChartJS,
  ArcElement,      // Para el gráfico circular 
  BarElement,      // Para las barras
  CategoryScale,   // Eje X
  LinearScale,     // Eje Y
  Tooltip,         // Leyenda flotante
  Legend,          // Leyenda de colores
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

export default function Estadisticas() {
  // 3. ESTADOS INICIALES 
  const [viajes, setViajes] = useState([]); 
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null); 
}