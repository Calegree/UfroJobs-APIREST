import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company, CompanyState } from '../companies/entities/company.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

describe('AdminService', () => {
  let service: AdminService;
  let companyRepository: Repository<Company>;
  let clientProxy: ClientProxy;

  const mockCompanyRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingCompanies', () => {
    it('should return an array of pending companies', async () => {
      const companies = [new Company(), new Company()];
      mockCompanyRepository.find.mockReturnValue(companies);

      const result = await service.getPendingCompanies();

      expect(result).toEqual(companies);
      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: { state: CompanyState.PENDIENTE },
      });
    });
  });

  describe('approveCompany', () => {
    it('should approve a company and emit an event', async () => {
      const company = {
        id: 1,
        state: CompanyState.PENDIENTE,
        email: 'test@test.com',
        name: 'Test Company',
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(company);
      mockCompanyRepository.save.mockImplementation((comp) => Promise.resolve(comp));

      const result = await service.approveCompany(1);

      expect(result.state).toEqual(CompanyState.ACTIVO);
      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCompanyRepository.save).toHaveBeenCalledWith(expect.objectContaining({ state: CompanyState.ACTIVO }));
      expect(mockClientProxy.emit).toHaveBeenCalledWith('company_approved', {
        companyId: 1,
        email: 'test@test.com',
        name: 'Test Company',
      });
    });

    it('should throw a NotFoundException if company not found', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.approveCompany(1)).rejects.toThrow(NotFoundException);
      expect(mockClientProxy.emit).not.toHaveBeenCalled();
    });
  });

  describe('rejectCompany', () => {
    it('should reject a company and emit an event', async () => {
      const company = {
        id: 1,
        state: CompanyState.PENDIENTE,
        email: 'test@test.com',
        name: 'Test Company',
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(company);
      mockCompanyRepository.save.mockImplementation((comp) => Promise.resolve(comp));

      const result = await service.rejectCompany(1);

      expect(result.state).toEqual(CompanyState.BANEADO);
      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCompanyRepository.save).toHaveBeenCalledWith(expect.objectContaining({ state: CompanyState.BANEADO }));
      expect(mockClientProxy.emit).toHaveBeenCalledWith('company_rejected', {
        companyId: 1,
        email: 'test@test.com',
        name: 'Test Company',
      });
    });

    it('should throw a NotFoundException if company not found', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.rejectCompany(1)).rejects.toThrow(NotFoundException);
      expect(mockClientProxy.emit).not.toHaveBeenCalled();
    });
  });
});
