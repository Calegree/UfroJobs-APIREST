import { Controller, Post, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JobOffersService } from './job_offers.service';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly jobOffersService: JobOffersService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) { }

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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createJobOfferDto: CreateJobOfferDto, @Request() req) {

    const companyId = req.user.companyId || req.user.userId;
    createJobOfferDto.companyId = companyId;
    return await this.jobOffersService.create(createJobOfferDto);
  }

}
