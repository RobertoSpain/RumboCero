import '../assets/Contacto.css';

const Contacto = () => {
  const params = new URLSearchParams(window.location.search);
  const esExito = params.get('success');

  return (
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
      <footer className="footer-social">
        <div className="footer-info">
          Proyecto Realizado por Roberto España | Código en
          <a href="https://github.com/RobertoSpain/PokeApiJunio" target="_blank" rel="noopener noreferrer">
            &nbsp;GitHub
          </a>
        </div>
        <a href="https://www.linkedin.com/in/roberto-espa%C3%B1a-540552208/" target="_blank" rel="noopener noreferrer">
          Linkedin
        </a>
        <a href="https://www.facebook.com/roberto.espana.58/?locale=es_ES" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </footer>
    </div>
  );
};

export default Contacto;