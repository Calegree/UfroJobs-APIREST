import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EmailModule } from '../email/email.module';
import { DashboardController } from './dashboard.controller';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';
//importa el modulo de rabbitMQ (rabbitmq.module.ts) y lo trae a este modulo para inyectar las dependencias en los controller y servicios de admin
@Module({
  imports: [TypeOrmModule.forFeature([Company, JobOffer]), RabbitMQModule, EmailModule, CompaniesModule,
    UsersModule,],
  controllers: [AdminController,DashboardController],
  providers: [AdminService],
})
export class AdminModule {}
