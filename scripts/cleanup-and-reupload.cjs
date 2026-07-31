const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

async function main() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => { 
      const [k, v] = line.split('='); 
      if(k && v) acc[k] = v.trim(); 
      return acc; 
    }, {}); 
    
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const folderPath = path.join(__dirname, '..', 'producto catologo');
    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpeg|jpg|png|webp)$/i));
    
    console.log('=== INICIANDO LIMPIEZA ===');
    const productNames = files.map(f => path.parse(f).name);
    
    // Buscar los productos subidos recientemente
    const { data: existingProducts } = await supabase
      .from('cv_products')
      .select('id, name, product_images:cv_product_images(storage_path)')
      .in('name', productNames);

    if (existingProducts && existingProducts.length > 0) {
      console.log(`Borrando ${existingProducts.length} productos antiguos y sus fotos (sin optimizar)...`);
      for (const prod of existingProducts) {
        // Borrar fotos de storage
        const paths = (prod.product_images || []).map(img => img.storage_path).filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from('cv-product-images').remove(paths);
        }
        // Borrar producto (cascade debería borrar el registro de cv_product_images, o lo hace la BD)
        await supabase.from('cv_products').delete().eq('id', prod.id);
        console.log(`  - Borrado: ${prod.name}`);
      }
    }
    
    console.log('\n=== INICIANDO SUBIDA OPTIMIZADA ===');
    
    // Agrupar archivos por nombre de producto
    const productGroups = {};
    for (const file of files) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      
      const match = baseName.match(/^(.*)_(\d+)$/);
      let productName = baseName;
      let sortOrder = 0;

      if (match) {
        productName = match[1].trim();
        sortOrder = parseInt(match[2], 10);
      }

      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push({ file, sortOrder });
    }

    const productNamesToCreate = Object.keys(productGroups);
    console.log(`Encontrados ${productNamesToCreate.length} productos con un total de ${files.length} imágenes...`);

    for (const productName of productNamesToCreate) {
      console.log(`\nProcesando producto: ${productName}`);
      const images = productGroups[productName].sort((a, b) => a.sortOrder - b.sortOrder);
      
      // 1. Crear el producto
      const { data: product, error: pErr } = await supabase.from('cv_products').insert({
        name: productName,
        type: 'servicio',
        status: 'publicado',
        price: '',
        price_numeric: null,
        description: null,
        metadata: { category: 'accesorios' }
      }).select().single();
      
      if (pErr) {
        console.error(`  [X] Error creando producto "${productName}":`, pErr.message || pErr);
        continue;
      }
      
      console.log(`  [-] Producto creado: ${product.id}`);

      // 2. Optimizar y subir imágenes
      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const imagePath = path.join(folderPath, file);
        const originalBuffer = fs.readFileSync(imagePath);
        
        const optimizedBuffer = await sharp(originalBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        console.log(`  [-] Imagen ${i+1}/${images.length} optimizada: ${(originalBuffer.length/1024).toFixed(1)}KB -> ${(optimizedBuffer.length/1024).toFixed(1)}KB`);

        // 3. Subir imagen
        const storagePath = `${product.id}/${Date.now()}-${i}.webp`;

        const { error: sErr } = await supabase.storage.from('cv-product-images')
          .upload(storagePath, optimizedBuffer, { contentType: 'image/webp' });
        
        if (sErr) {
          console.error(`  [X] Error subiendo foto ${file}:`, sErr.message || sErr);
          continue;
        }

        // 4. Crear registro de imagen
        const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
        
        const { error: iErr } = await supabase.from('cv_product_images').insert({
          product_id: product.id,
          url: urlData.publicUrl,
          storage_path: storagePath,
          sort_order: i
        });

        if (iErr) {
          console.error(`  [X] Error creando registro de imagen para ${file}:`, iErr.message || iErr);
        } else {
          console.log(`  [OK] ¡Foto ${file} subida! URL: ${urlData.publicUrl}`);
        }
      }
    }
    console.log('\n--- Proceso de re-subida finalizado ---');
  } catch (err) {
    console.error('Error fatal:', err);
  }
}
main();
