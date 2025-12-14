import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import '../assets/Perfil.css'; 

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [archivo, setArchivo] = useState(null);
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
      if (archivo) {
        const storageRef = ref(storage, `perfiles/${usuario.uid}-${Date.now()}`); 
        const snapshot = await uploadBytes(storageRef, archivo);
        urlFotoFinal = await getDownloadURL(snapshot.ref); 
      }
      // 2. Actualizar Auth
      await updateProfile(usuario, {
        displayName: nombre,
        photoURL: urlFotoFinal
      });
      // 3. Actualizar Firestore
      const userRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userRef, {
        nombre: nombre,
        foto: urlFotoFinal 
      });
      // 4. Actualizar LocalStorage
      localStorage.setItem('usuario', nombre);
      localStorage.setItem('fotoPerfil', urlFotoFinal); 
      // 5. Estado visual
      setUsuario({
        ...usuario,
        displayName: nombre,
        photoURL: urlFotoFinal});
      setFoto(urlFotoFinal);
      setArchivo(null); 
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
        {/* Formulario Accesible */}
        <form onSubmit={guardarCambios} className="formularioperfil" role="form" aria-label="Formulario de edición de perfil">
          <div className="campoformulario">
            <label htmlFor="nombreinput">Nombre de Usuario</label>
            <input 
              type="text" 
              id="nombreinput"
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              className="entradadatos"
              placeholder="Ej: Roberto España"
              required
              aria-required="true"/>
          </div>

          <div className="campoformulario">
            <span className="labeltitulo" id="label-foto">Foto de Perfil</span>
            {/* ZONA DE SUBIDA MODERNA Y ACCESIBLE */}
            <label 
                htmlFor="ficheroperfil" 
                className={`zonasubidaperfil ${archivo ? 'archivoseleccionado' : ''}`}
                role="button"
                tabIndex="0"
                aria-label="Subir nueva foto de perfil">
                <span className="iconoperfil">{archivo ? '✅' : '📤'}</span>
                <span className="textoperfil">{archivo ? archivo.name : "Subir foto nueva"}</span>
            </label>
            <input 
              type="file" 
              id="ficheroperfil"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files[0])} 
              className="inputoculto"
              aria-labelledby="label-foto"/>
            <small className="textoayuda">Elige una foto chula de tu dispositivo.</small>
          </div>
          <button type="submit" className="botonguardar" disabled={cargando} aria-busy={cargando}>
            {cargando ? '🔄 Subiendo...' : '💾 Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}