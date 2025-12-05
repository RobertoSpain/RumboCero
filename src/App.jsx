import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/login';
import Registro from './components/Registro';
import Header from './components/Header';
import { useState } from 'react';
import CrearViaje from './components/CrearViaje';
import AdminPanel from './components/AdminPanel';
import Viajes from './components/Viajes';
import DetallesViaje from './components/DetallesViaje';
import Foro from './components/Foro';
import CrearPost from './components/CrearPost';
import DetalleForo from './components/DetalleForo';
import Perfil from './components/Perfil';

function App() {
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || '');
  const [foto, setFoto] = useState(localStorage.getItem('fotoPerfil') || ''); 
  const [rol, setRol] = useState(localStorage.getItem('rol') || '');

  // 2. MODIFICADO: Ahora aceptamos un tercer parámetro 'fotoUsuario'
  const handleLogin = (nombre, rolUsuario, fotoUsuario) => {
    setUsuario(nombre);
    setRol(rolUsuario);
    setFoto(fotoUsuario); 
    localStorage.setItem('usuario', nombre);
    localStorage.setItem('rol', rolUsuario || 'usuario');
    localStorage.setItem('fotoPerfil', fotoUsuario || ''); 
  };

  // 3. MODIFICADO: Limpiamos también la foto al salir
  const handleLogout = () => {
    setUsuario('');
    setRol('');
    setFoto(''); 
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('fotoPerfil'); 
  };

  return (
    <Router>
      <Header usuario={usuario} rol={rol} foto={foto} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
        <Route path="/registro" element={<Registro />} />
        {/* Rutas protegidas */}
        <Route path="/perfil" element={usuario ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/foro/:id" element={usuario ? <DetalleForo /> : <Navigate to="/login" replace />} />
        <Route path="/viajes" element={usuario ? <Viajes /> : <Navigate to="/login" replace />} />
        <Route path="/crear-viaje" element={usuario ? <CrearViaje /> : <Navigate to="/login" replace />} />
        <Route path="/viajes/:id" element={usuario ? <DetallesViaje /> : <Navigate to="/login" replace />} />
        <Route path="/foro" element={usuario ? <Foro /> : <Navigate to="/login" replace />} />
        <Route path="/crear-post" element={usuario ? <CrearPost /> : <Navigate to="/login" replace />} />
        {/* Protección extra para Admin */}
        <Route path='/Admin-Panel' element={
            usuario && rol === 'administrador' ? <AdminPanel /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;