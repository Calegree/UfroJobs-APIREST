Feature: Panel de Administración

  Scenario: Acceso al dashboard
    Given el usuario "admin@test.com" tiene el rol "admin"
    When accede al dashboard de administración
    Then la respuesta debe ser exitosa
    And debe ver métricas

  Scenario: Visualización de métricas
    Given el usuario "admin@test.com" tiene el rol "admin"
    When accede a la sección de métricas
    Then la respuesta debe contener métricas

  Scenario: Gestión de usuarios y empresas desde el panel
    Given el usuario "admin@test.com" tiene el rol "admin"
    When accede a la gestión de usuarios y empresas
    Then debe poder ver y modificar usuarios y empresas
