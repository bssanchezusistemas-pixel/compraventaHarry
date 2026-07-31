import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Compraventa Harry | Motos · Carros · Oro · Divisas · Trámites · Alquiler",
  description:
    "Compraventa Harry — Motos, carros, oro, dólares, euros, trámites vehiculares y alquiler en Colombia.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
