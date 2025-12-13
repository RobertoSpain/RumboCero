import { useState, useEffect } from 'react';
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
            // Cargar Viajes
            const viajesRef = collection(db, 'viajes');
            const viajesSnap = await getDocs(viajesRef);
            setViajes(viajesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            // Cargar Usuarios
            const usuariosRef = collection(db, 'usuarios');
            const usuariosSnap = await getDocs(usuariosRef);
            setUsuarios(usuariosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    // --- 2. FUNCIONES DE ACCIÓN ---
    const borrarViaje = async (viaje) => {
        const motivo = prompt(`¿Por qué eliminas el viaje "${viaje.name}"?`, "Contenido inapropiado");
        if (!motivo) return; 
        try {
            const idAvisar = viaje.userId || (viaje.participantes && viaje.participantes[0]);
            if (idAvisar) {
                await addDoc(collection(db, "notificaciones"), {
                    uidUsuario: idAvisar,
                    mensaje: `Tu viaje "${viaje.name}" eliminado. Motivo: ${motivo}`,
                    leido: false,
                    fecha: serverTimestamp()
                });
            }
            await deleteDoc(doc(db, "viajes", viaje.id));
            setViajes(viajes.filter(v => v.id !== viaje.id));
            alert("✅ Viaje eliminado y aviso enviado.");
        } catch (error) {
            console.error(error);
            alert("Error al borrar viaje.");
        }
    };

    // B) CAMBIAR ROL
    const cambiarRol = async (usuario) => {
        const nuevoRol = usuario.rol === 'administrador' ? 'usuario' : 'administrador';
        if (window.confirm(`¿Cambiar rol de ${usuario.nombre} a ${nuevoRol}?`)) {
            try {
                await updateDoc(doc(db, 'usuarios', usuario.id), { rol: nuevoRol });
                setUsuarios(usuarios.map(u => u.id === usuario.id ? { ...u, rol: nuevoRol } : u));
            } catch (error) { console.error(error); }
        }
    };

    const cambiarBaneo = async (usuario) => {
        const nuevoEstado = !usuario.baneado; 
        const accion = nuevoEstado ? "BANEAR 🚫" : "DESBANEAR 😇";
        if (window.confirm(`¿Seguro que quieres ${accion} a ${usuario.nombre}?`)) {
            try {
                await updateDoc(doc(db, 'usuarios', usuario.id), { baneado: nuevoEstado });
                    setUsuarios(usuarios.map(u => 
                    u.id === usuario.id ? { ...u, baneado: nuevoEstado } : u
                ));
            } catch (error) {
                console.error(error);
                alert("Error al cambiar estado de baneo.");
            }
        }
    };
    // --- 3. RENDERIZADO ---
    return (
        <div className="admin-contenedor">
            <h1 className="titulo-grande">Panel de Administración</h1>    
            <div className="zonatabs" role="tablist">
                <button 
                    onClick={() => setTabActiva('viajes')}
                    className={`boton-pes ${tabActiva === 'viajes' ? 'activa' : ''}`}
                    role="tab">
                    ✈️ Viajes
                </button>
                <button 
                    onClick={() => setTabActiva('usuarios')}
                    className={`boton-pes ${tabActiva === 'usuarios' ? 'activa' : ''}`}
                    role="tab">
                    👥 Usuarios
                </button>
            </div>
            {cargando ? (
                <div className="estado-carga">Cargando...</div> 
            ) : (
                <div className="cajaprincipal">
                    {/* LISTA DE VIAJES */}
                    {tabActiva === 'viajes' && (
                        <div>
                            <h2 className="titulolista">Viajes ({viajes.length})</h2>     
                            {viajes.map(viaje => (
                                <div key={viaje.id} className="filadato">
                                    <div className="columnainfo">
                                    <h4>{viaje.name}</h4>
                                    <p>📍 {viaje.destinoPrincipal}</p>
                                </div>
                            <button 
                                    onClick={() => borrarViaje(viaje)}
                                    className="boton-mini rojo">
                                    Eliminar
                                 </button>
                             </div>
                         ))}
                    </div>
            )}
                    {/* LISTA DE USUARIOS */}
                    {tabActiva === 'usuarios' && (
                        <div>
                            <h2 className="titulolista">Usuarios ({usuarios.length})</h2>
                            {usuarios.map(u => (
                                <div key={u.id} className="filadato">
                                    <div className="columnainfo">
                                        <h4>
                                            {u.nombre || 'Sin nombre'} 
                                            {u.baneado && <span className="tag-baneado" style={{color:'red', marginLeft:'5px'}}>(BANEADO)</span>}
                                        </h4>
                                        <p>{u.email}</p>
                                        <div className="contenedor-rol">
                                            <span className={`etiqueta ${u.rol === 'administrador' ? 'tipo-jefe' : 'tipo-normal'}`}>
                                                {u.rol || 'usuario'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="botones-grupo">
                                        <button 
                                            onClick={() => cambiarRol(u)}
                                            className="boton-mini azul">
                                            {u.rol === 'administrador' ? '🔽 Rol' : '⭐ Rol'}
                                        </button>
                                        <button 
                                            onClick={() => cambiarBaneo(u)}
                                            className={`boton-mini ${u.baneado ? 'verde' : 'rojo'}`}>
                                        {u.baneado ? '😇 Desbanear' : '🚫 Banear'}
                                    </button>
                                </div>
                             </div>
                         ))}
                    </div>
                 )}
            </div>
         )}
    </div>
    );
}