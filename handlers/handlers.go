package handlers

import (
	"net/http"
	"strconv"

	"joke_bot/joke_bot/dto"
	"joke_bot/joke_bot/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Handlers структура для хранения зависимостей
type Handlers struct {
	DB *gorm.DB
}

// NewHandlers создает новый экземпляр Handlers
func NewHandlers(db *gorm.DB) *Handlers {
	return &Handlers{DB: db}
}

// GetTriggers обрабатывает GET /api/triggers
func (h *Handlers) GetTriggers(c *gin.Context) {
	var triggers []models.Trigger
	if err := h.DB.Preload("Jokes").Find(&triggers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, triggers)
}

// GetJokesByTriggerID обрабатывает GET /api/triggers/:id/jokes
func (h *Handlers) GetJokesByTriggerID(c *gin.Context) {
	id := c.Param("id")
	var jokes []models.Joke
	if err := h.DB.Where("trigger_id = ?", id).Find(&jokes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jokes)
}

// CreateTrigger обрабатывает POST /api/triggers
func (h *Handlers) CreateTrigger(c *gin.Context) {
	var triggerDTO dto.CreateTriggerDTO
	if err := c.ShouldBindJSON(&triggerDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Преобразование DTO в модель
	trigger := models.Trigger{
		Value: triggerDTO.Value,
	}

	if err := h.DB.Create(&trigger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, trigger)
}

// DeleteTrigger обрабатывает DELETE /api/triggers/:id
func (h *Handlers) DeleteTrigger(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Trigger{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// AddJokeToTrigger обрабатывает POST /api/triggers/:id/jokes
func (h *Handlers) AddJokeToTrigger(c *gin.Context) {
	triggerID := c.Param("id")
	var jokeDTO dto.AddJokeDTO
	if err := c.ShouldBindJSON(&jokeDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Преобразование и проверка TriggerID
	id, err := strconv.ParseUint(triggerID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trigger ID"})
		return
	}

	// Проверка существования триггера
	var trigger models.Trigger
	if err := h.DB.First(&trigger, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trigger not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Создание шутки
	joke := models.Joke{
		TriggerID: uint(id),
		Text:      jokeDTO.Text,
	}

	if err := h.DB.Create(&joke).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, joke)
}

// DeleteJoke обрабатывает DELETE /api/jokes/:id
func (h *Handlers) DeleteJoke(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Joke{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
