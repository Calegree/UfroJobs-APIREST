import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CompanyState } from '../src/companies/entities/company.entity';
import { CompaniesService } from '../src/companies/companies.service';

describe('CompaniesController (e2e)', () => {
  let app: INestApplication;
  let companiesService: CompaniesService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    companiesService = moduleFixture.get<CompaniesService>(CompaniesService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/companies (POST) - should register a company with a PENDING state', async () => {
    const createCompanyDto = {
      name: 'Test Company',
      pass: 'aSecurePassword123!',
      rut: '99.999.999-9',
      phone: '+56999999999',
      email: `test-${Date.now()}@company.com`, 
      localization: 'Test City, Chile',
      web: 'https://testcompany.com',
      description: 'A test company for e2e testing.',
      industry: 'Testing',
      size: '1-10 employees',
    };

    return request(app.getHttpServer())
      .post('/companies')
      .send(createCompanyDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toBeDefined();
        expect(response.body.name).toEqual(createCompanyDto.name);
        expect(response.body.state).toEqual(CompanyState.PENDIENTE);
      });
  });

  it('/companies (POST) - should return 409 for duplicate email', async () => {
    const uniqueEmail = `duplicate-${Date.now()}@company.com`;
    const createCompanyDto = {
      name: 'Another Test Company',
      pass: 'aSecurePassword123!',
      rut: '22.222.222-2',
      phone: '+56922222222',
      email: uniqueEmail,
      localization: 'Another Test City, Chile',
      web: 'https://anothertestcompany.com',
      description: 'Another test company for e2e testing.',
      industry: 'Testing',
      size: '1-10 employees',
    };

    await request(app.getHttpServer())
      .post('/companies')
      .send(createCompanyDto)
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/register-company')
      .send(createCompanyDto)
      .expect(409)
      .then((response) => {
        expect(response.body.message).toContain('El correo ya se encuentra registrado.');
      });
  });
});