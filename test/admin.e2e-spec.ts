import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company, CompanyState } from '../src/companies/entities/company.entity';
import { User, UserRole, UserState } from '../src/users/users.entity';
import { JobOffer } from '../src/job_offers/entities/job_offer.entity';
import { Application } from '../src/applications/entities/application.entity';
import { Connection, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../src/email/email.service';
import { ClientProxy } from '@nestjs/microservices';

// Mock para RabbitMQ
const mockRabbitMQ = {
  emit: jest.fn(),
};

// Mock para EmailService
const mockEmailService = {
  sendCompanyApprovedEmail: jest.fn(),
};

describe('Admin/Dashboard Flow (e2e)', () => {
  let app: INestApplication;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let jobOfferRepository: Repository<JobOffer>;
  let applicationRepository: Repository<Application>;
  let jwtService: JwtService;
  let adminToken: string;
  let pendingCompany: Company;
  let adminUser: User;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('RABBITMQ_SERVICE')
      .useValue(mockRabbitMQ)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    companyRepository = moduleFixture.get(getRepositoryToken(Company));
    userRepository = moduleFixture.get(getRepositoryToken(User));
    jobOfferRepository = moduleFixture.get(getRepositoryToken(JobOffer));
    applicationRepository = moduleFixture.get(getRepositoryToken(Application));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    connection = moduleFixture.get(Connection);
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar mocks y base de datos
    mockRabbitMQ.emit.mockClear();
    mockEmailService.sendCompanyApprovedEmail.mockClear();
    await applicationRepository.query('DELETE FROM "applications"');
    await jobOfferRepository.query('DELETE FROM "job_offers"');
    await companyRepository.query('DELETE FROM "companies"');
    await userRepository.query('DELETE FROM "users"');

    // 1. Crear un usuario administrador
    adminUser = await userRepository.save(
      userRepository.create({
        name: 'Admin E2E User',
        email: `admin-e2e-${Date.now()}@ufromail.cl`,
        password: 'adminpassword',
        role: UserRole.ADMIN,
        state: UserState.ACTIVE,
      }),
    );

    // 2. Crear una empresa pendiente
    pendingCompany = await companyRepository.save(
      companyRepository.create({
        name: 'Pending Test Company',
        pass: 'aSecurePassword123!',
        rut: `11.111.111-1`,
        phone: '+56911111111',
        email: `pending-${Date.now()}@company.com`,
        state: CompanyState.PENDIENTE,
        description: 'A company waiting for approval.',
      }),
    );

    // 3. Generar token JWT para el admin
    const payload = { sub: adminUser.id, role: adminUser.role };
    adminToken = jwtService.sign(payload);
  });

  describe('Company Approval Flow', () => {
    it('should approve a pending company, update its state, and emit an event', async () => {
      // --- Parte 1: Probar el endpoint de aprobación ---

      // 4. Llamar al endpoint para aprobar la empresa
      const response = await request(app.getHttpServer())
        .patch(`/admin/dashboard/approve-company/${pendingCompany.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 5. Verificar que el estado de la empresa ahora es ACTIVO
      expect(response.body.state).toEqual(CompanyState.ACTIVO);

      const updatedCompany = await companyRepository.findOne({
        where: { id: pendingCompany.id },
      });
      expect(updatedCompany).not.toBeNull();
      expect(updatedCompany!.state).toEqual(CompanyState.ACTIVO);

      // 6. Verificar que el evento 'company_approved' fue emitido a RabbitMQ
      expect(mockRabbitMQ.emit).toHaveBeenCalledTimes(1);
      expect(mockRabbitMQ.emit).toHaveBeenCalledWith('company_approved', {
        companyId: pendingCompany.id,
        email: pendingCompany.email,
        name: pendingCompany.name,
      });

      // --- Parte 2: Probar el consumidor del evento ---
      // El consumidor se ejecuta en el AdminController. Podemos simular su ejecución
      // para verificar que llama al EmailService.
      const { AdminController } = await import('../src/admin/admin.controller');
      const mockAdminService = {
        approveCompany: jest.fn(),
        rejectCompany: jest.fn(),
        getPendingCompanies: jest.fn(),
      };
      const adminController = new AdminController(
        mockAdminService as any,
        mockEmailService as any,
      );

      const eventPayload = {
        companyId: pendingCompany.id,
        email: pendingCompany.email,
        name: pendingCompany.name,
      };

      // 7. Ejecutar manualmente el manejador de eventos
      await adminController.handleCompanyApproved(eventPayload);

      // 8. Verificar que el servicio de email fue llamado (simulando el envío de correo)
      expect(mockEmailService.sendCompanyApprovedEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendCompanyApprovedEmail).toHaveBeenCalledWith(
        eventPayload.email,
        eventPayload.name,
      );
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/dashboard/approve-company/${pendingCompany.id}`)
        .expect(401);
    });

    it('should return 403 Forbidden if user is not an admin', async () => {
      // Crear un usuario estudiante
      const studentUser = await userRepository.save(
        userRepository.create({
          name: 'Student E2E User',
          email: `student-e2e-${Date.now()}@ufromail.cl`,
          password: 'studentpassword',
          role: UserRole.STUDENT,
        }),
      );
      const studentToken = jwtService.sign({ sub: studentUser.id, role: studentUser.role });

      await request(app.getHttpServer())
        .patch(`/admin/dashboard/approve-company/${pendingCompany.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 404 Not Found if company does not exist', async () => {
        const nonExistentId = 9999;
        await request(app.getHttpServer())
            .patch(`/admin/dashboard/approve-company/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(404);
    });
  });
});
