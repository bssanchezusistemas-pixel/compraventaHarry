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
    
    const { data, error } = await supabase
      .from('cv_products')
      .update({ description: null })
      .eq('description', 'Subido automáticamente (Optimizado a WebP).');
      
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Descriptions cleared successfully.');
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}
main();
