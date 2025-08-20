import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersService } from './job_offers.service';
import { JobOffersController } from './job_offers.controller';
import { JobOffer } from './entities/job_offer.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer, User])],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}
