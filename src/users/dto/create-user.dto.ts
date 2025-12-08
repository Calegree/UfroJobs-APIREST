import { UserRole, UserState } from '../users.entity';
import { IsString, IsEmail, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  career?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsString()
  @IsOptional()
  rut?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  cvKey?: string;

  @IsArray()
  @IsOptional()
  titles?: string[];

  @IsString()
  @IsOptional()
  cv?: string;

  @IsArray()
  @IsOptional()
  applications?: number[];

  @IsEnum(UserState)
  @IsOptional()
  state?: UserState;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}