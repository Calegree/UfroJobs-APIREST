import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: ['http://localhost', '200.13.4.208'], // your frontend origin(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // if needed
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
