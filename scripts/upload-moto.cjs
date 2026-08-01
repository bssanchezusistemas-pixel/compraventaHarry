const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => { 
      const [k, v] = line.split('='); 
      if(k && v) acc[k] = v.trim(); 
      return acc; 
    }, {}); 
    
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Configuración específica de la 23ª Yamaha Crypton Fi 2027
    const productData = {
      name: "Yamaha Crypton Fi",
      type: "vehiculo",
      status: "publicado",
      price: "$10.500.000",
      description: "🎨Verde Mate, Gris Verde, Gris Azul, Gris Rojo\n🧾Se Entrega Con:\n• Placa i\n• Soat Pago\n• Tarjeta De Propiedad",
      created_at: new Date(Date.now() - 1000 * 60 * 690).toISOString(), // 11.5 hours in the past
      metadata: { 
        category: "moto",
        year: 2027,
        mileage: "0 Kilómetros",
        purpose: "venta"
      }
    };

    console.log(`Creando producto: ${productData.name}...`);

    // 1. Crear el producto
    const { data: product, error: pErr } = await supabase.from('cv_products').insert(productData).select().single();
    
    if (pErr) {
      console.error(`[X] Error creando producto:`, pErr);
      return;
    }
    
    console.log(`[-] Producto creado exitosamente con ID: ${product.id}`);

    // 2. Subir imagen
    const folderPath = path.join(__dirname, '..', 'producto catologo', 'motos');
    const file = "23-yamaha-crypton-fi-2027-0km.jpg";
    const imagePath = path.join(folderPath, file);
    
    if (!fs.existsSync(imagePath)) {
        console.error(`[X] La imagen no existe en la ruta: ${imagePath}`);
        return;
    }
    
    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(file).replace('.', '');
    const storagePath = `${product.id}/${Date.now()}-0.${ext}`;

    console.log(`[-] Subiendo imagen a Supabase Storage...`);
    const { error: sErr } = await supabase.storage.from('cv-product-images')
      .upload(storagePath, fileBuffer, { contentType: `image/${ext}` });
    
    if (sErr) {
      console.error(`[X] Error subiendo foto:`, sErr);
      return;
    }

    // 3. Crear registro de imagen
    const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
    
    const { error: iErr } = await supabase.from('cv_product_images').insert({
      product_id: product.id,
      url: urlData.publicUrl,
      storage_path: storagePath,
      sort_order: 0
    });

    if (iErr) {
      console.error(`[X] Error creando registro de imagen:`, iErr);
    } else {
      console.log(`[OK] ¡MOTO SUBIDA EXITOSAMENTE! URL de la imagen: ${urlData.publicUrl}`);
    }
    
  } catch (err) {
    console.error('Error fatal:', err);
  }
}
main();
