# GitHub Pages Configuration for StudyingFlash

## Configuración Actual:
- **Dominio personalizado**: www.medicineflash.com (configurado en CNAME)
- **Archivo principal**: index.html (root del repositorio)
- **Build source**: Desde rama main
- **Jekyll**: Deshabilitado (.nojekyll presente)

## Estructura para GitHub Pages:
```
MEDELITE/
├── index.html          (✅ Archivo principal)
├── main.css           (✅ Estilos principales)
├── manifest.webmanifest (✅ PWA manifest)
├── CNAME              (✅ Dominio personalizado)
├── .nojekyll          (✅ Deshabilitar Jekyll)
├── js/                (✅ Scripts JavaScript)
├── css/               (✅ Estilos CSS)
├── icons/             (✅ Iconos PWA)
└── backend/           (❌ No se sirve en GitHub Pages)
```

## URLs de Acceso:
- **GitHub Pages**: https://medflash1.github.io/MEDELITE/
- **Dominio personalizado**: https://www.medicineflash.com/

## Diagnóstico de Problemas Comunes:

### 1. Verificar configuración en GitHub:
- Ir a Settings > Pages en el repositorio
- Source debe estar en "Deploy from a branch"
- Branch debe ser "main" y folder "/ (root)"

### 2. DNS del dominio personalizado:
- CNAME record debe apuntar a: medflash1.github.io
- Verificar propagación DNS

### 3. Archivos requeridos:
- ✅ index.html existe en root
- ✅ CNAME configurado
- ✅ .nojekyll añadido
- ✅ Rutas relativas en HTML

### 4. Tiempo de propagación:
- Los cambios pueden tardar hasta 10 minutos
- El dominio personalizado puede tardar hasta 24 horas

## Comandos de verificación:
```bash
# Verificar que el sitio se sirve localmente
python3 -m http.server 8080

# Verificar configuración DNS
nslookup www.medicineflash.com

# Verificar headers de GitHub Pages
curl -I https://medflash1.github.io/MEDELITE/
```

## Próximos pasos:
1. Hacer commit y push de .nojekyll
2. Verificar configuración en GitHub Settings > Pages
3. Esperar propagación (5-10 minutos)
4. Probar acceso via GitHub Pages URL
5. Verificar dominio personalizado
