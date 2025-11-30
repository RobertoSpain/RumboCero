import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore'; 
import { db } from '../firebase'; 

export default function AdminPanel() { 
    const [tabActiva, setTabActiva] = useState('viajes'); // 'viajes' o 'usuarios'
    // Estados de datos
    const [viajes, setViajes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    // --- 1. CARGA DE DATOS ---
    const cargarDatos = async () => {
        setCargando(true);
        try {
            // Cargar Viajes
            const viajesRef = collection(db, 'viajes');
            const viajesSnap = await getDocs(viajesRef);
            const listaViajes = viajesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setViajes(listaViajes);
            // Cargar Usuarios
            const usuariosRef = collection(db, 'usuarios');
            const usuariosSnap = await getDocs(usuariosRef);
            const listaUsuarios = usuariosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsuarios(listaUsuarios);
        } catch (error) {
            console.error("Error cargando datos:", error);
            alert("Error al cargar datos");
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    // --- 2. FUNCIONES DE ACCIÓN ---
    // Función para borrar viaje
    const eliminarViaje = async (idViaje, nombreViaje) => {
        if (window.confirm(`¿Seguro que quieres eliminar el viaje "${nombreViaje}"?`)) {
            try {
                await deleteDoc(doc(db, 'viajes', idViaje));
                // Recargamos los datos para ver el cambio
                cargarDatos(); 
                alert("Viaje eliminado");
            } catch (error) {
                console.error(error);
                alert("Error al eliminar");
            }
        }
    };

    // Función para cambiar rol (Ascender/Degradar)
    const cambiarRol = async (idUsuario, rolActual, nombreUsuario) => {
        const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador';
        const mensaje = rolActual === 'administrador' 
            ? `¿Quitar permisos de admin a ${nombreUsuario}?`
            : `¿Hacer ADMINISTRADOR a ${nombreUsuario}?`;

        if (window.confirm(mensaje)) {
            try {
                await updateDoc(doc(db, 'usuarios', idUsuario), {
                    rol: nuevoRol
                });
                cargarDatos(); // Recargar para ver el cambio
            } catch (error) {
                console.error(error);
                alert("Error al cambiar rol");
            }
        }
    };

    // --- 3. RENDERIZADO ---
    return (
        <div className="pt-20 p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b-2 border-red-200 pb-2">
                Panel de Administración
            </h1>
            
            {/* Botones de Pestañas */}
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setTabActiva('viajes')}
                    className={`px-4 py-2 rounded-lg font-bold ${tabActiva === 'viajes' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Gestión de Viajes
                </button>
                <button 
                    onClick={() => setTabActiva('usuarios')}
                    className={`px-4 py-2 rounded-lg font-bold ${tabActiva === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Gestión de Usuarios
                </button>
            </div>
            {/* Contenido */}
            {cargando ? (
                <p>Cargando datos...</p>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                    {/* VISTA DE VIAJES */}
                    {tabActiva === 'viajes' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Listado de Viajes ({viajes.length})</h2>
                            {viajes.map(viaje => (
                                <div key={viaje.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold text-lg">{viaje.name}</p>
                                        <p className="text-sm text-gray-500">Destino: {viaje.destinoPrincipal}</p>
                                    </div>
                                    <button 
                                        onClick={() => eliminarViaje(viaje.id, viaje.name)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* VISTA DE USUARIOS */}
                    {tabActiva === 'usuarios' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Listado de Usuarios ({usuarios.length})</h2>
                            {usuarios.map(u => (
                                <div key={u.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold text-lg">{u.nombre || u.email}</p>
                                        <p className="text-sm text-gray-500">
                                            Rol actual: <span className={u.rol === 'administrador' ? 'text-red-600 font-bold' : 'text-blue-600'}>
                                                {u.rol || 'usuario'}
                                            </span>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => cambiarRol(u.id, u.rol, u.nombre)}
                                        className={`px-3 py-1 rounded text-sm text-white ${u.rol === 'administrador' ? 'bg-orange-500' : 'bg-green-600'}`}
                                    >
                                        {u.rol === 'administrador' ? 'Degradar a Usuario' : 'Hacer Admin'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}