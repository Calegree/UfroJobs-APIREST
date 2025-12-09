import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';
import { JobOfferModality, JobOfferState } from '../entities/job_offer.entity';

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @IsString()
  @IsNotEmpty()
  salary: string;

  @IsString()
  @IsNotEmpty()
  worktime: string;

  @IsEnum(JobOfferModality)
  @IsNotEmpty()
  modality: JobOfferModality;

  @IsEnum(JobOfferState)
  @IsOptional()
  state?: JobOfferState;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}
