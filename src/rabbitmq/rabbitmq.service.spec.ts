import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqService } from './rabbitmq.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('RabbitmqService', () => {
  let service: RabbitmqService;
  let client: ClientProxy;

  const mockRabbitMQClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqService,
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: mockRabbitMQClient,
        },
      ],
    }).compile();

    service = module.get<RabbitmqService>(RabbitmqService);
    client = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send a message with the given pattern and data', () => {
      const pattern = 'test_pattern';
      const data = { message: 'test_message' };
      const expectedResponse = { status: 'ok' };
      mockRabbitMQClient.send.mockReturnValue(of(expectedResponse));

      const result = service.send(pattern, data);

      expect(client.send).toHaveBeenCalledWith(pattern, data);
      result.subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });
    });
  });
});
