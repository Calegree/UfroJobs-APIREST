import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { CompanyEventsHandler } from './events/company-events.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), RabbitMQModule],
  controllers: [CompaniesController, CompanyEventsHandler],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
