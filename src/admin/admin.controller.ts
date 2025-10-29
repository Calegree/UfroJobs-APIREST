import { Controller, Get, Patch, Param } from '@nestjs/common';
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
}
