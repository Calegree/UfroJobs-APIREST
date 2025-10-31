import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Company } from '../../companies/entities/company.entity';

export enum JobOfferState {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export enum JobOfferModality {
  REMOTO = 'remoto',
  HIBRIDO = 'hibrido',
  PRESENCIAL = 'presencial',
}

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column()
  @IsString()
  location: string;

  @Column()
  @IsString()
  salary: string;

  @Column('text', { array: true })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @CreateDateColumn()
  publishedAt: Date;

  @Column('integer', { array: true, default: () => 'ARRAY[]::integer[]' })
  @IsArray()
  @IsNumber({}, { each: true })
  applicants: number[];

  @Column('text')
  @IsString()
  description: string;

  @Column('text', { array: true })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @Column()
  @IsString()
  worktime: string; 

  @Column({ type: 'enum', enum: JobOfferModality })
  @IsEnum(JobOfferModality)
  modality: JobOfferModality;

  @Column({ type: 'enum', enum: JobOfferState, default: JobOfferState.ACTIVO })
  @IsEnum(JobOfferState)
  state: JobOfferState;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column('increment')
  companyId: number;
}
