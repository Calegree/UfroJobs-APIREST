import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  public send(pattern: string, data: any) {
    return this.client.send(pattern, data);
  }
}