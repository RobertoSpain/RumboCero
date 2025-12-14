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

    // --- 2. FUNCIONES DE ACCIÓN  ---
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
        const accion = nuevoEstado ? "BANEAR" : "DESBANEAR";
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

    // --- 3. RENDERIZADO PRO ---
    return (
        <div className="admin-contenedor">
            <h1 className="titulo-grande">
                <svg className="icono-titulo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                Panel de Administración
            </h1>
            <div className="zonatabs" role="tablist" aria-label="Secciones de administración">
                <button 
                    onClick={() => setTabActiva('viajes')}
                    className={`boton-pes ${tabActiva === 'viajes' ? 'activa' : ''}`}
                    role="tab"
                    aria-selected={tabActiva === 'viajes'}
                    aria-controls="panel-viajes" >
                    <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Viajes
                </button>
                <button 
                    onClick={() => setTabActiva('usuarios')}
                    className={`boton-pes ${tabActiva === 'usuarios' ? 'activa' : ''}`}
                    role="tab"
                    aria-selected={tabActiva === 'usuarios'}
                    aria-controls="panel-usuarios">
                    <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    Usuarios
                </button>
            </div>
            {cargando ? (
                <div className="estado-carga" role="status">
                    <svg className="spinner-carga" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Cargando panel...
                </div> 
            ) : (
                <div className="cajaprincipal">
                {/* --- PANEL DE VIAJES --- */}
                {tabActiva === 'viajes' && (
                    <div id="panel-viajes" role="tabpanel">
                         <h2 className="titulolista">Gestión de Viajes ({viajes.length})</h2>     
                         {viajes.map(viaje => (
                              <div key={viaje.id} className="filadato">
                                <div className="columnainfo">
                                    <h4>{viaje.name}</h4>
                                    <p className="flex-row">
                                        <svg className="icono-micro" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                    {viaje.destinoPrincipal}
                                    </p>
                                </div>
                                    <button 
                                        onClick={() => borrarViaje(viaje)}
                                        className="boton-mini rojo"
                                        aria-label={`Eliminar viaje ${viaje.name}`}>
                                        <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- PANEL DE USUARIOS --- */}
            {tabActiva === 'usuarios' && (
                        <div id="panel-usuarios" role="tabpanel">
                            <h2 className="titulolista">Gestión de Usuarios ({usuarios.length})</h2>
                            {usuarios.map(u => (
                            <div key={u.id} className="filadato">
                            <div className="columnainfo">
                            <h4 className="flex-row">
                             {u.nombre || 'Sin nombre'} 
                            {u.baneado && (
                             <span className="tag-baneado" title="Usuario baneado">
                            <svg className="icono-micro" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                             BANEADO
                            </span>
                            )}
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
                                            className="boton-mini verde"
                                            aria-label={`Cambiar rol de ${u.nombre}`}>
                                    {/* Icono Estrella/User */}
                                    {u.rol === 'administrador' ? (
                                    <>
                                   <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                  Quitar Admin
                                </>
                                ) : (
                               <>
                              <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                              Hacer Admin
                             </>
                             )}
                            </button>
                                        
                            <button 
                                    onClick={() => cambiarBaneo(u)}
                                    className={`boton-mini ${u.baneado ? 'azul' : 'rojo'}`}
                                    aria-label={u.baneado ? "Desbanear usuario" : "Banear usuario"}>
                                    {u.baneado ? (
                                    <>
                                <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Desbanear
                                </>
                                ) : (
                                    <>
                              <svg className="icono-mini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                 Banear </>
                             )}
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