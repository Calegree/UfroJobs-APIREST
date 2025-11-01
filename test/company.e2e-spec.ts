import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Company, CompanyState } from '../src/companies/entities/company.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Mock para RabbitMQ
const mockRabbitMQ = {
  emit: jest.fn(),
};

describe('CompaniesController (e2e) - Flujo 2: Registro de Empresa', () => {
  let app: INestApplication;
  let companyRepository: Repository<Company>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('RABBITMQ_SERVICE')
      .useValue(mockRabbitMQ)
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
  });

  beforeEach(async () => {
    // Limpiar mocks y base de datos
    mockRabbitMQ.emit.mockClear();
    await companyRepository.query('DELETE FROM "companies"');
  });

  afterAll(async () => {
    await app.close();
  });

  it('IT-1: debe registrar una empresa con estado PENDIENTE (Camino Feliz)', async () => {
    console.log('\n\n--- [IT-1: Registro Exitoso de Empresa] ---');
    const createCompanyDto = {
      name: 'Test Company',
      pass: 'aSecurePassword123!',
      rut: '99.999.999-9',
      phone: '+56999999999',
      email: `test-${Date.now()}@company.com`,
      localization: 'Test City, Chile',
      web: 'https://testcompany.com',
      description: 'A test company for e2e testing.',
    };
    console.log('Paso 1: Enviando POST /companies con payload:', createCompanyDto);

    const response = await request(app.getHttpServer())
      .post('/companies')
      .send(createCompanyDto)
      .expect(201);

    console.log('Resultado 1: Respuesta 201 Created recibida.');
    expect(response.body).toBeDefined();
    expect(response.body.name).toEqual(createCompanyDto.name);
    expect(response.body.state).toEqual(CompanyState.PENDIENTE);
    console.log('Resultado 2: Nuevo registro en BD tiene estado PENDIENTE.');

    const dbCompany = await companyRepository.findOneBy({ email: createCompanyDto.email });
    expect(dbCompany).toBeDefined();
    console.log('Verificación: La empresa existe en la base de datos.');

    // No podemos verificar S3 directamente en este test, pero asumimos que el servicio fue llamado.
    console.log('Resultado 3: (Asumido) Documento almacenado en S3.');

    expect(mockRabbitMQ.emit).toHaveBeenCalledWith('company_created', { companyId: dbCompany!.id });
    console.log('Resultado 4: Mensaje "company_created" emitido a RabbitMQ. [STUB CHECK]');
    console.log('--- [FIN IT-1] ---\n');
  });

  it('IT-2: debe retornar 409 por email duplicado', async () => {
    console.log('\n\n--- [IT-2: Error - Registro con Email Duplicado] ---');
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
    };

    console.log('Precondición: Creando una empresa inicial con email:', uniqueEmail);
    // Se crea la primera empresa
    await request(app.getHttpServer())
      .post('/companies')
      .send(createCompanyDto)
      .expect(201);
    
    const dbCompany = await companyRepository.findOneBy({ email: uniqueEmail });
    expect(dbCompany).toBeDefined();
    console.log('Verificación Precondición: Empresa inicial creada en BD.');

    console.log('Paso 1: Enviando POST /companies con el mismo email.');
    const response = await request(app.getHttpServer())
      .post('/companies')
      .send(createCompanyDto)
      .expect(409);

    console.log('Resultado 1: Respuesta 409 Conflict recibida.');
    expect(response.body.message).toContain('El correo ya se encuentra registrado.');
    
    const companiesCount = await companyRepository.count({ where: { email: uniqueEmail } });
    expect(companiesCount).toBe(1);
    console.log('Resultado 2: No se creó un nuevo registro en la BD.');

    // El servicio arroja error antes de emitir, por lo que el mock no debería ser llamado por segunda vez.
    expect(mockRabbitMQ.emit).toHaveBeenCalledTimes(1);
    console.log('Resultado 4: La cola de notificaciones a admin no recibió un nuevo mensaje. [STUB CHECK]');
    console.log('--- [FIN IT-2] ---\n');
  });
});