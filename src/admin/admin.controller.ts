import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { EmailService } from '../email/email.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) {}

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
