import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices'; // Añadir EventPattern y Payload
import { JobOffersService } from './job_offers.service';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly jobOffersService: JobOffersService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  // --- Endpoint de prueba para enviar un evento ---
  @Post('test-postulacion')
  testPostulacion() {
    const postulacion = {
      id_oferta: 999,
      id_usuario: 1,
      mensaje: "Esta es una postulación de prueba desde la API.",
    };
    this.client.emit('nueva_postulacion', postulacion);
    return { message: 'Evento de postulación enviado a la cola.', data: postulacion };
  }
  // --- Fin del endpoint de prueba ---

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
