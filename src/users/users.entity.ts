import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsPhoneNumber,
  Matches // For RUT validation example
} from 'class-validator';

export enum UserState {
  ACTIVE = 'activo',      // Renamed for consistency?
  INACTIVE = 'inactivo',  // Renamed for consistency?
  PENDING_VERIFICATION = 'pendiente_verificacion', // Example state
}

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'estudiante', // Renamed for consistency?
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number; // Changed to number

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  password: string; // Hashed password

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('CL')
  phone?: string;

  @Column({ nullable: true }) // Made location optional
  @IsOptional()
  @IsString()
  location?: string;

  // --- Student Specific Fields ---
  @Column({ nullable: true }) // Career might not apply to Admin
  @IsOptional()
  @IsString()
  career?: string;

  @Column({ nullable: true }) // Academic year might not apply to Admin
  @IsOptional()
  @IsString()
  academicYear?: string;

  @Column({ nullable: true, unique: true }) // RUT could be unique for students
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, { message: 'RUT must be in format XX.XXX.XXX-X' }) // Basic RUT format validation
  rut?: string; // Student ID / RUT

  @Column('text', { array: true, default: () => "'{}'" }) // Added default
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills: string[]; // Specific field for skills

  // --- CV Field ---
  @Column({ nullable: true }) // Optional
  @IsOptional()
  @IsString()
  cvKey?: string; // Stores the S3 Key (filename), NOT a URL

  // --- Other Fields ---
  @Column('integer', { array: true, default: () => "'{}'" })
  @IsArray()
  applications: number[]; // IDs of job_offers

  @Column({ type: 'enum', enum: UserState, default: UserState.ACTIVE })
  @IsEnum(UserState)
  state: UserState;

  @CreateDateColumn({ type: 'timestamptz' }) // Use timestamptz for timezone support
  createdAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}