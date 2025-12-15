import { Link } from 'react-router-dom';
import '../assets/Landing.css';

const IconoCalendar = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V7.5M9.75 9.75h.008v.008H9.75M9.75 12.75h.008v.008H9.75M9.75 15.75h.008v.008H9.75M12.75 9.75h.008v.008h-.008M12.75 12.75h.008v.008h-.008M12.75 15.75h.008v.008h-.008M15.75 9.75h.008v.008h-.008M15.75 12.75h.008v.008h-.008" />
    </svg>
);
const IconoLuggage = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.584A2.25 2.25 0 0 1 17.671 21H6.329a2.25 2.25 0 0 1-2.247-1.916L3.75 7.5M10.5 11.25h3M12 18V7.5m-8.625 2.25L4.5 10.125m15-.75l.875.875" />
    </svg>
);
const IconoChat = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.766L4.29 11.72l.62-1.076m4.246 6.03l.875 1.514M12 21.75l-4.5-8.875m4.5 8.875l4.5-8.875m-4.5 8.875a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z" />
    </svg>
);
const IconoMap = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
);
const IconoGithub = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const IconoLinkedin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export default function Landing() {

    return (
        <>
            <div className="paginalanding">
                <div className="filtrooscuro" role="presentation" aria-hidden="true"></div>
                <main className="cajacentral" role="region" aria-labelledby="main-title">
                    
                    <h1 id="main-title" className="titulazo">
                        Viaja mejor acompañado: planifica, organiza y comparte con <span className="resalteverde">Rumbo Cero</span>
                    </h1>
                    <p className="parrafolanding">
                        Crea itinerarios colaborativos con tus amigos, gestiona listas de equipaje conjuntas y conecta con la comunidad en nuestro foro.
                        <br />¡Vuestra próxima gran aventura comienza aquí!
                    </p>

                    <div className="zonabotones" role="group" aria-label="Opciones de acceso">
                        <Link to="/login" className="botonlanding botonazul" aria-label="Comenzar a planificar, ir a iniciar sesión">
                            Comienza a Planificar
                        </Link>
                        <Link to="/registro" className="botonlanding botontransparente" aria-label="Crear una cuenta nueva, ir a registro">
                            Crear Cuenta
                        </Link>
                    </div>
                </main>
            </div>
            {/* --- SECCIÓN SOBRE NOSOTROS --- */}
            <section className="sobre-nosotros" role="region" aria-label="Sobre Rumbo Cero">
                <div className="contenedor-sobre-nosotros">
                    <div className="imagen-sobre-nosotros">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80" 
                            alt="Grupo de amigos planificando un viaje con mapas y notas" 
                        />
                    </div>
                    <div className="texto-sobre-nosotros">
                        <div className="icono-titulo-wrapper">
                            <IconoMap className="icono-feature-small" />
                            <h2>El Viaje Perfecto está en los Detalles</h2>
                        </div>
                        <p>
                            En <strong>Rumbo Cero</strong>, creemos que la magia de viajar comienza mucho antes de subir al avión. 
                            Sabemos que coordinar un grupo puede ser caótico: fechas que no cuadran, maletas duplicadas y rutas confusas.
                        </p>
                        <p>
                            Por eso creamos una plataforma donde los <strong>detalles del viaje</strong> dejan de ser un problema para convertirse en parte de la emoción. 
                            Desde la previsión del clima en tu destino hasta la gestión de tareas compartidas, nos encargamos de la logística para que tú y tus amigos solo os preocupéis de crear recuerdos inolvidables.
                        </p>
                        <div className="stats-resumen">
                            <div className="stat-item">
                                <strong>+100</strong> Viajes Creados
                            </div>
                            <div className="stat-item">
                                <strong>100%</strong> Colaborativo
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* SECCIÓN CARACTERÍSTICAS */}
            <section className="caracteristicas-section" role="region" aria-label="Características clave">
                <div className="contenedor-caracteristicas">
                    <article className="bloque-caracteristica">
                        <IconoCalendar className="icono-feature" aria-hidden="true" />
                        <h3>Planificación Colaborativa</h3>
                        <p>Crea y edita rutas e itinerarios con tu grupo de amigos, asignando fechas y destinos en tiempo real.</p>
                    </article>

                    <article className="bloque-caracteristica">
                        <IconoLuggage className="icono-feature" aria-hidden="true" />
                        <h3>Listas de Equipaje Conjuntas</h3>
                        <p>Evita duplicidades. Cada miembro puede marcar qué lleva, asegurando que nada se quede atrás.</p>
                    </article>

                    <article className="bloque-caracteristica">
                        <IconoChat className="icono-feature" aria-hidden="true" />
                        <h3>Foro y Comunidad</h3>
                        <p>Conéctate con otros viajeros, comparte experiencias y encuentra los mejores consejos locales.</p>
                    </article>
                </div>
            </section>

            {/* --- FOOTER */}
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
}