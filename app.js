/*
  Compraventa Harry — app.js
  Integración Supabase + Base de datos local de respaldo
  Renderizado separado: Motos | Carros | Oro | Divisas | Trámites | Alquiler | Admin
  Menú lateral de catálogo + animación fade-in
*/

// =========================================
// SUPABASE CONFIGURATION
// =========================================
const SUPABASE_URL_KEY = "ch_supabase_url";
const SUPABASE_KEY_KEY = "ch_supabase_anon_key";

let supabaseClient = null;
let usingSupabase = false;

function initSupabase() {
  const url = localStorage.getItem(SUPABASE_URL_KEY);
  const key = localStorage.getItem(SUPABASE_KEY_KEY);

  if (url && key && url.includes("supabase.co") && key.length > 20) {
    try {
      supabaseClient = supabase.createClient(url, key);
      usingSupabase = true;
      updateDbStatus("✅ Conectado a Supabase correctamente.", "#22c55e");
      return true;
    } catch (e) {
      usingSupabase = false;
      updateDbStatus("❌ Error al conectar. Verifica tus credenciales.", "#ef4444");
      return false;
    }
  } else {
    usingSupabase = false;
    updateDbStatus("⚠️ Modo Local: Datos precargados de muestra. Conecta Supabase para datos en tiempo real.", "#d4af37");
    return false;
  }
}

