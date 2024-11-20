package models

type JokeX struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Text string `json:"text" gorm:"not null"`
}
