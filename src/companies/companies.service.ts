import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyState } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const existingCompany = await this.companyRepo.findOne({
      where: { email: createCompanyDto.email },
    });
    if (existingCompany) {
      throw new ConflictException('El correo ya se encuentra registrado.');
    }

    const company = this.companyRepo.create(createCompanyDto);
    const newCompany = await this.companyRepo.save(company);

    this.rabbitClient.emit('company_created', { companyId: newCompany.id });

    return newCompany;
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

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
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
    company.state =
      company.state === CompanyState.ACTIVO
        ? CompanyState.BANEADO
        : CompanyState.ACTIVO;
    return this.companyRepo.save(company);
  }
}
