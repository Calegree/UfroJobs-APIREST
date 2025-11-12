import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL is not defined in the environment variables');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'main_queue', // Una cola principal para comandos
              queueOptions: {
                durable: true, // La cola sobrevive a reinicios del broker
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [RabbitmqService],
  exports: [ClientsModule, RabbitmqService],
})
export class RabbitMQModule {}