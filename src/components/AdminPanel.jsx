import { useState, useEffect } from 'react';
// IMPORTANTE: Hemos añadido 'addDoc' y 'serverTimestamp' para las notificaciones
import { collection, getDocs, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'; 
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
            const viajesRef = collection(db, 'viajes');
            const viajesSnap = await getDocs(viajesRef);
            const listaViajes = viajesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setViajes(listaViajes);
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
    // A) BORRAR VIAJE CON NOTIFICACIÓN 
    const borrarViaje = async (viaje) => {
        // 1. Pedimos el motivo 
        const motivo = prompt(`¿Por qué eliminas el viaje "${viaje.name}"?`, "Contenido inapropiado");
        if (!motivo) return; 

        try {
            // 2. CREAMOS LA NOTIFICACIÓN PARA EL USUARIO
            const idAvisar = viaje.userId || (viaje.participantes && viaje.participantes[0]);
            if (idAvisar) {
                await addDoc(collection(db, "notificaciones"), {
                    uidUsuario: idAvisar,
                    mensaje: `Tu viaje "${viaje.name}" ha sido eliminado por administración. Motivo: ${motivo}`,
                    leido: false,
                    fecha: serverTimestamp()
                });
            }
            // 3. BORRAMOS EL VIAJE DE LA BASE DE DATOS
            await deleteDoc(doc(db, "viajes", viaje.id));
            // 4. Actualizamos la pantalla sin recargar
            setViajes(viajes.filter(v => v.id !== viaje.id));
            alert("✅ Viaje eliminado y usuario notificado.");
        } catch (error) {
            console.error("Error admin:", error);
            alert("❌ Error al borrar el viaje");
        }
    };

    // B) CAMBIAR ROL DE USUARIO
    const cambiarRol = async (idUsuario, rolActual, nombreUsuario) => {
        const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador';
        const mensaje = rolActual === 'administrador' 
            ? `¿Quitar permisos de admin a ${nombreUsuario}?`
            : `¿Hacer ADMINISTRADOR a ${nombreUsuario}?`;
        
        if (window.confirm(mensaje)) {
            try {
                await updateDoc(doc(db, 'usuarios', idUsuario), { rol: nuevoRol });
                setUsuarios(usuarios.map(u => 
                    u.id === idUsuario ? { ...u, rol: nuevoRol } : u
                ));
            } catch (error) { 
                console.error(error); 
                alert("Error al cambiar rol"); 
            }
        }
    };

    // --- 3. RENDERIZADO ---
    return (
        <div className="admin-contenedor">
            <h1 className="titulo-grande">Panel de Administración</h1>    
            {/* ACCESIBILIDAD: role="tablist" indica que esto es un menú de pestañas */}
            <div className="zonatabs" role="tablist">
                <button 
                    onClick={() => setTabActiva('viajes')}
                    className={`boton-pes ${tabActiva === 'viajes' ? 'activa' : ''}`}
                    role="tab"
                    aria-selected={tabActiva === 'viajes'}
                    aria-controls="panel-viajes">
                    ✈️ Gestión de Viajes
                </button>
                <button 
                    onClick={() => setTabActiva('usuarios')}
                    className={`boton-pes ${tabActiva === 'usuarios' ? 'activa' : ''}`}
                    role="tab"
                    aria-selected={tabActiva === 'usuarios'}
                    aria-controls="panel-usuarios" >
                    👥 Gestión de Usuarios
                </button>
            </div>
            {cargando ? (
                <div className="estado-carga" role="status">Cargando datos... ⏳</div> 
            ) : (
                <div className="cajaprincipal">
                                        {tabActiva === 'viajes' && (
                        <div id="panel-viajes" role="tabpanel">
                            <h2 className="titulolista">Listado de Viajes ({viajes.length})</h2>
                            {viajes.length === 0 && <p className="texto-vacio">No hay viajes creados.</p>}          
                            {viajes.map(viaje => (
                                <div key={viaje.id} className="filadato">
                                    <div className="columnainfo">
                                        <h4>{viaje.name}</h4>
                                        <p><span aria-hidden="true">📍</span> {viaje.destinoPrincipal}</p>
                                    </div>
                                    <button 
                                        onClick={() => borrarViaje(viaje)} 
                                        className="boton-mini rojo"
                                        aria-label={`Eliminar viaje a ${viaje.destinoPrincipal} creado por ${viaje.name}`}
                                    >
                                        Eliminar Viaje
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- VISTA DE USUARIOS --- */}
                    {tabActiva === 'usuarios' && (
                        <div id="panel-usuarios" role="tabpanel">
                            <h2 className="titulolista">Listado de Usuarios ({usuarios.length})</h2>
                            
                            {usuarios.map(u => {
                                const esAdmin = u.rol === 'administrador';
                                return (
                                    <div key={u.id} className="filadato">
                                        <div className="columnainfo">
                                            <h4>{u.nombre || 'Usuario sin nombre'}</h4>
                                            <p>{u.email}</p>
                                            <div className="contenedor-rol">
                                                <span className={`etiqueta ${esAdmin ? 'tipo-jefe' : 'tipo-normal'}`}>
                                                    {u.rol || 'usuario'}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => cambiarRol(u.id, u.rol, u.nombre)}
                                            className="boton-mini azul"
                                            title={esAdmin ? "Degradar a Usuario" : "Promover a Admin"}
                                            aria-label={esAdmin ? `Quitar permisos de administrador a ${u.nombre}` : `Dar permisos de administrador a ${u.nombre}`}>
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