function updateDbStatus(msg, color) {
  const el = document.getElementById("dbStatus");
  if (el) {
    el.textContent = "Estado: " + msg;
    el.style.color = color;
  }
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
    image: "./2026-yamaha-nmax-155-tech-max-scooter-first-look-1-768x512.webp"
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
    image: "./yamaha-nmax-125-2025-6.webp"
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
    image: "./CRYPTON-FI_0001_CRYPTON-NEGRO-MATE-AZUL.webp"
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
    image: "./CRYPTON-FI_0002_CRYPTON-NEGRO-MATE-AMARILLO.webp"
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
    image: "./linea_dirt_dr650.png"
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
    image: "./yamaha-nmax-125-2025-6.webp"
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
    image: "./Gemini_Generated_Image_vz65j3vz65j3vz65.png"
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
    image: "./Gemini_Generated_Image_vz65j3vz65j3vz65.png"
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
    image: "./Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
  },
  {
    id: 2,
    name: "Pulsera Italiana Oro 14k",
    karats: "14k",
    weight: "8 gr / 20 cm",
    price: "$2.100.000",
    image: "./Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
  },
  {
    id: 3,
    name: "Anillo Sello Oro 18k",
    karats: "18k",
    weight: "5 gr",
    price: "$1.350.000",
    image: "./Gemini_Generated_Image_h0jrkah0jrkah0jr.png"
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
async function loadData() {
  if (usingSupabase && supabaseClient) {
    try {
      const [vRes, gRes, tRes, eRes] = await Promise.all([
        supabaseClient.from("vehicles").select("*"),
        supabaseClient.from("gold_items").select("*"),
        supabaseClient.from("tramite_services").select("*"),
        supabaseClient.from("exchange_rates").select("*")
      ]);

      if (vRes.error) throw vRes.error;
      if (gRes.error) throw gRes.error;

      vehicles = vRes.data || [];
      goldItems = gRes.data || [];
      tramiteServices = tRes.error ? LOCAL_TRAMITES : (tRes.data || LOCAL_TRAMITES);
      exchangeRates = eRes.error ? LOCAL_EXCHANGE_RATES : (eRes.data?.length ? eRes.data : LOCAL_EXCHANGE_RATES);
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

// =========================================
// ADMIN PANEL
// =========================================
function initAdmin() {
  // Supabase config form
  const configForm = document.getElementById("supabaseConfigForm");
  const disconnectBtn = document.getElementById("btnDisconnect");

  // Show disconnect button if already connected
  if (usingSupabase) {
    if (disconnectBtn) disconnectBtn.style.display = "block";
    if (configForm) {
      const urlInput = configForm.querySelector("#dbUrl");
      const keyInput = configForm.querySelector("#dbKey");
      if (urlInput) urlInput.value = localStorage.getItem(SUPABASE_URL_KEY) || "";
      if (keyInput) keyInput.value = localStorage.getItem(SUPABASE_KEY_KEY) || "";
    }
  }

  if (configForm) {
    configForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = configForm.querySelector("#dbUrl").value.trim();
      const key = configForm.querySelector("#dbKey").value.trim();

      if (!url || !key) {
        updateDbStatus("❌ Ingresa ambos campos.", "#ef4444");
        return;
      }

      localStorage.setItem(SUPABASE_URL_KEY, url);
      localStorage.setItem(SUPABASE_KEY_KEY, key);

      const ok = initSupabase();
      if (ok) {
        if (disconnectBtn) disconnectBtn.style.display = "block";
        await loadData();
        refreshAllGrids();
      }
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      localStorage.removeItem(SUPABASE_URL_KEY);
      localStorage.removeItem(SUPABASE_KEY_KEY);
      supabaseClient = null;
      usingSupabase = false;
      disconnectBtn.style.display = "none";
      updateDbStatus("⚠️ Desconectado. Usando base de datos local temporal.", "#d4af37");
      vehicles = LOCAL_VEHICLES;
      goldItems = LOCAL_GOLD;
      tramiteServices = LOCAL_TRAMITES;
      exchangeRates = LOCAL_EXCHANGE_RATES;
      refreshAllGrids();
    });
  }

  // Item type switcher
  const itemTypeSelect = document.getElementById("itemType");
  const vehicleFieldsGroup = document.getElementById("vehicleFieldsGroup");
  const goldFieldsGroup = document.getElementById("goldFieldsGroup");
  const tramiteFieldsGroup = document.getElementById("tramiteFieldsGroup");
  const priceField = document.getElementById("itemPrice");
  const imgField = document.getElementById("itemImg");

  function updateAdminFieldVisibility() {
    const type = itemTypeSelect?.value || "vehiculo";
    if (vehicleFieldsGroup) vehicleFieldsGroup.style.display = type === "vehiculo" ? "block" : "none";
    if (goldFieldsGroup) goldFieldsGroup.style.display = type === "oro" ? "block" : "none";
    if (tramiteFieldsGroup) tramiteFieldsGroup.style.display = type === "tramite" ? "block" : "none";
    if (priceField) priceField.required = type !== "tramite";
    if (imgField) imgField.required = type !== "tramite";
  }

  if (itemTypeSelect) {
    itemTypeSelect.addEventListener("change", updateAdminFieldVisibility);
    updateAdminFieldVisibility();
  }

  // Add product form
  const addProductForm = document.getElementById("addProductForm");
  const actionStatus = document.getElementById("actionStatus");

  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = itemTypeSelect?.value;
      const price = document.getElementById("itemPrice")?.value.trim();
      const image = document.getElementById("itemImg")?.value.trim();

      if (type === "oro") {
        const goldName = document.getElementById("goldName")?.value.trim();
        const karats = document.getElementById("goldKarats")?.value.trim();
        const weight = document.getElementById("goldWeight")?.value.trim();

        const newItem = { name: goldName, karats, weight, price, image };

        if (usingSupabase && supabaseClient) {
          const { error } = await supabaseClient.from("gold_items").insert([newItem]);
          if (error) {
            if (actionStatus) { actionStatus.textContent = "❌ Error al guardar: " + error.message; actionStatus.style.color = "#ef4444"; }
            return;
          }
          goldItems = (await supabaseClient.from("gold_items").select("*")).data || [];
        } else {
          newItem.id = Date.now();
          goldItems.push(newItem);
        }

        const grid = document.getElementById("oroGrid");
        if (grid) { grid.innerHTML = ""; renderOro(); }
        if (actionStatus) { actionStatus.textContent = "✅ Pieza de oro guardada correctamente."; actionStatus.style.color = "#22c55e"; }

      } else if (type === "tramite") {
        const name = document.getElementById("tramiteName")?.value.trim();
        const description = document.getElementById("tramiteDesc")?.value.trim();
        const icon = document.getElementById("tramiteIcon")?.value.trim() || "📄";
        const btn_label = document.getElementById("tramiteBtnLabel")?.value.trim();
        const wa_message = document.getElementById("tramiteWaMsg")?.value.trim();

        const newTramite = { name, description, icon, btn_label, wa_message };

        if (usingSupabase && supabaseClient) {
          const { error } = await supabaseClient.from("tramite_services").insert([newTramite]);
          if (error) {
            if (actionStatus) { actionStatus.textContent = "❌ Error al guardar: " + error.message; actionStatus.style.color = "#ef4444"; }
            return;
          }
          tramiteServices = (await supabaseClient.from("tramite_services").select("*")).data || [];
        } else {
          newTramite.id = Date.now();
          tramiteServices.push(newTramite);
        }

        const grid = document.getElementById("tramitesGrid");
        if (grid) { grid.innerHTML = ""; renderTramites(); }
        if (actionStatus) { actionStatus.textContent = "✅ Servicio de trámite guardado correctamente."; actionStatus.style.color = "#22c55e"; }

      } else {
        const name = document.getElementById("vehName")?.value.trim();
        const category = document.getElementById("vehCategory")?.value;
        const vehType = document.getElementById("vehType")?.value;
        const purpose = document.getElementById("vehPurpose")?.value;
        const year = parseInt(document.getElementById("vehYear")?.value) || 2026;
        const mileage = document.getElementById("vehMileage")?.value.trim();

        const newVehicle = { name, category, type: vehType, purpose, year, mileage, price, image };

        if (usingSupabase && supabaseClient) {
          const { error } = await supabaseClient.from("vehicles").insert([newVehicle]);
          if (error) {
            if (actionStatus) { actionStatus.textContent = "❌ Error al guardar: " + error.message; actionStatus.style.color = "#ef4444"; }
            return;
          }
          vehicles = (await supabaseClient.from("vehicles").select("*")).data || [];
        } else {
          newVehicle.id = Date.now();
          vehicles.push(newVehicle);
        }

        refreshAllGrids();
        if (actionStatus) { actionStatus.textContent = "✅ Vehículo guardado correctamente."; actionStatus.style.color = "#22c55e"; }
      }

      addProductForm.reset();
      setTimeout(() => { if (actionStatus) actionStatus.textContent = ""; }, 4000);
    });
  }
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

  // 5. Init admin panel
  initAdmin();

  // 6. Init mobile menu
  initMobileMenu();

  // 7. Init contact form
  initContactForm();

  // 8. Scroll effects (rAF-optimized)
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
