import  { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase.js"; 
import '../assets/Foro.css'; 
export default function CrearPost() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarPublicacion = async (e) => {
    e.preventDefault();
    if(!titulo || !contenido) return;

    setCargando(true);
    const user = auth.currentUser;

    if (!user) {
        alert("Debes iniciar sesión para publicar.");
        navigate('/login');
        return;
    }
    try {
      await addDoc(collection(db, "foro"), {
        titulo: titulo,
        contenido: contenido,
        autor: user.displayName || user.email, 
        userId: user.uid,
        createAt: Timestamp.now(),
        likes: 0
      });
      navigate('/foro'); 
    } catch (error) {
      console.error(error);
      alert("Error al publicar el mensaje.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="foro">
      <div className="crearpost">
        <h2 style={{marginTop: 0, color: '#111827'}}>📝 Nuevo Tema</h2>
        <p style={{color: '#6b7280', marginBottom: '20px'}}>Comparte tus consejos o preguntas con la comunidad.</p>
        
        <form onSubmit={manejarPublicacion}>
          <div className="form">
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Título:</label>
            <input 
                type="text" 
                placeholder="Ej: ¿Mejor época para ir a Japón?" 
                className="input-post"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                required
            />
          </div>
          <div className="form">
            <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Mensaje:</label>
            <textarea 
                placeholder="Escribe aquí..." 
                className="textarea-post"
                rows="6"
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                required
            ></textarea>
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <Link to="/foro" className="botonborrarpost" style={{textDecoration:'none', textAlign:'center', paddingTop:'12px'}}>
                Cancelar
            </Link>
            <button type="submit" className="botonpublicar" disabled={cargando}>
                {cargando ? 'Publicando...' : 'Publicar Mensaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}