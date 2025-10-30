import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum CompanyState {
  ACTIVO = 'activo',
  BANEADO = 'baneado',
  PENDIENTE = 'pendiente',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  logo?: string; // foto

  @Column()
  @IsNotEmpty()
  @IsString()
  pass: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  rut: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ default: 'Temuco, Chile' })
  @IsString()
  localization: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  web?: string; // link

  @Column('text')
  @IsString()
  description: string;

  @Column('text', { array: true, nullable: true })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  documents?: string[]; // links a S3

  @Column({ type: 'enum', enum: CompanyState, default: CompanyState.PENDIENTE })
  @IsEnum(CompanyState)
  state: CompanyState;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;
}
