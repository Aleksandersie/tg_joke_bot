package dto

type CreateTriggerDTO struct {
	Value string `json:"value" binding:"required"`
}

type AddJokeDTO struct {
	Text string `json:"text" binding:"required"`
}
