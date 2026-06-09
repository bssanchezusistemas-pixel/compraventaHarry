import LegacyStubLink from "@/components/LegacyStubLink";

export default function PreviewPage() {
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />

      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <header className="navbar" id="navbar" role="banner">
        <div className="nav-inner">
          <a href="#" className="logo">
            Compraventa <span>Harry</span>
          </a>

          <nav className="nav-links" id="navLinks" aria-label="Navegación principal">
            <a href="#hero">Inicio</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#experiencia">Experiencia</a>
            <a href="#contacto">Contacto</a>
            <a href="/admin" className="nav-admin-btn">
              Admin ⚙️
            </a>
          </nav>

          <a
            href="https://wa.me/573127622440?text=%C2%A1Hola%20Harry!%20Quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios."
            className="nav-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos
          </a>

          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Abrir menú"
            aria-expanded="false"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ─── HERO (Sticky Video Scroll) ────────────────────────── */}
      <section className="hero" id="hero" aria-label="Hero Video">
        <div className="hero-video-wrap">
          <video className="hero-video" autoPlay loop muted playsInline preload="auto">
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay" />

        <div className="hero-scroll-cue" aria-hidden="true">
          <span>Desliza hacia abajo</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ─── MAIN CONTENT (slides over hero) ───────────────────── */}
      <main className="main-content" id="catalogo">
        <div className="catalog-page" id="catalogPage">
          <header className="catalog-page-header">
            <p className="section-label">Nuestros Servicios</p>
            <h1 className="catalog-page-title">Catálogo Completo</h1>
            <p className="catalog-page-desc" id="catalogPageDesc">
              Motos, carros, oro, divisas, trámites y alquiler — todo en un solo lugar.
            </p>
          </header>

          <button
            className="catalog-mobile-toggle"
            id="catalogMobileToggle"
            type="button"
            aria-expanded="false"
            aria-controls="catalogSidebar"
          >
            <span className="catalog-mobile-toggle-icon" aria-hidden="true">
              ☰
            </span>
            <span id="catalogMobileToggleText">Menú Catálogo</span>
          </button>

          <div className="catalog-layout">
            <aside className="catalog-sidebar" id="catalogSidebar">
              <div className="catalog-sidebar-header">
                <span className="catalog-sidebar-title">Categorías</span>
              </div>
              <nav
                className="catalog-menu"
                id="catalogMenu"
                role="tablist"
                aria-label="Categorías del catálogo"
              >
                <button
                  className="catalog-menu-btn active"
                  data-tab="motos"
                  role="tab"
                  aria-selected="true"
                  aria-controls="panel-motos"
                  type="button"
                >
                  🏍️ Motos
                </button>
                <button
                  className="catalog-menu-btn"
                  data-tab="carros"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-carros"
                  type="button"
                >
                  🚗 Carros
                </button>
                <button
                  className="catalog-menu-btn"
                  data-tab="oro"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-oro"
                  type="button"
                >
                  ✨ Oro
                </button>
                <button
                  className="catalog-menu-btn"
                  data-tab="divisas"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-divisas"
                  type="button"
                >
                  💵 Dólares y Euros
                </button>
                <button
                  className="catalog-menu-btn"
                  data-tab="tramites"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-tramites"
                  type="button"
                >
                  📄 Trámites y Papeles
                </button>
                <button
                  className="catalog-menu-btn"
                  data-tab="alquiler"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-alquiler"
                  type="button"
                >
                  🔑 Alquiler
                </button>
              </nav>
            </aside>

            <div className="catalog-main">
              <div className="tab-panels-min-height" id="tabPanelsWrap">
                {/* ── PANEL: MOTOS ──────────────────────────────────── */}
                <section
                  className="tab-panel active"
                  id="panel-motos"
                  role="tabpanel"
                  aria-labelledby="tab-motos"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Dos Ruedas</p>
                      <h2 className="section-title">Catálogo de Motos</h2>
                    </header>

                    <div className="catalog-grid" id="motosGrid">
                      <article className="catalog-card catalog-card--static">
                        <div className="card-img-wrap">
                          <div className="card-overlay" />
                          <img
                            src="/Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
                            alt="Vende tu moto con Harry"
                            loading="eager"
                          />
                          <span className="card-badge-static">Servicio Directo</span>
                        </div>
                        <div className="card-body">
                          <h3 className="card-title">¿Quieres vender tu Moto? Directo a Harry</h3>
                          <p className="card-static-subtitle">
                            Envíanos los siguientes datos para una cotización inmediata:
                          </p>
                          <ul className="card-bullets">
                            <li>
                              <span>✓</span> Fotos reales
                            </li>
                            <li>
                              <span>✓</span> Precio pretendido
                            </li>
                            <li>
                              <span>✓</span> Modelo / Año
                            </li>
                            <li>
                              <span>✓</span> Estado de Impuestos
                            </li>
                            <li>
                              <span>✓</span> Kilometraje actual
                            </li>
                            <li>
                              <span>✓</span> Placa (¿De dónde es?)
                            </li>
                            <li>
                              <span>✓</span> SOAT (¿Hasta cuándo?)
                            </li>
                            <li>
                              <span>✓</span> Tecno (¿Hasta cuándo?)
                            </li>
                          </ul>
                          <a
                            href="https://wa.me/573127622440?text=Hola%20Harry%2C%20quiero%20vender%20mi%20moto.%20Aqu%C3%AD%20tengo%20las%20fotos%2C%20precio%2C%20modelo%2C%20info%20de%20impuestos%2C%20kilometraje%2C%20placas%2C%20y%20vigencia%20de%20SOAT%20y%20Tecno."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-card btn-card--static"
                          >
                            Enviar Datos por WhatsApp
                          </a>
                        </div>
                      </article>
                    </div>
                  </div>
                </section>

                {/* ── PANEL: CARROS ─────────────────────────────────── */}
                <section
                  className="tab-panel"
                  id="panel-carros"
                  role="tabpanel"
                  aria-labelledby="tab-carros"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Cuatro Ruedas</p>
                      <h2 className="section-title">Catálogo de Carros</h2>
                    </header>
                    <div className="catalog-grid" id="carrosGrid" />
                  </div>
                </section>

                {/* ── PANEL: ORO Y DIVISAS ──────────────────────────── */}
                <section
                  className="tab-panel"
                  id="panel-oro"
                  role="tabpanel"
                  aria-labelledby="tab-oro"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Metales Preciosos</p>
                      <h2 className="section-title">Compraventa de Oro</h2>
                    </header>

                    <div className="oro-layout">
                      <div className="oro-sell-card">
                        <div className="oro-sell-image-wrap">
                          <div className="oro-sell-overlay" />
                          <span className="oro-sell-badge">Compra Premium</span>
                          <h3 className="oro-sell-title-overlay">Compramos tu Oro al mejor precio</h3>
                        </div>
                        <div className="oro-sell-body">
                          <p className="oro-sell-desc">
                            Envíanos los datos de tu pieza y recibe una oferta competitiva basada en el
                            precio real del mercado:
                          </p>
                          <ul className="card-bullets">
                            <li>
                              <span>⚡</span> Fotos nítidas de la pieza
                            </li>
                            <li>
                              <span>⚡</span> Color del oro
                            </li>
                            <li>
                              <span>⚡</span> Precio estimado
                            </li>
                            <li>
                              <span>⚡</span> Kilates
                            </li>
                            <li>
                              <span>⚡</span> Centímetros / Medidas
                            </li>
                          </ul>
                          <a
                            href="https://wa.me/573127622440?text=Hola%20Harry%2C%20quiero%20vender%20una%20pieza%20de%20oro.%20Tengo%20listos%20los%20datos%3A%20fotos%2C%20color%2C%20precio%2C%20kilates%20y%20cent%C3%ADmetros."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-card"
                          >
                            Cotizar mi Oro
                          </a>
                        </div>
                      </div>

                      <div className="oro-buy-wrap">
                        <h3 className="oro-buy-subtitle">Piezas Disponibles</h3>
                        <div className="oro-buy-grid" id="oroGrid" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── PANEL: DIVISAS (USD / EUR) ───────────────────── */}
                <section
                  className="tab-panel"
                  id="panel-divisas"
                  role="tabpanel"
                  aria-labelledby="tab-divisas"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Cambio de Divisas</p>
                      <h2 className="section-title">Compra y Venta de Dólares y Euros</h2>
                    </header>

                    <div className="divisas-disclaimer">
                      <span className="divisas-disclaimer-icon" aria-hidden="true">
                        📊
                      </span>
                      <p>
                        Tasas referenciales del día. La cotización final se confirma por WhatsApp según
                        monto, moneda y disponibilidad.
                      </p>
                    </div>

                    <div className="divisas-rates-grid" id="divisasRatesGrid" />

                    <div className="divisas-actions-grid">
                      <article className="divisa-action-card">
                        <div className="divisa-action-icon">💵</div>
                        <h3>Comprar Divisas</h3>
                        <p>
                          Adquiere dólares o euros con atención personalizada, proceso ágil y entrega
                          segura.
                        </p>
                        <ul className="card-bullets">
                          <li>
                            <span>✓</span> Moneda deseada (USD o EUR)
                          </li>
                          <li>
                            <span>✓</span> Monto a comprar en pesos colombianos
                          </li>
                          <li>
                            <span>✓</span> Forma de pago y ciudad de entrega
                          </li>
                        </ul>
                        <a
                          href="https://wa.me/573127622440?text=Hola%20Harry%2C%20quiero%20comprar%20divisas%20(d%C3%B3lares%20o%20euros).%20%C2%BFPodr%C3%ADas%20enviarme%20la%20tasa%20del%20d%C3%ADa%20y%20disponibilidad%3F"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-card btn-card--divisa"
                        >
                          Comprar USD / EUR
                        </a>
                      </article>

                      <article className="divisa-action-card divisa-action-card--sell">
                        <div className="divisa-action-icon">💶</div>
                        <h3>Vender Divisas</h3>
                        <p>
                          Vende tus dólares o euros y recibe pesos colombianos al mejor precio del
                          mercado.
                        </p>
                        <ul className="card-bullets">
                          <li>
                            <span>✓</span> Tipo de moneda y cantidad en efectivo
                          </li>
                          <li>
                            <span>✓</span> Billetes en buen estado (sin daños)
                          </li>
                          <li>
                            <span>✓</span> Documento de identidad vigente
                          </li>
                        </ul>
                        <a
                          href="https://wa.me/573127622440?text=Hola%20Harry%2C%20quiero%20vender%20mis%20divisas%20(d%C3%B3lares%20o%20euros).%20%C2%BFCu%C3%A1l%20es%20la%20tasa%20de%20compra%20hoy%3F"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-card btn-card--divisa-sell"
                        >
                          Vender mis Divisas
                        </a>
                      </article>
                    </div>
                  </div>
                </section>

                {/* ── PANEL: TRÁMITES Y PAPELES ────────────────────── */}
                <section
                  className="tab-panel"
                  id="panel-tramites"
                  role="tabpanel"
                  aria-labelledby="tab-tramites"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Documentación Vehicular</p>
                      <h2 className="section-title">Trámites y Papeles</h2>
                    </header>

                    <div className="tramite-featured-card">
                      <div className="tramite-featured-header">
                        <div className="tramite-featured-icon">📋</div>
                        <div>
                          <span className="tramite-priority-badge">Requisito Previo</span>
                          <h3>Traspaso de Vehículo — Documentos que necesitas</h3>
                        </div>
                      </div>
                      <p className="tramite-featured-desc">
                        Para que Harry pueda gestionar el traspaso de tu vehículo de forma ágil y segura,
                        debes tener listos los siguientes documentos al momento del proceso:
                      </p>
                      <ul className="card-bullets tramite-bullets">
                        <li>
                          <span>📌</span> Improntas nítidas (número de chasis y motor)
                        </li>
                        <li>
                          <span>📌</span> Contrato de compraventa firmado por ambas partes
                        </li>
                        <li>
                          <span>📌</span> Paz y salvo de impuestos del año en curso
                        </li>
                        <li>
                          <span>📌</span> SOAT y Tecnicomecánica vigentes en el RUNT
                        </li>
                      </ul>
                      <a
                        href="https://wa.me/573127622440?text=Hola%20Harry%2C%20necesito%20hacer%20un%20traspaso.%20Ya%20tengo%20listos%20los%20papeles%2C%20improntas%20y%20el%20paz%20y%20salvo%20de%20impuestos."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tramite-primary"
                      >
                        Iniciar Trámite →
                      </a>
                    </div>

                    <div className="tramites-services-header">
                      <h3 className="oro-buy-subtitle">Servicios Disponibles</h3>
                    </div>
                    <div className="tramites-grid" id="tramitesGrid" />
                  </div>
                </section>

                {/* ── PANEL: ALQUILER ───────────────────────────────── */}
                <section
                  className="tab-panel"
                  id="panel-alquiler"
                  role="tabpanel"
                  aria-labelledby="tab-alquiler"
                >
                  <div className="catalog-container">
                    <header className="section-header">
                      <p className="section-label">Renta de Vehículos</p>
                      <h2 className="section-title">Alquiler de Vehículos</h2>
                    </header>

                    <div className="rental-warning-box">
                      <div className="rental-warning-icon">⚠️</div>
                      <div className="rental-warning-text">
                        <h3>REQUISITO MÍNIMO DE ALQUILER</h3>
                        <p>
                          El tiempo mínimo de alquiler para cualquier vehículo (Moto o Carro) es de{" "}
                          <strong>5 DÍAS en adelante</strong>. Sin excepciones.
                        </p>
                      </div>
                    </div>

                    <div className="catalog-grid" id="alquilerGrid" />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* ── EXPERIENCIA ───────────────────────────────────── */}
        <section className="experience-section reveal" id="experiencia">
          <div className="experience-images">
            <img
              src="/Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
              alt="Yamaha Crypton FI Crimson Red"
              className="exp-main-img"
              loading="lazy"
            />
          </div>
          <div className="experience-content">
            <p className="section-label">Nuestra Pasión</p>
            <h2 id="experience-heading">
              Rendimiento Extremo y <em>Operaciones Seguras</em>
            </h2>
            <p>
              En <strong>Compraventa Harry</strong>, conectamos a entusiastas del motor con vehículos
              premium, gestionamos trámites con agilidad, compramos oro a precio real, cambiamos
              dólares y euros, y ofrecemos alquiler flexible. Todo con acompañamiento transparente de
              inicio a fin.
            </p>
            <p>
              Cada operación está respaldada por nuestra experiencia y compromiso con el cliente.
              Contáctanos y experimenta la velocidad en tus transacciones.
            </p>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-desc">Atención Virtual</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">&lt; 1h</div>
                <div className="stat-desc">Respuesta</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-desc">Transparencia</div>
              </div>
            </div>
          </div>
        </section>

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
                <li>
                  <a href="#experiencia">Experiencia</a>
                </li>
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
