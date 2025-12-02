import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company, CompanyState } from './entities/company.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: Repository<Company>;
  let rabbitClient: ClientProxy;

  const mockCompany: Company = {
    id: 1,
    name: 'Test Co',
    email: 'test@co.com',
    password: 'password',
    rut: '12345678-9',
    phone: '123456789',
    localization: 'Test City',
    description: 'A test company',
    state: CompanyState.ACTIVO,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    rabbitClient = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a company successfully', async () => {
      const createDto: CreateCompanyDto = {
        name: 'Test Co',
        email: 'test@co.com',
        password: 'password',
        rut: '12345678-9',
        phone: '123456789',
        localization: 'Test City',
        description: 'A test company',
      };

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(companyRepository, 'create').mockReturnValue(mockCompany);
      jest.spyOn(companyRepository, 'save').mockResolvedValue(mockCompany);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCompany);
      expect(rabbitClient.emit).toHaveBeenCalledWith('company_created', { companyId: mockCompany.id });
    });

    it('should throw a ConflictException if email already exists', async () => {
      const createDto: CreateCompanyDto = {
        name: 'Test Co',
        email: 'test@co.com',
        password: 'password',
        rut: '12345678-9',
        phone: '123456789',
        localization: 'Test City',
        description: 'A test company',
      };

      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(mockCompany);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException('El correo ya se encuentra registrado.'),
      );
    });
  });

  describe('findOne', () => {
    it('should return a company if found', async () => {
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(mockCompany);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCompany);
    });

    it('should throw a NotFoundException if company not found', async () => {
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Company not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a company successfully', async () => {
      const updateDto: UpdateCompanyDto = { name: 'Updated Test Co' };
      const updatedCompany = { ...mockCompany, ...updateDto };

      jest.spyOn(companyRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedCompany);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(updatedCompany);
    });
  });

  describe('remove', () => {
    it('should remove a company successfully', async () => {
      jest.spyOn(companyRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.remove(1);
      expect(companyRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('toggleState', () => {
    it('should toggle state from ACTIVO to BANEADO', async () => {
      const company = { ...mockCompany, state: CompanyState.ACTIVO };
      const expectedCompany = { ...mockCompany, state: CompanyState.BANEADO };

      jest.spyOn(service, 'findOne').mockResolvedValue(company);
      jest.spyOn(companyRepository, 'save').mockResolvedValue(expectedCompany);

      const result = await service.toggleState(1);
      expect(result.state).toEqual(CompanyState.BANEADO);
    });

    it('should toggle state from BANEADO to ACTIVO', async () => {
      const company = { ...mockCompany, state: CompanyState.BANEADO };
      const expectedCompany = { ...mockCompany, state: CompanyState.ACTIVO };

      jest.spyOn(service, 'findOne').mockResolvedValue(company);
      jest.spyOn(companyRepository, 'save').mockResolvedValue(expectedCompany);

      const result = await service.toggleState(1);
      expect(result.state).toEqual(CompanyState.ACTIVO);
    });

    it('should throw an error if company not found', async () => {
        jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Company not found'));
        await expect(service.toggleState(999)).rejects.toThrow(new NotFoundException('Company not found'));
    });
  });
});
