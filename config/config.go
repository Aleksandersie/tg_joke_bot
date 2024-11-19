package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config структура для хранения конфигурации базы данных
type Config struct {
	Host     string
	User     string
	Password string
	DbName   string
	Port     string
	BotToken string
}

// NewConfig создает новую конфигурацию из переменных окружения
func NewConfig() *Config {
	// Загружаем переменные окружения из файла .env
	err := godotenv.Load("../.env")
	if err != nil {
		panic("Error loading .env file")
	}

	return &Config{
		Host:     getEnv("DB_HOST", "localhost"),
		User:     getEnv("DB_USER", "youruser"),
		Password: getEnv("DB_PASSWORD", "yourpassword"),
		DbName:   getEnv("DB_NAME", "yourdb"),
		Port:     getEnv("EXTERNAL_PORT", "5432"),
		BotToken: getEnv("BOT_TOKEN", ""),
	}
}

// GetDSN формирует строку подключения (DSN) для базы данных
func (c *Config) GetDSN() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		c.Host, c.User, c.Password, c.DbName, c.Port)
}

// getEnv получает значение переменной окружения или возвращает значение по умолчанию
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
