import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestState } from './entities/request.entity';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
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
