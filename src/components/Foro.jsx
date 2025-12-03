import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase.js'; 
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import '../assets/Foro.css'; 

export default function Foro() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    // 1. Verificar Admin
    const checkAdmin = () => {
      const user = auth.currentUser;
      const rolGuardado = localStorage.getItem('rol');
      if (user && rolGuardado === 'administrador') {
        setEsAdmin(true);
      }
    };
    checkAdmin();
    // 2. Cargar posts y contar respuestas
    const postsRef = collection(db, 'foro');
    const q = query(postsRef, orderBy('createAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(snapshot.docs.map(async (documento) => {
        const data = documento.data();
        const id = documento.id;
        const comentariosRef = collection(db, 'foro', id, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);
        const numeroRespuestas = comentariosSnap.size;
        return {
          id: id,
          ...data,
          fecha: data.createAt?.toDate ? data.createAt.toDate().toLocaleDateString() : 'Reciente',
          respuestas: numeroRespuestas // Guardamos el número
        };
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const borrarPost = async (id) => {
    if(window.confirm("👮‍♂️ ADMIN: ¿Borrar este mensaje y sus respuestas?")) {
        try {
            await deleteDoc(doc(db, 'foro', id));
        } catch (err) {
            console.error(err);
            alert("Error al borrar");
        }
    }
  };

  if (loading) return <div className="foro-page text-center">Cargando comunidad...</div>;
  return (
    <div className="foro-page">
      <div className="foro-header">
        <h2 className="foro-title">💬 Mini-Foro</h2>
        <Link to="/crear-post" className="btn-nuevo-tema">
          + Nuevo Tema
        </Link>
      </div>
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="text-center p-10 bg-white rounded shadow">
            <h3>¡El foro está vacío! 🦗</h3>
            <p>Sé el primero en compartir tu experiencia.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div>
                    <h3 className="post-title">{post.titulo}</h3>
                    <div className="post-meta">
                        <span>Por: <span className="post-author">{post.autor}</span></span>
                        <span>• {post.fecha}</span>
                    </div>
                </div>
                {/* Etiqueta con número de respuestas */}
                <div style={{fontSize: '0.9rem', color: post.respuestas > 0 ? '#3b82f6' : '#9ca3af', fontWeight: 'bold'}}>
                    {post.respuestas} {post.respuestas === 1 ? 'respuesta' : 'respuestas'}
                </div>
              </div>
        <p className="post-content">{post.contenido}</p>
             <div className="post-actions" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                  <Link to={`/foro/${post.id}`} style={{textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}>
                      💬 Responder / Ver Hilo ({post.respuestas})
                  </Link>
                  {esAdmin && (
                    <button onClick={() => borrarPost(post.id)} className="btn-borrar-post">
                        🗑️ Eliminar
                    </button>
                  )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}