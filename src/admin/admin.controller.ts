import { Controller, Get, Patch, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('companies/pending')
  getPendingCompanies() {
    return this.adminService.getPendingCompanies();
  }

  @Patch('companies/:id/approve')
  approveCompany(@Param('id') id: string) {
    return this.adminService.approveCompany(+id);
  }

  @Patch('companies/:id/reject')
  rejectCompany(@Param('id') id: string) {
    return this.adminService.rejectCompany(+id);
  }

  // --- Consumidor de eventos de RabbitMQ ---

  @EventPattern('company_approved')
  handleCompanyApproved(@Payload() data: { companyId: number; email: string; name: string }) {
    console.log(`[EMAIL STUB] Enviando correo de APROBACIÓN a ${data.email}`);
    console.log(`Contenido: Hola ${data.name}, tu empresa ha sido aprobada.`);
  }

  @EventPattern('company_rejected')
  handleCompanyRejected(@Payload() data: { companyId: number; email: string; name: string }) {
    console.log(`[EMAIL STUB] Enviando correo de RECHAZO a ${data.email}`);
    console.log(`Contenido: Hola ${data.name}, lamentamos informarte que tu empresa ha sido rechazada.`);
  }
}
