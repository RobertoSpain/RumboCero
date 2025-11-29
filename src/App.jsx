// Importaciones de React Router para gestionar la navegación
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Importación de los componentes principales de la aplicación
import Landing from './components/Landing';
import Login from './components/login';
import Registro from './components/Registro';
import Bienvenida from './components/Bienvenida';
import Header from './components/Header';
import { useState } from 'react';
import CrearViaje from './components/CrearViaje';

// Componente principal de la aplicación (estructura original adaptada)
function App() {
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || '');

  const handleLogin = (nombre) => {
    setUsuario(nombre);
    localStorage.setItem('usuario', nombre);
  };

  const handleLogout = () => {
    setUsuario('');
    localStorage.removeItem('usuario');
  };

  return (
    <Router>
      <Header usuario={usuario} onLogout={handleLogout} />
      {/* Estructura de rutas original; usamos Landing/ Login según lo disponible */}
      <Routes>
        <Route path="/" element={usuario ? <Bienvenida usuario={usuario} onLogout={handleLogout} /> : <Landing />}/>
        <Route path="/login"element={<Login onLogin={handleLogin} />}/>
        <Route path="/registro" element={<Registro />} />
        <Route path="/crear-viaje" element={usuario ? <CrearViaje /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;