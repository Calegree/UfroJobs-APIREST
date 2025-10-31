import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {

  @Get('pending-companies')
  getPendingCompanies() {
    return this.adminService.getPendingCompanies();
  }

  @Patch('approve-company/:id')
  approveCompany(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveCompany(id);
  }

  @Patch('reject-company/:id')
  rejectCompany(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectCompany(id);
  }

  constructor(
    private readonly companiesService: CompaniesService,
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    @InjectRepository(JobOffer)
    private readonly jobOfferRepo: Repository<JobOffer>,
  ) { }

  @Get('user-distribution')
  async getUserDistribution() {
    const empresas = await this.companiesService.count();
    const estudiantes = await this.usersService.countEstudiantes();
    return [
      { name: 'Estudiantes', value: estudiantes, color: '#4285F4' },
      { name: 'Empresas', value: empresas, color: '#1ABC9C' }
    ];
  }

  @Get('job-offers-by-month')
  async getJobOffersByMonth() {
    // Agrupa por mes y cuenta
    const result = await this.jobOfferRepo.query(`
      SELECT 
        TO_CHAR("publishedAt", 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM job_offers
      GROUP BY month
      ORDER BY month
    `);

    // Puedes devolver el array así, o mapearlo para tu frontend
    return result.map(row => ({
      month: row.month,
      job_offers: Number(row.count),
    }));
  }

  @Get('total-companies')
  async getTotalCompanies() {
    const total = await this.companiesService.count();
    return { total };
  }
}