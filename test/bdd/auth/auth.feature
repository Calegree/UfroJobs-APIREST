Feature: Autenticación y Autorización

  Scenario: Login de usuario
    Given el usuario "user@test.com" existe y tiene la contraseña "123456"
    When el usuario intenta iniciar sesión con email "user@test.com" y contraseña "123456"
    Then la respuesta debe ser exitosa y debe recibir un token

  Scenario: Acceso restringido por roles
    Given el usuario "admin@test.com" tiene el rol "admin"
    When el usuario accede a la ruta protegida "/admin/dashboard"
    Then la respuesta debe ser exitosa
    And debe ver el dashboard de administración

  Scenario: Registro de usuario
    When registro un usuario con email "nuevo@test.com" y contraseña "abcdef"
    Then el usuario debe existir en la base de datos
