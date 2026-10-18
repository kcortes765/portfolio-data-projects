import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Globe2,
  Network,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Portal CEIC UCN · Proyecto de Sebastián Cortés",
  description:
    "Portal académico publicado para Ingeniería Civil UCN: calendario, mallas interactivas, biblioteca, acceso institucional e integración de servicios.",
};

export default function CeicCase() {
  return (
    <div className="case-page thesis-page project-story story-portal">
      <a className="skip" href="#ceic-main">
        Saltar al proyecto
      </a>
      <header className="story-nav">
        <a className="story-identity" href="/">
          <span className="story-monogram">sc.</span>
          <span>
            Sebastián Cortés<small>PORTAFOLIO / PROYECTOS</small>
          </span>
        </a>
        <a className="story-nav-link" href="https://ceicucn.cl/">
          Ver portal <ArrowUpRight size={16} />
        </a>
      </header>
      <main className="story-content" id="ceic-main">
        <a className="story-back" href="/#proyecto">
          <ArrowLeft size={14} /> Todos los proyectos
        </a>
        <div className="story-meta">
          <p>04 / PRODUCTO WEB · INGENIERÍA CIVIL UCN</p>
          <span>
            <i /> Portal publicado
          </span>
        </div>
        <div className="story-hero">
          <div className="story-hero-copy">
            <p className="story-kicker">PORTAL CEIC UCN</p>
            <h1>
              La información de la carrera,
              <br />
              <em>en un solo lugar.</em>
            </h1>
            <p className="story-lead">
              Calendario, mallas y material de estudio para estudiantes y CEAL
              de Ingeniería Civil UCN.
            </p>
            <p className="story-intro">
              Un producto web que reúne consultas cotidianas y conecta
              información académica con una experiencia de acceso público.
            </p>
            <a className="story-button" href="https://ceicucn.cl/">
              Explorar el portal <ArrowUpRight size={17} />
            </a>
          </div>
          <figure className="story-product-map">
            <div className="story-map-top">
              <Globe2 size={16} />
              <span>CEIC UCN</span>
              <span>MAPA DEL PRODUCTO</span>
            </div>
            <div className="story-map-center">
              <span>Comunidad de Ingeniería Civil</span>
              <strong>
                Una entrada.
                <br />
                Tres consultas habituales.
              </strong>
            </div>
            <div className="story-map-services">
              <div>
                <CalendarDays size={21} />
                <strong>¿Qué viene?</strong>
                <span>Calendario académico</span>
              </div>
              <div>
                <Network size={21} />
                <strong>¿Qué sigue?</strong>
                <span>Mallas y prerrequisitos</span>
              </div>
              <div>
                <BookOpen size={21} />
                <strong>¿Dónde estudio?</strong>
                <span>Biblioteca por asignatura</span>
              </div>
            </div>
            <div className="story-map-access">
              <ShieldCheck size={16} />
              <span>
                Consulta como invitado · Gestión con acceso autorizado
              </span>
            </div>
            <figcaption>
              Esquema de las funciones del portal. La aplicación real está
              disponible en ceicucn.cl.
            </figcaption>
          </figure>
        </div>
        <dl className="story-facts">
          <div>
            <dt>CONTEXTO</dt>
            <dd>Comunidad universitaria</dd>
          </div>
          <div>
            <dt>DESARROLLO</dt>
            <dd>Producto web con apoyo de IA</dd>
          </div>
          <div>
            <dt>ACCESO</dt>
            <dd>Consulta pública como invitado</dd>
          </div>
          <div>
            <dt>PUBLICACIÓN</dt>
            <dd>
              <a href="https://ceicucn.cl/">
                ceicucn.cl <ArrowUpRight size={13} />
              </a>
            </dd>
          </div>
        </dl>
        <section
          className="story-section story-split"
          aria-labelledby="ceic-need"
        >
          <div>
            <p className="story-section-number">01 / LA NECESIDAD</p>
            <h2 id="ceic-need">
              Menos búsqueda.
              <br />
              Más contexto.
            </h2>
          </div>
          <div className="story-section-copy">
            <p>
              Fechas, planes de estudio y recursos responden preguntas
              distintas, pero pertenecen a una misma experiencia académica. El
              portal los organiza por tareas y asignaturas, con navegación tanto
              en escritorio como en móvil.
            </p>
            <p>
              El trabajo combina estructura de información, interfaz,
              integración de servicios y mantenimiento de una aplicación
              publicada.
            </p>
          </div>
        </section>
        <section className="story-section" aria-labelledby="ceic-service">
          <div className="story-section-heading">
            <div>
              <p className="story-section-number">02 / EL PRODUCTO</p>
              <h2 id="ceic-service">De la consulta al detalle.</h2>
            </div>
            <p>
              Cuatro funciones concretas, con el acceso adecuado para cada
              tarea.
            </p>
          </div>
          <div className="story-feature-grid">
            {[
              {
                Icon: CalendarDays,
                title: "Calendario académico",
                text: "Fechas, eventos y acuerdos en una vista navegable. Cada actividad tiene su propio detalle.",
                tag: "ORGANIZAR EL SEMESTRE",
              },
              {
                Icon: Network,
                title: "Mallas interactivas",
                text: "Planes O y P por semestre, con prerrequisitos y relaciones entre asignaturas y recursos.",
                tag: "ENTENDER EL RECORRIDO",
              },
              {
                Icon: BookOpen,
                title: "Biblioteca por asignatura",
                text: "Búsqueda y filtros en un catálogo de materiales, asociados al código y nombre de cada ramo.",
                tag: "ENCONTRAR MATERIAL",
              },
              {
                Icon: ShieldCheck,
                title: "Acceso según el rol",
                text: "Consulta como invitado, ingreso institucional con Google y permisos de gestión diferenciados para CEAL.",
                tag: "SEPARAR CONSULTA Y GESTIÓN",
              },
            ].map(({ Icon, title, text, tag }) => (
              <article key={title}>
                <Icon size={23} />
                <p className="story-feature-tag">{tag}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="story-section" aria-labelledby="ceic-architecture">
          <div className="story-section-heading">
            <div>
              <p className="story-section-number">03 / LA CONSTRUCCIÓN</p>
              <h2 id="ceic-architecture">Información, interfaz y servicios.</h2>
            </div>
            <p>
              Una arquitectura que distingue la consulta pública de las
              operaciones internas.
            </p>
          </div>
          <figure className="story-architecture">
            <div className="story-architecture-lane">
              <div>
                <span>EXPERIENCIA</span>
                <strong>Frontend</strong>
                <p>JavaScript · HTML / CSS</p>
                <small>GitHub Pages</small>
              </div>
              <ArrowRight
                className="story-flow-arrow"
                size={23}
                aria-hidden="true"
              />
              <div>
                <span>LÓGICA Y PERMISOS</span>
                <strong>API</strong>
                <p>Node.js · Identidad Google</p>
                <small>Render</small>
              </div>
              <ArrowRight
                className="story-flow-arrow"
                size={23}
                aria-hidden="true"
              />
              <div>
                <span>ESTADO COMPARTIDO</span>
                <strong>Persistencia</strong>
                <p>Datos de la aplicación</p>
                <small>Supabase</small>
              </div>
            </div>
            <figcaption>
              Esquema de servicios. La identidad y la autorización de acciones
              internas se verifican desde el servidor.
            </figcaption>
          </figure>
          <div className="story-build-grid">
            <article>
              <span>01</span>
              <h3>Dar estructura a los datos</h3>
              <p>
                Normalización de mallas y prerrequisitos; scripts de importación
                y construcción del catálogo de materiales.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Resolver la experiencia</h3>
              <p>
                Navegación, filtros, vistas de detalle, temas claro y oscuro y
                adaptación a pantallas pequeñas.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Publicar y mantener</h3>
              <p>
                Control de versiones y publicación con GitHub Actions. Revisión
                de navegación, permisos, almacenamiento, foco y contraste.
              </p>
            </article>
          </div>
        </section>
        <section
          className="story-section story-tour"
          aria-labelledby="ceic-tour"
        >
          <div>
            <p className="story-section-number">04 / RECORRIDO SUGERIDO</p>
            <h2 id="ceic-tour">Pruébalo como invitado.</h2>
            <p>
              No necesitas una cuenta UCN para conocer las funciones públicas.
              La gestión interna requiere una cuenta autorizada.
            </p>
            <a className="story-button" href="https://ceicucn.cl/">
              Abrir ceicucn.cl <ArrowUpRight size={17} />
            </a>
          </div>
          <ol>
            <li>
              <span>01</span>
              <p>Compara los planes O y P en las mallas.</p>
            </li>
            <li>
              <span>02</span>
              <p>Abre una asignatura y busca material relacionado.</p>
            </li>
            <li>
              <span>03</span>
              <p>Consulta una actividad del calendario.</p>
            </li>
          </ol>
        </section>
        <section
          className="story-section story-split story-scope"
          aria-labelledby="ceic-evidence"
        >
          <div>
            <p className="story-section-number">EVIDENCIA Y ALCANCE</p>
            <h2 id="ceic-evidence">
              Un producto publicado.
              <br />
              Una implementación visible.
            </h2>
          </div>
          <div className="story-section-copy">
            <p>
              El desarrollo contó con apoyo de IA. La implementación permite
              revisar la organización de información, las integraciones y el
              funcionamiento de una aplicación para una comunidad. Para un rol
              de datos, el vínculo está en el catálogo, las relaciones de las
              mallas y los scripts de integración.
            </p>
            <p>
              Esta presentación describe funciones y arquitectura. No atribuye
              cifras de usuarios activos, impacto medido ni una relación
              laboral.
            </p>
            <p className="story-review">
              Contenido y documentación revisados el 14 de septiembre de 2026.
              Portal y endpoint público de salud de la API accesibles en esa
              revisión.
            </p>
          </div>
        </section>
        <nav className="story-next" aria-label="Otros proyectos">
          <a href="/opsforge/caso">
            <span>CONCILIACIÓN DE DATOS</span>
            <strong>
              OpsForge <ArrowUpRight size={21} />
            </strong>
          </a>
          <a href="/tesis">
            <span>SIMULACIÓN Y DATOS</span>
            <strong>
              SPH-IncipientMotion <ArrowUpRight size={21} />
            </strong>
          </a>
        </nav>
      </main>
      <footer className="story-footer">
        <span>Sebastián Cortés · Ingeniería Civil UCN, último año</span>
        <a href="/">
          Volver al portafolio <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}
