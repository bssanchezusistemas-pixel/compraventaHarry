/*
  Compraventa Harry — app.js
  Integración Supabase + Base de datos local de respaldo
  Renderizado separado: Motos | Carros | Oro | Divisas | Trámites | Alquiler | Admin
  Menú lateral de catálogo + animación fade-in
*/

// =========================================
// SUPABASE CONFIGURATION
// =========================================
let supabaseClient = null;
let usingSupabase = false;

function initSupabase() {
  const url = window.__SUPABASE_URL || "";
  const key = window.__SUPABASE_ANON_KEY || "";

  if (url && key && url.includes("supabase.co") && key.length > 20) {
    try {
      supabaseClient = supabase.createClient(url, key);
      usingSupabase = true;
      return true;
    } catch (e) {
      usingSupabase = false;
      return false;
    }
  }
  usingSupabase = false;
  return false;
}

// =========================================
// CONFIGURATION
// =========================================
const WHATSAPP_PHONE = "573127622440";

// =========================================
// LOCAL FALLBACK DATA
// =========================================
const LOCAL_VEHICLES = [
  // MOTOS - VENTA
  {
    id: 1,
    name: "Yamaha NMAX 155 Tech Max",
    category: "yamaha-nmax",
    type: "moto",
    purpose: "venta",
    year: 2026,
    mileage: "0 km",
    price: "$17.400.000",
    image: "/2026-yamaha-nmax-155-tech-max-scooter-first-look-1-768x512.webp"
  },
  {
    id: 2,
    name: "Yamaha NMAX 125 Connect",
    category: "yamaha-nmax",
    type: "moto",
    purpose: "venta",
    year: 2025,
    mileage: "2.500 km",
    price: "$13.900.000",
    image: "/yamaha-nmax-125-2025-6.webp"
  },
  {
    id: 3,
    name: "Yamaha Crypton FI (Negro Mate Azul)",
    category: "crypton-fi",
    type: "moto",
    purpose: "venta",
    year: 2025,
    mileage: "1.200 km",
    price: "$8.400.000",
    image: "/CRYPTON-FI_0001_CRYPTON-NEGRO-MATE-AZUL.webp"
  },
  {
    id: 4,
    name: "Yamaha Crypton FI (Negro Mate Amarillo)",
    category: "crypton-fi",
    type: "moto",
    purpose: "venta",
    year: 2025,
    mileage: "800 km",
    price: "$8.600.000",
    image: "/CRYPTON-FI_0002_CRYPTON-NEGRO-MATE-AMARILLO.webp"
  },
  {
    id: 5,
    name: "Suzuki DR 650 SE (Línea Dirt)",
    category: "linea-dirt",
    type: "moto",
    purpose: "venta",
    year: 2026,
    mileage: "0 km",
    price: "$34.500.000",
    image: "/linea_dirt_dr650.png"
  },
  // MOTOS - ALQUILER
  {
    id: 6,
    name: "Yamaha NMAX 155 (Alquiler)",
    category: "yamaha-nmax",
    type: "moto",
    purpose: "alquiler",
    year: 2025,
    mileage: "Disponible",
    price: "$120.000/día",
    image: "/yamaha-nmax-125-2025-6.webp"
  },
  // CARROS - VENTA
  {
    id: 7,
    name: "Superdeportivo Premium Red",
    category: "carros",
    type: "carro",
    purpose: "venta",
    year: 2025,
    mileage: "1.500 km",
    price: "$420.000.000",
    image: "/Gemini_Generated_Image_vz65j3vz65j3vz65.png"
  },
  // CARROS - ALQUILER
  {
    id: 8,
    name: "SUV Sport (Alquiler)",
    category: "carros",
    type: "carro",
    purpose: "alquiler",
    year: 2024,
    mileage: "Disponible",
    price: "$350.000/día",
    image: "/Gemini_Generated_Image_vz65j3vz65j3vz65.png"
  }
];

