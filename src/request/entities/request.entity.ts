import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum RequestState {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column('integer')
  companyId: number;

  @Column({ type: 'enum', enum: RequestState, default: RequestState.PENDIENTE })
  state: RequestState;

  @CreateDateColumn()
  createdAt: Date;

  @Column('text', { array: true, nullable: true })
  documents: string[]; // links a los documentos adjuntos
}
