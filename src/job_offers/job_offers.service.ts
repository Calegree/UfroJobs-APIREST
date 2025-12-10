import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository, In } from 'typeorm';
import { JobOffer, JobOfferState } from './entities/job_offer.entity';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Application } from '../applications/entities/application.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepo: Repository<JobOffer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly s3Service: S3Service,
  ) { }

  async create(createJobOfferDto: CreateJobOfferDto): Promise<JobOffer> {
    const existingOffer = await this.jobOfferRepo.findOne({
      where: { title: createJobOfferDto.title, companyId: createJobOfferDto.companyId },
    });
    if (existingOffer) {
      throw new Error('A job offer with this title already exists for the company.');
    }

    const jobOffer = this.jobOfferRepo.create(createJobOfferDto);
    this.applyCreateDefaults(jobOffer as any);

    

    const newJobOffer = await this.jobOfferRepo.save(jobOffer);

    try {
 
      this.rabbitClient.emit('job_offer_created', { id: newJobOffer.id });
    }
    catch (error) {
      console.error('Failed to emit job_offer_created event:', error);
    }


    return newJobOffer;
  }

  async findAll(): Promise<JobOffer[]> {
    return this.jobOfferRepo.find();
  }

  private applyCreateDefaults(jobOffer: any): void {
    if (!('publishedAt' in jobOffer) || !jobOffer.publishedAt) {
      jobOffer.publishedAt = new Date();
    }
    if (!jobOffer.state) {
      jobOffer.state = JobOfferState.ACTIVO;
    }
  }

  async findOne(id: number): Promise<JobOffer> {
    const jobOffer = await this.jobOfferRepo.findOne({ where: { id } });
    if (!jobOffer) throw new NotFoundException('Job offer not found');
    return jobOffer;
  }

  async update(id: number, updateJobOfferDto: UpdateJobOfferDto): Promise<JobOffer> {
    await this.jobOfferRepo.update(id, updateJobOfferDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.jobOfferRepo.delete(id);
  }

  async findByCompany(companyId: number) {
    return this.jobOfferRepo.find({
      where: { companyId },
      order: { publishedAt: 'DESC' }
    });
  }

  async findApplicantsByOffer(offerId: number) {
    const offer = await this.jobOfferRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Job offer not found');
    if (!offer.applicants || offer.applicants.length === 0) return [];
    return this.userRepo.findBy({ id: In(offer.applicants) });
  }

  async toggleState(id: number): Promise<JobOffer> {
    const offer = await this.findOne(id);
    if (!offer) throw new NotFoundException('Job offer not found');
    offer.state = offer.state === JobOfferState.ACTIVO ? JobOfferState.INACTIVO : JobOfferState.ACTIVO;
    return this.jobOfferRepo.save(offer);
  }

  async getApplicantsWithDetails(jobOfferId: number) {
    const offer = await this.findOne(jobOfferId);
    if (!offer) {
      throw new NotFoundException('Job offer not found');
    }

    const applications = await this.applicationRepo.find({
      where: { jobOfferId },
      relations: ['user'],
      order: { applicationDate: 'DESC' },
    });

    const applicantsWithDetails = await Promise.all(
      applications.map(async (app) => {
        let cvUrl: string | null = null;
        if (app.cvKey) {
          try {
            cvUrl = await this.s3Service.getPresignedDownloadUrl(app.cvKey);
          } catch (error) {
            console.error(`Error generating CV URL for application ${app.id}:`, error);
          }
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
            phone: app.user.phone,
            career: app.user.career,
          },
        };
      })
    );

    return applicantsWithDetails;
  }
}
