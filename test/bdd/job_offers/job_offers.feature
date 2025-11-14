Feature: Ofertas de Trabajo

  Scenario: Creación de oferta
    When creo una oferta de trabajo "Desarrollador"
    Then la oferta debe existir en la base de datos

  Scenario: Actualización de oferta
    Given la oferta "Desarrollador" existe
    When actualizo el título de la oferta a "Backend Developer"
    Then la oferta debe tener el título "Backend Developer"

  Scenario: Eliminación de oferta
    Given la oferta "Desarrollador" existe
    When elimino la oferta "Desarrollador"
    Then la oferta no debe existir en la base de datos

  Scenario: Listado y búsqueda de ofertas
    When consulto el listado de ofertas
    Then la respuesta debe contener ofertas
