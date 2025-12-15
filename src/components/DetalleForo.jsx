import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase.js';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import '../assets/DetalleForo.css';

export default function DetalleForo() {
  const { id } = useParams(); 
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  // 1. CARGAR DATOS
  useEffect(() => {
    const checkAdmin = () => {
      const rolGuardado = localStorage.getItem('rol');
      if (rolGuardado === 'administrador') setEsAdmin(true);
    };
    checkAdmin();
    const obtenerPost = async () => {
      try {
        const docRef = doc(db, 'foro', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    obtenerPost();

    const comentariosRef = collection(db, 'foro', id, 'comentarios');
    const q = query(comentariosRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Reciente'
      }));
      setComentarios(comData);
    });
    return () => unsubscribe();
  }, [id]);

  // 2. ENVIAR COMENTARIO
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
        createdAt: serverTimestamp()
      });
      setNuevoComentario(''); 
    } catch (error) { console.error(error); alert("Error al enviar comentario."); }
  };

  // 3. BORRAR COMENTARIO 
  const borrarComentario = async (idComentario) => {
    if(!window.confirm("¿Seguro que quieres eliminar este comentario?")) return;
    try {
        const comentarioRef = doc(db, 'foro', id, 'comentarios', idComentario);
        await deleteDoc(comentarioRef);
    } catch (error) { console.error("Error borrando:", error); alert("No se pudo borrar."); }
  };
  if (loading) return <div className="paginadetalle centrado">Cargando conversación...</div>;
  if (!post) return <div className="paginadetalle centrado">Post no encontrado 😢</div>;
  const usuarioActual = auth.currentUser;

  return (
    <div className="paginadetalle">
      <div className="contenedordetalle">
                <Link to="/foro" className="enlacevolver">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="icono-volver">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al Foro
        </Link>
        <div className="cajapost">
          <h1 className="titulopost">{post.titulo}</h1>
          <div className="datospost">
            Escrito por <span className="autor-resaltado">{post.autor}</span>
          </div>
          <div className="cuerpopost">
            {post.contenido}
          </div>
        </div>
        <div className="seccionrespuestas">
          <h3 className="titulorespuestas">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
             </svg>
             Respuestas ({comentarios.length})
          </h3>
          <div className="listacomentarios">
            {comentarios.length === 0 && <p className="textovacio">Nadie ha respondido aún. ¡Sé el primero!</p>}
            {comentarios.map(com => {
                const esMio = usuarioActual && usuarioActual.uid === com.userId;
                const puedeBorrar = esMio || esAdmin;
                return (
                  <div key={com.id} className="tarjetacomentario">
                    <div className="cabeceracomentario">
                      <span className="autorcomentario">{com.autor}</span>
                      <span className="fechacomentario">{com.fecha}</span>
                    </div>
                    <p className="textocomentario">{com.texto}</p>
                    
                    {puedeBorrar && (
                      <button 
                        className="botonborrar" 
                        onClick={() => borrarComentario(com.id)}
                        title={esMio ? "Borrar mi comentario" : "Borrar como Admin"}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                         </svg>
                      </button> 
                    )}
                  </div>
                );
            })}
          </div>
          <div className="zonaescribir">
            <h4>Responder al tema:</h4>
            <form onSubmit={manejarEnvio}>
              <textarea 
                className="cajatexto" 
                rows="3" 
                placeholder="Escribe tu opinión aquí..."
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="botonenviar">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                 </svg>
                 Enviar Respuesta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}