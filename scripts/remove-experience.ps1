# Script para eliminar la sección EXPERIENCIA del archivo page.tsx (Next.js)
# Solo elimina de la versión Next.js - NO toca el panel admin ni la versión legacy

$ErrorActionPreference = "Stop"
$file = "src\app\page.tsx"

if (-not (Test-Path $file)) {
    Write-Host "ERROR: No se encuentra el archivo $file" -ForegroundColor Red
    exit 1
}

$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "=== ANTES ===" -ForegroundColor Yellow
$count1 = ([regex]::Matches($content, "experiencia")).Count
Write-Host "Ocurrencias de 'experiencia' antes: $count1"

# 1. Eliminar enlace del navbar
$content = [regex]::Replace($content, '\s*<a href="#experiencia">Experiencia</a>\r?\n', "")

# 2. Eliminar bloque completo de la sección EXPERIENCIA
# Patron: desde {/* + cualquier cosa que contenga EXPERIENCIA hasta </section>
# Usamos (?s) para que . incluya saltos de linea
$pattern = '(?s)\s*\{/?\*[\s\S]*?EXPERIENCIA[\s\S]*?</section>'
$content = [regex]::Replace($content, $pattern, "")

# 3. Eliminar enlace del footer (Informacion -> Experiencia)
$content = [regex]::Replace($content, '\s*<li>\s*<a href="#experiencia">Experiencia</a>\s*</li>', "")

Write-Host "`n=== DESPUES ===" -ForegroundColor Green
$count2 = ([regex]::Matches($content, "experiencia")).Count
Write-Host "Ocurrencias de 'experiencia' despues: $count2"

if ($count1 -eq $count2) {
    Write-Host "`nADVERTENCIA: El numero de ocurrencias no cambio. Revisar el patron." -ForegroundColor Yellow
}

Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
Write-Host "`nArchivo guardado correctamente: $file" -ForegroundColor Green
