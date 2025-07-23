# PR #3: Simplificar configuración de TypeScript

## Cambios en tsconfig.json:

### 1. Cambiar target
```json
// De:
"target": "ES2022",

// A:
"target": "ESNext",
```

### 2. Simplificar excludes
Remover exclusiones innecesarias:
- `"scripts"` - puede ser útil tipar scripts
- `"backup_*/**/*"` - patrón muy específico

## Beneficios:
- Configuración más simple y mantenible
- Mejor soporte para características modernas de JavaScript
- Menos restricciones innecesarias