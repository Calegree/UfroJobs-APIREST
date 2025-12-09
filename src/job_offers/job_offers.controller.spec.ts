import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job_offers.controller';
import { JobOffersService } from './job_offers.service';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  } as any;

  const mockClient = { emit: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        { provide: JobOffersService, useValue: mockService },
        { provide: 'RABBITMQ_SERVICE', useValue: mockClient },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('testPostulacion emits event and returns message', () => {
    const res = controller.testPostulacion();
    expect(mockClient.emit).toHaveBeenCalledWith('nueva_postulacion', expect.any(Object));
    expect(res).toHaveProperty('message');
    expect(res).toHaveProperty('data');
  });

  describe('create', () => {
    it('sets companyId from req and calls service.create', async () => {
      const dto: CreateJobOfferDto = { title: 'X' } as any;
      const req: any = { user: { companyId: 42 } };
      mockService.create.mockResolvedValue({ id: 1, companyId: 42 });

      const res = await controller.create(dto, req);
      expect(dto.companyId).toEqual(42);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ id: 1, companyId: 42 });
    });
  });

  describe('findAll / findOne', () => {
    it('findAll returns service result', async () => {
      mockService.findAll.mockResolvedValue([{ id: 1 }] as any);
      const res = await controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
      expect(res).toEqual([{ id: 1 }]);
    });

    it('findOne returns service result for numeric id', async () => {
      mockService.findOne.mockResolvedValue({ id: 5 } as any);
      const res = await controller.findOne(5 as any);
      expect(mockService.findOne).toHaveBeenCalledWith(5);
      expect(res).toEqual({ id: 5 });
    });
  });

  describe('update', () => {
    it('allows update when companyId matches and calls service.update', async () => {
      const id = 7;
      const dto: UpdateJobOfferDto = { title: 'new' } as any;
      const req: any = { user: { userId: 10 } };
      // jobOffer belongs to companyId 10
      mockService.findOne.mockResolvedValue({ id, companyId: 10 } as any);
      mockService.update.mockResolvedValue({ id, title: 'new' } as any);

      const res = await controller.update(id as any, dto, req);
      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(mockService.update).toHaveBeenCalledWith(id, dto);
      expect(res).toEqual({ id, title: 'new' });
    });

    it('throws when companyId does not match', async () => {
      const id = 8;
      const dto: UpdateJobOfferDto = { title: 'x' } as any;
      const req: any = { user: { companyId: 99 } };
      mockService.findOne.mockResolvedValue({ id, companyId: 1 } as any);

      await expect(controller.update(id as any, dto, req)).rejects.toThrow('You are not authorized to update this job offer');
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });
});
