import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardStats, Product, ProductImage, ProductStatus, ProductType } from "./types";

const BUCKET = "product-images";

export async function fetchAllProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    product_images: (p.product_images || []).sort(
      (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
    ),
  }));
}

export async function fetchPublishedProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "publicado")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export function computeStats(products: Product[]): DashboardStats {
  return {
    totalProducts: products.length,
    totalVehicles: products.filter((p) => p.type === "vehiculo").length,
    totalGold: products.filter((p) => p.type === "oro").length,
    totalServices: products.filter((p) => p.type === "tramite" || p.type === "servicio").length,
    published: products.filter((p) => p.status === "publicado").length,
    sold: products.filter((p) => p.status === "vendido").length,
  };
}

export async function uploadProductImages(
  supabase: SupabaseClient,
  productId: string,
  files: File[]
): Promise<ProductImage[]> {
  const uploaded: ProductImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `${productId}/${Date.now()}-${i}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: "image/webp", upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        url: urlData.publicUrl,
        storage_path: path,
        sort_order: i,
      })
      .select()
      .single();

    if (error) throw error;
    uploaded.push(data);
  }

  return uploaded;
}

export async function deleteProductWithImages(supabase: SupabaseClient, product: Product) {
  const paths = (product.product_images || [])
    .map((img) => img.storage_path)
    .filter(Boolean) as string[];

  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) throw error;
}

export async function saveProduct(
  supabase: SupabaseClient,
  payload: {
    id?: string;
    name: string;
    type: ProductType;
    status: ProductStatus;
    price: string;
    description?: string;
    metadata?: Record<string, unknown>;
  },
  imageFiles: File[]
) {
  const row = {
    name: payload.name,
    type: payload.type,
    status: payload.status,
    price: payload.price,
    price_numeric: parsePrice(payload.price),
    description: payload.description || null,
    metadata: payload.metadata || {},
  };

  let productId = payload.id;

  if (productId) {
    const { error } = await supabase.from("products").update(row).eq("id", productId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("products").insert(row).select().single();
    if (error) throw error;
    productId = data.id;
  }

  if (imageFiles.length > 0 && productId) {
    await uploadProductImages(supabase, productId, imageFiles);
  }

  return productId;
}

function parsePrice(price: string): number | null {
  const n = parseFloat(price.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function getPrimaryImage(product: Product): string | null {
  const sorted = [...(product.product_images || [])].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.url || null;
}
