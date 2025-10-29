import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job_offers/job_offers.module';
import { JobOffer } from './job_offers/entities/job_offer.entity';
import { DashboardController } from './admin/dashboard.controller';
import { AdminCompaniesController } from './admin/companies.controller';
import { RequestModule } from './request/request.module';
import { S3Module } from './s3/s3.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    JobOffersModule, // <-- Agrega esta línea,
    ApplicationsModule,
    TypeOrmModule.forFeature([JobOffer]), RequestModule, S3Module, // <-- agrega esto
  ],
  controllers: [DashboardController, AdminCompaniesController],
  providers: [],
})
export class AppModule {}
