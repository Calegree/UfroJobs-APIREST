import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray, IsOptional } from 'class-validator';
import { JobOfferModality } from '../entities/job_offer.entity';

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
  salary?: string;

  @IsString()
  @IsNotEmpty()
  worktime: string;

  @IsString()
  @IsNotEmpty()
  modality: JobOfferModality;


  @IsDateString()
  @IsNotEmpty()
  publication_date: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}
