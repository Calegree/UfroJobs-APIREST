import { UserRole, UserState } from "src/users/users.entity";
import { IsString, IsEmail, MinLength, IsArray, IsOptional, IsUrl } from 'class-validator';

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  @IsString()
  name: string; // Viene de formData.fullName

  @IsEmail()
  email: string; // Viene de formData.email

  @IsString()
  @MinLength(8)
  password: string; // Viene de formData.password

  @IsString()
  phone: string; // Viene de formData.phone

  // Campos específicos de Estudiante (¡NUEVOS!)
  @IsString()
  career: string; // Viene de formData.career

  @IsString()
  academicYear: string; // Viene de formData.academicYear

  @IsString()
  studentId: string; // RUT, viene de formData.studentId

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]; // Viene de formData.skills (separado por comas)

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
  pass: string;
  
  // Esto recibirá el array ['1678886400000-rut.pdf', '1678886400001-sii.pdf']
  @IsArray()
  @IsString({ each: true })
  documentKeys: string[];
}
