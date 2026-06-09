import type { Metadata } from "next";
import LegacyHomeScripts from "@/components/LegacyHomeScripts";

export const metadata: Metadata = {
  title: "Compraventa Harry | Motos · Carros · Oro · Divisas · Trámites · Alquiler",
  description:
    "Compraventa Harry — Motos, carros, oro, dólares, euros, trámites vehiculares y alquiler en Colombia.",
  other: {
    "theme-color": "#000000",
  },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/style.css" />
      {children}
      <LegacyHomeScripts />
    </>
  );
}
