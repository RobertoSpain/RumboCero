import  { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import '../assets/AdminPanel.css'; 

export default function AdminPanel() { 
    const [tabActiva, setTabActiva] = useState('viajes'); 
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
    const eliminarViaje = async (idViaje, nombreViaje) => {
        if (window.confirm(`¿Seguro que quieres eliminar el viaje "${nombreViaje}"?`)) {
            try {
                await deleteDoc(doc(db, 'viajes', idViaje));
                cargarDatos(); 
                alert("Viaje eliminado");
            } catch (error) { console.error(error); alert("Error al eliminar"); }
        }
    };

    const cambiarRol = async (idUsuario, rolActual, nombreUsuario) => {
        const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador';
        const mensaje = rolActual === 'administrador' 
            ? `¿Quitar permisos de admin a ${nombreUsuario}?`
            : `¿Hacer ADMINISTRADOR a ${nombreUsuario}?`;
        if (window.confirm(mensaje)) {
            try {
                await updateDoc(doc(db, 'usuarios', idUsuario), { rol: nuevoRol });
                cargarDatos(); 
            } catch (error) { console.error(error); alert("Error al cambiar rol"); }
        }
    };

    // --- 3. RENDERIZADO ---
    return (
        <div className="admin-container">
            <h1 className="admin-title">Panel de Administración</h1>
            <div className="tabs-container">
                <button 
                    onClick={() => setTabActiva('viajes')}
                    className={`tab-btn ${tabActiva === 'viajes' ? 'active' : ''}`}
                >✈️ Gestión de Viajes
                </button>
                <button 
                    onClick={() => setTabActiva('usuarios')}
                    className={`tab-btn ${tabActiva === 'usuarios' ? 'active' : ''}`}
                >👥 Gestión de Usuarios
                </button>
            </div>
            {/* CONTENIDO PRINCIPAL */}
            {cargando ? (
                <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>Cargando datos... ⏳</div>
            ) : (
                <div className="panel-card">
                    {/* --- VISTA DE VIAJES --- */}
                    {tabActiva === 'viajes' && (
                        <div>
                            <h2 className="section-title">Listado de Viajes ({viajes.length})</h2>
                            {viajes.length === 0 && <p style={{color:'#888'}}>No hay viajes creados.</p>}
                            
                            {viajes.map(viaje => (
                                <div key={viaje.id} className="list-item">
                                    <div className="item-info">
                                        <h4>{viaje.name}</h4>
                                        <p>📍 {viaje.destinoPrincipal}</p>
                                    </div>
                                    <button 
                                        onClick={() => eliminarViaje(viaje.id, viaje.name)}
                                        className="btn-action btn-delete">
                                        Eliminar Viaje
                                    </button>
                                </div>
                            ))}
                        </div>)}
                    {/* --- VISTA DE USUARIOS --- */}
                    {tabActiva === 'usuarios' && (
                        <div>
                            <h2 className="section-title">Listado de Usuarios ({usuarios.length})</h2>
                            {usuarios.map(u => {
                                const esAdmin = u.rol === 'administrador';
                                return (
                                    <div key={u.id} className="list-item">
                                        <div className="item-info">
                                            <h4>{u.nombre || 'Usuario sin nombre'}</h4>
                                            <p>{u.email}</p>
                                            <div style={{marginTop:'5px'}}>
                                                <span className={`badge-rol ${esAdmin ? 'rol-admin' : 'rol-user'}`}>
                                                    {u.rol || 'usuario'}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => cambiarRol(u.id, u.rol, u.nombre)}
                                            className="btn-action btn-toggle-role"
                                            title={esAdmin ? "Degradar a Usuario" : "Promover a Admin"}>
                                            {esAdmin ? '🔽 Degradar' : '⭐ Hacer Admin'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}