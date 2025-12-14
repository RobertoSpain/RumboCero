import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/login';
import Registro from './components/Registro';
import Header from './components/Header';
import { useState, useEffect } from 'react'; 
import CrearViaje from './components/CrearViaje';
import AdminPanel from './components/AdminPanel';
import Viajes from './components/Viajes';
import DetallesViaje from './components/DetallesViaje';
import Foro from './components/Foro';
import CrearPost from './components/CrearPost';
import DetalleForo from './components/DetalleForo';
import Perfil from './components/Perfil';
import Estadisticas from './components/Estadisticas';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Contacto from './components/Contacto';

function App() {
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || '');
  const [foto, setFoto] = useState(localStorage.getItem('fotoPerfil') || ''); 
  const [rol, setRol] = useState(localStorage.getItem('rol') || '');

  // 2. Login
  const handleLogin = (nombre, rolUsuario, fotoUsuario) => {
    setUsuario(nombre);
    setRol(rolUsuario);
    setFoto(fotoUsuario); 
    localStorage.setItem('usuario', nombre);
    localStorage.setItem('rol', rolUsuario || 'usuario');
    localStorage.setItem('fotoPerfil', fotoUsuario || ''); 
  };

  // 3. Logout (
  const handleLogout = () => {
    setUsuario('');
    setRol('');
    setFoto(''); 
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('fotoPerfil'); 
  };
  // busca si el usuario esta baneado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             if (docSnap.data().baneado === true) {
                alert("⛔ SESIÓN CERRADA: Tu cuenta ha sido suspendida por administración.");
                await signOut(auth); 
                handleLogout();      
                window.location.href = '/';
             }
          }
        } catch (error) {
          console.error("Error verificando seguridad:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Header usuario={usuario} rol={rol} foto={foto} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
        <Route path="/registro" element={<Registro />} />
        <Route path="/contacto" element={<Contacto />} />
        {/* Rutas protegidas */}
        <Route path="/perfil" element={usuario ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/foro/:id" element={usuario ? <DetalleForo /> : <Navigate to="/login" replace />} />
        <Route path="/viajes" element={usuario ? <Viajes /> : <Navigate to="/login" replace />} />
        <Route path="/crear-viaje" element={usuario ? <CrearViaje /> : <Navigate to="/login" replace />} />
        <Route path="/viajes/:id" element={usuario ? <DetallesViaje /> : <Navigate to="/login" replace />} />
        <Route path="/foro" element={usuario ? <Foro /> : <Navigate to="/login" replace />} />
        <Route path="/crear-post" element={usuario ? <CrearPost /> : <Navigate to="/login" replace />} />
        <Route path="/estadisticas" element={usuario ? <Estadisticas /> : <Navigate to="/login" replace />} />
                <Route path='/Admin-Panel' element={
            usuario && rol === 'administrador' ? <AdminPanel /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;