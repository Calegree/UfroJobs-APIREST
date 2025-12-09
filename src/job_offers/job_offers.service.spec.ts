import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersService } from './job_offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer, JobOfferState, JobOfferModality } from './entities/job_offer.entity';
import { User, UserRole } from '../users/users.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';
import { Company, CompanyState } from '../companies/entities/company.entity';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let jobOfferRepository: Repository<JobOffer>;
  let userRepository: Repository<User>;

  const mockCompany: Company = {
    id: 1,
    name: 'Test Co',
    email: 'test@co.com',
    password: 'password',
    rut: '12345678-9',
    phone: '123456789',
    localization: 'Test City',
    description: 'A test company',
    state: CompanyState.ACTIVO,
  };

  const mockJobOffer: JobOffer = {
    id: 1,
    title: 'Software Engineer',
    location: 'Remote',
    salary: '100k',
    tags: ['typescript', 'nestjs'],
    publishedAt: new Date(),
    applicants: [1, 2],
    description: 'A great job',
    requirements: ['5 years of experience'],
    worktime: 'Full-time',
    modality: JobOfferModality.REMOTO,
    state: JobOfferState.ACTIVO,
    company: mockCompany,
    companyId: 1,
  };

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'password',
    cvKey: 'cv.pdf',
    skills: [],
    applications: [],
    role: UserRole.STUDENT,
    createdAt: new Date(),
    updatedAt: new Date(),
    state: 'activo' as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: getRepositoryToken(JobOffer),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
          },
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
    jobOfferRepository = module.get<Repository<JobOffer>>(getRepositoryToken(JobOffer));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job offer', async () => {
      const createDto: CreateJobOfferDto = {
        title: 'Software Engineer',
        description: 'A great job',
        requirements: ['5 years of experience'],
        location: 'Remote',
        tags: ['typescript', 'nestjs'],
        salary: '100k',
        worktime: 'Full-time',
        modality: JobOfferModality.REMOTO,
        state: JobOfferState.ACTIVO, // opcional
        companyId: 1,
      };
      jest.spyOn(jobOfferRepository, 'create').mockReturnValue(mockJobOffer);
      jest.spyOn(jobOfferRepository, 'save').mockResolvedValue(mockJobOffer);

      const result = await service.create(createDto);
      expect(result).toEqual(mockJobOffer);
    });
  });

  describe('findOne', () => {
    it('should return a job offer if found', async () => {
      jest.spyOn(jobOfferRepository, 'findOne').mockResolvedValue(mockJobOffer);
      const result = await service.findOne(1);
      expect(result).toEqual(mockJobOffer);
    });

    it('should throw NotFoundException if job offer not found', async () => {
      jest.spyOn(jobOfferRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a job offer', async () => {
      const updateDto: UpdateJobOfferDto = { title: 'Senior Software Engineer' };
      const updatedJobOffer = { ...mockJobOffer, ...updateDto };
      jest.spyOn(jobOfferRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedJobOffer);

      const result = await service.update(1, updateDto);
      expect(result.title).toEqual('Senior Software Engineer');
    });
  });

  describe('remove', () => {
    it('should remove a job offer', async () => {
      jest.spyOn(jobOfferRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.remove(1);
      expect(jobOfferRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCompany', () => {
    it('should return job offers for a company', async () => {
      jest.spyOn(jobOfferRepository, 'find').mockResolvedValue([mockJobOffer]);
      const result = await service.findByCompany(1);
      expect(result).toEqual([mockJobOffer]);
    });
  });

  describe('findApplicantsByOffer', () => {
    it('should return applicants for an offer', async () => {
      jest.spyOn(jobOfferRepository, 'findOne').mockResolvedValue(mockJobOffer);
      jest.spyOn(userRepository, 'findBy').mockResolvedValue([mockUser]);
      const result = await service.findApplicantsByOffer(1);
      expect(result).toEqual([mockUser]);
    });

    it('should throw NotFoundException if offer not found', async () => {
      jest.spyOn(jobOfferRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findApplicantsByOffer(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleState', () => {
    it('should toggle state from ACTIVO to INACTIVO', async () => {
      const offer = { ...mockJobOffer, state: JobOfferState.ACTIVO };
      const expectedOffer = { ...mockJobOffer, state: JobOfferState.INACTIVO };
      jest.spyOn(service, 'findOne').mockResolvedValue(offer);
      jest.spyOn(jobOfferRepository, 'save').mockResolvedValue(expectedOffer);

      const result = await service.toggleState(1);
      expect(result.state).toEqual(JobOfferState.INACTIVO);
    });

    it('should toggle state from INACTIVO to ACTIVO', async () => {
      const offer = { ...mockJobOffer, state: JobOfferState.INACTIVO };
      const expectedOffer = { ...mockJobOffer, state: JobOfferState.ACTIVO };
      jest.spyOn(service, 'findOne').mockResolvedValue(offer);
      jest.spyOn(jobOfferRepository, 'save').mockResolvedValue(expectedOffer);

      const result = await service.toggleState(1);
      expect(result.state).toEqual(JobOfferState.ACTIVO);
    });
  });
});
