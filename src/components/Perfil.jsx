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
    const userReal = auth.currentUser;

    if (!userReal) return;
    
    setCargando(true);
    try {
      let urlFotoFinal = foto; 
      
      // 1. Actualizar en Firebase Auth
      await updateProfile(userReal, {
        displayName: nombre,
        photoURL: urlFotoFinal
      });
      // 2. Actualizar en Firestore
      const userRef = doc(db, 'usuarios', userReal.uid);
      await updateDoc(userRef, {
        nombre: nombre,
        foto: urlFotoFinal 
      });
      // 3. Actualizar LocalStorage y Estado local
      localStorage.setItem('usuario', nombre);
      localStorage.setItem('fotoPerfil', urlFotoFinal); 
      setNombre(nombre);
      setFoto(urlFotoFinal);
      
      await userReal.reload(); 
      setUsuario(auth.currentUser); 
      window.dispatchEvent(new Event("perfilActualizado"));
      alert("¡Perfil actualizado con éxito!");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) return <div className="cargandoperfil" role="status">Cargando tu perfil...</div>;

  return (
    <div className="paginaperfil">
      <div className="cajaperfil">
        
        <h1 className="tituloperfil">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" className="icono-titulo">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Editar Perfil
        </h1>
        <div className="cabeceraperfil">
          <img 
            src={foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
            alt={`Foto de perfil actual de ${nombre}`} 
            className="avatarimagen"
            onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} />
          <h3 className="nombreusuario">{nombre || usuario?.email}</h3>
          <p className="correousuario">{usuario?.email}</p>
        </div>
        
        <form onSubmit={guardarCambios} className="formularioperfil" aria-label="Formulario de edición de perfil">
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
            {cargando ? (
                <span className="flexcentro">Guardando...</span>
            ) : (
                <span className="flexcentro">
                    Guardar Cambios
                </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}