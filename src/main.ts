import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // This will allow requests from any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // if needed
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
  await app.listen(3000); // Puerto para la API REST
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();