const LOCAL_TRAMITES = [
  {
    id: 1,
    name: "SOAT",
    description: "Seguro Obligatorio de Accidentes de Tránsito. Cotización rápida y gestión sin filas.",
    icon: "🛡️",
    btn_label: "Cotizar mi SOAT",
    wa_message: "Hola Harry, necesito cotizar el SOAT de mi vehículo. ¿Me ayudas con el proceso?"
  },
  {
    id: 2,
    name: "Tecnomecánica",
    description: "Revisión técnico-mecánica y de emisiones. Agenda tu cita con nosotros.",
    icon: "🔧",
    btn_label: "Agendar Tecno",
    wa_message: "Hola Harry, necesito agendar la revisión tecnomecánica de mi vehículo. ¿Cuándo tienen disponibilidad?"
  },
  {
    id: 3,
    name: "Impuestos",
    description: "Liquidación de impuestos departamentales y municipales del año en curso.",
    icon: "💰",
    btn_label: "Liquidar Impuestos",
    wa_message: "Hola Harry, necesito ayuda para liquidar los impuestos de mi vehículo. ¿Me puedes asesorar?"
  },
  {
    id: 4,
    name: "Matrículas / Duplicados / Improntas",
    description: "Duplicados de tarjeta de propiedad, matrículas e improntas vehiculares.",
    icon: "📋",
    btn_label: "Consultar Trámite",
    wa_message: "Hola Harry, necesito información sobre un trámite de matrícula, duplicado o improntas. ¿Me puedes orientar?"
  }
];

const LOCAL_EXCHANGE_RATES = [
  {
    id: 1,
    currency: "USD",
    name: "Dólar Estadounidense",
    icon: "🇺🇸",
    buy_rate: "$4.150",
    sell_rate: "$4.050",
    updated_label: "Actualizado hoy"
  },
  {
    id: 2,
    currency: "EUR",
    name: "Euro",
    icon: "🇪🇺",
    buy_rate: "$4.520",
    sell_rate: "$4.420",
    updated_label: "Actualizado hoy"
  }
];

const LOCAL_GOLD = [
  {
    id: 1,
    name: "Cadena Cubana Oro 18k",
    karats: "18k",
    weight: "12 gr / 60 cm",
    price: "$4.800.000",
    image: "/Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
  },
  {
    id: 2,
    name: "Pulsera Italiana Oro 14k",
    karats: "14k",
    weight: "8 gr / 20 cm",
    price: "$2.100.000",
    image: "/Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
  },
  {
    id: 3,
    name: "Anillo Sello Oro 18k",
    karats: "18k",
    weight: "5 gr",
    price: "$1.350.000",
    image: "/Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
  }
];

// Runtime stores
let vehicles = [];
let goldItems = [];
let tramiteServices = [];
let exchangeRates = [];

const CATALOG_DESCRIPTIONS = {
  motos: "Catálogo de motos en venta y servicio para vender la tuya directo a Harry.",
  carros: "Vehículos de cuatro ruedas disponibles para compra inmediata.",
  oro: "Compraventa de oro con cotización al precio real del mercado.",
  divisas: "Compra y venta de dólares y euros con tasas competitivas del día.",
  tramites: "Trámites vehiculares, SOAT, tecnomecánica, impuestos y documentación.",
  alquiler: "Alquiler de motos y carros — mínimo 5 días de renta."
};

// =========================================
// DATA LOADING
// =========================================
function getPrimaryImage(product) {
  const images = (product.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return images[0]?.url || "";
}

function inferVehicleSubtype(product) {
  const m = product.metadata || {};
  if (m.vehicle_type === "moto" || m.vehicle_type === "carro") return m.vehicle_type;
  if (m.subtype === "moto" || m.subtype === "carro") return m.subtype;
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  if (/(carro|auto|suv|sed[aá]n|camioneta|pickup|4x4)/.test(text)) return "carro";
  return "moto";
}

function mapProductToVehicle(product) {
  const m = product.metadata || {};
  return {
    id: product.id,
    name: product.name,
    category: m.category || "general",
    type: inferVehicleSubtype(product),
    purpose: m.purpose === "alquiler" ? "alquiler" : "venta",
    year: m.year || new Date().getFullYear(),
    mileage: m.mileage || m.kilometraje || "Consultar",
    price: product.price || "",
    image: getPrimaryImage(product),
  };
}

function mapProductToGold(product) {
  const m = product.metadata || {};
  return {
    id: product.id,
    name: product.name,
    karats: m.karats || m.kilate || m.quilates || "Consultar",
    weight: m.weight || m.peso || m.medidas || "Consultar",
    price: product.price || "",
    image: getPrimaryImage(product),
  };
}

function mapProductToTramite(product) {
  const m = product.metadata || {};
  const defaultWa = `Hola Harry, necesito información sobre ${product.name}. ¿Me puedes ayudar?`;
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    icon: m.icon || "📄",
    btn_label: m.btn_label || m.button_label || "Consultar",
    wa_message: m.wa_message || m.whatsapp_message || defaultWa,
  };
}

