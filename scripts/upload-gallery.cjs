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
    
    console.log('Buscando Yamaha NMAX 2027...');
    
    // 1. Buscar la moto
    const { data: product, error: findErr } = await supabase
      .from('cv_products')
      .select('id')
      .eq('name', 'Yamaha NMAX 2027')
      .single();
      
    if (findErr || !product) {
      console.error('[X] No se encontró la Yamaha NMAX 2027:', findErr);
      return;
    }
    
    console.log(`[-] Moto encontrada con ID: ${product.id}`);

    // 2. Subir las 5 imágenes extra
    const imagesToUpload = [
      "nmax-2027-extra-1.jpg",
      "nmax-2027-extra-2.jpg",
      "nmax-2027-extra-3.jpg",
      "nmax-2027-extra-4.jpg",
      "nmax-2027-extra-5.jpg"
    ];

    const folderPath = path.join(__dirname, '..', 'producto catologo', 'motos');

    // Empezamos en sort_order = 1 (porque 0 es el collage que ya subimos)
    let currentSortOrder = 1;

    for (const file of imagesToUpload) {
      const imagePath = path.join(folderPath, file);
      
      if (!fs.existsSync(imagePath)) {
          console.error(`[X] La imagen no existe en la ruta: ${imagePath}`);
          continue;
      }
      
      const fileBuffer = fs.readFileSync(imagePath);
      const ext = path.extname(file).replace('.', '');
      // Añadimos un pequeño identificador para que no haya colisiones de tiempo
      const storagePath = `${product.id}/${Date.now()}-${currentSortOrder}.${ext}`;

      console.log(`[-] Subiendo ${file} a Supabase Storage...`);
      const { error: sErr } = await supabase.storage.from('cv-product-images')
        .upload(storagePath, fileBuffer, { contentType: `image/${ext}` });
      
      if (sErr) {
        console.error(`[X] Error subiendo foto ${file}:`, sErr);
        continue;
      }

      // Crear registro de imagen
      const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
      
      const { error: iErr } = await supabase.from('cv_product_images').insert({
        product_id: product.id,
        url: urlData.publicUrl,
        storage_path: storagePath,
        sort_order: currentSortOrder
      });

      if (iErr) {
        console.error(`[X] Error creando registro de imagen para ${file}:`, iErr);
      } else {
        console.log(`[OK] Imagen ${file} subida. URL: ${urlData.publicUrl}`);
      }

      currentSortOrder++;
      // Esperar un poco para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('[OK] ¡Galería actualizada exitosamente!');
    
  } catch (err) {
    console.error('Error fatal:', err);
  }
}
main();
