import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async create(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('Token de usuario inválido');
    }
    return this.favoritesService.create(createFavoriteDto, userId);
  }

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('Token de usuario inválido');
    }
    return this.favoritesService.findByUser(userId);
  }

  @Delete(':jobId')
  async remove(@Param('jobId', ParseIntPipe) jobId: number, @Request() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException('Token de usuario inválido');
    }
    return this.favoritesService.remove(userId, jobId);
  }
}
