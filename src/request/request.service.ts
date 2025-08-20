import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestState } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepo: Repository<Request>,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const request = this.requestRepo.create(createRequestDto);
    return this.requestRepo.save(request);
  }

  findAll() {
    return `This action returns all request`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }

  async countByState(state: RequestState): Promise<number> {
    return this.requestRepo.count({ where: { state } });
  }

  async countAll(): Promise<number> {
    return this.requestRepo.count();
  }
}
