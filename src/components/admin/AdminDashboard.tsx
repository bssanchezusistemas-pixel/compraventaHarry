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
import type { DashboardStats, Product, ProductStatus, ProductType } from "@/lib/types";
import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/types";

type Toast = { id: string; message: string; type: "success" | "error" };

const emptyForm = {
  id: "" as string | undefined,
  name: "",
  type: "vehiculo" as ProductType,
  status: "borrador" as ProductStatus,
  price: "",
  description: "",
};

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
    setForm({
      id: product.id,
      name: product.name,
      type: product.type,
      status: product.status,
      price: product.price || "",
      description: product.description || "",
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
          type: form.type,
          status: form.status,
          price: form.price,
          description: form.description,
          metadata: {},
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

  const publishProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "publicado" })
        .eq("id", product.id);
      if (error) throw error;
      toast("Producto publicado");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al publicar", "error");
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
                    <th>Estado</th>
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
                      <td>{TYPE_LABELS[p.type]}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${p.status}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="admin-hide-mobile">{p.price || "—"}</td>
                      <td className="admin-hide-mobile">{formatDate(p.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <button type="button" className="admin-btn" onClick={() => openEdit(p)}>Editar</button>
                          {p.status !== "publicado" && (
                            <button type="button" className="admin-btn" onClick={() => publishProduct(p)}>Publicar</button>
                          )}
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
                <label htmlFor="type">Tipo</label>
                <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="status">Estado</label>
                <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}>
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
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
