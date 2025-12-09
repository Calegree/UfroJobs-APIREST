import { Controller, Post, Body, Inject, UseGuards, Request, Get, Param, ParseIntPipe, Patch, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JobOffersService } from './job_offers.service';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';
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

  @Get()
  async findAll() {
    return this.jobOffersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobOffersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
    @Request() req
  ) {
    const companyId = req.user.companyId || req.user.userId;
    
    // Verificar que la oferta pertenece a la empresa
    const jobOffer = await this.jobOffersService.findOne(id);
    if (jobOffer.companyId !== companyId) {
      throw new Error('You are not authorized to update this job offer');
    }
    
    return this.jobOffersService.update(id, updateJobOfferDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applicants')
  async getApplicants(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    const companyId = req.user.companyId || req.user.userId;
    
    // Verificar que la oferta pertenece a la empresa
    const jobOffer = await this.jobOffersService.findOne(id);
    if (jobOffer.companyId !== companyId) {
      throw new ForbiddenException('You are not authorized to view applicants for this job offer');
    }
    
    return this.jobOffersService.getApplicantsWithDetails(id);
  }

}
