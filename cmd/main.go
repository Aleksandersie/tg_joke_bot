package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
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

// WeatherResponse структура для парсинга ответа от WeatherAPI
type WeatherResponse struct {
	Location struct {
		Name    string  `json:"name"`
		Region  string  `json:"region"`
		Country string  `json:"country"`
		Lat     float64 `json:"lat"`
		Lon     float64 `json:"lon"`
	} `json:"location"`
	Current struct {
		TempC     float64 `json:"temp_c"`
		Condition struct {
			Text string `json:"text"`
		} `json:"condition"`
		WindKph    float64 `json:"wind_kph"`
		Humidity   int     `json:"humidity"`
		FeelslikeC float64 `json:"feelslike_c"`
	} `json:"current"`
}

func getWeather(cfg *config.Config) (models.Weather, error) {
	url := fmt.Sprintf("http://api.weatherapi.com/v1/current.json?key=%s&q=Krasnodar&lang=ru", cfg.WeatherAPIKey)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return models.Weather{}, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return models.Weather{}, fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return models.Weather{}, fmt.Errorf("error reading response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return models.Weather{}, fmt.Errorf("API returned non-200 status code: %d, body: %s", resp.StatusCode, string(body))
	}

	var weatherResp WeatherResponse
	if err := json.Unmarshal(body, &weatherResp); err != nil {
		return models.Weather{}, fmt.Errorf("error parsing JSON: %v, body: %s", err, string(body))
	}

	weather := models.Weather{
		Temperature: weatherResp.Current.TempC,
		Description: weatherResp.Current.Condition.Text,
		City:        weatherResp.Location.Name,
	}

	return weather, nil
}

func formatWeatherMessage(weather models.Weather) string {
	return fmt.Sprintf(
		"Погода в городе %s:\nТемпература: %.1f°C\nПогода: %s",
		weather.City,
		weather.Temperature,
		weather.Description,
	)
}

func sendPeriodicWeather(bot *tgbotapi.BotAPI, chatIDs map[int64]bool, cfg *config.Config) {
	for {
		now := time.Now()
		next := now
		hour := now.Hour()

		if hour < 9 {
			next = time.Date(now.Year(), now.Month(), now.Day(), 9, 0, 0, 0, now.Location())
		} else if hour < 14 {
			next = time.Date(now.Year(), now.Month(), now.Day(), 14, 0, 0, 0, now.Location())
		} else if hour < 19 {
			next = time.Date(now.Year(), now.Month(), now.Day(), 19, 0, 0, 0, now.Location())
		} else {
			next = time.Date(now.Year(), now.Month(), now.Day()+1, 9, 0, 0, 0, now.Location())
		}

		time.Sleep(time.Until(next))

		weather, err := getWeather(cfg)
		if err != nil {
			fmt.Printf("Ошибка получения погоды: %v\n", err)
			continue
		}

		weatherMsg := formatWeatherMessage(weather)
		for chatID := range chatIDs {
			msg := tgbotapi.NewMessage(chatID, weatherMsg)
			if _, err := bot.Send(msg); err != nil {
				fmt.Printf("Ошибка отправки погоды в чат %d: %v\n", chatID, err)
			}
		}
	}
}

func initDB(cfg *config.Config) {
	var err error
	dsn := cfg.GetDSN()
	fmt.Println("DSN:", dsn)
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Не удалось подключиться к базе данных: " + err.Error())
	}
	err = db.AutoMigrate(&models.Trigger{}, &models.Joke{}, &models.JokeX{})
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
	chatIDs := make(map[int64]bool)

	go sendPeriodicJokes(bot, db)
	go sendPeriodicWeather(bot, chatIDs, cfg)

	updateConfig := tgbotapi.NewUpdate(0)
	updateConfig.Timeout = 60

	updates := bot.GetUpdatesChan(updateConfig)

	for update := range updates {
		if update.Message == nil {
			continue
		}

		chatIDs[update.Message.Chat.ID] = true

		if strings.Contains(strings.ToLower(update.Message.Text), "какая погода") {
			weather, err := getWeather(cfg)
			if err != nil {
				msg := tgbotapi.NewMessage(update.Message.Chat.ID, "Извините, не удалось получить данные о погоде. Попробуйте позже.")
				bot.Send(msg)
			} else {
				weatherMsg := formatWeatherMessage(weather)
				msg := tgbotapi.NewMessage(update.Message.Chat.ID, weatherMsg)
				bot.Send(msg)
			}
			continue
		}

		if strings.Contains(strings.ToLower(update.Message.Text), "хочу анекдот") {
			var joke models.JokeX
			result := db.Order("RANDOM()").First(&joke)
			if result.Error == nil {
				msg := tgbotapi.NewMessage(update.Message.Chat.ID, joke.Text)
				bot.Send(msg)
				continue
			}
		}

		var triggers []models.Trigger
		db.Preload("Jokes").Find(&triggers)

		for _, trigger := range triggers {
			if strings.Contains(strings.ToLower(update.Message.Text), strings.ToLower(trigger.Value)) {
				rand.Seed(time.Now().UnixNano())
				if len(trigger.Jokes) > 0 {
					joke := trigger.Jokes[rand.Intn(len(trigger.Jokes))]
					msg := tgbotapi.NewMessage(update.Message.Chat.ID, joke.Text)
					bot.Send(msg)
				}
				break
			}
		}
	}
}

func sendPeriodicJokes(bot *tgbotapi.BotAPI, db *gorm.DB) {
	interval := 3 * time.Hour

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	chatIDs := make(map[int64]bool)

	for range ticker.C {
		var joke models.JokeX
		result := db.Order("RANDOM()").First(&joke)
		if result.Error != nil {
			fmt.Printf("Ошибка при получении анекдота: %v\n", result.Error)
			continue
		}

		for chatID := range chatIDs {
			msg := tgbotapi.NewMessage(chatID, joke.Text)
			if _, err := bot.Send(msg); err != nil {
				fmt.Printf("Ошибка при отправке анекдота в чат %d: %v\n", chatID, err)
			}
		}
	}
}

func addChatToList(chatID int64, chatIDs map[int64]bool) {
	chatIDs[chatID] = true
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

		api.GET("/jokes-x", h.GetJokesX)
		api.POST("/jokes-x", h.CreateJokeX)
		api.DELETE("/jokes-x/:id", h.DeleteJokeX)
	}

	// Раздача статических файлов админ-панели через NoRoute
	r.NoRoute(func(c *gin.Context) {
		c.File("./admin-panel/dist/index.html")
	})

	return r
}

func main() {
	cfg := config.NewConfig()
	initDB(cfg)

	h := handlers.NewHandlers(db)

	go startBot(cfg)

	router := setupRouter(h)
	fmt.Println("Запуск веб-сервера на :8080")
	if err := router.Run(":8080"); err != nil {
		panic("Ошибка при запуске веб-сервера: " + err.Error())
	}
}
