# PR #2: Mejorar tipos de formularios

## Cambio principal:

### src/types/components.ts
```typescript
// Cambiar:
options?: Array<{ value: string | number; label: string }>;

// Por:
options?: Array<{ value: any; label: string }>;
```

## Justificación:
- Mayor flexibilidad para valores de formularios
- Evita problemas con valores booleanos o complejos en selects
- Mantiene compatibilidad hacia atrás

## Otros cambios relacionados:
- Hacer `flashcards` no opcional en `Deck` (siempre debe ser un array, aunque esté vacío)
- Mejorar consistencia en espaciado de propiedades