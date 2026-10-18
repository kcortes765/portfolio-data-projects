export default function ThesisSchematic() {
  return (
    <figure className="thesis-schematic">
      <svg
        viewBox="0 0 840 300"
        role="img"
        aria-labelledby="thesis-schematic-title thesis-schematic-description"
      >
        <title id="thesis-schematic-title">
          Flujo, bloque costero y cadena de observación
        </title>
        <desc id="thesis-schematic-description">
          Esquema conceptual de un flujo de izquierda a derecha hacia un bloque
          sobre un fondo inclinado. Las etiquetas distinguen el fluido modelado
          con SPH, el cuerpo rígido y los datos observados. No representa una
          simulación ni tiene escala.
        </desc>
        <defs>
          <pattern
            id="thesis-particles"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="9" cy="9" r="2" fill="#539cae" opacity=".6" />
          </pattern>
          <marker
            id="thesis-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path
              d="M0 0 6 3 0 6"
              fill="none"
              stroke="#167283"
              strokeWidth="1.5"
            />
          </marker>
        </defs>
        <path
          d="M32 113 Q190 110 290 143 T455 173 L485 194 32 242Z"
          fill="#e1f0f2"
        />
        <path
          d="M32 113 Q190 110 290 143 T455 173 L485 194 32 242Z"
          fill="url(#thesis-particles)"
        />
        <path d="M32 242 790 171 790 263 32 263Z" fill="#ebe4d7" />
        <path
          d="M32 242 790 171"
          fill="none"
          stroke="#b5a181"
          strokeWidth="2"
        />
        <path d="M468 163 542 149 583 176 510 189Z" fill="#6b706c" />
        <path d="M468 163 510 189 507 207 466 184Z" fill="#464e4c" />
        <path d="M510 189 583 176 580 199 507 207Z" fill="#8a9089" />
        <g stroke="#167283" strokeWidth="2" markerEnd="url(#thesis-arrow)">
          <path d="M83 173H215" />
          <path d="M259 187H382" />
        </g>
        <g fontFamily="Arial, sans-serif" fontSize="16" fill="#264950">
          <text x="34" y="55">
            Fluido · SPH
          </text>
          <text x="424" y="55">
            Bloque · cuerpo rígido
          </text>
          <text x="627" y="116">
            Movimiento
          </text>
          <text x="627" y="139">
            y señales del flujo
          </text>
        </g>
        <g stroke="#698a8f" strokeWidth="1.5" fill="none">
          <path d="M92 70V108" />
          <path d="M514 70V139" />
          <path d="M610 134 570 150" />
        </g>
      </svg>
      <figcaption>
        Esquema conceptual, sin escala. Ilustra el problema; no es una salida
        del solver.
      </figcaption>
    </figure>
  );
}
