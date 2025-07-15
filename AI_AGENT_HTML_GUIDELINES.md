# 🤖 GUÍA CRÍTICA PARA AGENTES DE IA - ESTRUCTURA HTML

## ⚠️ PROBLEMA CRÍTICO IDENTIFICADO

**NUNCA** colocar elementos HTML después de `</body>` y `</html>`. Este error específico ocurrió en nuestro proyecto causando que el footer no se renderizara.

## 🚨 REGLAS OBLIGATORIAS PARA AGENTES DE IA

### 1. ESTRUCTURA HTML VÁLIDA
```html
<!DOCTYPE html>
<html>
<head>
    <!-- HEAD content -->
</head>
<body>
    <!-- TODO EL CONTENIDO VISIBLE VA AQUÍ -->
    <!-- INCLUYENDO FOOTER -->
    <footer>
        <!-- Footer content -->
    </footer>
</body>
</html>
<!-- NADA MÁS DESPUÉS DE ESTE PUNTO -->
```

### 2. ❌ ERRORES PROHIBIDOS

**NUNCA HAGAS ESTO:**
```html
</body>
</html>

<!-- ❌ FOOTER FUERA DEL HTML VÁLIDO -->
<footer class="footer">
    <!-- Esto NO se renderizará -->
</footer>
```

**NUNCA HAGAS ESTO:**
```html
</body>
</html>

</body>  <!-- ❌ DUPLICADO -->
</html>  <!-- ❌ DUPLICADO -->
```

### 3. ✅ ESTRUCTURA CORRECTA

**SIEMPRE HAGAS ESTO:**
```html
<body>
    <!-- Main content -->
    <main>
        <!-- Sections -->
    </main>
    
    <!-- Footer DENTRO del body -->
    <footer class="footer">
        <!-- Footer content -->
    </footer>
</body>
</html>
```

## 🔍 VALIDACIONES OBLIGATORIAS ANTES DE EDITAR

Antes de modificar `index.html`, SIEMPRE:

1. **Localiza la estructura actual:**
   ```bash
   grep -n "</body>\|</html>\|<footer" index.html
   ```

2. **Verifica la posición del footer:**
   - Debe estar ANTES de `</body>`
   - Nunca después de `</html>`

3. **Cuenta los tags de cierre:**
   ```bash
   grep -c "</body>" index.html  # Debe ser 1
   grep -c "</html>" index.html  # Debe ser 1
   ```

## 🛡️ PROTOCOLO DE EDICIÓN PARA AGENTES

### ANTES de editar:
```python
# Pseudocódigo para agentes
def before_editing_html():
    content = read_file("index.html")
    
    # Verificar estructura básica
    body_closes = content.count("</body>")
    html_closes = content.count("</html>")
    
    if body_closes != 1 or html_closes != 1:
        raise Error("HTML structure invalid before editing")
    
    # Encontrar posición del footer
    footer_pos = content.find("<footer")
    body_close_pos = content.find("</body>")
    
    if footer_pos > body_close_pos and footer_pos != -1:
        raise Error("Footer is outside body tag")
```

### DESPUÉS de editar:
```python
def after_editing_html():
    content = read_file("index.html")
    
    # Re-validar estructura
    validate_html_structure(content)
    
    # Verificar que footer esté en lugar correcto
    lines = content.split('\n')
    footer_line = find_line_with('<footer')
    body_close_line = find_line_with('</body>')
    
    if footer_line > body_close_line:
        fix_footer_position()
```

## 🎯 CASOS ESPECÍFICOS DE NUESTRO PROYECTO

### Footer en MEDELITE:
- **Ubicación correcta:** Dentro de `<body>`, después de todo el contenido principal
- **CSS incluido:** Ya existe en `footer.css` y `main.css`
- **Estructura esperada:**
```html
<body>
    <!-- Todo el contenido de la app -->
    
    <!-- Scripts -->
    <script src="..."></script>
    
    <!-- FOOTER - ÚLTIMA COSA ANTES DE </body> -->
    <footer class="footer">
        <div class="footer-content">
            <!-- Footer sections -->
        </div>
    </footer>
</body>
</html>
```

## 🔧 COMANDOS DE EMERGENCIA

Si detectas que el footer está mal ubicado:

1. **Localizar el problema:**
   ```bash
   grep -A5 -B5 "</html>" index.html
   ```

2. **Mover footer al lugar correcto:**
   - Cortar todo el bloque `<footer>...</footer>`
   - Pegar ANTES de `</body>`

## 🚨 SEÑALES DE ALERTA

Si ves estas líneas en el HTML, hay un problema:

```html
</body>
</html>

<!-- Cualquier contenido aquí es INVÁLIDO -->
<footer>  <!-- ❌ MAL -->
```

## 📋 CHECKLIST FINAL

Antes de completar cualquier edición en `index.html`:

- [ ] ¿Hay exactamente un `</body>`?
- [ ] ¿Hay exactamente un `</html>`?
- [ ] ¿El footer está dentro de `<body>`?
- [ ] ¿No hay contenido después de `</html>`?
- [ ] ¿El HTML pasa validación básica?

## 🔄 HISTORIAL DEL PROBLEMA

**Commits problemáticos identificados:**
- `6e9ec9c`: Revert que causó el problema
- `1b2cfcc`: Merge mal resuelto

**Lección:** Los merges conflictivos requieren validación extra de estructura HTML.

---

**RECUERDA:** Un HTML inválido significa que el navegador no renderizará el contenido correctamente, sin importar cuán perfecto sea el CSS.
