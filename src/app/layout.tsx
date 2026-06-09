import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compraventa Harry",
  description: "Motos, carros, oro, divisas, trámites y alquiler en Colombia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
