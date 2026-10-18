import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Code2,
  Mail,
} from "lucide-react";
import { dataset, format, monthLabel, records } from "@/lib/gridops";

const email = "sebastian.cortes.ing@gmail.com";

function EnergyPreview() {
  const months = Array.from(
    { length: 12 },
    (_, i) => `2025-${String(i + 1).padStart(2, "0")}`,
  );
  const values = months.map(
    (month) =>
      records
        .filter(
          (r) => r.period === month && r.technology === "Solar Fotovoltaica",
        )
        .reduce((n, r) => n + r.mwh, 0) / 1000,
  );
  const max = Math.max(...values);
  const points = values
    .map((value, i) => `${28 + i * 34},${160 - (value / max) * 115}`)
    .join(" ");
  return (
    <figure className="studio-data-preview">
      <div className="studio-preview-label">
        <span className="studio-dot" /> DATOS REALES / GRIDOPS <span>2025</span>
      </div>
      <div className="studio-preview-title">Un año de generación solar.</div>
      <p>Solar fotovoltaica · Chile · GWh por mes</p>
      <svg
        viewBox="0 0 430 205"
        role="img"
        aria-label="Generación solar fotovoltaica mensual de Chile durante 2025, calculada desde la captura oficial de GridOps"
      >
        {[45, 100, 160].map((y) => (
          <line
            key={y}
            x1="20"
            x2="410"
            y1={y}
            y2={y}
            stroke="currentColor"
            opacity=".13"
          />
        ))}
        <polygon
          points={`28,160 ${points} 402,160`}
          fill="currentColor"
          opacity=".07"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {values.map((value, i) => (
          <circle
            key={i}
            cx={28 + i * 34}
            cy={160 - (value / max) * 115}
            r="3.5"
            fill="currentColor"
          />
        ))}
        <g fill="currentColor" fontSize="10" opacity=".65">
          <text x="20" y="187">
            ENE
          </text>
          <text x="192" y="187">
            JUN
          </text>
          <text x="383" y="187">
            DIC
          </text>
          <text x="20" y="29">
            {Math.round(max).toLocaleString("es-CL")} GWh / máximo
          </text>
        </g>
      </svg>
      <figcaption>
        Fuente: CNE / datos.gob.cl. Captura histórica; no es monitoreo en vivo.
      </figcaption>
      <a href="/gridops">
        Explorar el conjunto completo <ArrowUpRight size={16} />
      </a>
    </figure>
  );
}

