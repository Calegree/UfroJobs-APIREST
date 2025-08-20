import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOfferDto } from './create-job_offer.dto';

export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {}
