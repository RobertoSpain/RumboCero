import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase.js'; 
import { collection, onSnapshot, query, orderBy, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import '../assets/Foro.css'; 

export default function Foro() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    // 1. Verificar si es Admin
    const checkAdmin = () => {
      const user = auth.currentUser;
      const rolGuardado = localStorage.getItem('rol');
      if (user && rolGuardado === 'administrador') {
        setEsAdmin(true);
      }
    };
    checkAdmin();

    // 2. Cargar posts
    const postsRef = collection(db, 'foro');
    const q = query(postsRef, orderBy('createAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(snapshot.docs.map(async (documento) => {
        const data = documento.data();
        const id = documento.id;
        const comentariosRef = collection(db, 'foro', id, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);
        return {
          id: id,
          ...data,
          fecha: data.createAt?.toDate ? data.createAt.toDate().toLocaleDateString() : 'Reciente',
          respuestas: comentariosSnap.size
        };
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- OPCIÓN A: CENSURAR  ---
  const censurarPost = async (id) => {
    if (window.confirm("⚠️ ¿Censurar este mensaje? Se cambiará el texto por un aviso.")) {
        try {
            const postRef = doc(db, 'foro', id);
            await updateDoc(postRef, {
                titulo: "⛔ TEMA ELIMINADO",
                contenido: "Este mensaje ha sido eliminado por un administrador por incumplir las normas.",
                autor: "Administrador",
                respuestas: 0 
            });
        } catch (err) {
            console.error(err);
            alert("Error al censurar");
        }
    }
  };
  // --- OPCIÓN B: BORRAR  ---
  const borrarPost = async (id) => {
    if (window.confirm("🗑️ ¿Borrar DEFINITIVAMENTE este post? Desaparecerá para siempre.")) {
        try {
            await deleteDoc(doc(db, 'foro', id));
        } catch (err) {
            console.error(err);
            alert("Error al borrar");
        }
    }
  };
  if (loading) return <div className="foro cargando">Cargando comunidad...</div>;

  return (
    <div className="foro">
      
      <div className="cabeceraforo">
        <h2 className="tituloseccion">💬 Mini-Foro</h2>
        <Link to="/crear-post" className="boton-nuevo">
          + Nuevo Tema
        </Link>
      </div>
      <div className="lista-temas">
        {posts.length === 0 ? (
          <div className="cajavacia">
            <h3>¡El foro está vacío! 🦗</h3>
            <p>Sé el primero en compartir tu experiencia.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="tarjeta-tema">
              
              <div className="tarjeta">
                <div>
                    <h3 className="titulotema">{post.titulo}</h3>
                    <div className="datostema">
                        <span>Por: <span className="nombre-autor">{post.autor}</span></span>
                        <span>• {post.fecha}</span>
                    </div>
                </div>
                <div className={`contador-respuestas ${post.respuestas > 0 ? 'con-respuestas' : 'sin-respuestas'}`}>
                    {post.respuestas} {post.respuestas === 1 ? 'respuesta' : 'respuestas'}
                </div>
              </div>

              <p className="texto">{post.contenido}</p> 
              <div className="pietarjeta">
                  <Link to={`/foro/${post.id}`} className="enlace-responder">
                      💬 Responder / Ver Hilo ({post.respuestas})
                  </Link>
                  {esAdmin && (
                    <div className="acciones-admin">
                        <button onClick={() => censurarPost(post.id)} className="boton-censurar">
                            🚨 Censurar
                        </button>
                        <button onClick={() => borrarPost(post.id)} className="boton-borrar">
                            🗑️ Borrar
                        </button>
                    </div>
                  )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}