function mapProductToExchangeRate(product) {
  const m = product.metadata || {};
  const currency = m.currency || m.code || product.name;
  return {
    id: product.id,
    currency,
    name: m.currency_name || m.name || product.name,
    icon: m.icon || "💱",
    buy_rate: m.buy_rate || product.price || "Consultar",
    sell_rate: m.sell_rate || product.description || m.buy_rate || product.price || "Consultar",
    updated_label: m.updated_label || "Actualizado hoy",
  };
}

async function loadData() {
  if (usingSupabase && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*, product_images(*)")
        .eq("status", "publicado");

      if (error) throw error;

      const products = data || [];
      vehicles = products.filter((p) => p.type === "vehiculo").map(mapProductToVehicle);
      goldItems = products.filter((p) => p.type === "oro").map(mapProductToGold);
      tramiteServices = products.filter((p) => p.type === "tramite").map(mapProductToTramite);
      exchangeRates = products.filter((p) => p.type === "divisa").map(mapProductToExchangeRate);
    } catch (err) {
      console.warn("Supabase fetch failed, using local data:", err);
      vehicles = LOCAL_VEHICLES;
      goldItems = LOCAL_GOLD;
      tramiteServices = LOCAL_TRAMITES;
      exchangeRates = LOCAL_EXCHANGE_RATES;
    }
  } else {
    vehicles = LOCAL_VEHICLES;
    goldItems = LOCAL_GOLD;
    tramiteServices = LOCAL_TRAMITES;
    exchangeRates = LOCAL_EXCHANGE_RATES;
  }
}

// =========================================
// CARD BUILDERS
// =========================================
function buildVehicleCard(vehicle) {
  const msg = `¡Hola Harry! Estoy interesado en la ${vehicle.name} que vi en la página web. ¿Me podrías dar más información sobre precio y financiamiento?`;
  const isRental = vehicle.purpose === "alquiler";
  const waMsg = isRental
    ? `¡Hola Harry! Quiero alquilar el vehículo ${vehicle.name} por 5 días o más. ¿Me confirmas disponibilidad y precio?`
    : msg;
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(waMsg)}`;
  const btnLabel = isRental ? "Consultar Alquiler" : "Consultar Disponibilidad";

  const card = document.createElement("article");
  card.className = "catalog-card reveal active";
  card.innerHTML = `
    <div class="card-img-wrap">
      <div class="card-overlay"></div>
      <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
    </div>
    <div class="card-body">
      <h3 class="card-title">${vehicle.name}</h3>
      <div class="card-specs">
        <span class="spec-badge">Año ${vehicle.year}</span>
        <span class="spec-badge">${vehicle.mileage}</span>
      </div>
      <div class="card-price-wrap">
        <span class="price-label">Precio</span>
        <span class="price-tag">${vehicle.price}</span>
      </div>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card">
        ${btnLabel}
      </a>
    </div>
  `;
  return card;
}

function buildGoldCard(item) {
  const msg = `¡Hola Harry! Estoy interesado en la pieza de oro: ${item.name} (${item.karats}, ${item.weight}). ¿Sigue disponible?`;
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;

  const card = document.createElement("article");
  card.className = "catalog-card gold-card reveal active";
  card.innerHTML = `
    <div class="card-img-wrap">
      <div class="card-overlay"></div>
      <img src="${item.image}" alt="${item.name}" loading="lazy">
    </div>
    <div class="card-body">
      <h3 class="card-title">${item.name}</h3>
      <div class="card-specs">
        <span class="spec-badge">${item.karats}</span>
        <span class="spec-badge">${item.weight}</span>
      </div>
      <div class="card-price-wrap">
        <span class="price-label">Precio</span>
        <span class="price-tag">${item.price}</span>
      </div>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card">
        Consultar Pieza
      </a>
    </div>
  `;
  return card;
}

function buildTramiteCard(service) {
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(service.wa_message)}`;

  const card = document.createElement("article");
  card.className = "tramite-service-card reveal active";
  card.innerHTML = `
    <div class="tramite-service-icon">${service.icon || "📄"}</div>
    <h3 class="tramite-service-title">${service.name}</h3>
    <p class="tramite-service-desc">${service.description || ""}</p>
    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-tramite-service">
      ${service.btn_label || "Consultar"}
    </a>
  `;
  return card;
}

function showEmpty(grid, msg = "No hay artículos disponibles en este momento.", append = false) {
  const el = document.createElement("p");
  el.className = "catalog-empty";
  el.textContent = msg;
  if (append) {
    grid.appendChild(el);
  } else {
    grid.innerHTML = "";
    grid.appendChild(el);
  }
}

