import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mapa Estratégico | Cooplivre",
  description: "Revisão colaborativa dos objetivos, indicadores, metas e iniciativas do Mapa Estratégico Cooplivre 2027–2030.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003641",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sourceSans.variable}>
      <body>{children}</body>
    </html>
  );
}
