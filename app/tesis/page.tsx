import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Database,
  Waves,
  FlaskConical,
} from "lucide-react";
import ThesisSchematic from "@/components/thesis-schematic";

export const metadata: Metadata = {
  title: "SPH-IncipientMotion · Tesis de Sebastián Cortés",
  description:
    "Investigación numérica del movimiento incipiente de bloques costeros: DualSPHysics, Chrono, Python, automatización de experimentos y modelos sustitutos.",
};

export default function Thesis() {
  return (
    <div className="case-page thesis-page project-story story-research">
      <a className="skip" href="#thesis-main">
        Saltar a la investigación
      </a>
      <header className="story-nav">
        <a className="story-identity" href="/">
          <span className="story-monogram">sc.</span>
          <span>
            Sebastián Cortés<small>PORTAFOLIO / PROYECTOS</small>
          </span>
        </a>
        <a className="story-nav-link" href="/#proyecto">
          Ver proyectos <ArrowUpRight size={16} />
        </a>
      </header>
      <main className="story-content" id="thesis-main">
        <a className="story-back" href="/#proyecto">
          <ArrowLeft size={14} /> Todos los proyectos
        </a>
        <div className="story-meta">
          <p>03 / TESIS · INGENIERÍA CIVIL UCN</p>
          <span className="story-status-open">
            <i /> Investigación en desarrollo
          </span>
        </div>
        <div className="story-hero story-research-hero">
          <div className="story-hero-copy">
            <p className="story-kicker">SPH-INCIPIENTMOTION</p>
            <h1>
              Del flujo
              <br />
              <em>al movimiento.</em>
            </h1>
            <p className="story-lead">
              ¿Bajo qué condiciones un flujo tipo tsunami comienza a desplazar
              un bloque costero?
            </p>
            <p className="story-intro">
              Simulación numérica, automatización de experimentos e ingeniería
              de datos para estudiar un umbral físico.
            </p>
            <a className="story-inline-link" href="#thesis-system">
              Ver el sistema de experimentación <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="story-research-visual">
            <div className="story-visual-label">
              <span>MODELO DEL PROBLEMA</span>
              <span>FLUJO → BLOQUE → OBSERVACIÓN</span>
            </div>
            <ThesisSchematic />
            <div className="story-observables">
              <div>
                <span>ENTRADAS</span>
                <p>Flujo · Geometría · Masa · Fricción</p>
              </div>
              <div>
                <span>OBSERVACIONES</span>
                <p>Desplazamiento · Rotación · Señales hidráulicas</p>
              </div>
            </div>
          </div>
        </div>
        <dl className="story-facts">
          <div>
            <dt>CONTEXTO</dt>
            <dd>Tesis académica en desarrollo</dd>
          </div>
          <div>
            <dt>SIMULACIÓN</dt>
            <dd>DualSPHysics 5.4 + Chrono</dd>
          </div>
          <div>
            <dt>DATOS</dt>
            <dd>Python · pandas · SQLite</dd>
          </div>
          <div>
            <dt>EVALUACIÓN</dt>
            <dd>Modelos sustitutos · scikit-learn</dd>
          </div>
        </dl>
        <section
          className="story-section story-split"
          aria-labelledby="thesis-question"
        >
          <div>
            <p className="story-section-number">01 / LA PREGUNTA</p>
            <h2 id="thesis-question">
              Observar el inicio.
              <br />
              Explicar las condiciones.
            </h2>
          </div>
          <div className="story-section-copy">
            <p>
              El movimiento depende del flujo, la geometría, la masa, la
              fricción y la interacción con el fondo. El proyecto explora ese
              umbral mediante casos paramétricos de flujos transitorios
              generados numéricamente.
            </p>
            <p>
              DualSPHysics representa el fluido con partículas mediante SPH.
              Chrono resuelve la dinámica del cuerpo rígido y el contacto. Las
              salidas se estudian conservando unidades y condiciones de cada
              caso.
            </p>
            <div className="story-boundary">
              <FlaskConical size={19} />
              <p>
                Investigación de simulación numérica. No incluye laboratorio
                físico ni validación experimental propia.
              </p>
            </div>
          </div>
        </section>
        <section
          className="story-section"
          id="thesis-system"
          aria-labelledby="thesis-pipeline"
        >
          <div className="story-section-heading">
            <div>
              <p className="story-section-number">02 / EL SISTEMA</p>
              <h2 id="thesis-pipeline">De los parámetros a los datos.</h2>
            </div>
            <p>
              La infraestructura organiza experimentos, ejecuciones y resultados
              que se pueden rastrear.
            </p>
          </div>
          <ol className="story-experiment-flow">
            {[
              {
                n: "01",
                title: "Construir",
                code: "PARÁMETROS → CASOS",
                text: "Python, geometrías STL y plantillas XML parametrizadas. Diseño de experimentos con muestreo Latin Hypercube.",
              },
              {
                n: "02",
                title: "Ejecutar",
                code: "CLI → SIMULACIÓN GPU",
                text: "Orquestación de GenCase y DualSPHysics, registros de ejecución y preservación de las salidas y sus fallos.",
              },
              {
                n: "03",
                title: "Transformar",
                code: "CSV → DATOS ESTRUCTURADOS",
                text: "ETL de Chrono y sensores: unidades, valores ausentes, métricas cinemáticas y almacenamiento SQLite.",
              },
              {
                n: "04",
                title: "Evaluar",
                code: "DATASET → MODELO SUSTITUTO",
                text: "Código de Gaussian Processes y active learning. Evaluación de sensibilidad, incertidumbre y generalización.",
              },
            ].map(({ n, title, code, text }) => (
              <li key={n}>
                <span className="story-flow-number">{n}</span>
                <h3>{title}</h3>
                <span className="story-flow-code">{code}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="story-flow-note">
            NumPy / pandas para el procesamiento · SQLite para persistencia ·
            scikit-learn para los modelos sustitutos
          </p>
        </section>
        <section className="story-section" aria-labelledby="thesis-skills">
          <div className="story-section-heading">
            <div>
              <p className="story-section-number">03 / APORTE TÉCNICO</p>
              <h2 id="thesis-skills">El trabajo detrás de una ejecución.</h2>
            </div>
            <p>
              Un problema científico que exige software, datos y criterio
              numérico.
            </p>
          </div>
          <div className="story-feature-grid">
            {[
              {
                Icon: Code2,
                title: "Automatización científica",
                tag: "EJECUCIONES TRAZABLES",
                text: "Convertir especificaciones en casos ejecutables, conservar registros e investigar los fallos.",
              },
              {
                Icon: Database,
                title: "Ingeniería de datos",
                tag: "SALIDAS COMPARABLES",
                text: "Procesar formatos del solver y separar datos operativos de cohortes científicas comparables.",
              },
              {
                Icon: Waves,
                title: "Computación numérica",
                tag: "SUPUESTOS EXPLÍCITOS",
                text: "Relacionar discretización, contacto, fronteras y pasos de integración con las observaciones.",
              },
              {
                Icon: FlaskConical,
                title: "Modelos sustitutos",
                tag: "EVALUACIÓN EN CURSO",
                text: "Examinar sus supuestos y su capacidad de generalizar fuera de los casos conocidos.",
              },
            ].map(({ Icon, title, tag, text }) => (
              <article key={title}>
                <Icon size={23} />
                <p className="story-feature-tag">{tag}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="story-section" aria-labelledby="thesis-state">
          <div className="story-section-heading">
            <div>
              <p className="story-section-number">04 / ESTADO Y EVIDENCIA</p>
              <h2 id="thesis-state">
                Qué está construido.
                <br />
                Qué sigue en evaluación.
              </h2>
            </div>
            <p>
              Una ejecución completa aporta datos. La conclusión física requiere
              controles adicionales.
            </p>
          </div>
          <div className="story-evidence-grid">
            <article>
              <span className="story-evidence-label">
                IMPLEMENTADO EN EL REPOSITORIO
              </span>
              <h3>Infraestructura de experimentación</h3>
              <ul>
                <li>Generación paramétrica de geometrías y casos.</li>
                <li>Orquestación y procesamiento de simulaciones.</li>
                <li>ETL, métricas y almacenamiento SQLite.</li>
                <li>Código de Gaussian Processes y active learning.</li>
                <li>Instrumentación, pruebas y trazabilidad.</li>
              </ul>
            </article>
            <article>
              <span className="story-evidence-label">VALIDACIÓN EN CURSO</span>
              <h3>Alcance de las conclusiones</h3>
              <ul>
                <li>Sensibilidad temporal y a la discretización.</li>
                <li>Movimiento del bloque y comportamiento del contacto.</li>
                <li>Interpretación hidráulica y efectos de las fronteras.</li>
                <li>Nuevas campañas y admisibilidad de sus datos.</li>
                <li>Generalización de los modelos sustitutos.</li>
              </ul>
            </article>
          </div>
          <div className="story-evidence-note">
            <p>
              El repositorio contiene análisis históricos y nuevas campañas de
              diagnóstico. El programa de validación continúa abierto; los
              resultados negativos también se conservan y orientan el siguiente
              experimento.
            </p>
            <p className="story-review">
              Estado documental revisado el 14 de septiembre de 2026. Esta
              página presenta el proyecto; no monitoriza ejecuciones en vivo.
            </p>
          </div>
        </section>
        <section
          className="story-section story-split story-scope"
          aria-labelledby="thesis-review"
        >
          <div>
            <p className="story-section-number">CRITERIO DE TRABAJO</p>
            <h2 id="thesis-review">
              Evidencia que se
              <br />
              pueda revisar.
            </h2>
          </div>
          <div className="story-section-copy">
            <p>
              La IA apoya el desarrollo y la revisión del pipeline. La
              verificación se apoya en pruebas, trazabilidad de archivos,
              criterios explícitos y contraste de resultados.
            </p>
            <p>
              El objetivo es explicar una conclusión y reconocer cuándo los
              datos todavía no permiten sostenerla. Esta tesis complementa los
              proyectos de datos y automatización con un problema físico en
              investigación.
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
          <a href="/ceic">
            <span>PRODUCTO WEB</span>
            <strong>
              Portal CEIC UCN <ArrowUpRight size={21} />
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
