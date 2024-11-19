package models

type Trigger struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Value string `gorm:"unique;not null" json:"value"`
	Jokes []Joke `gorm:"foreignKey:TriggerID" json:"jokes"`
}

type Joke struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	TriggerID uint   `gorm:"not null" json:"trigger_id"`
	Text      string `gorm:"not null" json:"text"`
}
