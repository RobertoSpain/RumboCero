import { useState, useEffect } from 'react';
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
        // Contamos las respuestas de la subcolección
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

  if (loading) return <div className="foro cargando">Cargando comunidad...</div>;

  return (
    // Usamos 'foro' como clase principal para compartir fondo con CrearPost
    <div className="foro">
      
      {/* Cabecera con título y botón */}
      <div className="cabeceraforo">
        <h2 className="tituloseccion">💬 Mini-Foro</h2>
        <Link to="/crear-post" className="boton-nuevo">
          + Nuevo Tema
        </Link>
      </div>

      {/* Lista de tarjetas */}
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
                {/* Contador de respuestas */}
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
                    <button onClick={() => borrarPost(post.id)} className="boton-borrar">
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