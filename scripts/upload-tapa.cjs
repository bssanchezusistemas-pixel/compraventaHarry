const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { 
      const [k, v] = line.split('='); 
      if(k && v) acc[k] = v.trim(); 
      return acc; 
    }, {}); 
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // 1. Create product
    const { data: product, error: pErr } = await supabase.from('cv_products').insert({
      name: 'Tapa guantera Nmax v3',
      type: 'servicio', // This maps to "repuestos" based on inferCategory
      status: 'publicado',
      price: '',
      price_numeric: null,
      description: 'Producto subido automáticamente desde la carpeta local.',
      metadata: { category: 'repuestos', brand: 'Yamaha Nmax v3' }
    }).select().single();
    
    if (pErr) throw new Error(`Error creating product: ${JSON.stringify(pErr)}`);
    console.log('Product created:', product.id);

    // 2. Upload image
    const imagePath = `C:\\Users\\User\\Desktop\\compraventaHarry\\producto catologo\\tapa guantera Nmax v3.jpeg`;
    const fileBuffer = fs.readFileSync(imagePath);
    const storagePath = `${product.id}/${Date.now()}-0.jpeg`;

    const { error: sErr } = await supabase.storage.from('cv-product-images')
      .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: false });
    
    if (sErr) throw new Error(`Error uploading image: ${JSON.stringify(sErr)}`);
    console.log('Image uploaded:', storagePath);

    // 3. Get URL and create image record
    const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
    
    const { error: iErr } = await supabase.from('cv_product_images').insert({
      product_id: product.id,
      url: urlData.publicUrl,
      storage_path: storagePath,
      sort_order: 0
    });

    if (iErr) throw new Error(`Error creating image record: ${JSON.stringify(iErr)}`);
    console.log('Upload complete! URL:', urlData.publicUrl);
  } catch (err) {
    console.error(err);
  }
}
main();
