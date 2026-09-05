const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function run() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, l) => {
      const [k, v] = l.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- 1. RESTAURANDO LOS 37 PRODUCTOS ---');
    const productsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'products_backup.json'), 'utf8').replace(/^\uFEFF/, ''));

    const rowsToInsert = productsRaw.map(p => {
      let meta = {};
      try {
        if (p.metadata) meta = JSON.parse(p.metadata);
      } catch (e) {
        meta = {};
      }

      let priceNum = null;
      if (p.price_numeric && !isNaN(parseFloat(p.price_numeric))) {
        priceNum = parseFloat(p.price_numeric);
      }

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status || 'publicado',
        price: p.price || '',
        price_numeric: priceNum,
        description: p.description || null,
        metadata: meta,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
      };
    });

    const { error: pErr } = await supabase.from('cv_products').upsert(rowsToInsert);
    if (pErr) {
      console.error('[X] Error insertando productos:', pErr);
      return;
    }
    console.log(`[OK] ¡Insertados ${rowsToInsert.length} productos exitosamente!`);

    console.log('\n--- 2. SUBIENDO FOTOS DE ACCESORIOS ---');
    const accFolder = path.join(__dirname, '..', 'producto catologo');
    const accFiles = fs.readdirSync(accFolder).filter(f => f.match(/\.(jpeg|jpg|png|webp)$/i));

    // Agrupar por nombre base
    const accGroups = {};
    for (const file of accFiles) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const match = baseName.match(/^(.*)_(\d+)$/);
      let productName = baseName;
      let sortOrder = 0;
      if (match) {
        productName = match[1].trim();
        sortOrder = parseInt(match[2], 10) - 1;
      }
      if (!accGroups[productName]) accGroups[productName] = [];
      accGroups[productName].push({ file, sortOrder });
    }

    for (const [prodName, files] of Object.entries(accGroups)) {
      // Buscar producto correspondiente
      const matchProd = rowsToInsert.find(p => p.name.toLowerCase().trim() === prodName.toLowerCase().trim());
      if (!matchProd) {
        console.log(`  [i] No hay producto en BD para archivo: ${prodName}`);
        continue;
      }

      for (const item of files) {
        const filePath = path.join(accFolder, item.file);
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(item.file).replace('.', '');
        const storagePath = `${matchProd.id}/${Date.now()}-${item.sortOrder}.${ext}`;

        const { error: sErr } = await supabase.storage.from('cv-product-images')
          .upload(storagePath, buffer, { contentType: `image/${ext}`, upsert: true });

        if (sErr) {
          console.error(`  [X] Error subiendo ${item.file}:`, sErr.message);
          continue;
        }

        const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
        await supabase.from('cv_product_images').insert({
          product_id: matchProd.id,
          url: urlData.publicUrl,
          storage_path: storagePath,
          sort_order: item.sortOrder
        });
        console.log(`  [OK] Accesorio vinculado: ${prodName} -> ${item.file}`);
      }
    }

    console.log('\n--- 3. SUBIENDO FOTOS DE MOTOS ---');
    const motoFolder = path.join(__dirname, '..', 'producto catologo', 'motos');
    const motoFiles = fs.readdirSync(motoFolder).filter(f => f.match(/\.(jpeg|jpg|png|webp)$/i)).sort();

    // Obtener motos de la BD ordenadas
    const motoProds = rowsToInsert.filter(p => p.type === 'vehiculo' && (p.name.toLowerCase().includes('nmax') || p.name.toLowerCase().includes('crypton')));
    
    // Mapeo inteligente de fotos a motos
    for (let i = 0; i < motoProds.length; i++) {
      const prod = motoProds[i];
      const isNmax = prod.name.toLowerCase().includes('nmax');
      
      // Buscar fotos correspondientes
      let matchingPhotos = [];
      if (isNmax) {
        matchingPhotos = motoFiles.filter(f => f.includes('nmax') && !f.includes('extra'));
      } else {
        matchingPhotos = motoFiles.filter(f => f.includes('crypton'));
      }

      const photoToUse = matchingPhotos[i % matchingPhotos.length];
      if (!photoToUse) continue;

      const filePath = path.join(motoFolder, photoToUse);
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(photoToUse).replace('.', '');
      const storagePath = `${prod.id}/${Date.now()}-0.${ext}`;

      const { error: sErr } = await supabase.storage.from('cv-product-images')
        .upload(storagePath, buffer, { contentType: `image/${ext}`, upsert: true });

      if (!sErr) {
        const { data: urlData } = supabase.storage.from('cv-product-images').getPublicUrl(storagePath);
        await supabase.from('cv_product_images').insert({
          product_id: prod.id,
          url: urlData.publicUrl,
          storage_path: storagePath,
          sort_order: 0
        });
        console.log(`  [OK] Moto vinculada: ${prod.name} (${prod.price}) -> ${photoToUse}`);
      }
    }

    console.log('\n--- 4. CONFIGURANDO USUARIO ADMINISTRADOR ---');
    const adminEmail = 'admin@compraventaharry.com';
    const adminPass = 'HarryAdmin2026*';

    // Verificar si ya existe en auth
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existing = (userList && userList.users) ? userList.users.find(u => u.email === adminEmail) : null;

    if (!existing) {
      const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPass,
        email_confirm: true
      });
      if (uErr) {
        console.error('[X] Error creando usuario admin en auth:', uErr.message);
      } else {
        console.log(`[OK] Usuario admin creado en Supabase Auth: ${adminEmail} (Contraseña: ${adminPass})`);
      }
    } else {
      console.log(`[i] El usuario ${adminEmail} ya existe en Supabase Auth.`);
    }

    console.log('\n=== ¡RESTAURACIÓN COMPLETADA CON ÉXITO TOTAL! ===');
  } catch (err) {
    console.error('Error general:', err);
  }
}

run();