export default function Portfolio() {
  return (
    <div className="studio">
      <a href="#main" className="skip">
        Saltar al contenido
      </a>
      <header className="studio-nav">
        <a
          className="studio-identity"
          href="/"
          aria-label="Sebastián Cortés, inicio"
        >
          <span className="studio-mark">sc.</span>
          <span>
            Sebastián Cortés
            <span className="studio-identity-sub">DATOS & SOFTWARE</span>
          </span>
        </a>
        <nav aria-label="Principal">
          <a href="#proyecto">Proyectos</a>
          <a href="#sobre-mi">Sobre mí</a>
          <a className="studio-nav-contact" href="#contacto">
            Hablemos <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="studio-hero" aria-labelledby="intro-title">
          <div className="studio-hero-copy">
            <p className="studio-kicker">
              ANTOFAGASTA, CHILE <span> / </span> PORTAFOLIO 2026
            </p>
            <h1 id="intro-title">
              Ingeniería de datos,
              <br />
              <em>con Python y SQL.</em>
            </h1>
            <p className="studio-intro">
              Soy Sebastián Cortés, estudiante de último año de Ingeniería Civil
              UCN. Busco mi primera oportunidad como{" "}
              <strong>Data Engineer Jr.</strong>
            </p>
            <p className="studio-hero-note">
              Aquí puedes probar mis aplicaciones, revisar cómo están
              construidas y descargar el código.
            </p>
            <div className="studio-actions">
              <a className="studio-button" href="#proyecto">
                Ver los proyectos <ArrowDown size={17} />
              </a>
              <a className="studio-link" href={`mailto:${email}`}>
                Contactar <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <EnergyPreview />
        </section>
        <div
          className="studio-skills"
          aria-label="Tecnologías de los proyectos"
        >
          <span>HERRAMIENTAS EN ESTOS PROYECTOS</span>
          <p>
            Python <b>/</b> SQL <b>/</b> PostgreSQL <b>/</b> dbt <b>/</b> DuckDB{" "}
            <b>/</b> TypeScript
          </p>
        </div>
        <section
          className="studio-work"
          id="proyecto"
          aria-labelledby="work-title"
        >
          <div className="studio-section-head">
            <div>
              <p className="studio-kicker">01 / PROYECTOS PRINCIPALES</p>
              <h2 id="work-title">Del problema al código.</h2>
            </div>
            <p>
              Dos casos personales de datos y automatización.
              <br />
              Con demos, decisiones técnicas y código para revisar.
            </p>
          </div>
          <article className="studio-project studio-project-ops" id="opsforge">
            <div className="studio-project-copy">
              <p className="studio-project-meta">
                01 <span>OPERACIONES / PROYECTO PERSONAL</span>
              </p>
              <h3>OpsForge</h3>
              <p className="studio-project-lead">
                Cuando un pedido y su factura no coinciden.
              </p>
              <p>
                Conciliación de pedidos, facturas y entregas. Un flujo de datos
                que conserva el origen de cada documento y permite repetir una
                carga, corregirla o rechazarla sin duplicar registros.
              </p>
              <ul>
                <li>Ingesta y conciliación con Python, PostgreSQL y dbt.</li>
                <li>Demo web independiente con persistencia D1/SQLite.</li>
                <li>Datos sintéticos; sin información de clientes.</li>
              </ul>
              <div className="studio-project-actions">
                <a className="studio-button" href="/opsforge">
                  Probar la demo <ArrowUpRight size={17} />
                </a>
                <a className="studio-link" href="/opsforge/caso">
                  Ver el caso técnico <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <a
              className="studio-project-image"
              href="/opsforge"
              aria-label="Abrir la demo de OpsForge"
            >
              <div className="studio-image-bar">
                <span />
                <span />
                <span />
                <b>opsforge / conciliación</b>
              </div>
              <img
                src="/images/opsforge-preview.png"
                alt="Interfaz real de OpsForge: estado de conciliación de pedidos y documentos"
                width="1200"
                height="900"
                loading="lazy"
              />
              <span className="studio-image-caption">
                DEMO INTERACTIVA <ArrowUpRight size={16} />
              </span>
            </a>
          </article>
          <article className="studio-project studio-project-grid" id="gridops">
            <div className="studio-project-copy">
              <p className="studio-project-meta">
                02 <span>ENERGÍA / DATOS PÚBLICOS</span>
              </p>
              <h3>GridOps</h3>
              <p className="studio-project-lead">
                De un CSV oficial a una consulta útil.
              </p>
              <p>
                Un explorador de generación eléctrica de Chile. Procesa los
                datos con Python y DuckDB, conserva su trazabilidad y los
                conecta a una API y una interfaz para comparar y descargar
                resultados.
              </p>
              <div className="studio-project-facts">
                <div>
                  <strong>{format(dataset.quality.source_rows)}</strong>
                  <span>registros de origen</span>
                </div>
                <div>
                  <strong>{dataset.quality.periods}</strong>
                  <span>meses en la captura</span>
                </div>
              </div>
              <p className="studio-small">
                CNE / datos.gob.cl · datos hasta{" "}
                {monthLabel(dataset.quality.last_period)}. No es una fuente en
                vivo.
              </p>
              <div className="studio-project-actions">
                <a className="studio-button" href="/gridops">
                  Explorar los datos <ArrowUpRight size={17} />
                </a>
                <a className="studio-link" href="/gridops/caso">
                  Ver el caso técnico <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <a
              className="studio-project-image"
              href="/gridops"
              aria-label="Abrir el explorador GridOps"
            >
              <div className="studio-image-bar">
                <span />
                <span />
                <span />
                <b>gridops / generación eléctrica</b>
              </div>
              <img
                src="/images/gridops-preview.png"
                alt="Interfaz real de GridOps con filtros, series de generación eléctrica y controles de cobertura"
                width="1200"
                height="900"
                loading="lazy"
              />
              <span className="studio-image-caption">
                EXPLORADOR DE DATOS <ArrowUpRight size={16} />
              </span>
            </a>
          </article>
          <div className="studio-source-strip">
            <div>
              <Download size={20} />
              <p>
                <strong>El código también forma parte del portafolio.</strong>
                <span>
                  Un paquete con ambas aplicaciones, datos de ejemplo e
                  instrucciones de ejecución.
                </span>
              </p>
            </div>
            <a href="/downloads/gridops-source.zip" download>
              Descargar código <ArrowDown size={16} />
            </a>
          </div>
          <a
            className="studio-review-link"
            href="/downloads/REVISAR_EN_5_MINUTOS.md"
          >
            Guía para revisar el código y ejecutar las 22 pruebas de Python{" "}
            <ArrowUpRight size={14} />
          </a>
          <a
            className="studio-review-link"
            href="https://github.com/kcortes765/portfolio-data-projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leer el código en GitHub <ArrowUpRight size={14} />
          </a>
        </section>
        <section className="studio-more" aria-labelledby="more-title">
          <div className="studio-section-head">
            <div>
              <p className="studio-kicker">02 / OTROS PROYECTOS</p>
              <h2 id="more-title">Otra parte de mi recorrido.</h2>
            </div>
          </div>
          <div className="studio-more-grid">
            <article id="tesis">
              <p className="studio-project-meta">
                INVESTIGACIÓN ACADÉMICA · EN DESARROLLO
              </p>
              <h3>SPH-IncipientMotion</h3>
              <p>
                Mi tesis estudia el inicio del movimiento de bloques costeros
                bajo flujos tipo tsunami. Automatización de simulaciones,
                procesamiento de resultados y modelos sustitutos en evaluación.
              </p>
              <span className="studio-small">
                Python · DualSPHysics · Chrono · SQLite
              </span>
              <a className="studio-link" href="/tesis">
                Conocer la investigación <ArrowUpRight size={16} />
              </a>
            </article>
            <article id="ceic">
              <p className="studio-project-meta">
                PRODUCTO WEB · COMUNIDAD UNIVERSITARIA
              </p>
              <h3>Portal CEIC UCN</h3>
              <p>
                Calendario, mallas interactivas y biblioteca para Ingeniería
                Civil UCN. Un proyecto de integración web con acceso
                institucional y permisos diferenciados.
              </p>
              <span className="studio-small">
                JavaScript · Node.js · Supabase · OAuth
              </span>
              <a className="studio-link" href="/ceic">
                Ver el proyecto <ArrowUpRight size={16} />
              </a>
            </article>
          </div>
        </section>
        <section
          className="studio-about"
          id="sobre-mi"
          aria-labelledby="about-title"
        >
          <div>
            <p className="studio-kicker">03 / SOBRE MÍ</p>
            <h2 id="about-title">
              De Ingeniería Civil
              <br />
              <em>a los sistemas de datos.</em>
            </h2>
            <p>
              Estudio en la Universidad Católica del Norte, en Antofagasta, con
              egreso previsto para julio de 2027. La simulación numérica me
              llevó a trabajar con Python, organizar experimentos y preparar
              datos para analizarlos.
            </p>
            <p>
              Me interesa empezar en un equipo donde pueda aportar en ingesta,
              transformación y calidad de datos. También considero roles de
              integraciones cuando sus tareas encajan con los proyectos que
              presento aquí.
            </p>
          </div>
          <div className="studio-about-details">
            <div>
              <span>MI BASE</span>
              <p>
                Python para pipelines y automatización. SQL para transformar,
                conciliar y consultar datos.
              </p>
            </div>
            <div>
              <span>CÓMO TRABAJO</span>
              <p>
                Conservo archivos de origen, compruebo los resultados y
                documento las decisiones y los límites de cada proyecto.
              </p>
            </div>
            <div>
              <span>LO QUE BUSCO</span>
              <p>
                Primera experiencia profesional remunerada, en español y remota
                desde Chile, con horario compatible con mis clases.
              </p>
            </div>
            <p className="studio-assistance">
              Estos proyectos se desarrollan con asistencia de IA. En los casos
              técnicos explico qué está implementado, qué se ha probado y qué
              sigue pendiente.
            </p>
          </div>
        </section>
        <section
          className="studio-contact"
          id="contacto"
          aria-labelledby="contact-title"
        >
          <p className="studio-kicker">¿CONVERSAMOS?</p>
          <div>
            <h2 id="contact-title">
              Hablemos de datos.
              <br />
              <em>Y de lo que podemos construir.</em>
            </h2>
            <a
              className="studio-contact-arrow"
              href={`mailto:${email}`}
              aria-label="Enviar un correo a Sebastián Cortés"
            >
              <ArrowUpRight size={40} />
            </a>
          </div>
          <a className="studio-email" href={`mailto:${email}`}>
            {email}
          </a>
          <p>
            Si tienes una oportunidad junior o quieres conversar sobre alguno de
            los proyectos, puedes escribirme.
          </p>
        </section>
      </main>
      <footer className="studio-footer">
        <a href="/">
          Sebastián Cortés <span>· Antofagasta, Chile</span>
        </a>
        <div>
          <a
            href="https://github.com/kcortes765"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Code2 size={15} /> GitHub <ArrowUpRight size={13} />
          </a>
          <a href={`mailto:${email}`}>
            <Mail size={15} /> Correo
          </a>
          <span>Actualizado · octubre 2026</span>
        </div>
      </footer>
    </div>
  );
}
