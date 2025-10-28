import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestState } from './entities/request.entity';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';

@Controller('request')
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    this.client.emit('student_applied', createRequestDto);
    return { message: 'Application is being processed.' };
  }

  // --- CONSUMIDOR ---
  @EventPattern('student_applied')
  async handleStudentApplication(@Payload() data: CreateRequestDto) {
    console.log('Processing new student application from queue');
    try {
      await this.requestService.create(data);
      console.log('Student application successfully saved.');
    } catch (error) {
      console.error('Failed to save student application from queue', error);
    }
  }

  @Get()
  findAll() {
    return this.requestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestService.update(+id, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestService.remove(+id);
  }

  @Get('count/pending')
  async countPending() {
    const count = await this.requestService.countByState(RequestState.PENDIENTE);
    return { pending: count };
  }

  @Get('count/approved')
  async countApproved() {
    const count = await this.requestService.countByState(RequestState.APROBADA);
    return { approved: count };
  }

  @Get('count/rejected')
  async countRejected() {
    const count = await this.requestService.countByState(RequestState.RECHAZADA);
    return { rejected: count };
  }

  @Get('count/total')
  async countTotal() {
    const count = await this.requestService.countAll();
    return { total: count };
  }
}
