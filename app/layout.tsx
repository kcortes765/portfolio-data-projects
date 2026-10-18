import type { Metadata } from "next";
import "./globals.css";
import "./gridops.css";
import "./opsforge.css";
import "./portfolio.css";
import "./portfolio-home.css";
import "./gridops-refresh.css";
import "./opsforge-refresh.css";
import "./project-stories.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site",
  ),
  title: "Sebastián Cortés | Data Engineer Jr · Python y SQL",
  description:
    "Estudiante de Ingeniería Civil UCN en Antofagasta. Proyectos de ingeniería de datos con Python, SQL y dbt: demos, casos técnicos y código descargable.",
  openGraph: {
    title: "Sebastián Cortés · Datos y software",
    description:
      "Python, SQL y automatización. Explora mis proyectos, revisa los casos técnicos y consulta el código.",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: "/images/social-card.png",
        width: 1200,
        height: 630,
        alt: "Sebastián Cortés — Data Engineer Jr, Python y SQL",
      },
    ],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
