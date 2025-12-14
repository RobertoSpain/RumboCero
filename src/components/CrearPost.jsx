import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from '../firebase.js';
import '../assets/Foro.css'; 

export default function CrearForo() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();
  const manejarCreacion = async (e) => {
    e.preventDefault();
    if (!titulo || !contenido) return alert("Por favor, escribe algo.");
    const user = auth.currentUser;
    if (!user) return alert("Debes iniciar sesión.");
    setCargando(true);
    try {
      await addDoc(collection(db, 'foro'), {
        titulo,
        contenido,
        autor: user.displayName || user.email,
        userId: user.uid,
        createAt: Timestamp.now()
      });
      navegar('/foro');
    } catch (error) {
      console.error(error);
      alert("Error al crear el tema.");
    } finally {
      setCargando(false);
    }
  };
  return (
    <div className="paginaforo"> 
      <div className="crearpost">
        
        <h2 className="titulocrear">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Nuevo Debate
        </h2>
        
        <p className="subtitulocrear">Comparte tus dudas o consejos con la comunidad.</p>

        <form onSubmit={manejarCreacion} className="formulariocrear">
          <div className="campocrear">
            <label htmlFor="tituloinput" className="labelcrear">Título del Tema</label>
            <input 
              id="tituloinput"
              type="text" 
              className="inputpost" 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              placeholder="Ej: ¿Mejor ruta por el norte de España?" 
              required
              aria-required="true"
            />
          </div>
          <div className="campocrear">
            <label htmlFor="contenidoarea" className="labelcrear">Tu Mensaje</label>
            <textarea 
              id="contenidoarea"
              className="areapost" 
              rows="6" 
              value={contenido} 
              onChange={e => setContenido(e.target.value)} 
              placeholder="Escribe aquí los detalles..." 
              required
              aria-required="true"
            ></textarea>
          </div>
          
          <div className="accionespost">
              <Link to="/foro" className="botoncancelar">Cancelar</Link>
              <button type="submit" className="botonpublicar" disabled={cargando}>
                {cargando ? (
                    <div className="flexcentro">
                        <svg className="spinnermini" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Publicando...
                    </div>
                ) : (
                    <div className="flexcentro">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:18, height:18}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Publicar Tema
                    </div>
                )}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}