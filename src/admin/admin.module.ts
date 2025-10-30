import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { AdminService } from './admin.service';
import { Company } from '../companies/entities/company.entity';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, JobOffer]),
    CompaniesModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [AdminService],
})
export class AdminModule {}
