import Hero from "@/components/Hero";

export const metadata = {
  title: "Demo Hero Premium | Compraventa Harry",
  description: "Preview of the premium GSAP + ScrollTrigger Hero Section",
};

export default function DemoPage() {
  return (
    <div className="bg-[#030303] text-white min-h-screen">
      {/* Premium Hero component to test */}
      <Hero />

      {/* Placeholder sections for scroll testing */}
      <div className="relative z-20 w-full bg-[#050505] border-t border-zinc-900">
        
        {/* Decorative Transition Stripe */}
        <div className="w-full h-1 bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-80"></div>

        {/* Section 1: Catalog Preview Placeholder */}
        <section className="max-w-7xl mx-auto py-24 px-6 md:px-12 flex flex-col items-center">
          <span className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs mb-3">
            Explora
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-center mb-6">
            Inventario Disponible
          </h2>
          <p className="text-zinc-500 text-center max-w-xl mb-12 text-sm sm:text-base">
            Esta sección representa el catálogo de vehículos, motocicletas, cambio de divisas, joyería y servicios de Compraventa Harry en la versión de producción.
          </p>

          {/* Dummy grid layout to occupy space */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded p-6 flex flex-col gap-4 group hover:border-red-600/30 transition-all duration-300"
              >
                <div className="w-full h-48 bg-zinc-950 rounded flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-zinc-700 font-bold text-xs uppercase tracking-widest">
                    Vehículo Demo #{i + 1}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-zinc-300 uppercase text-sm">Modelo Premium</span>
                  <span className="text-red-500 font-bold text-sm">$XX.XXX.XXX</span>
                </div>
                <div className="w-full h-[1px] bg-zinc-800"></div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                    Año 2026
                  </span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                    0 KM
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Contact Section Placeholder */}
        <section className="bg-black py-24 px-6 md:px-12 border-t border-zinc-900/60">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <span className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs mb-3">
              Contacto
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6">
              ¿Listo para el cambio?
            </h2>
            <p className="text-zinc-400 max-w-xl mb-8 text-sm sm:text-base">
              Si estás en la página demo y quieres probar la integración real, escríbenos por WhatsApp para coordinar tus trámites.
            </p>
            <a
              href="https://wa.me/573127622440"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-red-600/50 hover:bg-zinc-900/80 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300"
            >
              WhatsApp Directo
              <span className="text-red-500">→</span>
            </a>
          </div>
        </section>

        {/* Footer Placeholder */}
        <footer className="py-12 bg-black border-t border-zinc-900/40 text-center text-xs text-zinc-600">
          <p>© 2026 Compraventa Harry. Premium Automotive Aesthetic.</p>
        </footer>
      </div>
    </div>
  );
}
