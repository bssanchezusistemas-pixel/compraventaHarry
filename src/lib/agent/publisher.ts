import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { ExtractedProduct } from "./types";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://crvvcnzrwbxdzgifiblc.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  return createClient(url, key);
}

function parsePrice(price: string): number | null {
  const n = parseFloat(price.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function publishProductFromAgent(
  product: ExtractedProduct,
  imagesInput: Buffer | Buffer[]
): Promise<{ productId: string; imageUrls: string[] }> {
  const supabase = getServiceSupabase();
  const imageBuffers = Array.isArray(imagesInput) ? imagesInput : [imagesInput];

  const metadata: Record<string, unknown> = {};
  if (product.type === "vehiculo") {
    metadata.vehicle_type = product.vehicle_type || (product.category === "carro" ? "carro" : "moto");
    metadata.purpose = product.purpose || "venta";
    if (product.brand) metadata.brand = product.brand;
    if (product.model_year) {
      metadata.model_year = product.model_year;
      metadata.year = product.model_year;
    }
    if (product.kilometers) {
      metadata.mileage = product.kilometers;
      metadata.kilometers = product.kilometers;
    }
    if (product.paper_until) metadata.paper_until = product.paper_until;
  } else if (product.type === "oro") {
    if (product.karats) metadata.karats = product.karats;
    if (product.weight) metadata.weight = product.weight;
  } else if (product.type === "servicio") {
    metadata.category = product.category;
    if (product.brand) metadata.brand = product.brand;
  }

  // 1. Insertar fila en cv_products
  const row = {
    name: product.name,
    type: product.type,
    status: "publicado",
    price: product.price,
    price_numeric: parsePrice(product.price),
    description: product.description || null,
    metadata,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("cv_products")
    .insert(row)
    .select()
    .single();

  if (insertError) throw insertError;
  const productId = inserted.id;
  const imageUrls: string[] = [];

  // 2. Optimizar y subir cada imagen (hasta 5 máximo)
  const imagesToProcess = imageBuffers.slice(0, 5);

  for (let i = 0; i < imagesToProcess.length; i++) {
    try {
      const optimizedBuffer = await sharp(imagesToProcess[i])
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const filename = `${Date.now()}-${i}.webp`;
      const storagePath = `${productId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("cv-product-images")
        .upload(storagePath, optimizedBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("cv-product-images")
          .getPublicUrl(storagePath);
        const url = urlData.publicUrl;
        imageUrls.push(url);

        await supabase.from("cv_product_images").insert({
          product_id: productId,
          url,
          storage_path: storagePath,
          sort_order: i,
        });
      }
    } catch (imgErr) {
      console.warn(`Failed to process image index ${i}:`, imgErr);
    }
  }

  return { productId, imageUrls };
}
