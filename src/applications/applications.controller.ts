// src/applications/applications.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Inject, // Saca @Inject
  ForbiddenException, // Añade esto
} from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Saca ClientProxy y EventPattern
// import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { UserRole } from '../users/users.entity'; // Asumiendo que tienes esto

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    // Saca el cliente RabbitMQ de aquí
  ) {}

  @Post()
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ) {
    const userId = req.user.userId; // O req.user.sub, lo que sea tu payload
    if (!userId) {
      throw new ForbiddenException('Token de usuario inválido');
    }
    
    // ¡LLAMA AL SERVICIO DIRECTAMENTE!
    // El servicio ahora hará las validaciones (404, 409)
    // y emitirá el evento a RabbitMQ.
    return this.applicationsService.create(createApplicationDto, userId);
  }

  // SACA el consumidor @EventPattern de tu controlador.
  // El consumidor de RabbitMQ debe ser un servicio separado o estar
  // en un microservicio, no en el controlador HTTP.
  /*
  @EventPattern('student_applied')
  async handleStudentApplication(...) { ... }
  */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }
}