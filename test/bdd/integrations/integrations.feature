Feature: Integraciones

  Scenario: Subida de archivos a S3
    Given el usuario "user@test.com" existe
    When sube el archivo "cv.pdf" a S3
    Then el archivo debe estar disponible en S3

  Scenario: Descarga de archivos desde S3
    Given el archivo "cv.pdf" existe en S3
    When el usuario descarga el archivo "cv.pdf"
    Then la respuesta debe contener el archivo

  Scenario: Mensajería con RabbitMQ
    When se crea una empresa
    Then se debe emitir un mensaje "company_created" a RabbitMQ
