# Microservicio Go para Algoritmos de Repetición Espaciada

## Estructura del Proyecto Go

```
study-engine/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── algorithms/
│   │   ├── fsrs.go
│   │   ├── sm2.go
│   │   ├── anki.go
│   │   └── ultra_sm2.go
│   ├── handlers/
│   │   ├── review.go
│   │   └── stats.go
│   ├── models/
│   │   └── types.go
│   └── middleware/
│       ├── auth.go
│       └── cors.go
├── pkg/
│   └── firestore/
│       └── client.go
├── go.mod
├── go.sum
├── Dockerfile
└── cloudbuild.yaml
```

## 1. Tipos y Modelos

```go
// internal/models/types.go
package models

import (
    "time"
)

type ReviewRequest struct {
    UserID      string    `json:"userId"`
    CardID      string    `json:"cardId"`
    DeckID      string    `json:"deckId"`
    Rating      int       `json:"rating"` // 1-5
    Algorithm   string    `json:"algorithm"`
    ElapsedDays float64   `json:"elapsedDays"`
    
    // Estado actual de la carta
    CurrentState CardState `json:"currentState"`
}

type CardState struct {
    EaseFactor   float64   `json:"easeFactor"`
    Interval     int       `json:"interval"`
    Repetitions  int       `json:"repetitions"`
    Stability    float64   `json:"stability"`
    Difficulty   float64   `json:"difficulty"`
    LastReview   time.Time `json:"lastReview"`
}

type ReviewResponse struct {
    NextReview   time.Time `json:"nextReview"`
    NewInterval  int       `json:"newInterval"`
    NewState     CardState `json:"newState"`
    
    // Métricas para el dashboard
    Metrics      ReviewMetrics `json:"metrics"`
}

type ReviewMetrics struct {
    RetentionProbability float64 `json:"retentionProbability"`
    OptimalInterval      int     `json:"optimalInterval"`
    DifficultyTrend      string  `json:"difficultyTrend"` // "increasing", "decreasing", "stable"
}
```

## 2. Implementación FSRS v4

```go
// internal/algorithms/fsrs.go
package algorithms

import (
    "math"
    "time"
    "study-engine/internal/models"
)

const (
    w0  = 0.4
    w1  = 0.6
    w2  = 2.4
    w3  = 5.8
    w4  = 4.93
    w5  = 0.94
    w6  = 0.86
    w7  = 0.01
    w8  = 1.49
    w9  = 0.14
    w10 = 0.94
    w11 = 2.18
    w12 = 0.05
    w13 = 0.34
    w14 = 1.26
    w15 = 0.29
    w16 = 2.61
)

type FSRS struct{}

func (f *FSRS) Calculate(req models.ReviewRequest) models.ReviewResponse {
    state := req.CurrentState
    rating := float64(req.Rating)
    
    // Calcular nueva dificultad
    newDifficulty := f.calculateDifficulty(state.Difficulty, rating)
    
    // Calcular nueva estabilidad
    newStability := f.calculateStability(
        state.Stability,
        newDifficulty,
        rating,
        req.ElapsedDays,
    )
    
    // Calcular intervalo óptimo
    requestRetention := 0.9
    newInterval := f.calculateInterval(newStability, requestRetention)
    
    // Calcular probabilidad de retención
    retention := f.calculateRetention(req.ElapsedDays, state.Stability)
    
    return models.ReviewResponse{
        NextReview:  time.Now().AddDate(0, 0, newInterval),
        NewInterval: newInterval,
        NewState: models.CardState{
            Stability:   newStability,
            Difficulty:  newDifficulty,
            LastReview:  time.Now(),
            EaseFactor:  state.EaseFactor, // Mantener para compatibilidad
            Interval:    newInterval,
            Repetitions: state.Repetitions + 1,
        },
        Metrics: models.ReviewMetrics{
            RetentionProbability: retention,
            OptimalInterval:      newInterval,
            DifficultyTrend:     f.getDifficultyTrend(state.Difficulty, newDifficulty),
        },
    }
}

func (f *FSRS) calculateDifficulty(d float64, rating float64) float64 {
    newD := d - w6*(rating-3)
    return math.Max(1, math.Min(10, newD))
}

func (f *FSRS) calculateStability(s, d, rating, elapsed float64) float64 {
    if rating >= 3 {
        // Carta recordada
        hardPenalty := 1.0
        if rating == 3 {
            hardPenalty = w15
        }
        
        easyBonus := 1.0
        if rating == 5 {
            easyBonus = w16
        }
        
        return s * (1 + math.Exp(w8) * 
            (11 - d) * 
            math.Pow(s, -w9) * 
            (math.Exp((1-retention)*w10) - 1) * 
            hardPenalty * 
            easyBonus)
    }
    
    // Carta olvidada
    return w11 * math.Pow(d, -w12) * 
        (math.Pow(s+1, w13) - 1) * 
        math.Exp((1-retention)*w14)
}

func (f *FSRS) calculateInterval(stability, requestRetention float64) int {
    interval := stability * 9 * (1/requestRetention - 1)
    return int(math.Round(interval))
}

func (f *FSRS) calculateRetention(elapsed, stability float64) float64 {
    return math.Pow(1+elapsed/(9*stability), -1)
}
```

