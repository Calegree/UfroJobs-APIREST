Feature: Postulación a Ofertas

  Scenario: Postulación de usuario a oferta
    Given el usuario "user@test.com" y la oferta "Desarrollador" existen
    When el usuario postula a la oferta "Desarrollador"
    Then la postulación debe existir en la base de datos

  Scenario: Visualización de postulaciones
    Given el usuario "user@test.com" tiene postulaciones
    When consulto las postulaciones del usuario
    Then la respuesta debe contener las postulaciones

  Scenario: Actualización/Retiro de postulación
    Given la postulación del usuario "user@test.com" a "Desarrollador" existe
    When retiro la postulación
    Then la postulación no debe existir en la base de datos
