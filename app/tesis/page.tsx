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
    <div className="case-page thesis-page">
      <a className="skip" href="#thesis-main">
        Saltar a la investigación
      </a>
      <header className="portfolio-nav">
        <a className="identity" href="/">
          <span className="monogram">
            SC<span>·</span>
          </span>
          <span>Sebastián Cortés</span>
        </a>
        <a className="pf-text-action" href="/#proyecto">
          Ver los proyectos <ArrowUpRight size={16} />
        </a>
      </header>
      <main className="case-content" id="thesis-main">
        <a className="text-link" href="/#proyecto">
          <ArrowLeft size={16} /> Volver al portafolio
        </a>
        <div className="thesis-heading-meta">
          <p className="eyebrow">03 / TESIS · INGENIERÍA CIVIL UCN</p>
          <span className="thesis-progress">Investigación en desarrollo</span>
        </div>
        <h1>
          SPH-IncipientMotion.
          <br />
          Del flujo al movimiento.
        </h1>
        <p className="case-lead">
          ¿Bajo qué condiciones un flujo tipo tsunami comienza a desplazar un
          bloque costero? Una investigación que conecta simulación numérica,
          dinámica rígida, ingeniería de datos y aprendizaje automático.
        </p>
        <div className="case-stack">
          DualSPHysics 5.4 · Project Chrono · Python · NumPy / pandas · SQLite ·
          scikit-learn
        </div>
        <ThesisSchematic />
        <section>
          <h2>La pregunta de ingeniería</h2>
          <p>
            El movimiento depende del flujo, la geometría del bloque, su masa,
            la fricción y la interacción con el fondo. El proyecto estudia ese
            umbral mediante casos paramétricos de flujos transitorios tipo
            tsunami, generados numéricamente.
          </p>
          <p>
            DualSPHysics representa el fluido con partículas mediante SPH.
            Chrono resuelve la dinámica del cuerpo rígido y el contacto. Las
            salidas permiten estudiar desplazamiento, rotación y señales
            hidráulicas, manteniendo explícitas las unidades y las condiciones
            de cada caso.
          </p>
          <p>
            Es una investigación de simulación numérica. No incluye un
            laboratorio físico ni una validación experimental propia.
          </p>
        </section>
        <section>
          <h2>La infraestructura detrás del experimento</h2>
          <p>
            La tesis también es un sistema de software: convierte una matriz de
            parámetros en casos ejecutables, organiza sus salidas y prepara
            datos para comparaciones reproducibles.
          </p>
          <ol className="thesis-pipeline">
            {[
              [
                "01",
                "Construir los casos",
                "Python, geometrías STL y plantillas XML parametrizadas; diseño de experimentos con muestreo Latin Hypercube.",
              ],
              [
                "02",
                "Ejecutar y conservar",
                "Orquestación de GenCase y DualSPHysics por CLI, simulación en GPU, registros de ejecución y preservación de evidencia.",
              ],
              [
                "03",
                "Transformar las salidas",
                "ETL de CSV de Chrono y sensores: unidades, valores ausentes, métricas cinemáticas y almacenamiento estructurado en SQLite.",
              ],
              [
                "04",
                "Comparar y evaluar",
                "Modelos Gaussian Process, selección de candidatos mediante active learning y análisis de sensibilidad, incertidumbre y generalización.",
              ],
            ].map(([n, title, text]) => (
              <li key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2>Qué aporta como proyecto técnico</h2>
          <div className="thesis-capabilities">
            {[
              [
                Code2,
                "Automatización científica",
                "Convertir especificaciones de experimentos en ejecuciones trazables y conservar fallos para investigarlos.",
              ],
              [
                Database,
                "Ingeniería de datos",
                "Procesar formatos del solver, construir datasets y separar datos operativos de cohortes científicas comparables.",
              ],
              [
                Waves,
                "Computación numérica",
                "Relacionar discretización, contacto, condiciones de frontera y pasos de integración con las observaciones.",
              ],
              [
                FlaskConical,
                "Modelos sustitutos en evaluación",
                "Evaluar un modelo sustituto, sus supuestos y su capacidad de generalizar fuera de los casos conocidos.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Code2;
              return (
                <article key={String(title)}>
                  <I size={22} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section>
          <h2>Estado y alcance de la investigación</h2>
          <div className="thesis-status-grid">
            <div>
              <h3>Implementado en el repositorio</h3>
              <ul>
                <li>Generación paramétrica de geometrías y casos.</li>
                <li>
                  Orquestación de simulaciones y procesamiento de resultados.
                </li>
                <li>ETL, métricas y almacenamiento SQLite.</li>
                <li>Código de Gaussian Processes y active learning.</li>
                <li>
                  Instrumentación, pruebas y trazabilidad de experimentos.
                </li>
              </ul>
            </div>
            <div>
              <h3>Validación en curso</h3>
              <ul>
                <li>Sensibilidad temporal y a la discretización.</li>
                <li>
                  Observación del movimiento y comportamiento del contacto.
                </li>
                <li>Interpretación hidráulica y efectos de las fronteras.</li>
                <li>Nuevas campañas y admisibilidad de sus datos.</li>
                <li>Generalización y límites de los modelos sustitutos.</li>
              </ul>
            </div>
          </div>
          <p>
            El repositorio contiene análisis históricos y nuevas campañas de
            diagnóstico. El programa de validación continúa abierto: disponer de
            código o terminar una ejecución no basta para certificar una
            conclusión física. Los resultados negativos se conservan y orientan
            el siguiente experimento.
          </p>
          <p className="thesis-review-date">
            Resumen del estado documental revisado el 14 de septiembre de 2026.
            Esta página es una presentación del proyecto; no monitoriza
            ejecuciones en vivo.
          </p>
        </section>
        <section>
          <h2>Desarrollo asistido por IA, evidencia revisable</h2>
          <p>
            La IA apoya el desarrollo y la revisión del pipeline. La
            verificación se apoya en pruebas, trazabilidad de archivos,
            criterios explícitos y contraste de resultados. El objetivo es poder
            explicar tanto una conclusión como las razones para no sostenerla
            todavía.
          </p>
          <p>
            Este trabajo se presenta como tesis e investigación académica en
            desarrollo. Complementa los proyectos de datos y automatización del
            portafolio con un problema físico que exige experimentación y
            criterio numérico.
          </p>
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
