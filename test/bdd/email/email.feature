Feature: Notificaciones y Email

  Scenario: Envío de email al postular
    Given el usuario "user@test.com" postula a la oferta "Desarrollador"
    Then se debe enviar un email de confirmación a "user@test.com"

  Scenario: Notificación de cambios de estado en postulaciones
    Given la postulación del usuario "user@test.com" a "Desarrollador" cambia de estado
    Then el usuario debe recibir una notificación
