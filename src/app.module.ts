// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job_offers/job_offers.module'; // <-- Agrega esta línea
import { DashboardController } from './admin/dashboard.controller';
import { JobOffer } from './job_offers/entities/job_offer.entity'; // <-- Importa la entidad aquí
import { RequestModule } from './request/request.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Muy importante para que RabbitMQModule pueda leer .env
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Solo dev
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    JobOffersModule, // <-- Agrega esta línea
    TypeOrmModule.forFeature([JobOffer]), RequestModule, // <-- agrega esto
    RabbitMQModule, // <-- Añade esto
    AdminModule,
  ],
  controllers: [DashboardController], // <-- agrega aquí
})
export class AppModule {}
