const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const https = require('https');

// 1. Cargar variables de entorno
const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'cv-product-images';

// 2. Definicion de los 8 productos solicitados
const ORO_PRODUCTS = [
  {
    num: 1,
    name: 'Cadena Oro\u{1F1EE}\u{1F1F9} Veneciana',
    price: '1’800.000',
    price_numeric: 1800000,
    weight: '4,34 Gr',
    size: '55 Cm',
    origin: 'Italia',
    description: 'Cadena Oro\u{1F1EE}\u{1F1F9} Veneciana\n💲4,34 Gr📏55 Cm',
    imageFile: '1.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '4,34 Gr',
      length: '55 Cm',
      origin: 'Italia',
      category: 'oro'
    }
  },
  {
    num: 2,
    name: 'Anillo Oro\u{1F1E8}\u{1F1F4} Guadalupe',
    price: '2’200.000',
    price_numeric: 2200000,
    weight: '5,11 Gr',
    size: 'T 8-9',
    origin: 'Colombia',
    description: 'Anillo Oro\u{1F1E8}\u{1F1F4} Guadalupe\n💲5,11 Gr📏T 8-9',
    imageFile: '2.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '5,11 Gr',
      size: 'T 8-9',
      origin: 'Colombia',
      category: 'oro'
    }
  },
  {
    num: 3,
    name: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Guadalupe',
    price: '1’100.000',
    price_numeric: 1100000,
    weight: '2,90 Gr',
    size: '6 mm',
    origin: 'Colombia',
    description: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Guadalupe\n💲2,90 Gr📏6 mm',
    imageFile: '3.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '2,90 Gr',
      size: '6 mm',
      origin: 'Colombia',
      category: 'oro'
    }
  },
  {
    num: 4,
    name: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Van Cleef',
    price: '2’200.000',
    price_numeric: 2200000,
    weight: '5,24 Gr',
    size: '19,5 Cm',
    origin: 'Colombia',
    description: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Van Cleef\n💲5,24 Gr📏19,5 Cm',
    imageFile: '4.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '5,24 Gr',
      length: '19,5 Cm',
      origin: 'Colombia',
      category: 'oro'
    }
  },
  {
    num: 5,
    name: 'Pulsera Oro\u{1F1EE}\u{1F1F9} Sedusa',
    price: '2’450.000',
    price_numeric: 2450000,
    weight: '5,87 Gr',
    size: '18 Cm',
    origin: 'Italia',
    description: 'Pulsera Oro\u{1F1EE}\u{1F1F9} Sedusa\n💲5,87 Gr📏18 Cm',
    imageFile: '5.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '5,87 Gr',
      length: '18 Cm',
      origin: 'Italia',
      category: 'oro'
    }
  },
  {
    num: 6,
    name: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Aro Cartier',
    price: '4’200.000',
    price_numeric: 4200000,
    weight: '10 Gr',
    size: '20 Cm',
    origin: 'Colombia',
    description: 'Pulsera Oro\u{1F1E8}\u{1F1F4} Aro Cartier\n💲10 Gr📏20 Cm',
    imageFile: '6.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '10 Gr',
      length: '20 Cm',
      origin: 'Colombia',
      category: 'oro'
    }
  },
  {
    num: 7,
    name: 'Tobillera Oro\u{1F1E8}\u{1F1F4} Rustico',
    price: '3’200.000',
    price_numeric: 3200000,
    weight: '7,6 Gr',
    size: '28 Cm',
    origin: 'Colombia',
    description: 'Tobillera Oro\u{1F1E8}\u{1F1F4} Rustico\n💲7,6 Gr📏28 Cm',
    imageFile: '7.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '7,6 Gr',
      length: '28 Cm',
      origin: 'Colombia',
      category: 'oro'
    }
  },
  {
    num: 8,
    name: 'Pulsera Oro \u{1F1E8}\u{1F1F4} Gucci',
    price: '1’580.000',
    price_numeric: 1580000,
    weight: '3,77 Gr',
    size: '18,5 Cm',
    origin: 'Colombia',
    description: 'Pulsera Oro \u{1F1E8}\u{1F1F4} Gucci\n💲3,77 Gr📏18,5 Cm',
    imageFile: '8.jpeg',
    metadata: {
      karats: 'Oro 18k',
      weight: '3,77 Gr',
      length: '18,5 Cm',
      origin: 'Colombia',
      category: 'oro'
    }
  }
];

