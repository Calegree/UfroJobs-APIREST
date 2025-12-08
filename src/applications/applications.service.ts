import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from '../users/users.entity';
import { JobOffer, JobOfferState } from '../job_offers/entities/job_offer.entity';
import { S3Service } from '../s3/s3.service';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { CompanyState } from '../companies/entities/company.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(JobOffer)
    private readonly jobOffersRepository: Repository<JobOffer>,
    private readonly s3Service: S3Service,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy, 
  ) { }

  async create(createApplicationDto: CreateApplicationDto, userId: number) {
    const { jobOfferId, cvKey } = createApplicationDto;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const jobOffer = await this.jobOffersRepository.findOne({
      where: { id: jobOfferId },
      relations: ['company'], 
    });
    if (!jobOffer) {
      throw new NotFoundException(`Job offer with ID ${jobOfferId} not found`); 
    }
    if (jobOffer.state !== JobOfferState.ACTIVO) {
      throw new BadRequestException('Job offer is not active');
    }

    if (jobOffer.company.state !== CompanyState.ACTIVO) {
      throw new ForbiddenException('Cannot apply to a job from an unapproved company');
    }

    const existingApplication = await this.applicationsRepository.findOne({
      where: { user: { id: userId }, jobOffer: { id: jobOfferId } },
    });

    if (existingApplication) {
      throw new ConflictException('User has already applied to this job offer');
    }

    const applicationCvKey = cvKey || user.cvKey;

    if (!applicationCvKey) {
      throw new BadRequestException('No CV found for this application');
    }

    const application = this.applicationsRepository.create({
      user: user,
      jobOffer: jobOffer,
      cvKey: applicationCvKey,
    });


    const newApplication = await this.applicationsRepository.save(application);

    this.client.emit('student_applied', {
      applicationId: newApplication.id,
      userId: userId,
      jobOfferId: jobOfferId,
      companyId: jobOffer.company.id,
    });

    return {
      id: newApplication.id,
      status: newApplication.status,
      createdAt: newApplication.applicationDate
    };
  }
  @EventPattern('student_applied')
  async handleStudentApplication() {
    console.log('Processing new student application from queue');
    try {
      console.log('Student application successfully saved.');
    } catch (error) {
      console.error('Failed to save student application from queue', error);
    }
  }


  async findOne(id: number) {
    const app = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['user', 'jobOffer', 'jobOffer.company'],
    });

    if (!app) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    let cvUrl: string | null = null;
    if (app.cvKey) {
      cvUrl = await this.s3Service.getPresignedDownloadUrl(app.cvKey);
    }

    return {
      id: app.id,
      status: app.status,
      applicationDate: app.applicationDate,
      cvUrl,
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
    };
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return this.applicationsRepository.remove(application as any);
  }

  async findAllByJobOffer(jobOfferId: number): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { jobOffer: { id: jobOfferId } },
      relations: ['user'],
    });
  }

  async findByUser(userId: number) {
    const applications = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['jobOffer', 'jobOffer.company'],
      order: { applicationDate: 'DESC' },
    });

    return applications.map(app => ({
      id: app.id,
      status: app.status,
      applicationDate: app.applicationDate,
      jobOffer: {
        id: app.jobOffer.id,
        title: app.jobOffer.title,
        company: app.jobOffer.company.name,
        location: app.jobOffer.location,
        salary: app.jobOffer.salary,
        modality: app.jobOffer.modality,
      },
    }));
  }

  async updateStatus(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOneBy({ id });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    Object.assign(application, updateApplicationDto);
    return this.applicationsRepository.save(application);
  }
}
