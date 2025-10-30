import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EmailModule } from '../email/email.module';
//importa el modulo de rabbitMQ (rabbitmq.module.ts) y lo trae a este modulo para inyectar las dependencias en los controller y servicios de admin
@Module({
  imports: [TypeOrmModule.forFeature([Company]), RabbitMQModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
