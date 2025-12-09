import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/users.entity';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const favoritesRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const usersRepo = { findOneBy: jest.fn() };
  const jobOffersRepo = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: favoritesRepo },
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: getRepositoryToken(JobOffer), useValue: jobOffersRepo },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a favorite successfully', async () => {
      const dto = { jobOfferId: 2 } as any;
      usersRepo.findOneBy.mockResolvedValue({ id: 1 } as any);
      jobOffersRepo.findOne.mockResolvedValue({ id: 2, company: { name: 'C' } } as any);
      favoritesRepo.findOne.mockResolvedValue(null);
      favoritesRepo.create.mockReturnValue({ userId: 1, jobOfferId: 2 });
      favoritesRepo.save.mockResolvedValue({ id: 10, userId: 1, jobOfferId: 2, createdAt: new Date() });

      const res = await service.create(dto, 1);
      expect(res).toHaveProperty('id', 10);
      expect(favoritesRepo.create).toHaveBeenCalled();
      expect(favoritesRepo.save).toHaveBeenCalled();
    });

    it('throws NotFoundException if user not found', async () => {
      usersRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({ jobOfferId: 1 } as any, 999)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if job offer not found', async () => {
      usersRepo.findOneBy.mockResolvedValue({ id: 1 } as any);
      jobOffersRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ jobOfferId: 999 } as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if favorite already exists', async () => {
      usersRepo.findOneBy.mockResolvedValue({ id: 1 } as any);
      jobOffersRepo.findOne.mockResolvedValue({ id: 2 } as any);
      favoritesRepo.findOne.mockResolvedValue({ id: 5 } as any);
      await expect(service.create({ jobOfferId: 2 } as any, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUser', () => {
    it('returns mapped favorites', async () => {
      const fav = {
        id: 3,
        createdAt: new Date('2020-01-01'),
        jobOffer: {
          id: 7,
          title: 'Dev',
          company: { name: 'Co' },
          location: 'X',
          salary: '10',
          modality: 'REMOTO',
          tags: ['t'],
          publishedAt: new Date(),
          description: 'd',
          requirements: [],
          state: 'activo',
        },
      } as any;
      favoritesRepo.find.mockResolvedValue([fav]);
      const res = await service.findByUser(1);
      expect(res).toHaveLength(1);
      expect(res[0]).toHaveProperty('jobOffer');
      expect(res[0].jobOffer).toHaveProperty('company', 'Co');
    });
  });

  describe('remove', () => {
    it('removes favorite successfully', async () => {
      favoritesRepo.findOne.mockResolvedValue({ id: 4 } as any);
      favoritesRepo.remove.mockResolvedValue(undefined);
      const res = await service.remove(1, 2);
      expect(favoritesRepo.remove).toHaveBeenCalled();
      expect(res).toHaveProperty('message');
    });

    it('throws NotFoundException if favorite not found', async () => {
      favoritesRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
