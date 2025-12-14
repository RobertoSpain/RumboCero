import { Link } from 'react-router-dom';
import '../assets/Landing.css'; 

export default function Landing() {
    
    return (
        <div className="paginalanding">
            <div className="filtrooscuro"></div>
            <section className="cajacentral">
                
                <h1 className="titulazo">
                    Viaja mejor acompañado: planifica, organiza y comparte con <span className="resalteverde">Rumbo Cero</span>
                </h1>
                <p className="parrafolanding">
                    Crea itinerarios colaborativos con tus amigos, gestiona listas de equipaje conjuntas y conecta con la comunidad en nuestro foro.
                    <br />¡Vuestra próxima gran aventura comienza aquí!
                </p>

                <div className="zonabotones">
                    <Link to="/login" className="botonlanding botonazul">
                        Comienza a Planificar
                    </Link>
                    <Link to="/registro" className="botonlanding botontransparente">
                        Crear Cuenta
                    </Link>
                </div>
            </section>
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
}