import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import '../assets/Perfil.css'; 

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Escuchamos al usuario logueado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuario(user);
        setNombre(user.displayName || '');
        setFoto(user.photoURL || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!usuario) return;
    setCargando(true);

    try {
      await updateProfile(usuario, {
        displayName: nombre,
        photoURL: foto
      });

      const userRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userRef, {
        nombre: nombre,
        foto: foto 
      });

      // 3. Actualizar LocalStorage
      localStorage.setItem('usuario', nombre);
      // --- NUEVO: Guardamos también la foto para que el Header la vea ---
      localStorage.setItem('fotoPerfil', foto); 

      alert("¡Perfil actualizado con éxito!");
      window.location.reload(); 
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) return <div className="perfil-center">Cargando tu perfil...</div>;
  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h1 className="perfil-title">👤 Editar Perfil</h1>
        
        {/* Previsualización */}
        <div className="perfil-header">
          <img 
            src={foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
            alt="Avatar" 
            className="perfil-avatar"
            onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
          />
          <p className="perfil-email">{usuario.email}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={guardarCambios} className="perfil-form">
          <div className="form-group">
            <label>Nombre de Usuario</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              className="input-perfil"
              placeholder="Ej: Roberto España"
              required
            />
          </div>

          <div className="form-group">
            <label>Foto de Perfil (URL)</label>
            <input 
              type="text" 
              value={foto} 
              onChange={(e) => setFoto(e.target.value)} 
              className="input-perfil"
              placeholder="https://..."
            />
            <small className="help-text">Pega aquí el enlace de una imagen de Google.</small>
          </div>
          <button type="submit" className="btn-guardar" disabled={cargando}>
            {cargando ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}