import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyState } from '../companies/entities/company.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    //injection de rabbitMQ que viene desde el admin.module.ts
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getPendingCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      where: { state: CompanyState.PENDIENTE },
    });
  }

  async approveCompany(id: number): Promise<Company> {
      // 1. Se realizan las operaciones con la base de datos
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    company.state = CompanyState.ACTIVO;
    const savedCompany = await this.companyRepository.save(company);
  // 2. ¡AQUÍ OCURRE EL ENVÍO! this.client conecta con la injection de rabbitMQ
  //esto hace que el evento se emita a la cola de RabbitMQ entonces la api ya no se encarga de esto y todo pasa mas rapido  
  this.client.emit('company_approved', {
      companyId: savedCompany.id,
      email: savedCompany.email,
      name: savedCompany.name,
    });

    return savedCompany;
  }

  async rejectCompany(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    company.state = CompanyState.BANEADO;
    const savedCompany = await this.companyRepository.save(company);

    this.client.emit('company_rejected', {
      companyId: savedCompany.id,
      email: savedCompany.email,
      name: savedCompany.name,
    });

    return savedCompany;
  }
}
