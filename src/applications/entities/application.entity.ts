import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { JobOffer } from '../../job_offers/entities/job_offer.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.applications, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => JobOffer, (jobOffer) => jobOffer.applicants, {
    eager: true,
  })
  @JoinColumn({ name: 'jobOfferId' })
  jobOffer: JobOffer;

  @Column()
  jobOfferId: number;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ nullable: true })
  cvKey: string;

  @CreateDateColumn()
  applicationDate: Date;
}
