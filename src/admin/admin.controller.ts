import { Controller, Get, Patch, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { EmailService } from '../email/email.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) {}

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
  //  rabbitMQ recibe un evento company approved y este lo deriva a quien este escuchando la etiqueta admin approved
  @EventPattern('company_approved')
  async handleCompanyApproved(@Payload() data: { companyId: number; email: string; name: string }) {
    await this.emailService.sendCompanyApprovedEmail(data.email, data.name);
  }

  @EventPattern('company_rejected')
  async handleCompanyRejected(@Payload() data: { companyId: number; email: string; name: string }) {
    await this.emailService.sendCompanyRejectedEmail(data.email, data.name);
  }
}
