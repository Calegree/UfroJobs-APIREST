import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { ForbiddenException } from '@nestjs/common';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  const mockService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockService }],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('calls service.create with userId from req and returns result', async () => {
      const dto = { jobOfferId: 2 } as any;
      const req: any = { user: { userId: 1 } };
      mockService.create.mockResolvedValue({ id: 10 });

      const res = await controller.create(dto, req);
      expect(mockService.create).toHaveBeenCalledWith(dto, 1);
      expect(res).toEqual({ id: 10 });
    });

    it('throws ForbiddenException when req.user.userId missing', async () => {
      const dto = { jobOfferId: 2 } as any;
      const req: any = { user: {} };
      await expect(controller.create(dto, req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('calls service.findByUser and returns mapped favorites', async () => {
      const req: any = { user: { userId: 3 } };
      mockService.findByUser.mockResolvedValue([{ id: 1 }] as any);
      const res = await controller.findAll(req);
      expect(mockService.findByUser).toHaveBeenCalledWith(3);
      expect(res).toEqual([{ id: 1 }]);
    });

    it('throws ForbiddenException when req.user.userId missing', async () => {
      const req: any = { user: {} };
      await expect(controller.findAll(req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('calls service.remove with userId and jobId and returns result', async () => {
      const req: any = { user: { userId: 4 } };
      mockService.remove.mockResolvedValue({ message: 'Favorite removed successfully' });
      const res = await controller.remove(7 as any, req);
      expect(mockService.remove).toHaveBeenCalledWith(4, 7);
      expect(res).toEqual({ message: 'Favorite removed successfully' });
    });

    it('throws ForbiddenException when req.user.userId missing', async () => {
      const req: any = { user: {} };
      await expect(controller.remove(7 as any, req)).rejects.toThrow(ForbiddenException);
    });
  });
});
