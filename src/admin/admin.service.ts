import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyState } from '../companies/entities/company.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async approveCompany(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    company.state = CompanyState.ACTIVO;
    return this.companyRepo.save(company);
  }

  async getPendingCompanies(): Promise<Company[]> {
    return this.companyRepo.find({ where: { state: CompanyState.PENDIENTE } });
  }
}
