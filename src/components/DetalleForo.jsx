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
  const [esAdmin, setEsAdmin] = useState(false);

  // 1. CARGAR DATOS
  useEffect(() => {
    const checkAdmin = () => {
      const rolGuardado = localStorage.getItem('rol');
      if (rolGuardado === 'administrador') {
        setEsAdmin(true);
      }
    };
    checkAdmin();

    // B) Cargar Post
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

    // C) Comentarios en tiempo real
    const comentariosRef = collection(db, 'foro', id, 'comentarios');
    const q = query(comentariosRef, orderBy('createAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().createAt?.toDate ? doc.data().createAt.toDate().toLocaleString() : 'Reciente'
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
        const comentarioRef = doc(db, 'foro', id, 'comentarios', idComentario);
        await deleteDoc(comentarioRef);
    } catch (error) {
        console.error("Error borrando:", error);
        alert("No se pudo borrar.");
    }
  };

  if (loading) return <div className="paginadetalle centrado">Cargando conversación...</div>;
  if (!post) return <div className="paginadetalle centrado">Post no encontrado 😢</div>;

  const usuarioActual = auth.currentUser;

  return (
    <div className="paginadetalle">
      <div className="contenedordetalle">
        <Link to="/foro" className="enlacevolver">
          &larr; Volver al Foro
        </Link>
        {/* POST PRINCIPAL */}
        <div className="cajapost">
          <h1 className="titulopost">{post.titulo}</h1>
          <div className="datospost">
            Escrito por <span className="autor-resaltado">{post.autor}</span>
          </div>
          <div className="cuerpopost">
            {post.contenido}
          </div>
        </div>

        {/* SECCIÓN RESPUESTAS */}
        <div className="seccionrespuestas">
          <h3 className="titulorespuestas">💬 Respuestas ({comentarios.length})</h3>
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
               title={esMio ? "Borrar mi comentario" : "Borrar como Admin"}
              > 🗑️</button> )}
                </div>
             );
        })}
       </div>
      {/* FORMULARIO RESPONDER */}
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
              <button type="submit" className="botonenviar">Enviar Respuesta</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}