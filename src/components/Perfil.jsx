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
      
      await updateProfile(userReal, {
        displayName: nombre,
        photoURL: urlFotoFinal
      });

      const userRef = doc(db, 'usuarios', userReal.uid);
      await updateDoc(userRef, {
        nombre: nombre,
        foto: urlFotoFinal 
      });

      localStorage.setItem('usuario', nombre);
      localStorage.setItem('fotoPerfil', urlFotoFinal); 
      setNombre(nombre);
      setFoto(urlFotoFinal);
      
      await userReal.reload(); 
      setUsuario(auth.currentUser); 
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
                <span className="flexcentro">
                    <svg className="spinner-loading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                </span>
            ) : (
                <span className="flexcentro">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true" className="icono-btn">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                    </svg>
                    Guardar Cambios
                </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}