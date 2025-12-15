import { Link } from 'react-router-dom';
import '../assets/Landing.css';

// Componente SVG para los íconos de las características
// Se pueden definir aquí o en un archivo aparte.

// Ícono 1: Calendario / Rutas (Planificación Colaborativa)
const IconoCalendar = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V7.5M9.75 9.75h.008v.008H9.75M9.75 12.75h.008v.008H9.75M9.75 15.75h.008v.008H9.75M12.75 9.75h.008v.008h-.008M12.75 12.75h.008v.008h-.008M12.75 15.75h.008v.008h-.008M15.75 9.75h.008v.008h-.008M15.75 12.75h.008v.008h-.008" />
    </svg>
);

// Ícono 2: Maleta / Equipaje (Listas Conjuntas)
const IconoLuggage = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.584A2.25 2.25 0 0 1 17.671 21H6.329a2.25 2.25 0 0 1-2.247-1.916L3.75 7.5M10.5 11.25h3M12 18V7.5m-8.625 2.25L4.5 10.125m15-.75l.875.875" />
    </svg>
);

// Ícono 3: Mensajes / Chat (Comunidad)
const IconoChat = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.766L4.29 11.72l.62-1.076m4.246 6.03l.875 1.514M12 21.75l-4.5-8.875m4.5 8.875l4.5-8.875m-4.5 8.875a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z" />
    </svg>
);


export default function Landing() {

    return (
        <>
            <div className="paginalanding">
                <div className="filtrooscuro" role="presentation" aria-hidden="true"></div>
                
                {/* Contenido Principal sobre la Imagen */}
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

                {/* Footer Social (Fixed) */}
                <footer className="footer-social" role="contentinfo">
                    <div className="footer-info">
                        Proyecto Realizado por Roberto España | Código en 
                        <a href="https://github.com/RobertoSpain/PokeApiJunio" target="_blank" rel="noopener noreferrer" aria-label="Ver el código del proyecto en GitHub">
                            &nbsp;GitHub
                        </a>
                    </div>
                    <a href="https://www.linkedin.com/in/roberto-espa%C3%B1a-540552208/" target="_blank" rel="noopener noreferrer" aria-label="Perfil de Roberto España en LinkedIn">
                        Linkedin
                    </a>
                    <a href="https://www.facebook.com/roberto.espana.58/?locale=es_ES" target="_blank" rel="noopener noreferrer" aria-label="Perfil de Roberto España en Facebook">
                        Facebook
                    </a>
                </footer>
            </div>
            
            {/* Nueva Sección de Características (APARECE DESPUÉS DE 100vh) */}
            <section className="caracteristicas-section" role="region" aria-label="Características clave de la aplicación Rumbo Cero">
                <h2 className="sr-only">Qué ofrece Rumbo Cero</h2> {/* Título oculto para lectores de pantalla */}
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
        </>
    );
}