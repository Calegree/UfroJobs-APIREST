import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserState } from '../src/users/users.entity';
import { CompanyState } from '../src/companies/entities/company.entity';
import { JobOfferModality, JobOfferState } from '../src/job_offers/entities/job_offer.entity';
import { ApplicationStatus } from '../src/applications/entities/application.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../src/applications/entities/application.entity';
import { User } from '../src/users/users.entity';
import { Company } from '../src/companies/entities/company.entity';
import { JobOffer } from '../src/job_offers/entities/job_offer.entity';

class MockRabbitMQ {
  emit() {
    return {}; 
  }
}

describe('ApplicationsController (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;

    let applicationRepository: Repository<Application>;
    let userRepository: Repository<User>;
    let companyRepository: Repository<Company>;
    let jobOfferRepository: Repository<JobOffer>;

    let student;
    let company;
    let jobOffer;
    let studentToken;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideProvider('RABBITMQ_SERVICE') 
        .useClass(MockRabbitMQ)
        .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();

        jwtService = moduleFixture.get<JwtService>(JwtService);
        applicationRepository = moduleFixture.get(getRepositoryToken(Application));
        userRepository = moduleFixture.get(getRepositoryToken(User));
        companyRepository = moduleFixture.get(getRepositoryToken(Company));
        jobOfferRepository = moduleFixture.get(getRepositoryToken(JobOffer));
    });

  
    beforeEach(async () => {
        await applicationRepository.query('DELETE FROM "applications"');
        await jobOfferRepository.query('DELETE FROM "job_offers"');
        await companyRepository.query('DELETE FROM "companies"');
        await userRepository.query('DELETE FROM "users"');

        student = await userRepository.save(
            userRepository.create({
                name: 'Test Student E2E',
                email: `student-e2e-${Date.now()}@ufromail.cl`,
                password: 'hashedpassword', 
                role: UserRole.STUDENT,
                state: UserState.ACTIVE,
                rut: '20.333.444-5',
                career: 'Computer Science',
                academicYear: '4',
            }),
        );

        company = await companyRepository.save(
            companyRepository.create({
                name: 'E2E Test Company',
                email: `company-e2e-${Date.now()}@test.com`,
                pass: 'hashedpassword',
                rut: '77.777.777-7',
                phone: '+56977777777',
                localization: 'Test City, Chile',
                description: 'A test company for e2e testing.',
                state: CompanyState.ACTIVO,
            }),
        );

        jobOffer = await jobOfferRepository.save(
            jobOfferRepository.create({
                title: 'E2E Test Offer',
                description: 'A great job for a student.',
                company: company, 
                location: 'Test City, Chile',
                salary: '500000-700000 CLP',
                requirements: ['Enrolled student', 'Basic programming skills'],
                tags: ['part-time', 'remote'],
                state: JobOfferState.ACTIVO,
                worktime: 'Part-time',
                modality: JobOfferModality.REMOTO,
            }),
        );

        const payload = { sub: student.id, role: student.role };
        studentToken = jwtService.sign(payload);
    });

   
    afterAll(async () => {
        await app.close();
    });

    describe('POST /applications (Flujo de Postulación)', () => {

        it('IT-1: debe crear una postulación (201 Created) con un payload JSON válido', async () => {
            const payload = {
                jobOfferId: jobOffer.id,
                cvKey: `cvs/${student.id}/test-cv.pdf`,
            };

            const response = await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(payload)
                .expect(201);
            expect(response.body).toBeDefined();
            expect(response.body.id).toBeDefined();
            expect(response.body.status).toEqual(ApplicationStatus.PENDING);

            const dbApplication = await applicationRepository.findOneBy({ id: response.body.id });
            expect(dbApplication).toBeDefined();
            expect(dbApplication?.userId).toEqual(student.id);
            expect(dbApplication?.jobOfferId).toEqual(jobOffer.id);
        });

        it('IT-2: debe retornar 404 Not Found si la jobOfferId no existe', async () => {
            const payload = {
                jobOfferId: 999999,
                cvKey: 'cvs/test-cv.pdf',
            };

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(payload)
                .expect(404);
        });

        it('debe retornar 400 Bad Request si falta cvKey (ValidationPipe)', async () => {
            const payload = {
                jobOfferId: jobOffer.id,
            };

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(payload)
                .expect(400);
        });

        it('debe retornar 409 Conflict si el estudiante postula dos veces a la misma oferta', async () => {
            const payload = {
                jobOfferId: jobOffer.id,
                cvKey: `cvs/${student.id}/cv-duplicado.pdf`,
            };

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(payload)
                .expect(201);

            await request(app.getHttpServer())
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(payload)
                .expect(409); 
        });

        it('debe retornar 401 Unauthorized si no se provee token', async () => {
            const payload = {
                jobOfferId: jobOffer.id,
                cvKey: 'cvs/test-cv.pdf',
            };

            await request(app.getHttpServer())
                .post('/applications')
                .send(payload)
                .expect(401);
        });
    });
});