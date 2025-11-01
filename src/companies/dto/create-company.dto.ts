import { CompanyState } from '../entities/company.entity';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  MinLength,
  IsArray,
  IsEnum,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  pass: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('CL', {
    message: 'El número de teléfono debe ser un número chileno válido.',
  })
  phone: string;

  @IsEmail({}, { message: 'El email proporcionado no es válido.' })
  @IsNotEmpty({ message: 'El email no puede estar vacío.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  localization: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL web proporcionada no es válida.' })
  web?: string;

  @IsOptional()
  @IsArray()
  documents?: string[];

  @IsOptional()
  @IsEnum(CompanyState)
  state?: CompanyState;
}
