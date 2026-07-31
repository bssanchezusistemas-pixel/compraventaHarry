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
    
    // USAMOS EL SERVICE ROLE KEY para poder saltar las reglas de seguridad
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    const folderPath = path.join(__dirname, '..', 'producto catologo');
    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpeg|jpg|png|webp)$/i));
    
    console.log(`Encontrados ${files.length} productos para subir...`);

    for (const file of files) {
      console.log(`\nProcesando: ${file}`);
      const productName = path.parse(file).name;
      
      // 1. Crear el producto
      const { data: product, error: pErr } = await supabase.from('cv_products').insert({
        name: productName,
        type: 'servicio',
        status: 'publicado',
        price: '',
        price_numeric: null,
        description: 'Subido automáticamente desde la carpeta catálogo.',
        metadata: { category: 'accesorios' }
      }).select().single();
      
      if (pErr) {
        console.error(`  [X] Error creando producto "${productName}":`, pErr.message || pErr);
        continue;
      }
      
      console.log(`  [-] Producto creado: ${product.id}`);

      // 2. Subir imagen
      const imagePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(imagePath);
      const ext = path.extname(file).replace('.', '');
      const storagePath = `${product.id}/${Date.now()}-0.${ext}`;

      const { error: sErr } = await supabase.storage.from('cv-product-images')
        .upload(storagePath, fileBuffer, { contentType: `image/${ext}` });
      
      if (sErr) {
        console.error(`  [X] Error subiendo foto para "${productName}":`, sErr.message || sErr);
        continue;
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
        console.error(`  [X] Error creando registro de imagen para "${productName}":`, iErr.message || iErr);
      } else {
        console.log(`  [OK] ¡Subido exitosamente! URL: ${urlData.publicUrl}`);
      }
    }
    console.log('\n--- Proceso finalizado ---');
  } catch (err) {
    console.error('Error fatal:', err);
  }
}
main();