// =========================================
// RENDER FUNCTIONS
// =========================================
function renderMotos() {
  const grid = document.getElementById("motosGrid");
  if (!grid) return;

  grid.querySelectorAll(".catalog-card:not(.catalog-card--static), .catalog-empty").forEach(el => el.remove());

  const motos = vehicles.filter(v => v.type === "moto" && v.purpose === "venta");

  if (motos.length === 0) {
    showEmpty(grid, "No hay motos disponibles actualmente. ¡Vuelve pronto!", true);
    return;
  }

  motos.forEach(m => grid.appendChild(buildVehicleCard(m)));
}

function renderCarros() {
  const grid = document.getElementById("carrosGrid");
  if (!grid) return;

  const carros = vehicles.filter(v => v.type === "carro" && v.purpose === "venta");

  if (carros.length === 0) {
    showEmpty(grid, "No hay carros disponibles actualmente. ¡Vuelve pronto!");
    return;
  }

  carros.forEach(c => grid.appendChild(buildVehicleCard(c)));
}

function renderOro() {
  const grid = document.getElementById("oroGrid");
  if (!grid) return;

  if (goldItems.length === 0) {
    showEmpty(grid, "No hay piezas de oro disponibles en este momento.");
    return;
  }

  goldItems.forEach(g => grid.appendChild(buildGoldCard(g)));
}

function renderAlquiler() {
  const grid = document.getElementById("alquilerGrid");
  if (!grid) return;

  const rentals = vehicles.filter(v => v.purpose === "alquiler");

  if (rentals.length === 0) {
    showEmpty(grid, "No hay vehículos en alquiler disponibles en este momento.");
    return;
  }

  rentals.forEach(r => grid.appendChild(buildVehicleCard(r)));
}

function buildDivisaRateCard(rate) {
  const card = document.createElement("article");
  card.className = "divisa-rate-card reveal active";
  card.innerHTML = `
    <div class="divisa-rate-header">
      <span class="divisa-rate-flag">${rate.icon || "💱"}</span>
      <div>
        <div class="divisa-rate-name">${rate.name}</div>
        <div class="divisa-rate-code">${rate.currency}</div>
      </div>
    </div>
    <div class="divisa-rate-rows">
      <div class="divisa-rate-row">
        <span class="divisa-rate-label">Harry Compra (tú vendes)</span>
        <span class="divisa-rate-value">${rate.sell_rate}</span>
      </div>
      <div class="divisa-rate-row">
        <span class="divisa-rate-label">Harry Vende (tú compras)</span>
        <span class="divisa-rate-value">${rate.buy_rate}</span>
      </div>
    </div>
    <p class="divisa-rate-updated">${rate.updated_label || "Cotización del día"}</p>
  `;
  return card;
}

function renderDivisas() {
  const grid = document.getElementById("divisasRatesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (exchangeRates.length === 0) {
    showEmpty(grid, "Las tasas de cambio se actualizan pronto. Escríbenos por WhatsApp.");
    return;
  }

  exchangeRates.forEach(r => grid.appendChild(buildDivisaRateCard(r)));
}

function renderTramites() {
  const grid = document.getElementById("tramitesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (tramiteServices.length === 0) {
    showEmpty(grid, "No hay servicios de trámites disponibles en este momento.");
    return;
  }

  tramiteServices.forEach(s => grid.appendChild(buildTramiteCard(s)));
}

// =========================================
// CATALOG MENU NAVIGATION
// =========================================
const VALID_TABS = ["motos", "carros", "oro", "divisas", "tramites", "alquiler"];
let activeTab = "motos";

function updateCatalogDescription(tabId) {
  const desc = document.getElementById("catalogPageDesc");
  if (desc && CATALOG_DESCRIPTIONS[tabId]) {
    desc.textContent = CATALOG_DESCRIPTIONS[tabId];
  }
}

function closeMobileCatalogMenu() {
  const sidebar = document.getElementById("catalogSidebar");
  const toggle = document.getElementById("catalogMobileToggle");
  const toggleText = document.getElementById("catalogMobileToggleText");
  if (sidebar) sidebar.classList.remove("is-open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  if (toggleText) toggleText.textContent = "Menú Catálogo";
}

function switchTab(tabId, { scroll = true } = {}) {
  if (!VALID_TABS.includes(tabId)) return;
  if (tabId === activeTab) {
    closeMobileCatalogMenu();
    return;
  }

  document.querySelectorAll(".catalog-menu-btn").forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    const isActive = panel.id === `panel-${tabId}`;
    panel.classList.remove("active", "tab-fade-in");
    if (isActive) {
      void panel.offsetWidth;
      panel.classList.add("active", "tab-fade-in");
    }
  });

  activeTab = tabId;
  updateCatalogDescription(tabId);
  closeMobileCatalogMenu();

  if (scroll) {
    const catalogPage = document.getElementById("catalogPage");
    if (catalogPage) {
      const top = catalogPage.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }
}

