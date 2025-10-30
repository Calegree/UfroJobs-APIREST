import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from '../users/users.entity';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(JobOffer)
    private jobOffersRepository: Repository<JobOffer>,
    private s3Service: S3Service,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const { userId, jobOfferId , cvKey} = createApplicationDto;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const jobOffer = await this.jobOffersRepository.findOneBy({
      id: jobOfferId,
    });
    if (!jobOffer) {
      throw new NotFoundException(`Job offer with ID ${jobOfferId} not found`);
    }

    const existingApplication = await this.applicationsRepository.findOne({
      where: { user: { id: userId }, jobOffer: { id: jobOfferId } },
    });

    if (existingApplication) {
      throw new ConflictException('User has already applied to this job offer');
    }

    const applicationCvKey = cvKey || user.cvKey;

    if (!applicationCvKey) {
      throw new ConflictException('No CV found for this application');
    }

    const application = this.applicationsRepository.create({
      user: user,
      jobOffer: jobOffer,
      cvKey: applicationCvKey,
    });

    const newApplication = await this.applicationsRepository.save(application);

    return this.findOne(newApplication.id);
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
}
