import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    this.client.emit('student_applied', createApplicationDto);
    return { message: 'Application is being processed.' };
  }

  // --- CONSUMIDOR ---
  @EventPattern('student_applied')
  async handleStudentApplication(@Payload() data: CreateApplicationDto) {
    console.log('Processing new student application from queue');
    try {
      await this.applicationsService.create(data);
      console.log('Student application successfully saved.');
    } catch (error) {
      console.error('Failed to save student application from queue', error);
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }
}
