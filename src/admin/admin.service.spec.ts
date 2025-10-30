import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company, CompanyState } from '../companies/entities/company.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let companyRepository: Repository<Company>;

  const mockCompanyRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('approveCompany', () => {
    it('should approve a company', async () => {
      const company = new Company();
      company.id = 1;
      company.state = CompanyState.PENDIENTE;

      mockCompanyRepository.findOne.mockReturnValue(company);
      mockCompanyRepository.save.mockImplementation((comp) => Promise.resolve(comp));

      const result = await service.approveCompany(1);

      expect(result.state).toEqual(CompanyState.ACTIVO);
      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCompanyRepository.save).toHaveBeenCalledWith(company);
    });

    it('should throw a NotFoundException if company not found', async () => {
      mockCompanyRepository.findOne.mockReturnValue(null);

      await expect(service.approveCompany(1)).rejects.toThrow(NotFoundException);
    });
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
});
