import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyState } from '../companies/entities/company.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async getPendingCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      where: { state: CompanyState.PENDIENTE },
    });
  }

  async approveCompany(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    company.state = CompanyState.ACTIVO;
    return this.companyRepository.save(company);
  }

  async rejectCompany(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    company.state = CompanyState.BANEADO;
    return this.companyRepository.save(company);
  }
}
