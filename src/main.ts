import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });
  const configService = app.get(ConfigService);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('UfroJobs API')
    .setDescription('Documentación de la API de UfroJobs')
    .setVersion('1.0')
    .addBearerAuth() // Para endpoints protegidos con JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuración global del ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora los datos que no están en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envían datos extra
      transform: true, // Transforma los payloads a instancias de DTO
    }),
  );

  // Conectar el microservicio para escuchar eventos de RabbitMQ
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'main_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();