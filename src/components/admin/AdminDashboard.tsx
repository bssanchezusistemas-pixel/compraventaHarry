"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  computeStats,
  deleteProductWithImages,
  fetchAllProducts,
  getPrimaryImage,
  saveProduct,
} from "@/lib/products";
import {
  createPreviewImage,
  MAX_IMAGES,
  processImageForUpload,
  revokePreviewUrl,
  type PreviewImage,
} from "@/lib/image-process";
import type { DashboardStats, Product, ProductType } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

type Toast = { id: string; message: string; type: "success" | "error" };
type VehicleType = "moto" | "carro";
type ProductCategory = "moto" | "carro" | "oro" | "repuestos" | "accesorios" | "alquiler";

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "moto", label: "Moto" },
  { value: "carro", label: "Carro" },
  { value: "oro", label: "Oro" },
  { value: "repuestos", label: "Repuestos" },
  { value: "accesorios", label: "Accesorios" },
  { value: "alquiler", label: "Alquiler (moto o carro)" },
];

const CC_OPTIONS = ["110", "125", "150", "200", "250", "300", "650", "other"] as const;
const TRANSMISSION_OPTIONS = ["Manual", "Automática"] as const;
const FUEL_OPTIONS = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"] as const;

const emptyForm = {
  id: "" as string | undefined,
  name: "",
  category: "moto" as ProductCategory,
  vehicleType: "moto" as VehicleType,
  price: "",
  description: "",
  brand: "",
  modelYear: "",
  kilometers: "",
  paperUntil: "",
  cc: "",
  transmission: "",
  fuel: "",
};

function isVehicleCategory(category: ProductCategory): boolean {
  return category === "moto" || category === "carro" || category === "alquiler";
}

function resolveVehicleType(form: typeof emptyForm): VehicleType {
  if (form.category === "carro") return "carro";
  if (form.category === "moto") return "moto";
  return form.vehicleType;
}

function resolveProductType(category: ProductCategory): ProductType {
  if (category === "oro") return "oro";
  if (category === "repuestos" || category === "accesorios") return "servicio";
  return "vehiculo";
}

function buildMetadata(form: typeof emptyForm): Record<string, unknown> {
  if (form.category === "oro") {
    return {};
  }

  if (form.category === "repuestos" || form.category === "accesorios") {
    const metadata: Record<string, unknown> = { category: form.category };
    if (form.brand.trim()) metadata.brand = form.brand.trim();
    return metadata;
  }

  const vehicleType = resolveVehicleType(form);
  const metadata: Record<string, unknown> = {
    vehicle_type: vehicleType,
    purpose: form.category === "alquiler" ? "alquiler" : "venta",
  };

  if (form.brand.trim()) metadata.brand = form.brand.trim();
  if (form.modelYear) metadata.model_year = Number(form.modelYear);
  if (form.kilometers) metadata.kilometers = Number(form.kilometers);
  if (form.paperUntil.trim()) metadata.paper_until = form.paperUntil.trim();

  if (vehicleType === "moto" && form.cc) {
    metadata.cc = form.cc;
  }

  if (vehicleType === "carro") {
    if (form.transmission) metadata.transmission = form.transmission;
    if (form.fuel) metadata.fuel = form.fuel;
  }

  return metadata;
}

function inferCategory(product: Product): ProductCategory {
  const m = product.metadata || {};

  if (product.type === "oro") return "oro";
  if (product.type === "servicio") {
    if (m.category === "accesorios") return "accesorios";
    return "repuestos";
  }
  if (product.type === "vehiculo" && m.purpose === "alquiler") return "alquiler";
  if (m.vehicle_type === "carro") return "carro";
  return "moto";
}

function productCategoryLabel(product: Product): string {
  const category = inferCategory(product);
  const option = CATEGORY_OPTIONS.find((o) => o.value === category);
  if (option) return option.label;
  return TYPE_LABELS[product.type];
}

