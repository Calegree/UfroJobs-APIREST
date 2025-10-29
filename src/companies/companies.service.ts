import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyState } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create(createCompanyDto);
    return this.companyRepo.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find();
  }
  async findByEmail(email: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.companyRepo.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepo.delete(id);
  }

  async count(): Promise<number> {
    return this.companyRepo.count();
  }

  async toggleState(id: number): Promise<Company> {
    const company = await this.findOne(id);
    if (!company) throw new Error('Compañía no encontrada');
    company.state = company.state === CompanyState.ACTIVO ? CompanyState.BANEADO : CompanyState.ACTIVO;
    return this.companyRepo.save(company);
  }
}
