import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job_offers.controller';
import { JobOffersService } from './job_offers.service';

describe('JobOffersController', () => {
  let controller: JobOffersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [JobOffersService],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
