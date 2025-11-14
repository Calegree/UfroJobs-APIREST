Feature: Gestión de Usuarios

  Scenario: Creación de usuario
    When registro un usuario con email "nuevo@test.com"
    Then el usuario debe existir en la base de datos

  Scenario: Actualización de datos de usuario
    Given el usuario "user@test.com" existe
    When actualizo el nombre del usuario a "Nuevo Nombre"
    Then el usuario debe tener el nombre "Nuevo Nombre"

  Scenario: Eliminación de usuario
    Given el usuario "user@test.com" existe
    When elimino el usuario "user@test.com"
    Then el usuario no debe existir en la base de datos

  Scenario: Consulta de perfil
    Given el usuario "user@test.com" existe
    When consulto el perfil del usuario "user@test.com"
    Then la respuesta debe contener los datos del usuario
