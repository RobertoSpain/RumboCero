import React, { useState, useEffect } from 'react';
import { 
    doc, 
    collection, 
    getDocs, 
    deleteDoc,
    updateDoc 
} from 'firebase/firestore'; 

/**
 * Componente genérico para mostrar la lista de elementos.
 */
function AdminItemList({ items, onItemAction, actionLabel, primaryField, secondaryField, currentAdminId }) {
    if (items.length === 0) {
        return (
            <div className="p-10 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-500 text-lg">No hay elementos registrados para esta categoría.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Total: {items.length}</h2>
            {items.map((item) => {
                const isCurrentAdmin = item.id === currentAdminId;
                const role = item.rol;

                return (
                    <div 
                        key={item.id} 
                        className={`bg-white p-4 rounded-lg shadow-md border-l-8 flex flex-col sm:flex-row justify-between items-center transition-shadow ${
                            isCurrentAdmin ? 'border-yellow-500' : 
                            role === 'administrador' ? 'border-red-500' : 
                            'border-blue-500'
                        }`}
                    >
                        <div className="mb-2 sm:mb-0 text-left w-full sm:w-2/3">
                            <h3 className="text-lg font-bold text-gray-800 truncate">
                                {item[primaryField]}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {item[secondaryField] || 'Sin información secundaria'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                ID: <span className="font-mono text-xs p-1 bg-gray-100 rounded">{item.id}</span>
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                            {role && (
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${role === 'administrador' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {role} {isCurrentAdmin && '(TÚ)'}
                                </span>
                            )}

                            <button
                                onClick={() => onItemAction(item)}
                                className={`font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-md ${
                                    role === 'administrador' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 
                                    (role ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600')
                                }`}
                                disabled={isCurrentAdmin} 
                            >
                                {actionLabel(item)}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// 2. COMPONENTE PANEL DE ADMINISTRACIÓN (Toda la lógica)

export default function AdminPanel({ usuario, db, appId }) { 
    const [currentTab, setCurrentTab] = useState('viajes'); 
    
    // 1. Estados para los datos y la carga
    const [travels, setTravels] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorTravels, setErrorTravels] = useState('');
    const [errorUsers, setErrorUsers] = useState('');
    // 2. Referencias a colecciones (simplificadas)
    const getUsersCollectionRef = () => collection(db, 'artifacts', appId, 'public', 'data', 'usuarios'); 
    const getTravelsCollectionRef = () => collection(db, 'artifacts', appId, 'public', 'data', 'viajes'); 
    // 3. Función principal de carga de datos
    const fetchAllData = async () => {
        setLoading(true);
        setErrorTravels('');
        setErrorUsers('');
        try {
            // Cargar Usuarios
            const userSnapshot = await getDocs(getUsersCollectionRef());
            const fetchedUsers = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedUsers.sort((a, b) => a.id.localeCompare(b.id));
            setUsers(fetchedUsers);
            // Cargar Viajes
            const travelSnapshot = await getDocs(getTravelsCollectionRef());
            const fetchedTravels = travelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedTravels.sort((a, b) => a.id.localeCompare(b.id));
            setTravels(fetchedTravels);
        } catch (err) {
            console.error("Error fetching all data:", err);
            setErrorTravels(`Error al cargar viajes: ${err.message}`);
            setErrorUsers(`Error al cargar usuarios: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    // 4. Se ejecuta una sola vez al montar y cuando cambian db/appId
    useEffect(() => {
        if (db && appId) {
            fetchAllData();
        }
    }, [db, appId]); 
    // 5. Función de acción consolidada (maneja delete y update)
    const handleAction = async (item, confirmationMessage, successMessage, actionFunc, type) => {
        if (window.confirm(confirmationMessage(item))) {
            try {
                // Ejecuta la función específica de Firebase
                await actionFunc(item);
                console.log(successMessage(item)); 
                // Recarga todos los datos después de una acción exitosa
                await fetchAllData(); 
            } catch (err) {
                console.error(`Error al ejecutar acción de ${type}:`, err);
                const errorSetter = type === 'travel' ? setErrorTravels : setErrorUsers;
                errorSetter(`No se pudo completar la acción: ${err.message}`);
            }
        }
    };
    // 6. Implementaciones de Acciones Específicas
    const actionDeleteTravel = (travel) => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'viajes', travel.id));
    const handleDeleteTravel = (travel) => handleAction(
        travel,
        (t) => `¿Estás seguro de eliminar el viaje "${t.name}" de ${t.userID}?`,
        (t) => `Viaje "${t.name}" eliminado con éxito.`,
        actionDeleteTravel,
        'travel'
    );
    const actionToggleRole = async (user) => {
        const newRole = user.rol === 'administrador' ? 'usuario' : 'administrador';
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'usuarios', user.id);
        await updateDoc(userDocRef, {
            rol: newRole,
            updatedAt: new Date()
        });
    };
    const handleToggleRole = (user) => handleAction(
        user,
        (u) => `¿Cambiar rol de ${u.nombre || u.email} a ${u.rol === 'administrador' ? 'USUARIO' : 'ADMINISTRADOR'}?`,
        (u) => `Rol de ${u.nombre || u.email} cambiado a ${u.rol === 'administrador' ? 'usuario' : 'administrador'} con éxito.`,
        actionToggleRole,
        'user'
    );
    // 7. Renderizado condicional
    if (!usuario || usuario.rol !== 'administrador') {
        return (
            <div className="pt-20 p-8 text-center text-red-500">
                Acceso no autorizado. Solo Administradores.
            </div>
        );
    }
    const currentAdminId = usuario.uid;
    const isTravelsTab = currentTab === 'viajes';
    const currentItems = isTravelsTab ? travels : users;
    const currentError = isTravelsTab ? errorTravels : errorUsers;
    return (
        <div className="pt-20 p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-red-600 mb-6 border-b-4 border-red-400 pb-2">
                👑 Panel de Administración Sencillo 👑
            </h1>
            
            {/* Control de Pestañas */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-4 -mb-px">
                    <button
                        onClick={() => setCurrentTab('viajes')}
                        className={`py-2 px-4 font-semibold text-sm transition-colors rounded-t-lg ${isTravelsTab ? 'border-b-4 border-red-600 text-red-600 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Gestión de Viajes (Borrar Contenidos)
                    </button>
                    <button
                        onClick={() => setCurrentTab('usuarios')}
                        className={`py-2 px-4 font-semibold text-sm transition-colors rounded-t-lg ${!isTravelsTab ? 'border-b-4 border-red-600 text-red-600 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Gestión de Usuarios (Roles)
                    </button>
                </nav>
            </div>
            <div className="bg-white p-6 rounded-b-xl shadow-lg border border-gray-200"> 
                {currentError && <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg mb-4">{currentError}</div>}

                {/* Contenido */}
                {loading ? (
                    <p className="text-center text-blue-500 py-8">Cargando datos...</p>
                ) : (
                    <>
                        <p className="text-gray-600 mb-6">
                            {isTravelsTab ? 'El Administrador puede **Eliminar** viajes considerados inapropiados.' : 'El Administrador puede **Promover** o **Degradar** a otros usuarios.'}
                        </p>
                        <AdminItemList 
                            items={currentItems}
                            primaryField={isTravelsTab ? "name" : "nombre"}
                            secondaryField={isTravelsTab ? "destinoPrincipal" : "email"}
                            currentAdminId={isTravelsTab ? null : currentAdminId}
                            onItemAction={isTravelsTab ? handleDeleteTravel : handleToggleRole}
                            actionLabel={(item) => isTravelsTab ? "Eliminar Viaje" : (item.rol === 'administrador' ? 'Degradar' : 'Promover a Admin')}
                        />
                    </>
                )}
            </div>
        </div>
    );
}