import React from 'react';
import '../assets/Estadisticas.css'; // Asumimos que crearás este archivo después

export default function Estadisticas({ viaje, destinos, checklist }) {
  if (!viaje) {
    return <div>Cargando estadísticas...</div>;
  } }