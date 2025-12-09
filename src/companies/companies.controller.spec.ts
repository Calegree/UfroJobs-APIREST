import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            toggleState: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('basic endpoints', () => {
    it('create calls service.create', async () => {
      const dto = { name: 'X' } as any;
      const spy = jest.spyOn((controller as any).companiesService, 'create').mockResolvedValue({ id: 1 } as any);
      const res = await controller.create(dto);
      expect(spy).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ id: 1 });
    });

    it('findAll calls service.findAll', async () => {
      const spy = jest.spyOn((controller as any).companiesService, 'findAll').mockResolvedValue([]);
      const res = await controller.findAll();
      expect(spy).toHaveBeenCalled();
      expect(res).toEqual([]);
    });

    it('getMyProfile uses req.user', async () => {
      const mockUser = { userId: 5 } as any;
      const spy = jest.spyOn((controller as any).companiesService, 'findOne').mockResolvedValue({ id: 5 } as any);
      const res = await controller.getMyProfile({ user: mockUser });
      expect(spy).toHaveBeenCalledWith(5);
      expect(res).toEqual({ id: 5 });
    });

    it('findOne calls service.findOne with number', async () => {
      const spy = jest.spyOn((controller as any).companiesService, 'findOne').mockResolvedValue({ id: 3 } as any);
      const res = await controller.findOne('3');
      expect(spy).toHaveBeenCalledWith(3);
      expect(res).toEqual({ id: 3 });
    });

    it('update calls service.update', async () => {
      const spy = jest.spyOn((controller as any).companiesService, 'update').mockResolvedValue({ id: 2 } as any);
      const res = await controller.update('2', { name: 'New' } as any);
      expect(spy).toHaveBeenCalledWith(2, { name: 'New' });
      expect(res).toEqual({ id: 2 });
    });

    it('toggleCompanyState calls service.toggleState', async () => {
      const spy = jest.spyOn((controller as any).companiesService, 'toggleState').mockResolvedValue({ state: 'INACTIVO' } as any);
      const res = await controller.toggleCompanyState('4');
      expect(spy).toHaveBeenCalledWith(4);
      expect(res).toEqual({ state: 'INACTIVO' });
    });

    it('remove calls service.remove', async () => {
      const spy = jest.spyOn((controller as any).companiesService, 'remove').mockResolvedValue({});
      await controller.remove('6');
      expect(spy).toHaveBeenCalledWith(6);
    });
  });
});