# Compraventa Harry 2.0

Landing premium + panel administrativo profesional con **Next.js 15**, **Supabase Auth** y almacenamiento optimizado para el plan Free.

## Desarrollo local

```bash
cp .env.example .env.local
# Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

- Sitio público: http://localhost:3000/
- Admin: http://localhost:3000/admin (redirige a login si no hay sesión)

## Despliegue en Vercel

1. Importa el proyecto (directorio `compraventa-harry`).
2. Framework: **Next.js** (detectado automáticamente).
3. Variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Ejecuta la migración SQL en Supabase (ver `supabase/migrations/001_products_schema.sql`).
5. Crea un usuario admin en Supabase Auth (Dashboard → Authentication → Users).

## Estructura

| Ruta | Descripción |
|------|-------------|
| `/` | Catálogo público (legacy preservado) |
| `/admin` | Dashboard de productos |
| `/admin/login` | Autenticación Supabase |
| `/env-config.js` | Inyecta credenciales al catálogo público (sin localStorage) |

## Base de datos

Tablas principales: `products`, `product_images`  
Bucket Storage: `product-images` (WebP optimizado, máx. 5 por producto)

Las tablas legacy (`vehicles`, `gold_items`, etc.) siguen funcionando como fallback en el catálogo público hasta migrar datos.
