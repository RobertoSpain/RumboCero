import { Link } from 'react-router-dom'; 
import '../assets/Contacto.css';

const IconoGithub = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const IconoLinkedin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const Contacto = () => {
  const params = new URLSearchParams(window.location.search);
  const esExito = params.get('success');
  return (
    <>
      <div className="layout-contacto">
        <div className="contenedorcontacto">
          <h2 className="titulocontacto">Contacta con Nosotros</h2>
          {esExito ? (
            <div className="mensaje-exito" role="alert" aria-live="polite">
              <h3>¡Mensaje Enviado!</h3>
              <p>Gracias por escribirnos. Te responderemos lo antes posible.</p>
              <a href="/contacto" className="boton-volver">Volver al formulario</a>
            </div>
          ) : (
            <>
              <p className="descripcioncontacto">
                ¿Tienes dudas o has visto algo raro? Escríbenos y te contestamos volando.
              </p>

              <form
                className="formulariocontacto"
                action="https://formspree.io/f/meoydzvj"
                method="POST">
                <div className="cajainput">
                  <label htmlFor="nombre">Tu Nombre</label>
                  <input type="text" id="nombre" name="nombre" required aria-required="true" autoComplete="name" />
                </div>

                <div className="cajainput">
                  <label htmlFor="email">Tu Email</label>
                  <input type="email" id="email" name="email" required aria-required="true" autoComplete="email" />
                </div>

                <div className="cajainput">
                  <label htmlFor="asunto">Asunto</label>
                  <input type="text" id="asunto" name="asunto" required aria-required="true" />
                </div>

                <div className="cajainput">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea id="mensaje" name="mensaje" rows="5" required aria-required="true" />
                </div>

                <button type="submit" className="botonenviar">Enviar Mensaje</button>
                <input type="hidden" name="_next" value={window.location.origin + "/contacto?success=true"} />
              </form>
            </>
          )}
        </div>
      </div>
      <footer className="footer-pro" role="contentinfo">
        <div className="footer-contenedor">
            {/* Columna 1: Marca */}
            <div className="footer-col">
                <div className="footer-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="logo-icon-small">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>Rumbo Cero</span>
                </div>
                <p className="footer-desc">
                    Tu compañero de viajes colaborativo. Planifica, organiza y descubre el mundo con tus amigos sin estrés.
                </p>
                <span className="copyright">© 2025 Roberto España</span>
            </div>
            {/* Columna 2: Enlaces */}
            <div className="footer-col">
                <h4>Explora</h4>
                <ul className="footer-links">
                    <li><Link to="/viajes">Mis Viajes</Link></li>
                    <li><Link to="/foro">Comunidad</Link></li>
                    <li><Link to="/perfil">Mi Perfil</Link></li>
                </ul>
            </div>
            {/* Columna 3: Tech & Dev */}
            <div className="footer-col">
                <h4>Desarrollado con</h4>
                <div className="tech-tags">
                    <span className="tech-tag">React</span>
                    <span className="tech-tag">Firebase</span>
                    <span className="tech-tag">CSS3</span>
                </div>
                <div className="dev-socials">
                    <a href="https://github.com/RobertoSpain" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <IconoGithub />
                    </a>
                    <a href="https://linkedin.com/in/roberto-espana" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <IconoLinkedin />
                    </a>
                </div>
            </div>
        </div>
      </footer>
    </>
  );
};

export default Contacto;