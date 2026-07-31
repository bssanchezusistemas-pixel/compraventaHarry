const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => { 
    const [k, v] = line.split('='); 
    if(k && v) acc[k] = v.trim(); 
    return acc; 
  }, {}); 
  
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await supabase
    .from('cv_products')
    .select('id, name, cv_product_images(*)')
    .eq('name', 'Casco ICH talla L')
    .single();
    
  console.log(JSON.stringify(data, null, 2));
}
main();
