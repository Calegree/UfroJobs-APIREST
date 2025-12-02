import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from '../job_offers/entities/job_offer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// Mock de los servicios y repositorios que usa el controlador
const mockAdminService = {
  getPendingCompanies: jest.fn(),
  approveCompany: jest.fn(),
  rejectCompany: jest.fn(),
};

const mockCompaniesService = {
  count: jest.fn(),
};

const mockUsersService = {
  countEstudiantes: jest.fn(),
};

const mockJobOfferRepo = {
  query: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: getRepositoryToken(JobOffer),
          useValue: mockJobOfferRepo,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }) // Simula que el usuario está autenticado
    .overrideGuard(RolesGuard).useValue({ canActivate: () => true }) // Simula que el usuario tiene el rol correcto
    .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  // Limpia los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingCompanies', () => {
    it('should return pending companies from adminService', async () => {
      const result = [{ id: 1, name: 'Pending Corp' }];
      mockAdminService.getPendingCompanies.mockResolvedValue(result);

      expect(await controller.getPendingCompanies()).toBe(result);
      expect(mockAdminService.getPendingCompanies).toHaveBeenCalledTimes(1);
    });
  });

  describe('approveCompany', () => {
    it('should call adminService to approve a company', async () => {
      const companyId = 1;
      const approvedCompany = { id: companyId, status: 'approved' };
      mockAdminService.approveCompany.mockResolvedValue(approvedCompany);

      expect(await controller.approveCompany(companyId)).toBe(approvedCompany);
      expect(mockAdminService.approveCompany).toHaveBeenCalledWith(companyId);
    });
  });

  describe('rejectCompany', () => {
    it('should call adminService to reject a company', async () => {
      const companyId = 1;
      const rejectedCompany = { id: companyId, status: 'rejected' };
      mockAdminService.rejectCompany.mockResolvedValue(rejectedCompany);

      expect(await controller.rejectCompany(companyId)).toBe(rejectedCompany);
      expect(mockAdminService.rejectCompany).toHaveBeenCalledWith(companyId);
    });
  });

  describe('getUserDistribution', () => {
    it('should return the distribution of users', async () => {
      mockCompaniesService.count.mockResolvedValue(10);
      mockUsersService.countEstudiantes.mockResolvedValue(50);

      const result = await controller.getUserDistribution();

      expect(result).toEqual([
        { name: 'Estudiantes', value: 50, color: '#4285F4' },
        { name: 'Empresas', value: 10, color: '#1ABC9C' },
      ]);
      expect(mockCompaniesService.count).toHaveBeenCalledTimes(1);
      expect(mockUsersService.countEstudiantes).toHaveBeenCalledTimes(1);
    });
  });

  describe('getJobOffersByMonth', () => {
    it('should return job offers count grouped by month', async () => {
      const queryResult = [
        { month: '2025-10', count: '5' },
        { month: '2025-11', count: '8' },
      ];
      mockJobOfferRepo.query.mockResolvedValue(queryResult);

      const result = await controller.getJobOffersByMonth();

      expect(result).toEqual([
        { month: '2025-10', job_offers: 5 },
        { month: '2025-11', job_offers: 8 },
      ]);
      expect(mockJobOfferRepo.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTotalCompanies', () => {
    it('should return the total number of companies', async () => {
      mockCompaniesService.count.mockResolvedValue(25);

      const result = await controller.getTotalCompanies();

      expect(result).toEqual({ total: 25 });
      expect(mockCompaniesService.count).toHaveBeenCalledTimes(1);
    });
  });
});