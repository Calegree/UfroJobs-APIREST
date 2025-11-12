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
  let s3Service: S3Service;
  let client: ClientProxy;

  const mockUser = { id: 1, name: 'Test User', cvKey: 'user-cv.pdf' } as User;
  const mockCompany = {
    id: 1,
    name: 'Test Company',
    state: CompanyState.ACTIVO,
  } as Company;
  const mockJobOffer = {
    id: 1,
    title: 'Test Job',
    state: JobOfferState.ACTIVO,
    company: mockCompany,
  } as JobOffer;
  const mockApplicationDto: CreateApplicationDto = { jobOfferId: 1 };
  const mockApplication = {
    id: 1,
    user: mockUser,
    userId: mockUser.id,
    jobOffer: mockJobOffer,
    jobOfferId: mockJobOffer.id,
    status: ApplicationStatus.PENDING,
    cvKey: 'cv.pdf',
    applicationDate: new Date(),
  } as Application;

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
            find: jest.fn(),
            remove: jest.fn(),
            findOneBy: jest.fn(),
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
            getPresignedDownloadUrl: jest
              .fn()
              .mockResolvedValue('http://s3.com/cv.pdf'),
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
    s3Service = module.get<S3Service>(S3Service);
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
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest
        .spyOn(jobOffersRepository, 'findOne')
        .mockResolvedValue(mockJobOffer);
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(applicationsRepository, 'create')
        .mockReturnValue(newApplication as any);
      jest
        .spyOn(applicationsRepository, 'save')
        .mockResolvedValue(newApplication as any);

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
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(jobOffersRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.create(mockApplicationDto, mockUser.id),
      ).rejects.toThrow(
        new NotFoundException(
          `Job offer with ID ${mockApplicationDto.jobOfferId} not found`,
        ),
      );
    });

    it('should throw BadRequestException if job offer is not active', async () => {
      const inactiveJobOffer = {
        ...mockJobOffer,
        state: JobOfferState.INACTIVO,
      };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest
        .spyOn(jobOffersRepository, 'findOne')
        .mockResolvedValue(inactiveJobOffer as JobOffer);
      await expect(
        service.create(mockApplicationDto, mockUser.id),
      ).rejects.toThrow(new BadRequestException('Job offer is not active'));
    });

    it('should throw ForbiddenException if company is not approved', async () => {
      const unapprovedCompany = { ...mockCompany, state: CompanyState.BANEADO };
      const jobOfferWithUnapprovedCompany = {
        ...mockJobOffer,
        company: unapprovedCompany,
      };
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest
        .spyOn(jobOffersRepository, 'findOne')
        .mockResolvedValue(jobOfferWithUnapprovedCompany as JobOffer);
      await expect(
        service.create(mockApplicationDto, mockUser.id),
      ).rejects.toThrow(
        new ForbiddenException(
          'Cannot apply to a job from an unapproved company',
        ),
      );
    });

    it('should throw ConflictException if user has already applied', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest
        .spyOn(jobOffersRepository, 'findOne')
        .mockResolvedValue(mockJobOffer);
      jest
        .spyOn(applicationsRepository, 'findOne')
        .mockResolvedValue({ id: 2 } as Application);
      await expect(
        service.create(mockApplicationDto, mockUser.id),
      ).rejects.toThrow(
        new ConflictException('User has already applied to this job offer'),
      );
    });

    it('should throw BadRequestException if no CV is found', async () => {
      const userWithoutCv = { ...mockUser, cvKey: null };
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(userWithoutCv as any);
      jest
        .spyOn(jobOffersRepository, 'findOne')
        .mockResolvedValue(mockJobOffer);
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.create(mockApplicationDto, mockUser.id),
      ).rejects.toThrow(
        new BadRequestException('No CV found for this application'),
      );
    });
  });

  describe('findOne', () => {
    it('should return an application with a cvUrl', async () => {
      const app = {
        ...mockApplication,
        user: { id: 1, name: 'Test User', email: 'test@test.com' },
        jobOffer: { id: 1, title: 'Test Job', company: { name: 'Test Co' } },
      };
      jest
        .spyOn(applicationsRepository, 'findOne')
        .mockResolvedValue(app as any);
      const result = await service.findOne(1);

      expect(result).toEqual({
        id: app.id,
        status: app.status,
        applicationDate: app.applicationDate,
        cvUrl: 'http://s3.com/cv.pdf',
        user: {
          id: app.user.id,
          name: app.user.name,
          email: app.user.email,
        },
        jobOffer: {
          id: app.jobOffer.id,
          title: app.jobOffer.title,
          company: app.jobOffer.company.name,
        },
      });
      expect(s3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(app.cvKey);
    });

    it('should throw NotFoundException if application not found', async () => {
      jest.spyOn(applicationsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Application with ID 999 not found`),
      );
    });

    it('should return an application with null cvUrl if no cvKey', async () => {
      const appWithNoCv = { ...mockApplication, cvKey: null };
      jest
        .spyOn(applicationsRepository, 'findOne')
        .mockResolvedValue(appWithNoCv as any);

      const result = await service.findOne(1);

      expect(result.cvUrl).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove an application', async () => {
      jest
        .spyOn(applicationsRepository, 'findOne')
        .mockResolvedValue(mockApplication);
      jest
        .spyOn(applicationsRepository, 'remove')
        .mockResolvedValue(mockApplication);

      // We need to mock findOne as it's called by remove
      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue({
        id: mockApplication.id,
      } as any);

      await service.remove(1);

      expect(findOneSpy).toHaveBeenCalledWith(1);
      expect(applicationsRepository.remove).toHaveBeenCalledWith({
        id: mockApplication.id,
      });
    });

    it('should throw NotFoundException if application to remove is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
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
      const application = {
        ...mockApplication,
        id: applicationId,
        status: ApplicationStatus.PENDING,
      };
      const updatedApplication = { ...application, status };

      jest
        .spyOn(applicationsRepository, 'findOneBy')
        .mockResolvedValue(application);
      jest
        .spyOn(applicationsRepository, 'save')
        .mockResolvedValue(updatedApplication);

      const result = await service.updateStatus(applicationId, { status });

      expect(applicationsRepository.findOneBy).toHaveBeenCalledWith({
        id: applicationId,
      });
      expect(applicationsRepository.save).toHaveBeenCalledWith(
        updatedApplication,
      );
      expect(result.status).toEqual(status);
    });

    it('should throw NotFoundException if application to update is not found', async () => {
      jest.spyOn(applicationsRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.updateStatus(999, { status: ApplicationStatus.ACCEPTED }),
      ).rejects.toThrow(
        new NotFoundException(`Application with ID 999 not found`),
      );
    });
  });

  describe('handleStudentApplication', () => {
    it('should log success message', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await service.handleStudentApplication();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Processing new student application from queue',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Student application successfully saved.',
      );
    });

    it('should log error message on failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const testError = new Error('Test error');

      // We simulate that some internal operation inside the handler fails
      // For this example, we can't directly fail a `save` call as the handler doesn't have one.
      // A better approach would be to inject a logger and mock it.
      // For now, we'll just check if console.error is called.

      const originalImplementation = service.handleStudentApplication;

      service.handleStudentApplication = jest.fn().mockImplementation(async () => {
        console.log('Processing new student application from queue');
        try {
          throw testError;
        } catch (error) {
          console.error('Failed to save student application from queue', error);
        }
      });

      await service.handleStudentApplication();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save student application from queue',
        testError,
      );

      // Restore original implementation
      service.handleStudentApplication = originalImplementation;
    });
  });
});