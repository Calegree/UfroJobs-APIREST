import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices'; // Añadir EventPattern y Payload
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { JobOffersService } from './job_offers.service'; // Asegúrate de que el servicio esté disponible

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly jobOffersService: JobOffersService, // Inyecta el servicio aquí
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createJobOfferDto: CreateJobOfferDto) {
    this.client.emit('job_offer_created', createJobOfferDto);
    return { message: 'Job offer is being processed.' };
  }

  // --- CONSUMIDOR ---
  @EventPattern('job_offer_created')
  async handleJobOfferCreated(@Payload() data: CreateJobOfferDto) {
    console.log('Processing new job offer from queue:', data.title);
    try {
      await this.jobOffersService.create(data); // Asumiendo que tienes un método 'create' en tu servicio
      console.log('Job offer successfully saved.');
    } catch (error) {
      console.error('Failed to save job offer from queue', error);
    }
  }
}
