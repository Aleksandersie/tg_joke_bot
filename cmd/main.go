package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"joke_bot/joke_bot/config"
	"joke_bot/joke_bot/handlers"
	"joke_bot/joke_bot/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB(cfg *config.Config) {
	var err error
	dsn := cfg.GetDSN()
	fmt.Println("DSN:", dsn)
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Не удалось подключиться к базе данных: " + err.Error())
	}
	err = db.AutoMigrate(&models.Trigger{}, &models.Joke{})
	if err != nil {
		panic("Не удалось выполнить миграцию базы данных: " + err.Error())
	}
	fmt.Println("База данных успешно мигрирована.")
}

func startBot(cfg *config.Config) {
	bot, err := tgbotapi.NewBotAPI(cfg.BotToken)
	if err != nil {
		panic("Ошибка при создании бота: " + err.Error())
	}

	bot.Debug = true

	updateConfig := tgbotapi.NewUpdate(0)
	updateConfig.Timeout = 60

	updates := bot.GetUpdatesChan(updateConfig)

	for update := range updates {
		if update.Message == nil { // игнорируем не сообщения
			continue
		}

		// Проверяем наличие триггерных слов в сообщении
		var triggers []models.Trigger
		db.Preload("Jokes").Find(&triggers) // Получаем все триггеры и связанные шутки из базы данных

		for _, trigger := range triggers {
			if strings.Contains(strings.ToLower(update.Message.Text), strings.ToLower(trigger.Value)) {
				// Генерируем случайный индекс для выбора шутки из соответствующей группы
				rand.Seed(time.Now().UnixNano())
				if len(trigger.Jokes) > 0 {
					joke := trigger.Jokes[rand.Intn(len(trigger.Jokes))]
					msg := tgbotapi.NewMessage(update.Message.Chat.ID, joke.Text)
					bot.Send(msg)
				}
				break // Выходим из цикла после отправки шутки
			}
		}
	}
}

func setupRouter(h *handlers.Handlers) *gin.Engine {
	r := gin.Default()

	// Настраиваем CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API маршруты
	api := r.Group("/api")
	{
		api.GET("/triggers", h.GetTriggers)
		api.POST("/triggers", h.CreateTrigger)
		api.DELETE("/triggers/:id", h.DeleteTrigger)
		api.GET("/triggers/:id/jokes", h.GetJokesByTriggerID)
		api.POST("/triggers/:id/jokes", h.AddJokeToTrigger)
		api.DELETE("/jokes/:id", h.DeleteJoke)
	}

	// Раздача статических файлов админ-панели через NoRoute
	r.NoRoute(func(c *gin.Context) {
		c.File("./admin-panel/dist/index.html")
	})

	return r
}

func main() {
	cfg := config.NewConfig() // Создаем конфигурацию
	initDB(cfg)               // Инициализируем базу данных с конфигурацией

	// Создаем обработчики с доступом к базе данных
	h := handlers.NewHandlers(db)

	// Запускаем бота в отдельной горутине
	go startBot(cfg)

	// Запускаем HTTP-сервер с использованием Gin
	router := setupRouter(h)
	fmt.Println("Запуск веб-сервера на :8080")
	if err := router.Run(":8080"); err != nil {
		panic("Ошибка при запуске веб-сервера: " + err.Error())
	}
}
