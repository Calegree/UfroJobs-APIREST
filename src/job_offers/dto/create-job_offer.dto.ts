import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray, IsOptional } from 'class-validator';

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
  @IsOptional() // Hacemos que sea opcional por ahora, pero la BD lo requiere
  tags: string[];

  @IsString()
  @IsNotEmpty()
  salary: string;

  @IsDateString()
  @IsNotEmpty()
  publication_date: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  companyId: number;
}
