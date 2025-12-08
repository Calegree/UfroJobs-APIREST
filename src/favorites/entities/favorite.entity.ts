import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { JobOffer } from '../../job_offers/entities/job_offer.entity';

@Entity('favorites')
@Unique(['user', 'jobOffer'])
export class Favorite {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => JobOffer, { eager: true })
  @JoinColumn({ name: 'jobOfferId' })
  jobOffer: JobOffer;

  @Column()
  jobOfferId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
