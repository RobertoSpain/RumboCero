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

function App() {
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || '');
  const [rol, setRol] = useState(localStorage.getItem('rol') || '');

  const handleLogin = (nombre, rolUsuario) => {
    setUsuario(nombre);
    setRol(rolUsuario);
    
    localStorage.setItem('usuario', nombre);
    // Guardamos el rol 
    localStorage.setItem('rol', rolUsuario || 'usuario');
  };

  const handleLogout = () => {
    setUsuario('');
    setRol('');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  };

  return (
    <Router>
      <Header usuario={usuario} rol={rol} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
        <Route path="/registro" element={<Registro />} />
        {/* Rutas protegidas */}
        <Route path="/viajes" element={usuario ? <Viajes /> : <Navigate to="/login" replace />} />
        <Route path="/crear-viaje" element={usuario ? <CrearViaje /> : <Navigate to="/login" replace />} />
        <Route path="/viajes/:id" element={usuario ? <DetallesViaje /> : <Navigate to="/login" replace />} />
        {/* Protección extra: Si intenta entrar al admin y no es admin, lo mandamos al inicio */}
        <Route path='/Admin-Panel' element={
            usuario && rol === 'administrador' ? <AdminPanel /> : <Navigate to="/" replace />
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;