async function verifyHttp(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function main() {
  try {
    console.log('=== VERIFICANDO PRODUCTOS DE ORO EXISTENTES ===');
    const { data: existingGold, error: checkErr } = await supabase
      .from('cv_products')
      .select('id, name')
      .eq('type', 'oro');

    if (checkErr) {
      console.error('Error al consultar productos existentes:', checkErr);
      process.exit(1);
    }

    if (existingGold && existingGold.length > 0) {
      console.log('Eliminando ' + existingGold.length + ' productos de oro anteriores...');
      for (const prod of existingGold) {
        const { data: imgs } = await supabase
          .from('cv_product_images')
          .select('storage_path')
          .eq('product_id', prod.id);

        const paths = (imgs || []).map(img => img.storage_path).filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from(BUCKET).remove(paths);
        }
        await supabase.from('cv_products').delete().eq('id', prod.id);
      }
      console.log('Limpieza completada.');
    } else {
      console.log('No hay productos de oro previos.');
    }

    const oroFolder = path.join(__dirname, '..', 'producto catologo', 'oro');
    const now = Date.now();
    const results = [];

    console.log('\n=== SUBIENDO Y CREANDO LOS 8 PRODUCTOS DE ORO ===');
    for (let i = 0; i < ORO_PRODUCTS.length; i++) {
      const item = ORO_PRODUCTS[i];
      const imagePath = path.join(oroFolder, item.imageFile);

      if (!fs.existsSync(imagePath)) {
        console.error('[X] Foto no encontrada: ' + imagePath);
        continue;
      }

      console.log('\nProcesando Item ' + item.num + ': ' + item.name);

      const originalBuffer = fs.readFileSync(imagePath);
      const optimizedBuffer = await sharp(originalBuffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      console.log('  - Imagen ' + item.imageFile + ' optimizada: ' + (originalBuffer.length / 1024).toFixed(1) + 'KB -> ' + (optimizedBuffer.length / 1024).toFixed(1) + 'KB');

      const itemTimestamp = new Date(now + (ORO_PRODUCTS.length - i) * 1000).toISOString();

      const { data: product, error: prodErr } = await supabase
        .from('cv_products')
        .insert({
          name: item.name,
          type: 'oro',
          status: 'publicado',
          price: item.price,
          price_numeric: item.price_numeric,
          description: item.description,
          metadata: item.metadata,
          created_at: itemTimestamp,
          updated_at: itemTimestamp
        })
        .select()
        .single();

      if (prodErr) {
        console.error('  [X] Error creando producto ' + item.name + ':', prodErr);
        continue;
      }
      console.log('  [OK] Producto registrado con ID: ' + product.id);

      const storagePath = 'oro/' + product.id + '/' + Date.now() + '-0.webp';
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, optimizedBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadErr) {
        console.error('  [X] Error subiendo imagen a storage:', uploadErr);
        continue;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;
      console.log('  [OK] Imagen subida a Storage: ' + storagePath);

      const { data: imgRecord, error: imgErr } = await supabase
        .from('cv_product_images')
        .insert({
          product_id: product.id,
          url: publicUrl,
          storage_path: storagePath,
          sort_order: 0,
          created_at: itemTimestamp
        })
        .select()
        .single();

      if (imgErr) {
        console.error('  [X] Error vinculando imagen:', imgErr);
        continue;
      }
      console.log('  [OK] Registro de imagen creado (id: ' + imgRecord.id + ')');

      const httpCheck = await verifyHttp(publicUrl);
      console.log('  [OK] URL publica verificada: HTTP ' + httpCheck.statusCode + ' (' + httpCheck.contentType + ', ' + httpCheck.length + ' bytes)');

      results.push({
        num: item.num,
        id: product.id,
        name: product.name,
        price: product.price,
        weight: item.weight,
        size: item.size,
        publicUrl,
        httpStatus: httpCheck.statusCode
      });
    }

    console.log('\n=== RESUMEN FINAL DE PRODUCTOS PUBLICADOS ===');
    console.table(results.map(r => ({
      '#': r.num,
      'Nombre': r.name,
      'Precio': r.price,
      'Peso': r.weight,
      'Medida': r.size,
      'HTTP Foto': r.httpStatus,
      'ID': r.id
    })));

    console.log('\n=== VERIFICACION QUERY FRONTEND (cv_products con images) ===');
    const { data: frontendQuery, error: fErr } = await supabase
      .from('cv_products')
      .select('*, product_images:cv_product_images(*)')
      .eq('type', 'oro')
      .eq('status', 'publicado')
      .order('created_at', { ascending: false });

    if (fErr) {
      console.error('Error en consulta de frontend:', fErr);
    } else {
      console.log('Encontrados ' + frontendQuery.length + ' productos de oro listos para el catalogo.');
      frontendQuery.forEach((p, idx) => {
        const img = p.product_images && p.product_images[0] ? p.product_images[0].url : 'SIN FOTO';
        console.log('  ' + (idx + 1) + '. [' + p.name + '] - ' + p.price + ' | Foto: ' + img);
      });
    }

  } catch (err) {
    console.error('Error general en ejecucion:', err);
  }
}

main();