export default function AdminDashboard() {
  const [supabase] = useState(() => createClient());
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProducts(supabase);
      setProducts(data);
      setStats(computeStats(data));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const openCreate = () => {
    setForm(emptyForm);
    previews.forEach((p) => revokePreviewUrl(p.previewUrl));
    setPreviews([]);
    setDrawerOpen(true);
  };

  const openEdit = (product: Product) => {
    const m = product.metadata || {};
    const category = inferCategory(product);
    setForm({
      id: product.id,
      name: product.name,
      category,
      vehicleType: m.vehicle_type === "carro" ? "carro" : "moto",
      price: product.price || "",
      description: product.description || "",
      brand: typeof m.brand === "string" ? m.brand : "",
      modelYear: m.model_year != null ? String(m.model_year) : "",
      kilometers: m.kilometers != null ? String(m.kilometers) : "",
      paperUntil: typeof m.paper_until === "string" ? m.paper_until : "",
      cc: typeof m.cc === "string" ? m.cc : "",
      transmission: typeof m.transmission === "string" ? m.transmission : "",
      fuel: typeof m.fuel === "string" ? m.fuel : "",
    });
    previews.forEach((p) => revokePreviewUrl(p.previewUrl));
    setPreviews([]);
    setDrawerOpen(true);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - previews.length;
    if (remaining <= 0) {
      toast(`Máximo ${MAX_IMAGES} imágenes por producto`, "error");
      return;
    }

    setProcessingImages(true);
    try {
      const selected = Array.from(files).slice(0, remaining);
      const processed: PreviewImage[] = [];

      for (let i = 0; i < selected.length; i++) {
        const webp = await processImageForUpload(selected[i]);
        processed.push(createPreviewImage(webp, previews.length + i));
      }

      setPreviews((prev) => [...prev, ...processed]);
      toast(`${processed.length} imagen(es) optimizada(s) a WebP`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al procesar imágenes", "error");
    } finally {
      setProcessingImages(false);
    }
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) revokePreviewUrl(item.previewUrl);
      return prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, sortOrder: i }));
    });
  };

  const movePreview = (id: string, dir: -1 | 1) => {
    setPreviews((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy.map((p, i) => ({ ...p, sortOrder: i }));
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("El nombre es obligatorio", "error");
      return;
    }

    setSaving(true);
    try {
      await saveProduct(
        supabase,
        {
          id: form.id,
          name: form.name.trim(),
          type: resolveProductType(form.category),
          status: "publicado",
          price: form.price,
          description: form.description,
          metadata: buildMetadata(form),
        },
        previews.map((p) => p.file)
      );
      toast(form.id ? "Producto actualizado" : "Producto creado");
      previews.forEach((p) => revokePreviewUrl(p.previewUrl));
      setPreviews([]);
      setDrawerOpen(false);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProductWithImages(supabase, deleteTarget);
      toast("Producto eliminado");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al eliminar", "error");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <header className="admin-topbar">
          <h1>Compraventa <span>Harry</span> — Admin</h1>
          <div className="admin-topbar-actions">
            <a href="/" className="admin-btn">Ver sitio</a>
            <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
              + Nuevo producto
            </button>
            <button type="button" className="admin-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        {loading ? (
          <div className="admin-stats">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-skeleton" />
            ))}
          </div>
        ) : stats ? (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total productos</div>
              <div className="admin-stat-value">{stats.totalProducts}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Vehículos</div>
              <div className="admin-stat-value">{stats.totalVehicles}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Oro</div>
              <div className="admin-stat-value">{stats.totalGold}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Servicios</div>
              <div className="admin-stat-value">{stats.totalServices}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Publicados</div>
              <div className="admin-stat-value admin-stat-value--accent">{stats.published}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Vendidos</div>
              <div className="admin-stat-value">{stats.sold}</div>
            </div>
          </div>
        ) : null}

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 style={{ fontSize: "0.9rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Inventario
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "2rem" }}>
              <div className="admin-skeleton" style={{ height: 200 }} />
            </div>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📦</div>
              <p>No hay productos aún. Crea el primero con el botón superior.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th className="admin-hide-mobile">Precio</th>
                    <th className="admin-hide-mobile">Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {getPrimaryImage(p) ? (
                          <img src={getPrimaryImage(p)!} alt="" className="admin-thumb" loading="lazy" />
                        ) : (
                          <div className="admin-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>—</div>
                        )}
                      </td>
                      <td>{p.name}</td>
                      <td>{productCategoryLabel(p)}</td>
                      <td className="admin-hide-mobile">{p.price || "—"}</td>
                      <td className="admin-hide-mobile">{formatDate(p.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <button type="button" className="admin-btn" onClick={() => openEdit(p)}>Editar</button>
                          <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteTarget(p)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <h3>¿Eliminar producto?</h3>
            <p>
              Se eliminará <strong>{deleteTarget.name}</strong> y todas sus imágenes. Esta acción no se puede deshacer.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {drawerOpen && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="admin-drawer">
            <h2 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <form onSubmit={handleSave}>
              <div className="admin-field">
                <label htmlFor="name">Nombre</label>
                <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-field">
                <label htmlFor="category">Categoría</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ProductCategory })
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.category === "alquiler" && (
                <div className="admin-field">
                  <label htmlFor="vehicleType">Vehículo en alquiler</label>
                  <select
                    id="vehicleType"
                    value={form.vehicleType}
                    onChange={(e) =>
                      setForm({ ...form, vehicleType: e.target.value as VehicleType })
                    }
                  >
                    <option value="moto">Moto</option>
                    <option value="carro">Carro</option>
                  </select>
                </div>
              )}
              {isVehicleCategory(form.category) && (
                <>
              <div className="admin-field">
                <label htmlFor="brand">Marca</label>
                <input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Yamaha, Suzuki, Toyota…"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="modelYear">Modelo (año)</label>
                <input
                  id="modelYear"
                  type="number"
                  min={1980}
                  max={2100}
                  value={form.modelYear}
                  onChange={(e) => setForm({ ...form, modelYear: e.target.value })}
                  placeholder="2022"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="kilometers">Kilómetros</label>
                <input
                  id="kilometers"
                  type="number"
                  min={0}
                  value={form.kilometers}
                  onChange={(e) => setForm({ ...form, kilometers: e.target.value })}
                  placeholder="12500"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="paperUntil">Papeles hasta</label>
                <input
                  id="paperUntil"
                  value={form.paperUntil}
                  onChange={(e) => setForm({ ...form, paperUntil: e.target.value })}
                  placeholder="Marzo 2027"
                />
              </div>
              {(form.category === "moto" || (form.category === "alquiler" && form.vehicleType === "moto")) && (
                <div className="admin-field">
                  <label htmlFor="cc">Cilindraje</label>
                  <select
                    id="cc"
                    value={form.cc}
                    onChange={(e) => setForm({ ...form, cc: e.target.value })}
                  >
                    <option value="">Seleccionar…</option>
                    {CC_OPTIONS.map((cc) => (
                      <option key={cc} value={cc}>
                        {cc === "other" ? "Otro" : cc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(form.category === "carro" || (form.category === "alquiler" && form.vehicleType === "carro")) && (
                <>
                  <div className="admin-field">
                    <label htmlFor="transmission">Transmisión</label>
                    <select
                      id="transmission"
                      value={form.transmission}
                      onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    >
                      <option value="">Seleccionar…</option>
                      {TRANSMISSION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label htmlFor="fuel">Combustible</label>
                    <select
                      id="fuel"
                      value={form.fuel}
                      onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                    >
                      <option value="">Seleccionar…</option>
                      {FUEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
                </>
              )}
              {(form.category === "repuestos" || form.category === "accesorios") && (
                <div className="admin-field">
                  <label htmlFor="brand">Marca</label>
                  <input
                    id="brand"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Marca o compatibilidad…"
                  />
                </div>
              )}
              <div className="admin-field">
                <label htmlFor="price">Precio</label>
                <input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$17.400.000" />
              </div>
              <div className="admin-field">
                <label htmlFor="description">Descripción</label>
                <textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Imágenes (máx. {MAX_IMAGES}) — WebP 1600px / 75%</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={processingImages || previews.length >= MAX_IMAGES}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {processingImages && <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Comprimiendo y convirtiendo…</p>}
                {previews.length > 0 && (
                  <div className="admin-image-grid">
                    {previews.map((p) => (
                      <div key={p.id} className="admin-image-item">
                        <img src={p.previewUrl} alt="" />
                        <span className="admin-image-order">#{p.sortOrder + 1}</span>
                        <button type="button" className="admin-image-remove" onClick={() => removePreview(p.id)} aria-label="Quitar">×</button>
                        <div style={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 2 }}>
                          <button type="button" className="admin-btn" style={{ padding: "2px 6px", fontSize: "0.6rem" }} onClick={() => movePreview(p.id, -1)}>↑</button>
                          <button type="button" className="admin-btn" style={{ padding: "2px 6px", fontSize: "0.6rem" }} onClick={() => movePreview(p.id, 1)}>↓</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="admin-btn" onClick={() => setDrawerOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <div className="admin-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
