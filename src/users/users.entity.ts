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
  Matches
} from 'class-validator';

export enum UserState {
  ACTIVE = 'activo',      
  INACTIVE = 'inactivo',  
  PENDING_VERIFICATION = 'pendiente_verificacion', 
}

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'estudiante',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
  password: string; 

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('CL')
  phone?: string;

  @Column({ nullable: true }) 
  @IsOptional()
  @IsString()
  location?: string;

  @Column({ nullable: true }) 
  @IsOptional()
  @IsString()
  career?: string;

  @Column({ nullable: true }) 
  @IsOptional()
  @IsString()
  academicYear?: string;

  @Column({ nullable: true, unique: true }) 
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, { message: 'RUT must be in format XX.XXX.XXX-X' }) 
  rut?: string; 

  @Column('text', { array: true, default: () => "'{}'" }) 
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills: string[]; 

  @Column({ nullable: true }) 
  @IsOptional()
  @IsString()
  cvKey?: string; 

  @Column('integer', { array: true, default: () => "'{}'" })
  @IsArray()
  applications: number[]; 

  @Column({ type: 'enum', enum: UserState, default: UserState.ACTIVE })
  @IsEnum(UserState)
  state: UserState;

  @CreateDateColumn({ type: 'timestamptz' }) 
  createdAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}