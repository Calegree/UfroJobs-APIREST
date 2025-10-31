import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {


  @IsNotEmpty()
  @IsNumber()
  jobOfferId: number;

  @IsOptional()
  @IsString()
  cvKey?: string;
}
