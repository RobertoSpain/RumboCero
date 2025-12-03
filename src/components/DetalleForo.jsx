import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase.js';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc } from 'firebase/firestore';
import '../assets/DetalleForo.css';

export default function DetalleForo() {
  const { id } = useParams(); 
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estado para saber si el usuario actual es JEFE (Admin)
  const [esAdmin, setEsAdmin] = useState(false);

  // 1. CARGAR DATOS Y VERIFICAR PERMISOS
  useEffect(() => {
    // A) Chequear si soy Admin
    const checkAdmin = () => {
      const rolGuardado = localStorage.getItem('rol');
      if (rolGuardado === 'administrador') {
        setEsAdmin(true);
      }
    };
    checkAdmin();
    // B) Cargar el Post Principal
    const obtenerPost = async () => {
      try {
        const docRef = doc(db, 'foro', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    obtenerPost();
    // C) Suscribirse a los comentarios en tiempo real
    const comentariosRef = collection(db, 'foro', id, 'comentarios');
    const q = query(comentariosRef, orderBy('createAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Formateo de fecha bonito
        fecha: doc.data().createAt?.toDate ? doc.data().createAt.toDate().toLocaleString() : 'Reciente'
      }));
      setComentarios(comData);
    });
    return () => unsubscribe();
  }, [id]);

  // 2. ENVIAR NUEVO COMENTARIO
  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    const user = auth.currentUser;
    if (!user) return alert("Debes iniciar sesión para comentar.");

    try {
      await addDoc(collection(db, 'foro', id, 'comentarios'), {
        texto: nuevoComentario,
        autor: user.displayName || user.email,
        userId: user.uid, 
        createAt: Timestamp.now()
      });
      setNuevoComentario(''); 
    } catch (error) {
      console.error(error);
      alert("Error al enviar comentario.");
    }
  };

  // 3. BORRAR COMENTARIO 
  const borrarComentario = async (idComentario) => {
    if(!window.confirm("¿Seguro que quieres eliminar este comentario?")) return;
    try {
        // Ruta: foro -> ID_POST -> comentarios -> ID_COMENTARIO
        const comentarioRef = doc(db, 'foro', id, 'comentarios', idComentario);
        await deleteDoc(comentarioRef);
    } catch (error) {
        console.error("Error borrando:", error);
        alert("No se pudo borrar.");
    }
  };
  if (loading) return <div className="detalle-foro-page text-center">Cargando conversación...</div>;
  if (!post) return <div className="detalle-foro-page text-center">Post no encontrado 😢</div>;
  // Usuario actual para comparar dueños
  const usuarioActual = auth.currentUser;
  return (
    <div className="detalle-foro-page">
      <div className="detalle-container">
        <Link to="/foro" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>
          &larr; Volver al Foro
        </Link>
        <div className="post-principal">
          <h1 className="principal-titulo">{post.titulo}</h1>
          <div className="principal-meta">
            Escrito por <strong style={{color: '#3b82f6'}}>{post.autor}</strong>
          </div>
          <div className="principal-contenido">
            {post.contenido}
          </div>
        </div>
        <div className="comentarios-section">
          <h3 className="comentarios-titulo">💬 Respuestas ({comentarios.length})</h3>
          <div className="lista-comentarios">
            {comentarios.length === 0 && <p style={{color:'#888', fontStyle:'italic'}}>Nadie ha respondido aún. ¡Sé el primero!</p>}
            {comentarios.map(com => {
                // 1. Es mío si mi UID coincide con el del comentario
                const esMio = usuarioActual && usuarioActual.uid === com.userId;
                // 2. Puedo borrar si es mío O si soy Admin
                const puedeBorrar = esMio || esAdmin;
                return (
                  <div key={com.id} className="comentario-card" style={{position: 'relative'}}>
                    <div className="comentario-header">
                      <span className="comentario-autor">{com.autor}</span>
                      <span className="comentario-fecha">{com.fecha}</span>
                    </div>
                    <p className="comentario-texto">{com.texto}</p>
                  {puedeBorrar && (
                <button 
                  className="btn-borrar-comentario" 
                  onClick={() => borrarComentario(com.id)}
                 title={esMio ? "Borrar mi comentario" : "Borrar como Admin"}
                 > 🗑️</button>
                  )}
                  </div>
                );
            })}
          </div>
          <div className="form-responder">
            <h4>Responder al tema:</h4>
            <form onSubmit={manejarEnvio}>
              <textarea 
                className="textarea-responder" 
                rows="3" 
                placeholder="Escribe tu opinión aquí..."
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="btn-enviar">Enviar Respuesta</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}