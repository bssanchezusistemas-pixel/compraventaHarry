import HomeHero from "@/components/HomeHero";
import LegacyStubLink from "@/components/LegacyStubLink";

export default function PreviewPage() {
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />

        {/* ── CONTACTO ──────────────────────────────────────── */}
        <section className="contact-section-wrap" id="contacto">
          <div className="contact-container">
            <div className="contact-info reveal">
              <p className="section-label">¿Listo para el cambio?</p>
              <h2 id="contact-heading">Consúltanos</h2>
              <p>
                Completa el formulario para consultar disponibilidad, coordinar una inspección o resolver
                dudas. Respondemos de inmediato por WhatsApp.
              </p>
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h4>Ubicación</h4>
                    <p>Medellín, Antioquia — Colombia (Atención Nacional)</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <div>
                    <h4>Horario</h4>
                    <p>Lunes a Sábado: 8:00 AM – 7:00 PM</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h4>WhatsApp</h4>
                    <p>
                      <a href="tel:+573127622440">+57 312 7622440</a>
                    </p>
                  </div>
                </div>
              </div>
              <form className="contact-form" id="contactForm">
                <input
                  type="text"
                  name="name"
                  placeholder="Tu Nombre"
                  required
                  autoComplete="name"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Tu Correo Electrónico"
                  required
                  autoComplete="email"
                />
                <textarea name="message" placeholder="¿En qué te podemos ayudar?" required />
                <button type="submit">Enviar a WhatsApp</button>
                <p className="form-disclaimer">*Al enviar se abrirá WhatsApp con tus datos.</p>
              </form>
            </div>
            <div className="map-container reveal">
              <iframe
                title="Ubicación de Compraventa Harry"
                src="https://www.google.com/maps?q=Medellin,+Colombia&hl=es&z=12&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                Compraventa <span>Harry</span>
              </div>
              <p>
                Motos · Carros · Oro · Divisas · Trámites · Alquiler. La plataforma de confianza para tus
                operaciones vehiculares, metales y cambio de moneda.
              </p>
              <div className="social-links" aria-label="Redes sociales">
                <a
                  href="https://www.instagram.com/compraventa_harry_/"
                  className="social-link"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IG
                </a>
                <LegacyStubLink className="social-link" aria-label="Facebook">
                  FB
                </LegacyStubLink>
                <LegacyStubLink className="social-link" aria-label="TikTok">
                  TT
                </LegacyStubLink>
              </div>
            </div>
            <div className="footer-col">
              <h4>Catálogo</h4>
              <ul>
                <li>
                  <a href="#catalogo" data-goto-tab="motos">
                    🏍️ Motos
                  </a>
                </li>
                <li>
                  <a href="#catalogo" data-goto-tab="carros">
                    🚗 Carros
                  </a>
                </li>
                <li>
                  <a href="#catalogo" data-goto-tab="oro">
                    ✨ Oro
                  </a>
                </li>
                <li>
                  <a href="#catalogo" data-goto-tab="divisas">
                    💵 Dólares y Euros
                  </a>
                </li>
                <li>
                  <a href="#catalogo" data-goto-tab="tramites">
                    📄 Trámites
                  </a>
                </li>
                <li>
                  <a href="#catalogo" data-goto-tab="alquiler">
                    🔑 Alquiler
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Información</h4>
              <ul>
                <li>                </li>
                <li>
                  <a href="#contacto">Contacto</a>
                </li>
                <li>
                  <a href="tel:+573127622440">Llamar Directo</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Horario</h4>
              <ul>
                <li>
                  <a href="#">Lun – Sáb: 8AM – 7PM</a>
                </li>
                <li>
                  <a href="#">Respuesta &lt; 1 hora</a>
                </li>
                <li>
                  <a href="https://wa.me/573127622440" target="_blank" rel="noopener noreferrer">
                    WhatsApp Directo
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Compraventa Harry. Todos los derechos reservados.</p>
            <p>Diseño premium · Racing Aesthetic · Montserrat</p>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP ──────────────────────────────────── */}
      <a
        href="https://wa.me/573127622440?text=%C2%A1Hola%20Harry!%20Vi%20tu%20p%C3%A1gina%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
