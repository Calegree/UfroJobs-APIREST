Feature: Gestión de Empresas

  Scenario: Registro de empresa
    When registro una empresa con email "empresa@test.com"
    Then la empresa debe existir en la base de datos

  Scenario: Actualización de empresa
    Given la empresa "empresa@test.com" existe
    When actualizo el nombre de la empresa a "Empresa Nueva"
    Then la empresa debe tener el nombre "Empresa Nueva"

  Scenario: Eliminación de empresa
    Given la empresa "empresa@test.com" existe
    When elimino la empresa "empresa@test.com"
    Then la empresa no debe existir en la base de datos

  Scenario: Listado de empresas
    When consulto el listado de empresas
    Then la respuesta debe contener empresas
