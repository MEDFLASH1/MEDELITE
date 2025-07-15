# 🤖 PROMPT TEMPLATE PARA AGENTES DE IA

## Instrucciones Críticas para Modificación de HTML

Cuando trabajas con archivos HTML, especialmente `index.html`, SIEMPRE sigue estas reglas:

### 🚨 VALIDACIÓN PREVIA OBLIGATORIA

Antes de cualquier modificación, ejecuta:
```
1. Localizar estructura: grep -n "</body>\|</html>\|<footer" index.html
2. Contar tags de cierre: 
   - </body> debe aparecer exactamente 1 vez
   - </html> debe aparecer exactamente 1 vez
3. Verificar que footer esté DENTRO de <body>
```

### 📐 ESTRUCTURA HTML OBLIGATORIA

```html
<body>
    <!-- Todo el contenido principal -->
    
    <!-- Scripts al final del body -->
    <script src="..."></script>
    
    <!-- FOOTER - ÚLTIMA COSA ANTES DE </body> -->
    <footer class="footer">
        <!-- Contenido del footer -->
    </footer>
</body>
</html>
<!-- NADA después de esta línea -->
```

### ❌ ERRORES PROHIBIDOS

- NUNCA colocar contenido después de `</html>`
- NUNCA duplicar tags `</body>` o `</html>`
- NUNCA dejar footer fuera de `<body>`

### ✅ PROCEDIMIENTO DE EDICIÓN

1. **ANTES de editar:** Validar estructura actual
2. **DURANTE la edición:** Mantener footer dentro de `<body>`
3. **DESPUÉS de editar:** Re-validar estructura completa

### 🔍 COMANDOS DE VERIFICACIÓN

```bash
# Verificar estructura
grep -c "</body>" index.html    # Debe ser 1
grep -c "</html>" index.html    # Debe ser 1

# Verificar posición del footer
grep -n "<footer\|</body>\|</html>" index.html
```

### 📋 CHECKLIST FINAL

- [ ] ¿Exactamente un `</body>`?
- [ ] ¿Exactamente un `</html>`?
- [ ] ¿Footer dentro de `<body>`?
- [ ] ¿Nada después de `</html>`?

---

**CONTEXTO DEL PROBLEMA:** En nuestro proyecto, el footer se renderizaba incorrectamente porque estaba ubicado después de `</html>`, causado por un merge conflictivo mal resuelto. Esta guía previene la repetición del error.
