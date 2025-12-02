import { IsString, IsEmail, MinLength, IsArray, IsOptional, IsUrl } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
    @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  phone: string;

  @IsString()
  career: string;

  @IsString()
  academicYear: string;

  @IsString()
  studentId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

}


export class RegisterCompanyDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  web?: string;

  @IsString()
  rut: string;

  @IsString()
  localization: string;

  @IsString()
  description: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsArray()
  @IsString({ each: true })
  documentKeys: string[];
}
