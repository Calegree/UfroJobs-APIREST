import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  ForbiddenException, 
} from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post()
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ) {
    const userId = req.user.userId; 
    if (!userId) {
      throw new ForbiddenException('Token de usuario inválido');
    }
    
   
    return this.applicationsService.create(createApplicationDto, userId);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }
}