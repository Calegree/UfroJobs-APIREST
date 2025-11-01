# UfroJobs API

Bienvenido a la API de UfroJobs, una plataforma para conectar a estudiantes y empleadores. Esta API está construida con NestJS y sigue las mejores prácticas de desarrollo de software.

## Tabla de Contenidos

- [UfroJobs API](#ufrojobs-api)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Tecnologías](#tecnologías)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Instalación](#instalación)
  - [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
    - [Modo de Desarrollo](#modo-de-desarrollo)
    - [Modo de Producción](#modo-de-producción)
  - [Tests](#tests)
    - [Tests Unitarios](#tests-unitarios)
    - [Tests End-to-End (E2E)](#tests-end-to-end-e2e)
  - [Documentación de la API](#documentación-de-la-api)
  - [Variables de Entorno](#variables-de-entorno)

## Tecnologías

- **Framework**: [NestJS](https://nestjs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Autenticación**: [JWT](https://jwt.io/), [Passport](http://www.passportjs.org/)
- **Manejo de Archivos**: [MinIO](https://min.io/)
- **Comunicación Asíncrona**: [RabbitMQ](https://www.rabbitmq.com/)
- **Envío de Correos**: [Nodemailer](https://nodemailer.com/)
- **Contenerización**: [Docker](https://www.docker.com/)
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/visionmedia/supertest)

## Estructura del Proyecto

El proyecto sigue una arquitectura modular, donde cada módulo representa una característica de la aplicación (por ejemplo, `users`, `auth`, `companies`).

```
.
├── Dockerfile
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── admin
│   │   ├── admin.controller.ts
│   │   ├── admin.module.ts
│   │   ├── admin.service.spec.ts
│   │   ├── admin.service.ts
│   │   └── dashboard.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── applications
│   │   ├── applications.controller.spec.ts
│   │   ├── applications.controller.ts
│   │   ├── applications.module.ts
│   │   ├── applications.service.spec.ts
│   │   ├── applications.service.ts
│   │   ├── dto
│   │   └── entities
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── dto
│   │   ├── guards
│   │   └── strategies
│   ├── common
│   │   ├── decorators
│   │   └── guards
│   ├── companies
│   │   ├── companies.controller.spec.ts
│   │   ├── companies.controller.ts
│   │   ├── companies.module.ts
│   │   ├── companies.service.spec.ts
│   │   ├── companies.service.ts
│   │   ├── dto
│   │   └── entities
│   ├── email
│   │   ├── email.module.ts
│   │   └── email.service.ts
│   ├── job_offers
│   │   ├── dto
│   │   ├── entities
│   │   ├── job_offers.controller.spec.ts
│   │   ├── job_offers.controller.ts
│   │   ├── job_offers.module.ts
│   │   ├── job_offers.service.spec.ts
│   │   └── job_offers.service.ts
│   ├── main.ts
│   ├── rabbitmq
│   │   └── rabbitmq.module.ts
│   ├── s3
│   │   ├── s3.controller.ts
│   │   ├── s3.module.ts
│   │   └── s3.service.ts
│   └── users
│       ├── dto
│       ├── users.controller.spec.ts
│       ├── users.controller.ts
│       ├── users.entity.ts
│       ├── users.module.ts
│       ├── users.service.spec.ts
│       └── users.service.ts
├── test
│   ├── admin.e2e-spec.ts
│   ├── app.e2e-spec.ts
│   ├── application.e2e-spec.ts
│   ├── company.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

24 directories, 55 files
```

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Calegree/UfroJobs-APIREST.git
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## Ejecución de la Aplicación

### Configuración de los servicios

Para que la aplicación funcione correctamente, es necesario ejecutar los servicios de MinIO, RabbitMQ y PostgreSQL utilizando Docker Compose, incluido en la raíz del proyecto.

```bash
docker compose up -d
```
Esto levantará los contenedores necesarios para el entorno local.



### Modo de Desarrollo

Para iniciar la aplicación en modo de desarrollo con recarga automática:

```bash
npm run start:dev
```
### Modo de Producción
Para construir y ejecutar la aplicación en modo de producción:

```bash
npm run build
npm run start:prod
```

## Tests
El proyecto cuenta con tests unitarios y tests end-to-end (E2E) para garantizar la calidad y el correcto funcionamiento de la API.

### Tests Unitarios
Para ejecutar los tests unitarios:

```bash
npm run test
```

### Tests End-to-End (E2E)
Los tests E2E están listos y se pueden ejecutar para probar los flujos completos de la aplicación. Estos tests simulan las solicitudes HTTP a los endpoints de la API y verifican las respuestas.

Para ejecutar los tests E2E:

```bash
npm run test:e2e
```

Los tests **End-to-End (E2E)** implementados cubren los siguientes módulos:

- **admin:** Pruebas para las funcionalidades del panel de administración.  
- **application:** Pruebas para la creación y gestión de postulaciones.  
- **company:** Pruebas para el registro y gestión de empresas. 

## Documentación de la API

La API cuenta con documentación generada automáticamente a través de **Swagger**.  
Una vez que la aplicación esté en ejecución, puedes acceder a la documentación en la siguiente URL:

[http://localhost:3000/api](http://localhost:3000/api)

### Variables de entorno

Ejemplo `.env` backend
```
    #PostgreSQL
    DB_HOST=database
    DB_PORT=5432
    DB_USERNAME=ufro_admin
    DB_PASSWORD=clave_postgres_segura
    DB_NAME=ufrojobs

    #JWT
    JWT_SECRET=clave_jwt_segura
    JWT_EXPIRES_IN=1d

    #RabbitMQ
    RABBITMQ_URL=amqp://rabbitadmin:clave_rabbit_segura@rabbitmq:5672

    #MinIO
    MINIO_ENDPOINT=minios3
    MINIO_PORT=9000
    MINIO_USE_SSL=false
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=clave_super_segura
    MINIO_BUCKET=uploads
```
Ejemplo `.env.db` db
```
#DATABASE
POSTGRES_DB=ufrojobs
POSTGRES_USER=ufro_admin
POSTGRES_PASSWORD=clave_postgres_segura
```

Ejemplo `.env.minio` minio
```
#MINIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=clave_super_segura
```

Ejemplo `.env.rabbit` rabbit
```
RABBITMQ_DEFAULT_USER=rabbitadmin
RABBITMQ_DEFAULT_PASS=clave_rabbit_segura
```
