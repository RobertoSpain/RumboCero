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
      let urlFotoFinal = foto; 
      // 2. Actualizar Auth
      await updateProfile(usuario, {
        displayName: nombre,
        photoURL: urlFotoFinal
      });
            const userRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userRef, {
        nombre: nombre,
        foto: urlFotoFinal 
      });
            localStorage.setItem('usuario', nombre);
      localStorage.setItem('fotoPerfil', urlFotoFinal); 
            setUsuario({
        ...usuario,
        displayName: nombre,
        photoURL: urlFotoFinal
      });
      setFoto(urlFotoFinal);
      
      auth.currentUser.reload(); 
      
      alert("¡Perfil actualizado con éxito! 📸");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) return <div className="cargandoperfil">Cargando tu perfil...</div>;
  return (
    <div className="paginaperfil">
      <div className="cajaperfil">
        <h1 className="tituloperfil">👤 Editar Perfil</h1>
        
        <div className="cabeceraperfil">
          <img 
            src={foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
            alt={`Foto de perfil de ${nombre}`} 
            className="avatarimagen"
            onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
          />
          <h3 className="nombreusuario">{nombre || usuario.email}</h3>
          <p className="correousuario">{usuario.email}</p>
        </div>
        
        <form onSubmit={guardarCambios} className="formularioperfil" role="form" aria-label="Formulario de edición de perfil">
          <div className="campoformulario">
            <label htmlFor="nombreinput">Nombre de Usuario</label>
            <input 
              type="text" 
              id="nombreinput"
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              className="entradadatos"
              placeholder="Ej: Fran Ortiz"
              required
              aria-required="true"/>
          </div>
          <div className="campoformulario">
            <label htmlFor="fotoinput">URL de la Foto de Perfil</label>
            <input 
              type="text" 
              id="fotoinput"
              value={foto} 
              onChange={(e) => setFoto(e.target.value)} 
              className="entradadatos"
              placeholder="Pega aquí la URL de la imagen (ej: https://ejemplo.com/mi-foto.png)"
            />
            <small className="textoayuda">Copia y pega la URL de la imagen que quieres usar.</small>
          </div> 
          <button type="submit" className="botonguardar" disabled={cargando} aria-busy={cargando}>
            {cargando ? '🔄 Guardando...' : '💾 Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}