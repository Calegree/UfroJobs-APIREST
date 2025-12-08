import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from '../users/users.entity';
import { JobOffer } from '../job_offers/entities/job_offer.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(JobOffer)
    private readonly jobOffersRepository: Repository<JobOffer>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, userId: number) {
    const { jobOfferId } = createFavoriteDto;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const jobOffer = await this.jobOffersRepository.findOne({
      where: { id: jobOfferId },
      relations: ['company'],
    });
    if (!jobOffer) {
      throw new NotFoundException(`Job offer with ID ${jobOfferId} not found`);
    }

    const existingFavorite = await this.favoritesRepository.findOne({
      where: { userId, jobOfferId },
    });

    if (existingFavorite) {
      throw new ConflictException('Job offer is already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      user,
      userId,
      jobOffer,
      jobOfferId,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);

    return {
      id: savedFavorite.id,
      userId: savedFavorite.userId,
      jobOfferId: savedFavorite.jobOfferId,
      createdAt: savedFavorite.createdAt,
    };
  }

  async findByUser(userId: number) {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      relations: ['jobOffer', 'jobOffer.company'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map(fav => ({
      id: fav.id,
      createdAt: fav.createdAt,
      jobOffer: {
        id: fav.jobOffer.id,
        title: fav.jobOffer.title,
        company: fav.jobOffer.company.name,
        location: fav.jobOffer.location,
        salary: fav.jobOffer.salary,
        modality: fav.jobOffer.modality,
        tags: fav.jobOffer.tags,
        publishedAt: fav.jobOffer.publishedAt,
        description: fav.jobOffer.description,
        requirements: fav.jobOffer.requirements,
        state: fav.jobOffer.state,
      },
    }));
  }

  async remove(userId: number, jobOfferId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, jobOfferId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
    return { message: 'Favorite removed successfully' };
  }
}