## 3. API Handler con Fiber

```go
// cmd/server/main.go
package main

import (
    "log"
    "os"
    
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"
    
    "study-engine/internal/handlers"
    "study-engine/internal/middleware"
    "study-engine/pkg/firestore"
)

func main() {
    app := fiber.New(fiber.Config{
        Prefork:       true,
        CaseSensitive: true,
        StrictRouting: true,
        ServerHeader:  "StudyEngine",
        AppName:       "Study Engine v1.0.0",
    })
    
    // Middleware
    app.Use(recover.New())
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: os.Getenv("ALLOWED_ORIGINS"),
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))
    
    // Inicializar Firestore
    fsClient, err := firestore.NewClient(os.Getenv("GOOGLE_PROJECT_ID"))
    if err != nil {
        log.Fatal("Failed to create Firestore client:", err)
    }
    
    // Handlers
    reviewHandler := handlers.NewReviewHandler(fsClient)
    statsHandler := handlers.NewStatsHandler(fsClient)
    
    // Routes
    api := app.Group("/api/v1")
    
    // Health check
    api.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "status": "healthy",
            "version": "1.0.0",
        })
    })
    
    // Review endpoints
    api.Post("/review", middleware.RequireAuth(), reviewHandler.ProcessReview)
    api.Get("/next-cards/:deckId", middleware.RequireAuth(), reviewHandler.GetNextCards)
    
    // Stats endpoints (para el dashboard)
    api.Get("/stats/user/:userId", middleware.RequireAuth(), statsHandler.GetUserStats)
    api.Post("/stats/batch", middleware.RequireAuth(), statsHandler.BatchUpdateStats)
    
    // WebSocket para actualizaciones en tiempo real
    api.Get("/ws", middleware.RequireAuth(), websocket.New(handleWebSocket))
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Fatal(app.Listen(":" + port))
}
```

## 4. Handler de Review

```go
// internal/handlers/review.go
package handlers

import (
    "github.com/gofiber/fiber/v2"
    "study-engine/internal/algorithms"
    "study-engine/internal/models"
)

type ReviewHandler struct {
    fsClient *firestore.Client
    algos    map[string]Algorithm
}

type Algorithm interface {
    Calculate(req models.ReviewRequest) models.ReviewResponse
}

func NewReviewHandler(fs *firestore.Client) *ReviewHandler {
    return &ReviewHandler{
        fsClient: fs,
        algos: map[string]Algorithm{
            "fsrs":      &algorithms.FSRS{},
            "sm2":       &algorithms.SM2{},
            "anki":      &algorithms.Anki{},
            "ultra_sm2": &algorithms.UltraSM2{},
        },
    }
}

func (h *ReviewHandler) ProcessReview(c *fiber.Ctx) error {
    var req models.ReviewRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }
    
    // Validar algoritmo
    algo, exists := h.algos[req.Algorithm]
    if !exists {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid algorithm",
        })
    }
    
    // Calcular siguiente review
    response := algo.Calculate(req)
    
    // Actualizar en Firestore (async)
    go h.updateCardState(req.CardID, response.NewState)
    
    // Publicar evento para dashboard en tiempo real
    go h.publishReviewEvent(req.UserID, response)
    
    return c.JSON(response)
}
```

## 5. Dockerfile para Cloud Run

```dockerfile
# Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
```

## 6. Deploy en Cloud Run

```yaml
# cloudbuild.yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/study-engine:$COMMIT_SHA', '.']
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/study-engine:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'study-engine'
      - '--image=gcr.io/$PROJECT_ID/study-engine:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--set-env-vars=GOOGLE_PROJECT_ID=$PROJECT_ID'
      - '--min-instances=0'
      - '--max-instances=100'
      - '--memory=256Mi'
      - '--cpu=1'
```