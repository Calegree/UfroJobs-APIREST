import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsPhoneNumber,
} from 'class-validator';

export enum UserState {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export enum UserRole {
  ADMIN = 'admin',
  ESTUDIANTE = 'estudiante',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

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

  @Column({ default: 'temuco, chile' })
  @IsString()
  location: string;

  @Column('text', { array: true })
  @IsArray()
  @IsString({ each: true })
  titles: string[]; // Ej: ['ingeniero informatico', 'electrico']

  @Column()
  @IsUrl()
  cv: string; // Link a S3

  @Column('integer', { array: true, default: () => "'{}'" })
  @IsArray()
  applications: number[]; // IDs de job_offers

  @Column({ type: 'enum', enum: UserState, default: UserState.ACTIVO })
  @IsEnum(UserState)
  state: UserState;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ESTUDIANTE })
  @IsEnum(UserRole)
  role: UserRole;
}