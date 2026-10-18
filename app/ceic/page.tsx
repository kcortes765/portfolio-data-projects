import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
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
    <div className="case-page thesis-page ceic-page">
      <a className="skip" href="#ceic-main">
        Saltar al proyecto
      </a>
      <header className="portfolio-nav">
        <a className="identity" href="/">
          <span className="monogram">
            SC<span>·</span>
          </span>
          <span>Sebastián Cortés</span>
        </a>
        <a className="pf-text-action" href="https://ceicucn.cl/">
          ceicucn.cl <ArrowUpRight size={16} />
        </a>
      </header>
      <main className="case-content" id="ceic-main">
        <a className="text-link" href="/#ceic">
          <ArrowLeft size={16} /> Volver al portafolio
        </a>
        <div className="thesis-heading-meta">
          <p className="eyebrow">04 / PRODUCTO WEB · COMUNIDAD UNIVERSITARIA</p>
          <span className="thesis-progress">Portal publicado</span>
        </div>
        <h1>
          Portal CEIC UCN.
          <br />
          La vida académica, conectada.
        </h1>
        <p className="case-lead">
          Un punto de acceso al calendario, las mallas y el material de
          Ingeniería Civil UCN. Un proyecto que une organización de información,
          desarrollo web y gestión de contenidos para estudiantes y CEAL.
        </p>
        <div className="case-stack">
          JavaScript · HTML / CSS · Node.js · Supabase · Google OAuth · GitHub
          Pages
        </div>
        <a
          className="pf-text-action ceic-lead-action"
          href="https://ceicucn.cl/"
        >
          Explorar el portal publicado <ArrowUpRight size={18} />
        </a>
        <dl className="ceic-overview">
          <div>
            <dt>Comunidad</dt>
            <dd>Estudiantes y CEAL de Ingeniería Civil UCN</dd>
          </div>
          <div>
            <dt>Acceso público</dt>
            <dd>Consulta como invitado, sin una cuenta UCN</dd>
          </div>
          <div>
            <dt>Alcance</dt>
            <dd>Producto web e integración de servicios</dd>
          </div>
        </dl>
        <section>
          <h2>El servicio</h2>
          <p>
            La experiencia reúne consultas habituales de la carrera: revisar
            fechas, entender la secuencia de asignaturas y encontrar material de
            estudio. La navegación mantiene esas tareas disponibles tanto en
            escritorio como en móvil.
          </p>
          <div className="thesis-capabilities">
            {[
              {
                Icon: CalendarDays,
                title: "Calendario académico",
                text: "Fechas, eventos y acuerdos reunidos en una vista navegable, con detalle de cada actividad.",
              },
              {
                Icon: Network,
                title: "Mallas interactivas",
                text: "Planes O y P, organización por semestre, prerrequisitos y relación entre asignaturas y recursos.",
              },
              {
                Icon: BookOpen,
                title: "Biblioteca por asignatura",
                text: "Búsqueda y filtros sobre un catálogo de material académico, con asociación al ramo y acceso a los recursos.",
              },
              {
                Icon: ShieldCheck,
                title: "Acceso según el rol",
                text: "Consulta como invitado, ingreso institucional con Google y permisos de gestión diferenciados para CEAL.",
              },
            ].map(({ Icon, title, text }) => (
              <article key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2>De los archivos al servicio</h2>
          <ol className="thesis-pipeline">
            {[
              [
                "01",
                "Organizar la información",
                "Normalización de las mallas y sus prerrequisitos. Scripts de importación y construcción del catálogo de materiales, asociados a códigos y nombres de asignaturas.",
              ],
              [
                "02",
                "Construir la experiencia",
                "Interfaz JavaScript con navegación por secciones, filtros, vistas de detalle, temas claro y oscuro y adaptación a pantallas pequeñas.",
              ],
              [
                "03",
                "Integrar acceso y persistencia",
                "Frontend en GitHub Pages, API Node.js en Render y estado compartido en Supabase. Verificación de identidad Google y autorización de las acciones internas desde el servidor.",
              ],
              [
                "04",
                "Mantener la publicación",
                "Control de versiones, publicación por GitHub Actions y pruebas de navegación, permisos y recuperación de almacenamiento. Atención al foco, el contraste y la conservación del desplazamiento.",
              ],
            ].map(([number, title, text]) => (
              <li key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2>Qué demuestra en este portafolio</h2>
          <p>
            Capacidad de llevar una necesidad de una comunidad a una aplicación
            publicada: modelar información, integrar servicios, separar acceso
            público y gestión interna, desplegar cambios y corregir problemas de
            uso.
          </p>
          <p>
            Para un rol de datos, el vínculo está en la normalización del
            catálogo y las mallas, sus relaciones y los scripts de integración.
            El proyecto también aporta experiencia práctica de desarrollo y
            mantenimiento web.
          </p>
        </section>
        <section>
          <h2>Recorrido para conocerlo</h2>
          <p>
            Abre el portal e ingresa como invitado. Compara los planes O y P,
            revisa una asignatura y busca material relacionado. Después consulta
            un evento del calendario. La gestión interna requiere una cuenta
            autorizada.
          </p>
          <p>
            El portal continúa evolucionando. Esta presentación describe sus
            funciones y arquitectura; no atribuye cifras de usuarios activos,
            impacto medido ni una relación laboral.
          </p>
          <p className="thesis-review-date">
            Contenido y documentación revisados el 14 de septiembre de 2026.
            Portal y endpoint público de salud de la API accesibles en la
            revisión.
          </p>
          <a className="pf-text-action" href="https://ceicucn.cl/">
            Visitar ceicucn.cl <ArrowUpRight size={18} />
          </a>
        </section>
        <nav className="thesis-next" aria-label="Otros proyectos">
          <a href="/opsforge/caso">
            <span>OPERACIONES</span>
            <strong>
              OpsForge <ArrowUpRight size={18} />
            </strong>
          </a>
          <a href="/gridops/caso">
            <span>ENERGÍA</span>
            <strong>
              GridOps <ArrowUpRight size={18} />
            </strong>
          </a>
        </nav>
      </main>
      <footer className="portfolio-footer">
        <span>Sebastián Cortés · Ingeniería Civil UCN, último año</span>
        <a href="/">Volver al portafolio →</a>
      </footer>
    </div>
  );
}