function initTabs() {
  document.querySelectorAll(".catalog-menu-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  const mobileToggle = document.getElementById("catalogMobileToggle");
  const sidebar = document.getElementById("catalogSidebar");
  const toggleText = document.getElementById("catalogMobileToggleText");

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (toggleText) toggleText.textContent = isOpen ? "Cerrar Menú" : "Menú Catálogo";
    });
  }

  document.querySelectorAll("[data-goto-tab]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.dataset.gotoTab);
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  const navCatalogo = document.querySelector('.nav-links a[href="#catalogo"]');
  if (navCatalogo) {
    navCatalogo.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(activeTab || "motos");
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  updateCatalogDescription(activeTab);
}

function refreshAllGrids() {
  const motosGrid = document.getElementById("motosGrid");
  const carrosGrid = document.getElementById("carrosGrid");
  const oroGrid = document.getElementById("oroGrid");
  const alquilerGrid = document.getElementById("alquilerGrid");

  // Keep the static "Vender mi Moto" card in motosGrid (first child)
  if (motosGrid) {
    const staticCard = motosGrid.querySelector(".catalog-card--static");
    motosGrid.innerHTML = "";
    if (staticCard) motosGrid.appendChild(staticCard);
    renderMotos();
  }
  if (carrosGrid) { carrosGrid.innerHTML = ""; renderCarros(); }
  if (oroGrid) { oroGrid.innerHTML = ""; renderOro(); }
  if (alquilerGrid) { alquilerGrid.innerHTML = ""; renderAlquiler(); }

  const tramitesGrid = document.getElementById("tramitesGrid");
  if (tramitesGrid) { tramitesGrid.innerHTML = ""; renderTramites(); }

  const divisasGrid = document.getElementById("divisasRatesGrid");
  if (divisasGrid) { divisasGrid.innerHTML = ""; renderDivisas(); }
}

// =========================================
// SCROLL & UI EFFECTS
// =========================================
function handleScrollEffects(scrollY) {
  const windowHeight = window.innerHeight;

  // 1. Progress bar
  const docHeight = document.documentElement.scrollHeight - windowHeight;
  if (docHeight > 0) {
    const pct = (scrollY / docHeight) * 100;
    const bar = document.querySelector(".scroll-progress");
    if (bar) bar.style.width = `${pct}%`;
  }

  // 2. Navbar
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.classList.toggle("navbar--scrolled", scrollY > 50);
  }

  // 3. Hero video scroll zoom
  const heroVideoWrap = document.querySelector(".hero-video-wrap");
  if (heroVideoWrap) {
    const ratio = Math.min(scrollY / windowHeight, 1);
    heroVideoWrap.style.transform = `scale(${1 - ratio * 0.15})`;
    heroVideoWrap.style.opacity = 1 - ratio;
  }

  // 4. Reveal elements
  document.querySelectorAll(".reveal:not(.active)").forEach(el => {
    if (el.getBoundingClientRect().top < windowHeight * 0.85) {
      el.classList.add("active");
    }
  });
}

// =========================================
// MOBILE MENU
// =========================================
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navbar = document.getElementById("navbar");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("nav-links--mobile");
    navbar.classList.toggle("navbar--mobile-open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("nav-links--mobile");
      navbar?.classList.remove("navbar--mobile-open");
    });
  });
}

// =========================================
// CONTACT FORM → WHATSAPP
// =========================================
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('[name="name"]')?.value;
    const email = contactForm.querySelector('[name="email"]')?.value;
    const message = contactForm.querySelector('[name="message"]')?.value;
    const text = `¡Hola Harry! Mi nombre es ${name} (${email}). Te escribo desde la web: "${message}"`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  });
}

// =========================================
// BOOTSTRAP
// =========================================
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Init Supabase
  initSupabase();

  // 2. Load data (Supabase or local)
  await loadData();

  // 3. Render sections
  renderMotos();
  renderCarros();
  renderOro();
  renderDivisas();
  renderTramites();
  renderAlquiler();

  // 4. Tab navigation
  initTabs();

  // 5. Init mobile menu
  initMobileMenu();

  // 6. Init contact form
  initContactForm();

  // 7. Scroll effects (rAF-optimized)
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScrollEffects(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial call
  handleScrollEffects(window.scrollY);
});
