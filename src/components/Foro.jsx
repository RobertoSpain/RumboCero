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
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const listaTemporal = [];
      for (const documento of snapshot.docs) {
        const data = documento.data();
        const id = documento.id;
        const comentariosRef = collection(db, 'foro', id, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);
        
        listaTemporal.push({
          id: id,
          ...data,
          fecha: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Reciente',
          respuestas: comentariosSnap.size
        });
      }

      setPosts(listaTemporal);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const censurarPost = async (id) => {
    if (window.confirm("⚠️ ¿Censurar este mensaje? Se cambiará el texto por un aviso.")) {
        try {
            const postRef = doc(db, 'foro', id);
            await updateDoc(postRef, {
                titulo: "⛔ TEMA ELIMINADO",
                contenido: "Este mensaje ha sido eliminado por un administrador por incumplir las normas.",
                autor: "Administrador",
            });
        } catch (err) { console.error(err); alert("Error al censurar"); }
    }
  };
  const borrarPost = async (id) => {
    if (window.confirm("🗑️ ¿Borrar DEFINITIVAMENTE este post?")) {
        try {
            await deleteDoc(doc(db, 'foro', id));
        } catch (err) { console.error(err); alert("Error al borrar"); }
    }
  };
  if (loading) return <div className="foro cargando" role="status">Cargando comunidad...</div>;

  return (
    <div className="foro">
      <div className="contenedorforo">
        <div className="cabeceraforo">
            <h2 className="tituloseccion">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.18.063-2.33.12-3.458.168m0 0a2.12 2.12 0 00-1.812 1.913m0 0a2.12 2.12 0 01-1.812-1.912 51.554 51.554 0 0113.109-2.094c.383.003.766.012 1.148.027m-9.014 2.924a15.717 15.717 0 01-.617-1.192 15.717 15.717 0 00.617 1.192zm0 0a15.72 15.72 0 011.19-2.261 15.72 15.72 0 00-1.19 2.261z" />
                </svg>
                Foro de Viajeros
            </h2>
            <Link to="/crear-post" className="boton-nuevo" aria-label="Crear nuevo tema de discusión">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Tema
            </Link>
        </div>
        <div className="lista-temas" role="feed" aria-label="Lista de temas recientes">
            {posts.length === 0 ? (
            <div className="cajavacia">
                <h3>¡El foro está vacío!</h3>
                <p>Sé el primero en compartir tu experiencia.</p>
            </div>
            ) : (
            posts.map(post => (
                <article key={post.id} className="tarjeta-tema" aria-labelledby={`titulo-${post.id}`}>
                
                <div className="tarjeta-header">
                    <div>
                        <h3 id={`titulo-${post.id}`} className="titulotema">{post.titulo}</h3>
                        <div className="datostema">
                            <span className="info-item" title="Autor del post">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <span className="nombre-autor">{post.autor}</span>
                            </span>
                            <span className="separador" aria-hidden="true">•</span>
                            <span className="info-item" title="Fecha de publicación">
                                {post.fecha}
                            </span>
                        </div>
                    </div>
                    <div 
                        className={`contador-respuestas ${post.respuestas > 0 ? 'con-respuestas' : 'sin-respuestas'}`}
                        aria-label={`${post.respuestas} respuestas en este hilo`} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        {post.respuestas}
                    </div>
                </div>

                <p className="texto">{post.contenido}</p> 
                <div className="pietarjeta">
                    <Link 
                        to={`/foro/${post.id}`} 
                        className="enlace-responder"
                        aria-label={`Leer discusión completa sobre ${post.titulo}`}>
                        Ver hilo completo &rarr;
                    </Link>
                    {esAdmin && (
                        <div className="acciones-admin" role="group" aria-label="Herramientas de administrador">
                            <button 
                                onClick={() => censurarPost(post.id)} 
                                className="boton-censurar"
                                aria-label="Censurar este post"
                                title="Ocultar contenido ofensivo">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Censurar
                            </button>
                            <button 
                                onClick={() => borrarPost(post.id)} 
                                className="boton-borrar"
                                aria-label="Borrar este post permanentemente"
                                title="Eliminar de la base de datos" >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Borrar
                            </button>
                        </div>
                    )}
                </div>
                </article>
            ))
            )}
        </div>
      </div>
    </div>
  );
}