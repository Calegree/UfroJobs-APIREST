import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../applications/applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { User } from '../users/users.entity';
import { JobOffer, JobOfferState } from '../job_offers/entities/job_offer.entity';
import { S3Service } from '../s3/s3.service';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Company, CompanyState } from '../companies/entities/company.entity';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationsRepository: Repository<Application>;
  let usersRepository: Repository<User>;
  let jobOffersRepository: Repository<JobOffer>;
  let client: ClientProxy;

  const mockUser = { id: 1, name: 'Test User', cvKey: 'user-cv.pdf' };
  const mockCompany = { id: 1, name: 'Test Company', state: CompanyState.ACTIVO } as Company;
  const mockJobOffer = { id: 1, title: 'Test Job', state: JobOfferState.ACTIVO, company: mockCompany } as JobOffer;
  const mockApplicationDto: CreateApplicationDto = { jobOfferId: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobOffer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            getPresignedDownloadUrl: jest.fn(),
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

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationsRepository = module.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jobOffersRepository = module.get<Repository<JobOffer>>(
      getRepositoryToken(JobOffer),
    );
    client = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an application successfully with user CV', async () => {
      const newApplication = {
        id: 1,
        status: ApplicationStatus.PENDING,
        applicationDate: new Date(),
      };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(mockJobOffer);
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(applicationsRepository, 'create').mockReturnValue(newApplication as any);
      jest.spyOn(applicationsRepository, 'save').mockResolvedValue(newApplication as any);

      const result = await service.create(mockApplicationDto, mockUser.id);

      expect(result).toEqual({
        id: newApplication.id,
        status: newApplication.status,
        createdAt: newApplication.applicationDate,
      });
      expect(client.emit).toHaveBeenCalledWith('student_applied', {
        applicationId: newApplication.id,
        userId: mockUser.id,
        jobOfferId: mockJobOffer.id,
        companyId: mockCompany.id,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.create(mockApplicationDto, 999)).rejects.toThrow(
        new NotFoundException(`User with ID 999 not found`),
      );
    });

    it('should throw NotFoundException if job offer not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(null);
      await expect(service.create(mockApplicationDto, mockUser.id)).rejects.toThrow(
        new NotFoundException(`Job offer with ID ${mockApplicationDto.jobOfferId} not found`),
      );
    });

    it('should throw BadRequestException if job offer is not active', async () => {
      const inactiveJobOffer = { ...mockJobOffer, state: JobOfferState.INACTIVO };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(inactiveJobOffer as JobOffer);
      await expect(service.create(mockApplicationDto, mockUser.id)).rejects.toThrow(
        new BadRequestException('Job offer is not active'),
      );
    });

    it('should throw ForbiddenException if company is not approved', async () => {
      const unapprovedCompany = { ...mockCompany, state: CompanyState.BANEADO };
      const jobOfferWithUnapprovedCompany = { ...mockJobOffer, company: unapprovedCompany };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(jobOfferWithUnapprovedCompany as JobOffer);
      await expect(service.create(mockApplicationDto, mockUser.id)).rejects.toThrow(
        new ForbiddenException('Cannot apply to a job from an unapproved company'),
      );
    });

    it('should throw ConflictException if user has already applied', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(mockJobOffer);
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue({ id: 2 } as Application);
      await expect(service.create(mockApplicationDto, mockUser.id)).rejects.toThrow(
        new ConflictException('User has already applied to this job offer'),
      );
    });

    it('should throw BadRequestException if no CV is found', async () => {
      const userWithoutCv = { ...mockUser, cvKey: null };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(userWithoutCv as any);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(mockJobOffer);
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.create(mockApplicationDto, mockUser.id)).rejects.toThrow(
        new BadRequestException('No CV found for this application'),
      );
    });
  });

  describe('findOne', () => {
    it('should return an application with a cvUrl', async () => {
      const mockApplication = {
        id: 1,
        status: ApplicationStatus.PENDING,
        applicationDate: new Date(),
        cvKey: 'cv.pdf',
        user: { id: 1, name: 'Test User', email: 'test@test.com' },
        jobOffer: { id: 1, title: 'Test Job', company: { name: 'Test Co' } },
      };
      const cvUrl = 'http://s3.com/cv.pdf';

      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(mockApplication as any);
      const s3Service = { getPresignedDownloadUrl: jest.fn().mockResolvedValue(cvUrl) };
      (service as any).s3Service = s3Service;

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: mockApplication.id,
        status: mockApplication.status,
        applicationDate: mockApplication.applicationDate,
        cvUrl,
        user: {
          id: mockApplication.user.id,
          name: mockApplication.user.name,
          email: mockApplication.user.email,
        },
        jobOffer: {
          id: mockApplication.jobOffer.id,
          title: mockApplication.jobOffer.title,
          company: mockApplication.jobOffer.company.name,
        },
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Application with ID 999 not found`),
      );
    });

    it('should return an application with null cvUrl if no cvKey', async () => {
      const mockApplication = {
        id: 1,
        status: ApplicationStatus.PENDING,
        applicationDate: new Date(),
        cvKey: null,
        user: { id: 1, name: 'Test User', email: 'test@test.com' },
        jobOffer: { id: 1, title: 'Test Job', company: { name: 'Test Co' } },
      };

      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(mockApplication as any);

      const result = await service.findOne(1);

      expect(result.cvUrl).toBeNull();
    });
  });

  describe('findAllByJobOffer', () => {
    it('should return all applications for a job offer', async () => {
      const result = [{ id: 1 }, { id: 2 }] as Application[];
      jest.spyOn(applicationsRepository, 'find').mockResolvedValue(result);
      expect(await service.findAllByJobOffer(1)).toBe(result);
    });

    it('should return an empty array if no applications are found', async () => {
      jest.spyOn(applicationsRepository, 'find').mockResolvedValue([]);
      expect(await service.findAllByJobOffer(1)).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an application', async () => {
      const applicationId = 1;
      const status = ApplicationStatus.ACCEPTED;
      const application = { id: applicationId, status: ApplicationStatus.PENDING };

      jest.spyOn(applicationsRepository, 'findOneBy').mockResolvedValue(application as any);
      jest.spyOn(applicationsRepository, 'save').mockResolvedValue({ ...application, status });

      const result = await service.updateStatus(applicationId, { status });

      expect(applicationsRepository.findOneBy).toHaveBeenCalledWith({ id: applicationId });
      expect(applicationsRepository.save).toHaveBeenCalledWith({ ...application, status });
      expect(result.status).toEqual(status);
    });

    it('should throw NotFoundException if application to update is not found', async () => {
      jest.spyOn(applicationsRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.updateStatus(999, { status: ApplicationStatus.ACCEPTED })).rejects.toThrow(
        new NotFoundException(`Application with ID 999 not found`),
      );
    });
  });
});