# 📊 ANÁLISIS DE FUNCIONES - StudyingFlashApp

## 🎯 FUNCIONES PRINCIPALES IDENTIFICADAS

### **1. NAVEGACIÓN**
- `showSection(sectionName)` - Línea 248
  - Muestra/oculta secciones
  - Actualiza estado activo en nav
  - Gestiona menú móvil

### **2. GESTIÓN DE DECKS**
- `createDeck()` - Línea 370
  - Valida formulario
  - Crea objeto deck
  - Guarda en localStorage
  - Actualiza UI
  
- `updateDecksList()` - Línea 555
  - Renderiza lista de decks
  - Muestra contadores
  - Genera HTML

- `updateDeckOptions()` - Línea 522
  - Actualiza select de decks
  - Para formulario de flashcards

### **3. GESTIÓN DE FLASHCARDS**
- `createFlashcard()` - Línea 440
  - Valida formulario
  - Crea objeto flashcard
  - Asocia a deck
  - Actualiza contadores

- `updateDeckCountsInUI()` - Línea 1048
  - Actualiza contadores en tiempo real
  - En todas las vistas

### **4. SESIÓN DE ESTUDIO**
- `startStudySession(deckId)` - Línea 732
  - Carga flashcards del deck
  - Inicializa sesión
  - Muestra primera carta

- `showCard()` - Línea 781
  - Muestra carta actual
  - Gestiona volteo

- `flipCard()` - Línea 820
  - Voltea entre pregunta/respuesta

- `rateCard(rating)` - Línea 832
  - Aplica algoritmo de repetición
  - Actualiza siguiente revisión
  - Avanza a siguiente carta

### **5. ESTADÍSTICAS**
- `updateStats()` - Línea 958
  - Calcula totales
  - Actualiza localStorage

- `updateStatsSection()` - Línea 978
  - Renderiza estadísticas en UI

### **6. UTILIDADES**
- `showNotification(message, type)` - Utils objeto
- `formatDate(date)` - Utils objeto
- `generateId()` - Utils objeto
- `debounce(func, wait)` - Utils objeto

## 🔗 DEPENDENCIAS ENTRE FUNCIONES

```
createDeck()
  └─> updateDecksList()
  └─> updateDeckOptions()
  └─> updateStats()
  └─> showNotification()

createFlashcard()
  └─> updateDeckCountsInUI()
  └─> updateStats()
  └─> showNotification()

startStudySession()
  └─> showSection('study')
  └─> showCard()
      └─> flipCard()
      └─> rateCard()
          └─> calculateNextReview()
```

## 📦 PROPUESTA DE MÓDULOS

### **storage.service.js**
- get/set/remove de localStorage
- Manejo del prefijo "studyingflash_"

### **deck.service.js**
- createDeck
- updateDeck
- deleteDeck
- getDeckById
- getAllDecks

### **flashcard.service.js**
- createFlashcard
- updateFlashcard
- deleteFlashcard
- getFlashcardsByDeck
- getFlashcardsForReview

### **study.service.js**
- startSession
- rateCard
- calculateNextReview
- getProgress

### **notification.service.js**
- showNotification
- showError
- showSuccess

### **utils.js**
- formatDate
- generateId
- debounce
- validateForm

## 🚨 PUNTOS CRÍTICOS

1. **localStorage**: Todas las operaciones usan el prefijo "studyingflash_"
2. **IDs de elementos**: Muchas funciones dependen de IDs específicos en HTML
3. **Estado global**: this.decks, this.flashcards se usan en múltiples lugares
4. **Event listeners**: Se agregan en init() y deben preservarse

## 📝 NOTAS PARA AGENTES

### **Para AGENTE 2 (TypeScript)**
- Todas las funciones que manejan decks necesitan tipo `Deck`
- Las funciones de flashcards necesitan tipo `Flashcard`
- Los ratings son números del 1 al 5

### **Para AGENTE 3 (Modularización)**
- Empezar por servicios sin dependencias (storage, utils)
- Deck y Flashcard services dependen de storage
- Study service depende de flashcard service

### **Para AGENTE 4 (React)**
- showSection() será reemplazado por routing
- updateDecksList() será un componente DeckList
- Los formularios serán componentes controlados